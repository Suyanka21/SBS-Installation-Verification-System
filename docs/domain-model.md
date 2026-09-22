# SBS Domain Model — Implementation Reference

**Authority level:** DOMAIN / DATA MODEL layer. Subordinate to `docs/PRD.md` on any question of product scope; authoritative on field-level shape once scope is settled. See `docs/documentation-map.md` for the full hierarchy.

**Replaces:** the template's generic example schema (`users` / `projects` in `src/lib/db/supabase/schema.ts` and `src/lib/db/firebase/firestore.ts`, described in the old `docs/architecture.md` §3.1–3.2). Those files are application code and are **not edited by this documentation package** — this document is what an implementation agent reads before writing the real schema, per the template's own `context-engineering` → `source-driven-development` → `incremental-implementation` sequence.

**Stack assumption carried over unchanged from the template:** Drizzle ORM against Postgres (Supabase) or Firestore (Firebase), selected via `DATABASE_PROVIDER`. Nothing in the SBS PRD requires changing this. Field types below are described in implementation-neutral terms (UUID, text, timestamp, enum, boolean) so either backend can implement them.

---

## 1. Guiding Rules for Every Object

- Every object below maps 1:1 to an object the PRD (§7) already governs, plus the two Required Architectural Additions the PRD explains and justifies (§7.9–7.10 of the PRD). **Do not add a new top-level object without first checking whether it can be a field or relationship on one of these** — the PRD is explicit that new objects require the same "REQUIRED ARCHITECTURAL ADDITION" justification given here.
- Timestamps are server-authoritative unless explicitly marked otherwise (see Evidence Item).
- Nothing here is ever hard-deleted. Where a "removal" is needed, it is a status change (Superseded, Closed, Reopened), never a row deletion.

---

## 2. Installation Guideline

| Field | Type | Notes |
|---|---|---|
| `guideline_id` | UUID, PK | |
| `version_number` | integer | monotonic per guideline |
| `effective_date` | timestamp | |
| `status` | enum(Draft, Published, Superseded) | |

**Relationships:** has many Stage Templates (each with many Requirement Templates). A Job's Stages/Requirements are instantiated from exactly one Guideline version at Job creation and are never re-pointed to a later version.

**Created/modified by:** SBS admin/engineering user, outside the field workflow. **Never edited in place once Published** — a change is a new version.

---

## 3. Stage Template & Requirement Template (part of Guideline)

| Field | Type | Notes |
|---|---|---|
| `stage_template_id` | UUID, PK | |
| `guideline_id` | UUID, FK | |
| `title` | text | e.g. "Anchorage" |
| `sequence_order` | integer | for display/guideline clarity only — **does not hard-block** later stages (see Job-level lifecycle, `docs/workflow-state-machine.md`) |

| Field | Type | Notes |
|---|---|---|
| `requirement_template_id` | UUID, PK | |
| `stage_template_id` | UUID, FK | |
| `title` / `description` | text | from SBS's existing methodology — **not authored or redesigned by this system** |
| `evidence_required` | boolean | default `true` |
| `evidence_types_allowed` | set of enum(photo, video, document, measurement_note) | may allow more than one type |
| `min_evidence_count` | integer | e.g. `2` for a before/after pair |
| `allows_na` | boolean | |

---

## 4. Installation Job

| Field | Type | Notes |
|---|---|---|
| `job_id` | UUID, PK | |
| `guideline_id` | UUID, FK | the version instantiated at creation |
| `created_by` | user ref | |
| `created_at` | timestamp | server-authoritative — this is the primary field pilot **Recurrence** instrumentation reads (PRD §19) |
| `planned_demobilization_date` | date, nullable | drives the "unresolved Deficiency approaching demobilization" notification and metric (PRD §18–19) |
| `status` | enum(Not Started, In Progress, Ready for Handover, Practical Completion Recorded, Closed–Awaiting Commissioning, Commissioning Recorded, Closed) | see `docs/workflow-state-machine.md` for full transition rules |

**Relationships:** has many Stage instances; has one Practical Completion Certificate and (later) one Commissioning Certificate; may have zero or more Post-Handover Issue Records after closure.

