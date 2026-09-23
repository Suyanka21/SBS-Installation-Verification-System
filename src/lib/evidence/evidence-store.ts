// SBS Evidence Store & Submission Engine (Slice 2)
// Authoritative source: docs/evidence-and-offline.md, docs/domain-model.md §7, docs/PRD.md §9, §22 #4, #6

import {
  EvidenceItem,
  EvidenceType,
  EvidenceStatus,
} from "../installation/types";
import {
  getRequirementById,
  updateRequirementStatus,
  getStageById,
  updateStageStatus,
  getJobById,
  updateJobStatus,
  getRequirementTemplateById,
  saveEvidenceItem,
  getEvidenceByClientUuid,
  getEvidenceById,
  getEvidenceByRequirementId,
  getAllEvidence,
} from "../installation/store";
import { ServerSession } from "../auth/server-session";

export interface SubmitEvidenceInput {
  clientUuid: string; // Generated on-device at capture time (must be valid UUID/string)
  requirementId: string;
  type: EvidenceType;
  fileRef?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  measurementValue?: string | null;
  measurementUnit?: string | null;
  deviceCapturedAt?: string | null;
  sequenceNumber?: number | null;
  supersedesEvidenceId?: string | null;
  gpsLat?: number | null;
  gpsLng?: number | null;
}

export interface SubmissionResult {
  evidence: EvidenceItem;
  isDuplicate: boolean;
}

/**
 * Submits an installation evidence item with strict attribution, requirement linkage,
 * type verification, server-authoritative timestamping, and clientUuid idempotency.
 */
export async function submitEvidence(
  input: SubmitEvidenceInput,
  session: ServerSession
): Promise<SubmissionResult> {
  if (!input.clientUuid || !input.clientUuid.trim()) {
    throw new Error("Validation failed: clientUuid is mandatory for upload idempotency");
  }
  if (!input.requirementId || !input.requirementId.trim()) {
    throw new Error("Validation failed: requirementId is mandatory");
  }

  // 1. Idempotency Check: Protect against duplicate submissions per docs/PRD.md §22 #6
  const existing = getEvidenceByClientUuid(input.clientUuid);
  if (existing) {
    return {
      evidence: existing,
      isDuplicate: true,
    };
  }

  // 2. Validate Requirement & Template
  const req = getRequirementById(input.requirementId);
  if (!req) {
    throw new Error(`Requirement with ID '${input.requirementId}' not found`);
  }

  const template = getRequirementTemplateById(req.requirementTemplateId);
  if (!template) {
    throw new Error(`Requirement template '${req.requirementTemplateId}' not found`);
  }

  // 3. Verify Allowed Evidence Types
  if (!template.evidenceTypesAllowed.includes(input.type)) {
    throw new Error(
      `Evidence type '${input.type}' is not allowed for this requirement. Allowed: [${template.evidenceTypesAllowed.join(
        ", "
      )}]`
    );
  }

  // 4. Validate Measurement Notes
  if (input.type === "measurement_note") {
    if (!input.measurementValue || !input.measurementValue.trim()) {
      throw new Error("Validation failed: measurementValue is required for measurement_note evidence");
    }
  }

  // 5. Validate Superseding (Replacement Chain) per docs/PRD.md §22 #4
  let supersedesId: string | null = null;
  if (input.supersedesEvidenceId) {
    const oldItem = getEvidenceById(input.supersedesEvidenceId);
    if (!oldItem) {
      throw new Error(`Superseded evidence '${input.supersedesEvidenceId}' does not exist`);
    }
    // Mark previous item as Superseded (never deleted)
    oldItem.status = "Superseded";
    supersedesId = oldItem.evidenceId;
  }

  // 6. Build Server-Authoritative Evidence Record
  const evidenceId = `ev_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const nowIso = new Date().toISOString();

  const evidenceItem: EvidenceItem = {
    evidenceId,
    clientUuid: input.clientUuid,
    requirementId: input.requirementId,
    type: input.type,
    fileRef: input.fileRef || null,
    fileName: input.fileName || null,
    fileSize: input.fileSize || null,
    measurementValue: input.measurementValue?.trim() || null,
    measurementUnit: input.measurementUnit?.trim() || null,
    submittedBy: session.userId,
    submittedByName: session.name,
    submittedAt: nowIso, // Server-authoritative timestamp
    deviceCapturedAt: input.deviceCapturedAt || nowIso,
    sequenceNumber: input.sequenceNumber || 1,
    status: "Pending Review", // Always Pending Review for human QC — never auto-approved
    rejectionComment: null,
    supersedesEvidenceId: supersedesId,
    gpsLat: input.gpsLat || null,
    gpsLng: input.gpsLng || null,
  };

  // 7. Persist to Repositories
  saveEvidenceItem(evidenceItem);

  // 8. Workflow Progression: Update Requirement, Stage, and Job state
  if (req.status === "Not Started") {
    updateRequirementStatus(req.requirementId, "Evidence Submitted");
  }

  const stage = getStageById(req.stageId);
  if (stage && stage.status === "Not Started") {
    updateStageStatus(stage.stageId, "In Progress");
  }

  if (stage) {
    const job = getJobById(stage.jobId);
    if (job && job.status === "Not Started") {
      updateJobStatus(job.jobId, "In Progress");
    }
  }

  return {
    evidence: evidenceItem,
    isDuplicate: false,
  };
}

export {
  getEvidenceByRequirementId,
  getEvidenceById,
  getAllEvidence,
};

/**
 * Simulates a QC rejection on an evidence item to test the replacement / superseding chain.
 */
export function simulateQcRejection(evidenceId: string, comment: string) {
  const item = getEvidenceById(evidenceId);
  if (!item) throw new Error("Evidence item not found");
  if (!comment?.trim()) throw new Error("Rejection comment is mandatory");

  item.status = "Rejected";
  item.rejectionComment = comment.trim();
  return item;
}
