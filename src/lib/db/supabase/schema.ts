import { pgTable, text, timestamp, uuid, boolean, integer, numeric } from "drizzle-orm/pg-core";

// 1. Users Table (Aligned with docs/domain-model.md §10)
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").$type<"Installer" | "Lead Installer" | "QC Reviewer" | "Management">().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 2. Installation Guidelines (Aligned with docs/domain-model.md §2)
export const guidelines = pgTable("installation_guidelines", {
  guidelineId: uuid("guideline_id").primaryKey().defaultRandom(),
  versionNumber: integer("version_number").notNull(),
  effectiveDate: timestamp("effective_date").notNull(),
  status: text("status").$type<"Draft" | "Published" | "Superseded">().default("Draft").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3. Stage Templates (Aligned with docs/domain-model.md §3)
export const stageTemplates = pgTable("stage_templates", {
  stageTemplateId: uuid("stage_template_id").primaryKey().defaultRandom(),
  guidelineId: uuid("guideline_id")
    .references(() => guidelines.guidelineId, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  sequenceOrder: integer("sequence_order").notNull(),
});

// 4. Requirement Templates (Aligned with docs/domain-model.md §3)
export const requirementTemplates = pgTable("requirement_templates", {
  requirementTemplateId: uuid("requirement_template_id").primaryKey().defaultRandom(),
  stageTemplateId: uuid("stage_template_id")
    .references(() => stageTemplates.stageTemplateId, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  evidenceRequired: boolean("evidence_required").default(true).notNull(),
  evidenceTypesAllowed: text("evidence_types_allowed").notNull(), // comma-separated or json string
  minEvidenceCount: integer("min_evidence_count").default(1).notNull(),
  allowsNa: boolean("allows_na").default(true).notNull(),
});

// 5. Installation Jobs (Aligned with docs/domain-model.md §4)
export const jobs = pgTable("installation_jobs", {
  jobId: uuid("job_id").primaryKey().defaultRandom(),
  guidelineId: uuid("guideline_id")
    .references(() => guidelines.guidelineId)
    .notNull(),
  siteName: text("site_name").notNull(),
  tankModel: text("tank_model").notNull(),
  status: text("status")
    .$type<
      | "Not Started"
      | "In Progress"
      | "Ready for Handover"
      | "Practical Completion Recorded"
      | "Closed–Awaiting Commissioning"
      | "Commissioning Recorded"
      | "Closed"
    >()
    .default("Not Started")
    .notNull(),
  createdBy: uuid("created_by")
    .references(() => users.id)
    .notNull(),
  plannedDemobilizationDate: timestamp("planned_demobilization_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 6. Installation Stages (Aligned with docs/domain-model.md §5)
export const jobStages = pgTable("installation_stages", {
  stageId: uuid("stage_id").primaryKey().defaultRandom(),
  jobId: uuid("job_id")
    .references(() => jobs.jobId, { onDelete: "cascade" })
    .notNull(),
  stageTemplateId: uuid("stage_template_id")
    .references(() => stageTemplates.stageTemplateId)
    .notNull(),
  status: text("status")
    .$type<"Not Started" | "In Progress" | "Submitted for Review" | "Under Review" | "Approved" | "Has Open Deficiencies">()
    .default("Not Started")
    .notNull(),
  submittedBy: uuid("submitted_by").references(() => users.id),
  submittedAt: timestamp("submitted_at"),
});

// 7. Requirements Instances (Aligned with docs/domain-model.md §6)
export const requirements = pgTable("requirements", {
  requirementId: uuid("requirement_id").primaryKey().defaultRandom(),
  stageId: uuid("stage_id")
    .references(() => jobStages.stageId, { onDelete: "cascade" })
    .notNull(),
  requirementTemplateId: uuid("requirement_template_id")
    .references(() => requirementTemplates.requirementTemplateId)
    .notNull(),
  status: text("status")
    .$type<
      | "Not Started"
      | "Evidence Submitted"
      | "Under Review"
      | "Approved"
      | "Deficiency Opened"
      | "Closed-N/A Pending"
      | "Closed-N/A Confirmed"
    >()
    .default("Not Started")
    .notNull(),
  naReason: text("na_reason"),
  openDeficiencyId: uuid("open_deficiency_id"),
});

// 8. Evidence Items (Aligned with docs/domain-model.md §7)
export const evidenceItems = pgTable("evidence_items", {
  evidenceId: uuid("evidence_id").primaryKey().defaultRandom(),
  clientUuid: uuid("client_uuid").notNull(),
  requirementId: uuid("requirement_id")
    .references(() => requirements.requirementId, { onDelete: "cascade" })
    .notNull(),
  type: text("type").$type<"photo" | "video" | "document" | "measurement_note">().notNull(),
  fileRef: text("file_ref"),
  measurementValue: text("measurement_value"),
  measurementUnit: text("measurement_unit"),
  submittedBy: uuid("submitted_by")
    .references(() => users.id)
    .notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  deviceCapturedAt: timestamp("device_captured_at"),
  sequenceNumber: integer("sequence_number"),
  status: text("status").$type<"Pending Review" | "Approved" | "Rejected" | "Superseded">().default("Pending Review").notNull(),
  rejectionComment: text("rejection_comment"),
  supersedesEvidenceId: uuid("supersedes_evidence_id"),
  gpsLat: numeric("gps_lat"),
  gpsLng: numeric("gps_lng"),
});

// 9. Deficiencies (Aligned with docs/domain-model.md §8)
export const deficiencies = pgTable("deficiencies", {
  deficiencyId: uuid("deficiency_id").primaryKey().defaultRandom(),
  requirementId: uuid("requirement_id")
    .references(() => requirements.requirementId, { onDelete: "cascade" })
    .notNull(),
  openedBy: uuid("opened_by")
    .references(() => users.id)
    .notNull(),
  rejectionType: text("rejection_type")
    .$type<"Unconvincing Evidence" | "Defective Work" | "Installer-Flagged Issue">()
    .notNull(),
  comment: text("comment").notNull(),
  status: text("status").$type<"Open" | "Correction Submitted" | "Resolved" | "Reopened">().default("Open").notNull(),
  responsibleUser: uuid("responsible_user").references(() => users.id),
  openedAt: timestamp("opened_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

// 10. Corrective Actions (Aligned with docs/domain-model.md §9)
export const correctiveActions = pgTable("corrective_actions", {
  correctiveActionId: uuid("corrective_action_id").primaryKey().defaultRandom(),
  deficiencyId: uuid("deficiency_id")
    .references(() => deficiencies.deficiencyId, { onDelete: "cascade" })
    .notNull(),
  description: text("description").notNull(),
  newEvidenceIds: text("new_evidence_ids"), // JSON array string of Evidence Item IDs
  submittedBy: uuid("submitted_by")
    .references(() => users.id)
    .notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

// 11. Practical Completion & Commissioning Certificates (Aligned with docs/domain-model.md §11)
export const certificates = pgTable("certificates", {
  certificateId: uuid("certificate_id").primaryKey().defaultRandom(),
  jobId: uuid("job_id")
    .references(() => jobs.jobId, { onDelete: "cascade" })
    .notNull(),
  certificateType: text("certificate_type").$type<"Practical Completion" | "Commissioning">().notNull(),
  signedDate: timestamp("signed_date").notNull(),
  signedBy: text("signed_by").notNull(), // Client name/role captured as free text
  openDeficiencyCountAtSigning: integer("open_deficiency_count_at_signing").default(0).notNull(),
  signedWithOpenDeficiencies: boolean("signed_with_open_deficiencies").default(false).notNull(),
  attachmentRef: text("attachment_ref"),
  recordedBy: uuid("recorded_by")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 12. Event Log — REQUIRED ARCHITECTURAL ADDITION (Aligned with docs/domain-model.md §12)
export const eventLogs = pgTable("event_logs", {
  eventId: uuid("event_id").primaryKey().defaultRandom(),
  entityType: text("entity_type").notNull(), // Requirement, Stage, Job, Deficiency, Certificate
  entityId: uuid("entity_id").notNull(),
  eventType: text("event_type").notNull(),
  actor: uuid("actor")
    .references(() => users.id)
    .notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  payload: text("payload"), // Minimal JSON string
});

// 13. Post-Handover Issue Record — REQUIRED ARCHITECTURAL ADDITION (Aligned with docs/domain-model.md §13)
export const postHandoverIssueRecords = pgTable("post_handover_issue_records", {
  recordId: uuid("record_id").primaryKey().defaultRandom(),
  jobId: uuid("job_id")
    .references(() => jobs.jobId, { onDelete: "cascade" })
    .notNull(),
  reportedDate: timestamp("reported_date").notNull(),
  description: text("description").notNull(),
  linkedRequirementId: uuid("linked_requirement_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Type Inferences
export type UserSelect = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;
export type JobSelect = typeof jobs.$inferSelect;
export type JobInsert = typeof jobs.$inferInsert;
export type RequirementSelect = typeof requirements.$inferSelect;
export type RequirementInsert = typeof requirements.$inferInsert;
export type EvidenceItemSelect = typeof evidenceItems.$inferSelect;
export type EvidenceItemInsert = typeof evidenceItems.$inferInsert;
export type DeficiencySelect = typeof deficiencies.$inferSelect;
export type DeficiencyInsert = typeof deficiencies.$inferInsert;