**Billing-unit note (from the Value Longevity Audit, non-binding on this document but relevant to why this field matters):** a completed Job is the natural countable unit for any future per-installation commercial model. No extra field is needed for this — `status = Closed` plus `created_at` already gives a clean count.

---

## 5. Installation Stage (instance)

| Field | Type | Notes |
|---|---|---|
| `stage_id` | UUID, PK | |
| `job_id` | UUID, FK | |
| `stage_template_id` | UUID, FK | |
| `status` | enum(Not Started, In Progress, Submitted for Review, Under Review, Approved, Has Open Deficiencies) | |
| `submitted_by` | user ref, nullable | set when moved to Submitted for Review |
| `submitted_at` | timestamp, nullable | — this is the "Submission → QC review time" metric's start point (PRD §19) |

---

## 6. Requirement (instance)

| Field | Type | Notes |
|---|---|---|
| `requirement_id` | UUID, PK | |
| `stage_id` | UUID, FK | |
| `requirement_template_id` | UUID, FK | |
| `status` | enum(Not Started, Evidence Submitted, Under Review, Approved, Deficiency Opened, Closed-N/A Pending, Closed-N/A Confirmed) | |
| `na_reason` | text, nullable | required if status touches the N/A path |
| `open_deficiency_id` | UUID, FK, nullable | |

**Hard rule, never relaxed:** no field or code path exists that moves `status` to `Approved` except an explicit QC Reviewer action. There is no "auto-approve" state.

---

## 7. Evidence Item

| Field | Type | Notes |
|---|---|---|
| `evidence_id` | UUID, PK | |
| `client_uuid` | UUID | generated on-device at capture time; used for upload idempotency — **retrying an upload with the same `client_uuid` must never create a second row** |
| `requirement_id` | UUID, FK | **never** a Stage or Job directly |
| `type` | enum(photo, video, document, measurement_note) | |
| `file_ref` | text, nullable | for photo/video/document |
| `measurement_value` / `measurement_unit` | text/numeric, nullable | for `measurement_note` only |
| `submitted_by` | user ref | **never nullable, never a shared/team account** |
| `submitted_at` | timestamp | **server-authoritative** — set at successful sync, not at capture |
| `device_captured_at` | timestamp, nullable | informational only; a large gap vs. `submitted_at` is a structural flag, never proof of anything |
| `sequence_number` | integer, nullable | for ordering multi-part evidence |
| `status` | enum(Pending Review, Approved, Rejected, Superseded) | |
| `rejection_comment` | text, nullable | required if `status = Rejected` |
| `supersedes_evidence_id` | UUID, FK, nullable | set when this item replaces a rejected one |
| `gps_lat` / `gps_lng` | numeric, nullable | **SHOULD**, corroborating metadata only, never presented as proof |

**Immutability:** rows in this table are never updated after `submitted_at` is set, except the `status`/`rejection_comment` fields via the review flow, and are never deleted.

---

## 8. Deficiency

| Field | Type | Notes |
|---|---|---|
| `deficiency_id` | UUID, PK | |
| `requirement_id` | UUID, FK | |
| `opened_by` | user ref | a QC Reviewer, or an Installer via "Flag an Issue" |
| `rejection_type` | enum(Unconvincing Evidence, Defective Work, Installer-Flagged Issue) | drives the correct remedy — reshoot vs. redo — see `docs/workflow-state-machine.md` |
| `comment` | text | **mandatory, never empty** |
| `status` | enum(Open, Correction Submitted, Resolved, Reopened) | |
| `responsible_user` | user ref | defaults to the original submitter; reassignable |
| `opened_at` / `resolved_at` | timestamp | `resolved_at` feeds the "Rejection → correction time" metric (PRD §19) |

**Explicitly no `severity` field.** This is a deliberate omission (PRD §7.5/§14 — NON-GOAL), not a gap to be filled in later without re-opening that governance decision.

---

## 9. Corrective Action

| Field | Type | Notes |
|---|---|---|
| `corrective_action_id` | UUID, PK | |
| `deficiency_id` | UUID, FK | a Reopened Deficiency gets a **new row here**, not a new Deficiency |
| `description` | text | |
| `new_evidence_ids` | array of Evidence Item refs | |
| `submitted_by` | user ref | |
| `submitted_at` | timestamp | feeds "Correction → re-review time" metric |

