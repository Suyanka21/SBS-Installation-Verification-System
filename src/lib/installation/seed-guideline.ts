// SEED / DEMO GUIDELINE DATA
// Notice: Clearly separated from production data per Slice 1 governance rules.
// Derived strictly from SBS documentation references (docs/domain-model.md §3, docs/PRD.md §9–§10).

import {
  InstallationGuideline,
  StageTemplate,
  RequirementTemplate,
} from "./types";

export const SEED_GUIDELINE_ID = "gdl_seed_sbs_v1_0";

export const SEED_GUIDELINE: InstallationGuideline = {
  guidelineId: SEED_GUIDELINE_ID,
  versionNumber: 1,
  title: "SBS Kenya Standard Tank Installation Guideline",
  effectiveDate: "2026-01-01T00:00:00.000Z",
  status: "Published",
  createdAt: "2026-01-01T00:00:00.000Z",
  isSeed: true,
};

export const SEED_STAGE_TEMPLATES: StageTemplate[] = [
  {
    stageTemplateId: "stg_tpl_01_foundation",
    guidelineId: SEED_GUIDELINE_ID,
    title: "Foundation & Ring Beam Verification",
    sequenceOrder: 1,
  },
  {
    stageTemplateId: "stg_tpl_02_anchorage",
    guidelineId: SEED_GUIDELINE_ID,
    title: "Anchorage", // Explicitly documented in docs/domain-model.md §3
    sequenceOrder: 2,
  },
  {
    stageTemplateId: "stg_tpl_03_shell",
    guidelineId: SEED_GUIDELINE_ID,
    title: "Shell & Stiffeners Assembly",
    sequenceOrder: 3,
  },
  {
    stageTemplateId: "stg_tpl_04_liner",
    guidelineId: SEED_GUIDELINE_ID,
    title: "Internal Liner Installation",
    sequenceOrder: 4,
  },
  {
    stageTemplateId: "stg_tpl_05_roof",
    guidelineId: SEED_GUIDELINE_ID,
    title: "Roof Structure & External Fittings",
    sequenceOrder: 5,
  },
  {
    stageTemplateId: "stg_tpl_06_hydrotest",
    guidelineId: SEED_GUIDELINE_ID,
    title: "Pre-Handover Verification & Mechanical Completion",
    sequenceOrder: 6,
  },
];

export const SEED_REQUIREMENT_TEMPLATES: RequirementTemplate[] = [
  // Stage 1: Foundation
  {
    requirementTemplateId: "req_tpl_01_01",
    stageTemplateId: "stg_tpl_01_foundation",
    title: "Concrete Foundation Levelness & Dimensions",
    description: "Verify slab diameter, radial tolerance within ±5mm, and record levelness survey readings.",
    evidenceRequired: true,
    evidenceTypesAllowed: ["photo", "measurement_note"],
    minEvidenceCount: 2,
    allowsNa: false,
  },
  {
    requirementTemplateId: "req_tpl_01_02",
    stageTemplateId: "stg_tpl_01_foundation",
    title: "Ring Beam Surface Condition & Curing",
    description: "Visual inspection for honeycombing, cracking, or surface debris prior to bottom ring seating.",
    evidenceRequired: true,
    evidenceTypesAllowed: ["photo"],
    minEvidenceCount: 2,
    allowsNa: true,
  },

  // Stage 2: Anchorage (documented example in domain-model.md §3)
  {
    requirementTemplateId: "req_tpl_02_01",
    stageTemplateId: "stg_tpl_02_anchorage",
    title: "Anchor Bracket Positioning & Hole Alignment",
    description: "Inspect embedment depth and perpendicular alignment of all anchor bolt locations around perimeter.",
    evidenceRequired: true,
    evidenceTypesAllowed: ["photo"],
    minEvidenceCount: 2,
    allowsNa: false,
  },
  {
    requirementTemplateId: "req_tpl_02_02",
    stageTemplateId: "stg_tpl_02_anchorage",
    title: "Anchor Bolt Torque Verification",
    description: "Record calibrated torque wrench values across sample anchor studs against SBS torque spec.",
    evidenceRequired: true,
    evidenceTypesAllowed: ["measurement_note", "photo"],
    minEvidenceCount: 2,
    allowsNa: false,
  },

  // Stage 3: Shell & Stiffeners
  {
    requirementTemplateId: "req_tpl_03_01",
    stageTemplateId: "stg_tpl_03_shell",
    title: "Bottom Ring Panel Lapping & Gasket Seating",
    description: "Confirm sealant tape placement and lap joint alignment before tightening ring bolts.",
    evidenceRequired: true,
    evidenceTypesAllowed: ["photo"],
    minEvidenceCount: 2,
    allowsNa: false,
  },
  {
    requirementTemplateId: "req_tpl_03_02",
    stageTemplateId: "stg_tpl_03_shell",
    title: "Shell Panel Fastener Torque Check",
    description: "Record torque readings on vertical and horizontal seams per structural drawing requirements.",
    evidenceRequired: true,
    evidenceTypesAllowed: ["measurement_note"],
    minEvidenceCount: 1,
    allowsNa: false,
  },

  // Stage 4: Liner
  {
    requirementTemplateId: "req_tpl_04_01",
    stageTemplateId: "stg_tpl_04_liner",
    title: "Geotextile Underlay & Floor Cleanliness",
    description: "Inspect floor sweeping, absence of sharp particles, and full coverage of protective geotextile matting.",
    evidenceRequired: true,
    evidenceTypesAllowed: ["photo"],
    minEvidenceCount: 2,
    allowsNa: false,
  },
  {
    requirementTemplateId: "req_tpl_04_02",
    stageTemplateId: "stg_tpl_04_liner",
    title: "Liner Unfolding & Wall Attachment",
    description: "Verify uniform tensioning, perimeter clip fastening, and absence of excessive stress creases.",
    evidenceRequired: true,
    evidenceTypesAllowed: ["photo", "video"],
    minEvidenceCount: 2,
    allowsNa: false,
  },

  // Stage 5: Roof
  {
    requirementTemplateId: "req_tpl_05_01",
    stageTemplateId: "stg_tpl_05_roof",
    title: "Roof Truss Installation & Bracing",
    description: "Inspect center pole/truss alignment, purlin connections, and diagonal wind bracing.",
    evidenceRequired: true,
    evidenceTypesAllowed: ["photo"],
    minEvidenceCount: 2,
    allowsNa: false,
  },

  // Stage 6: Pre-Handover Verification
  {
    requirementTemplateId: "req_tpl_06_01",
    stageTemplateId: "stg_tpl_06_hydrotest",
    title: "Nozzle & Penetration Flange Inspection",
    description: "Confirm inlet/outlet connections, overflow piping, and gasket sealing prior to completion sign-off.",
    evidenceRequired: true,
    evidenceTypesAllowed: ["photo"],
    minEvidenceCount: 2,
    allowsNa: true,
  },
  {
    requirementTemplateId: "req_tpl_06_02",
    stageTemplateId: "stg_tpl_06_hydrotest",
    title: "Final Site Housekeeping & Demobilization Check",
    description: "Confirm removal of installation rigging, leftover fasteners, and safe site condition.",
    evidenceRequired: true,
    evidenceTypesAllowed: ["photo"],
    minEvidenceCount: 1,
    allowsNa: false,
  },
];
