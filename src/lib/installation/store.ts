// SBS Installation Store & Instantiation Engine (Slice 1)
// Authoritative source: docs/domain-model.md §2–§6, docs/workflow-state-machine.md §3–§4

import {
  InstallationGuideline,
  StageTemplate,
  RequirementTemplate,
  InstallationJob,
  InstallationStage,
  Requirement,
  PopulatedJob,
  PopulatedStage,
  PopulatedRequirement,
} from "./types";
import {
  SEED_GUIDELINE,
  SEED_STAGE_TEMPLATES,
  SEED_REQUIREMENT_TEMPLATES,
} from "./seed-guideline";

// In-memory repositories (singleton per node process)
const guidelinesMap = new Map<string, InstallationGuideline>();
const stageTemplatesMap = new Map<string, StageTemplate>();
const requirementTemplatesMap = new Map<string, RequirementTemplate>();

const jobsMap = new Map<string, InstallationJob>();
const stagesMap = new Map<string, InstallationStage>();
const requirementsMap = new Map<string, Requirement>();

let isInitialized = false;

export function initializeInstallationStore(force = false) {
  if (isInitialized && !force) return;

  // Initialize seed guideline
  guidelinesMap.set(SEED_GUIDELINE.guidelineId, { ...SEED_GUIDELINE });

  for (const st of SEED_STAGE_TEMPLATES) {
    stageTemplatesMap.set(st.stageTemplateId, { ...st });
  }

  for (const rt of SEED_REQUIREMENT_TEMPLATES) {
    requirementTemplatesMap.set(rt.requirementTemplateId, { ...rt });
  }

  isInitialized = true;
}

// Auto-initialize on first import
initializeInstallationStore();

// --- GUIDELINE RETRIEVAL ---

export function getAllGuidelines(): InstallationGuideline[] {
  initializeInstallationStore();
  return Array.from(guidelinesMap.values()).sort(
    (a, b) => b.versionNumber - a.versionNumber
  );
}

export function getActiveGuideline(): InstallationGuideline | null {
  initializeInstallationStore();
  const published = Array.from(guidelinesMap.values())
    .filter((g) => g.status === "Published")
    .sort((a, b) => b.versionNumber - a.versionNumber);

  return published[0] || null;
}

export function getGuidelineById(guidelineId: string): InstallationGuideline | null {
  initializeInstallationStore();
  return guidelinesMap.get(guidelineId) || null;
}

export function registerGuideline(
  guideline: InstallationGuideline,
  stageTemplates: StageTemplate[],
  requirementTemplates: RequirementTemplate[]
) {
  initializeInstallationStore();
  guidelinesMap.set(guideline.guidelineId, { ...guideline });
  for (const st of stageTemplates) {
    stageTemplatesMap.set(st.stageTemplateId, { ...st });
  }
  for (const rt of requirementTemplates) {
    requirementTemplatesMap.set(rt.requirementTemplateId, { ...rt });
  }
}

// --- JOB CREATION & ATOMIC INSTANTIATION ---

export interface CreateJobInput {
  siteName: string;
  tankModel: string;
  plannedDemobilizationDate?: string | null;
  createdBy: string;
  createdByName?: string;
  guidelineId?: string; // Optional: defaults to currently active Published guideline
}

export function createInstallationJob(input: CreateJobInput): PopulatedJob {
  initializeInstallationStore();

  if (!input.siteName?.trim()) {
    throw new Error("Validation failed: siteName is required");
  }
  if (!input.tankModel?.trim()) {
    throw new Error("Validation failed: tankModel is required");
  }
  if (!input.createdBy) {
    throw new Error("Validation failed: createdBy user ID is required for attribution");
  }

  // 1. Resolve active guideline version
  let targetGuideline: InstallationGuideline | null = null;
  if (input.guidelineId) {
    targetGuideline = getGuidelineById(input.guidelineId);
    if (!targetGuideline) {
      throw new Error(`Guideline with ID '${input.guidelineId}' not found`);
    }
  } else {
    targetGuideline = getActiveGuideline();
    if (!targetGuideline) {
      throw new Error("No active Published guideline found to instantiate job");
    }
  }

  // 2. Fetch all stage templates for this guideline version
  const stageTpls = Array.from(stageTemplatesMap.values())
    .filter((st) => st.guidelineId === targetGuideline!.guidelineId)
    .sort((a, b) => a.sequenceOrder - b.sequenceOrder);

  if (stageTpls.length === 0) {
    throw new Error(
      `Active guideline v${targetGuideline.versionNumber} has no stage templates configured`
    );
  }

  // 3. Create the Job
  const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const nowIso = new Date().toISOString();

  const job: InstallationJob = {
    jobId,
    guidelineId: targetGuideline.guidelineId,
    siteName: input.siteName.trim(),
    tankModel: input.tankModel.trim(),
    status: "Not Started",
    createdBy: input.createdBy,
    createdByName: input.createdByName || "Authorized User",
    plannedDemobilizationDate: input.plannedDemobilizationDate || null,
    createdAt: nowIso,
  };

  // 4. Instantiation: Instantiate every Stage and Requirement
  const instantiatedStages: InstallationStage[] = [];
  const instantiatedRequirements: Requirement[] = [];

  for (const stTpl of stageTpls) {
    const stageId = `stg_${jobId}_${stTpl.sequenceOrder}`;
    const stage: InstallationStage = {
      stageId,
      jobId,
      stageTemplateId: stTpl.stageTemplateId,
      status: "Not Started",
      submittedBy: null,
      submittedAt: null,
    };
    instantiatedStages.push(stage);

    // Find requirements for this stage template
    const reqTpls = Array.from(requirementTemplatesMap.values()).filter(
      (rt) => rt.stageTemplateId === stTpl.stageTemplateId
    );

    for (let i = 0; i < reqTpls.length; i++) {
      const rtTpl = reqTpls[i];
      const requirementId = `req_${stageId}_${i + 1}`;
      const requirement: Requirement = {
        requirementId,
        stageId,
        requirementTemplateId: rtTpl.requirementTemplateId,
        status: "Not Started",
        naReason: null,
        openDeficiencyId: null,
      };
      instantiatedRequirements.push(requirement);
    }
  }

  // 5. Atomic persistence into maps
  jobsMap.set(job.jobId, job);
  for (const s of instantiatedStages) {
    stagesMap.set(s.stageId, s);
  }
  for (const r of instantiatedRequirements) {
    requirementsMap.set(r.requirementId, r);
  }

  // Return the fully populated view
  const populated = getPopulatedJob(job.jobId);
  if (!populated) {
    throw new Error("Fatal: Failed to retrieve newly instantiated job");
  }
  return populated;
}