---

## 10. Installer / QC Reviewer / Management (user accounts)

Standard authenticated-user entity — see `docs/identity-and-auth.md` for the critical gap between this requirement and the template's current implementation. Minimum fields beyond whatever the auth provider supplies natively:

| Field | Type | Notes |
|---|---|---|
| `user_id` | UUID, PK (or provider-native ID) | |
| `role` | enum(Installer, Lead Installer, QC Reviewer, Management) | **replaces** the template's generic `admin`/`member`/`viewer` role enum |
| `display_name` | text | |

No "Team" object exists. Multiple installers on one Job is a many-to-many assignment (Job ↔ Installer), not a new domain object — attribution stays individual, at the Evidence Item level, regardless of how many people are assigned to a Job.

---

## 11. Practical Completion Certificate / Commissioning Certificate

| Field | Type | Notes |
|---|---|---|
| `certificate_id` | UUID, PK | |
| `job_id` | UUID, FK | |
| `certificate_type` | enum(Practical Completion, Commissioning) | |
| `signed_date` | date | |
| `signed_by` | text | client name/role, **captured as free text — not a system user account** |
| `open_deficiency_count_at_signing` | integer | system-computed at the moment of recording; only meaningful for Practical Completion (by the time Commissioning is recorded, the Job is already past that gate) |
| `signed_with_open_deficiencies` | boolean | derived from the count above; this is the field that directly answers the "client signed before technical verification" edge case |
| `attachment_ref` | text, nullable | scan/photo of the signed physical document |
| `recorded_by` | user ref | Lead Installer or QC Reviewer — **never the client directly** |

**Non-frozen business decision, restated here because it affects this table's constraints:** the system does **not** enforce `open_deficiency_count_at_signing = 0` as a required condition for inserting a row here. Recording is never blocked by Job state.

See `docs/sbs-domain-context.md` for how these two objects map onto the broader "mechanical completion → final QC/snag closure → commissioning → handover" language SBS uses publicly, and why that broader language does not change what this system records.

---

## 12. REQUIRED ARCHITECTURAL ADDITION — Event Log

| Field | Type | Notes |
|---|---|---|
| `event_id` | UUID, PK | |
| `entity_type` | text | e.g. `Requirement`, `Deficiency`, `Certificate` |
| `entity_id` | UUID | |
| `event_type` | text | e.g. `status_changed`, `evidence_submitted` |
| `actor` | user ref | |
| `timestamp` | timestamp, server-authoritative | |
| `payload` | JSON, minimal | e.g. `{from: "Under Review", to: "Approved"}` |

**Append-only. Never updated. Never deleted.** This table is what every pilot-timing metric in PRD §19 is actually computed from — do not attempt to derive those metrics solely from the current-state tables above; they don't preserve history.

---

## 13. REQUIRED ARCHITECTURAL ADDITION — Post-Handover Issue Record

| Field | Type | Notes |
|---|---|---|
| `record_id` | UUID, PK | |
| `job_id` | UUID, FK | |
| `reported_date` | date | |
| `description` | text | |
| `linked_requirement_id` | UUID, FK, nullable | the issue may not map cleanly back to one original Requirement |

**Created manually by SBS staff** when a rectification visit or client complaint happens after a Job is Closed. Not automated, not client-facing. Its entire purpose is to make the venture's core ROI question ("did fewer issues get discovered after handover") measurable at all — without it, that question has nowhere to be answered from.

---

## 14. What Is Deliberately Not a Table

- **Project** (grouping multiple tanks under one client engagement) — **deferred**, not built. If multi-tank sites turn out to be common, this becomes a thin wrapper around Job later; nothing here needs to anticipate its shape.
- **Notification** — treated as a side-effect of the Event Log plus a delivery-channel implementation detail, not a domain object with product-level meaning.
- **Severity** on Deficiency — see §8.
- **Installer score / ranking** — explicitly forbidden by the PRD's accountability model (§15). Do not add a derived or computed field anywhere that ranks or scores a user.
