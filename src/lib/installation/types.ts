// SBS Domain Model Types — Installation Structure (Slice 1)
// Authoritative source: docs/domain-model.md §2–§6

export type GuidelineStatus = "Draft" | "Published" | "Superseded";

export type EvidenceType = "photo" | "video" | "document" | "measurement_note";

export type JobStatus =
  | "Not Started"
  | "In Progress"
  | "Ready for Handover"
  | "Practical Completion Recorded"
  | "Closed–Awaiting Commissioning"
  | "Commissioning Recorded"
  | "Closed";

export type StageStatus =
  | "Not Started"
  | "In Progress"
  | "Submitted for Review"
  | "Under Review"
  | "Approved"
  | "Has Open Deficiencies";

export type RequirementStatus =
  | "Not Started"
  | "Evidence Submitted"
  | "Under Review"
  | "Approved"
  | "Deficiency Opened"
  | "Closed-N/A Pending"
  | "Closed-N/A Confirmed";

export interface InstallationGuideline {
  guidelineId: string;
  versionNumber: number;
  title: string;
  effectiveDate: string;
  status: GuidelineStatus;
  createdAt: string;
  isSeed?: boolean;
}

export interface StageTemplate {
  stageTemplateId: string;
  guidelineId: string;
  title: string;
  sequenceOrder: number;
}

export interface RequirementTemplate {
  requirementTemplateId: string;
  stageTemplateId: string;
  title: string;
  description: string;
  evidenceRequired: boolean;
  evidenceTypesAllowed: EvidenceType[];
  minEvidenceCount: number;
  allowsNa: boolean;
}

export interface InstallationJob {
  jobId: string;
  guidelineId: string;
  siteName: string;
  tankModel: string;
  status: JobStatus;
  createdBy: string;
  createdByName?: string;
  plannedDemobilizationDate: string | null;
  createdAt: string;
}

export interface InstallationStage {
  stageId: string;
  jobId: string;
  stageTemplateId: string;
  status: StageStatus;
  submittedBy: string | null;
  submittedAt: string | null;
}

export interface Requirement {
  requirementId: string;
  stageId: string;
  requirementTemplateId: string;
  status: RequirementStatus;
  naReason: string | null;
  openDeficiencyId: string | null;
}

// Populated views for UI presentation
export interface PopulatedRequirement extends Requirement {
  template: RequirementTemplate;
}

export interface PopulatedStage extends InstallationStage {
  template: StageTemplate;
  requirements: PopulatedRequirement[];
}

export interface PopulatedJob extends InstallationJob {
  guideline: InstallationGuideline;
  stages: PopulatedStage[];
}