// --- QUERY & RETRIEVAL ---

export function getAllJobs(): InstallationJob[] {
  initializeInstallationStore();
  return Array.from(jobsMap.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getJobById(jobId: string): InstallationJob | null {
  initializeInstallationStore();
  return jobsMap.get(jobId) || null;
}

export function getPopulatedJob(jobId: string): PopulatedJob | null {
  initializeInstallationStore();
  const job = jobsMap.get(jobId);
  if (!job) return null;

  const guideline = guidelinesMap.get(job.guidelineId);
  if (!guideline) return null;

  // Stages for this job
  const jobStages = Array.from(stagesMap.values()).filter((s) => s.jobId === jobId);

  const populatedStages: PopulatedStage[] = jobStages.map((stage) => {
    const template = stageTemplatesMap.get(stage.stageTemplateId) || {
      stageTemplateId: stage.stageTemplateId,
      guidelineId: job.guidelineId,
      title: "Unknown Stage",
      sequenceOrder: 0,
    };

    // Requirements for this stage
    const stageReqs = Array.from(requirementsMap.values()).filter(
      (r) => r.stageId === stage.stageId
    );

    const populatedRequirements: PopulatedRequirement[] = stageReqs.map((req) => {
      const rtTpl = requirementTemplatesMap.get(req.requirementTemplateId) || {
        requirementTemplateId: req.requirementTemplateId,
        stageTemplateId: stage.stageTemplateId,
        title: "Unknown Requirement",
        description: "",
        evidenceRequired: true,
        evidenceTypesAllowed: ["photo"],
        minEvidenceCount: 1,
        allowsNa: true,
      };

      const reqEvidence = Array.from(evidenceItemsMap.values())
        .filter((e) => e.requirementId === req.requirementId)
        .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());

      return {
        ...req,
        template: rtTpl,
        evidenceItems: reqEvidence,
      };
    });

    return {
      ...stage,
      template,
      requirements: populatedRequirements,
    };
  });

  // Sort stages by template sequenceOrder
  populatedStages.sort((a, b) => a.template.sequenceOrder - b.template.sequenceOrder);

  return {
    ...job,
    guideline,
    stages: populatedStages,
  };
}

// --- ENTITY LOOKUPS & MUTATIONS FOR EVIDENCE & WORKFLOW ENGINE ---

const evidenceItemsMap = new Map<string, import("./types").EvidenceItem>();
const evidenceByClientUuidMap = new Map<string, import("./types").EvidenceItem>();

export function getRequirementById(requirementId: string): Requirement | null {
  initializeInstallationStore();
  return requirementsMap.get(requirementId) || null;
}

export function updateRequirementStatus(requirementId: string, status: import("./types").RequirementStatus) {
  const req = requirementsMap.get(requirementId);
  if (req) {
    req.status = status;
  }
}

export function getStageById(stageId: string): InstallationStage | null {
  initializeInstallationStore();
  return stagesMap.get(stageId) || null;
}

export function updateStageStatus(stageId: string, status: import("./types").StageStatus) {
  const stage = stagesMap.get(stageId);
  if (stage) {
    stage.status = status;
  }
}

export function updateJobStatus(jobId: string, status: import("./types").JobStatus) {
  const job = jobsMap.get(jobId);
  if (job) {
    job.status = status;
  }
}

export function getRequirementTemplateById(templateId: string): RequirementTemplate | null {
  initializeInstallationStore();
  return requirementTemplatesMap.get(templateId) || null;
}

export function saveEvidenceItem(item: import("./types").EvidenceItem) {
  evidenceItemsMap.set(item.evidenceId, item);
  evidenceByClientUuidMap.set(item.clientUuid, item);
}

export function getEvidenceByClientUuid(clientUuid: string): import("./types").EvidenceItem | null {
  return evidenceByClientUuidMap.get(clientUuid) || null;
}

export function getEvidenceById(evidenceId: string): import("./types").EvidenceItem | null {
  return evidenceItemsMap.get(evidenceId) || null;
}

export function getEvidenceByRequirementId(requirementId: string): import("./types").EvidenceItem[] {
  return Array.from(evidenceItemsMap.values())
    .filter((e) => e.requirementId === requirementId)
    .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
}

export function getAllEvidence(): import("./types").EvidenceItem[] {
  return Array.from(evidenceItemsMap.values());
}

// Helper to seed an initial job for development if none exists
export function seedInitialJobIfEmpty(leadUserId: string, leadName: string) {
  initializeInstallationStore();
  if (jobsMap.size === 0) {
    createInstallationJob({
      siteName: "Naivasha Horticultural Processing Plant",
      tankModel: "SBS Cyclonic 250kL (Potable Water)",
      plannedDemobilizationDate: "2026-10-15",
      createdBy: leadUserId,
      createdByName: leadName,
    });
  }
}
