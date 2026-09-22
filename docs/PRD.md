# Product Requirements Document (PRD)
## Project: SBS Tanks — Installation Verification System
### Version: 1.0.0 — Pilot/MVP Scope
### Status: Governed product baseline. **This document supersedes the template's original generic PRD.**

> This repository was cloned from the Suyanka App Template (`agent-skills-starter-template`). Per the template's own convention (see root `README.md`, step 3), `docs/PRD.md` is the file every AI coding agent reads first as the master product specification, and it is meant to be replaced per-project. It has been replaced with the content below. The reusable `.agents/skills/` system, `AGENTS.md`, and the rest of the template's engineering foundation are unchanged and still govern *how* this gets built — this file governs *what* gets built.
>
> **Before writing any code from this file, read `docs/documentation-map.md` first.** It defines the full documentation hierarchy this PRD sits inside of, and resolves what to do if any two documents ever appear to disagree.

---

**Status:** Implementation-ready draft, derived from three governed prior outputs (Venture/Signal Definition, Architecture Discovery, Value Longevity & Commercial Audit). This PRD does not reopen product strategy — it translates governed decisions into buildable requirements.

**Intended consumers:** interface design agents, frontend implementation agents, backend implementation agents, and Venture Foundry governance review.

---

## 0. Scope Statement

SBS-first. Pilot/MVP only. This PRD defines the smallest reliable system that can run real SBS installations through a structured, attributable, requirement-linked verification workflow, and that preserves the data needed to evaluate whether the venture hypothesis holds. It is not a platform, not an analytics product, and not a market-wide construction tool.

---

## 1. Governing Principle & Product Boundary — **FROZEN**

**The product is:** a structured, attributable, requirement-linked installation verification workflow for remote SBS tank installations, allowing installation evidence to be reviewed by human QC/engineering before crew demobilization.

**The product is not:** an AI inspection system; a computer-vision defect detector; an automated engineering approval system; a replacement for QC engineers; a generic construction-management platform; a CRM; an ERP; a WhatsApp replacement; a generic checklist app; a sensor/hardware platform; a blockchain system; an installer ranking/scoring system; an analytics platform; or a client portal, except where the core workflow strictly requires client-facing interaction (it does not — see §6).

Every requirement below is written to stay inside this boundary. Where a requirement risks crossing it, that risk is called out explicitly.

---

## 2. Governed Product Decision — **FROZEN**

**Philosophy:** make the correct installation process easier to follow and the incorrect process harder to hide.

**Core workflow:**
`Installation Job → Requirements → Evidence Capture → Completeness Gate → QC Review → Deficiency → Correction → Re-review → Approval → Handover`

**Non-negotiable rule:** the human QC/engineering reviewer is the final authority on whether work is engineeringly correct. The software's job is limited to organizing evidence, enforcing completeness, and surfacing structural anomalies — never to determine physical correctness itself.

---

## 3. Commercial / Value Context (carried forward, not re-decided)

- **Durable value:** each completed Job produces a durable record (evidence, deficiencies, corrections, approval history, linked certificates).
- **Consumable value:** the verification workflow recurs because SBS keeps installing tanks; the recurring trigger is a new Installation Job, not a calendar interval.
- **Value model — FROZEN (qualitative):** operational-consumable workflow + durable per-job record.
- **Commercial model — HYPOTHESIS, not frozen:** per-installation or project-hybrid pricing is the current working assumption, but pricing logic must **not** be designed into the product. The only commercial-adjacent requirement this PRD imposes is that a completed Installation Job must be a cleanly countable, timestamped unit (already true — see §7) so that any future pricing model, whatever it turns out to be, has something concrete to meter.

---

## 4. The Most Important Unresolved Variable

Actual SBS installation volume/frequency is unknown. The product must **not** assume high, daily, weekly, or monthly usage, and must **not** assume continuous software dependence. Instead, the product must be usable correctly whether it sees one Job a month or twenty, and must preserve (not dashboard) the operational data needed to learn the answer during the pilot. See §19.

---

## 5. Primary MVP Objective — **FROZEN**

**Test proposition:** can SBS use a structured evidence-and-review workflow to verify remote tank installations and resolve deficiencies before crew demobilization, without requiring routine physical QC travel?

**Optimize for:** workflow completion, evidence quality, accountability, review speed, correction loops, handover readiness, operational adoption.

**Do not optimize for:** feature count, AI sophistication, dashboards, broad construction management, future platform expansion, or subscription revenue.

---

## 6. Users & Roles

| Role | Primary actions | Explicitly cannot do |
|---|---|---|
| **Installer** | Capture evidence against assigned Requirements; mark N/A with reason; flag an issue at any time; view own Job's status | Approve/reject own or others' work; edit or delete submitted evidence |
| **Lead Installer** | Everything an Installer can do; submit a Stage for review once its completeness gate is met (or override with justification); coordinate which installer covers which Requirement | Approve/reject Requirements (QC-only); sign certificates as if they were the client |
| **QC Reviewer / Engineer** | Review submitted Stages/Requirements; approve/reject per Requirement with mandatory comment; confirm or reject N/A justifications; open/resolve Deficiencies; determine handover readiness | Auto-approve without reviewing evidence; the system gives them no "approve all" shortcut that bypasses per-requirement review |
| **Management / Operations** | View Job status (in progress / has open deficiencies / ready for handover / closed) across Jobs | Receive analytics, trend dashboards, or installer-level scorecards in MVP |
| **Client** | Sign the Practical Completion Certificate and, later, the Commissioning Certificate, through SBS's existing process | Access the system directly. **Decision:** MVP has no client-facing interface at all. Certificate signing continues exactly as SBS's existing process (client signs a physical or existing document); the system only records that it happened, when, by whom it was captured internally, and the open-deficiency count at that moment (see §17). This is the minimum client interaction the core workflow requires — none, structurally — and avoids building a portal that nothing in the governed inputs justifies. |

---

## 7. Core Domain Model

**The full field-level domain model lives in `docs/domain-model.md` — it replaces the template's generic `users`/`projects` example schema.** This section states the governed object list and the reasoning; that document states the implementation-ready shape.

The governed model (Installation Job, Installation Guideline, Installation Stage, Requirement, Evidence Item, Deficiency, Corrective Action, Installer, QC Reviewer, Practical Completion Certificate, Commissioning Certificate) is used as-is. Two additions are required beyond it, both classified as **REQUIRED ARCHITECTURAL ADDITIONS**:

- **Event Log** — an append-only, immutable record of every state transition (actor, timestamp, entity), required because auditability (§20) and pilot-timing instrumentation (§19) can't be reliably derived from mutable current-state fields alone.
- **Post-Handover Issue Record** — a minimal, manually-logged record of issues discovered after a Job closes, required because this is the single most important pilot metric and nothing else in the governed model has anywhere to record it.

See `docs/domain-model.md` for every object's fields, relationships, lifecycle, and creation/modification/review ownership.

---

## 8. Installation Guideline → Requirement Architecture

Full specification in `docs/domain-model.md` and `docs/workflow-state-machine.md`. Restated constraint: **the MVP operationalizes SBS's existing guideline content — it does not rewrite or redesign SBS's engineering methodology.** Digitizing the current guideline into Stage/Requirement templates is implementation work; deciding what the guideline *should* say is explicitly out of scope for this product.

---

## 9. Evidence Model

Full specification in `docs/evidence-and-offline.md`. Summary of the boundary that must never be crossed: the system does not claim a photograph proves true bolt torque, hidden gasket compression, foundation levelness, coating performance, or other material/mechanical properties. Where a Requirement needs a physical measurement, the evidence type is a **measurement-note** — a structured, human-recorded reading — not a sensor integration. No sensor integrations are in scope.

---

## 10. Offline-First Requirement

Full specification in `docs/evidence-and-offline.md`. Non-negotiable: evidence capture, N/A marking, and issue-flagging must all work offline and sync later without producing duplicates or losing attribution.

---

## 11. Installation Lifecycle

Full state machine (Requirement level, Stage level, Job level) in `docs/workflow-state-machine.md`.

**Key rule (directly answers the one question this whole product exists to answer):** *the installer saying a Requirement is complete has no system effect by itself.* Completeness (evidence present or N/A+reason) is necessary to submit; it is never sufficient to approve. Only a QC Reviewer action moves a Requirement to Approved.

---

## 12. Completeness Gate

Four states, **never collapsed into a single pass/fail field** — Missing Evidence, Unconvincing Evidence, Defective Work, N/A. Full definitions and resolution paths in `docs/workflow-state-machine.md`.

---

## 13. QC Review

QC Reviewer capabilities, automatic structural flags, and the explicit non-goal (no automated engineering-correctness determination) are fully specified in `docs/workflow-state-machine.md`.

---

## 14. Deficiency + Corrective Action Loop

Full loop specification in `docs/workflow-state-machine.md`. Severity scoring is explicitly **not built** in MVP — **NON-GOAL**, so as not to become an installer-blame proxy.

---

## 15. Accountability Model

**Built (MUST):** named evidence, attributable actions, visible omissions, requirement-level completeness, preserved correction history, and an always-available **"Flag an Issue"** action that behaves identically whether used proactively or reactively.

**Explicitly not built (NON-GOAL):** installer rankings, public scorecards, or any surveillance mechanic.

**This model depends entirely on real, individual, unspoofable user identity — see `docs/identity-and-auth.md` for a critical finding about the template's current authentication that must be resolved before this model can hold.**

---

## 16. WhatsApp

**NON-GOAL for MVP:** WhatsApp API integration or automated ingestion of any kind. The structured system is the source of truth for compliance-critical, Requirement-linked evidence; WhatsApp remains available for informal daily coordination and chat.

---

## 17. Certificates + Handover

Full field-level specification in `docs/domain-model.md`; terminology and boundary context (mechanical completion vs. commissioning vs. handover, per SBS's own published QC/handover practice) in `docs/sbs-domain-context.md`.

**Explicit, non-frozen business decision:** whether certificate signing should be *gated* by the system is a business decision SBS hasn't made, not a validated requirement. MVP does **not** gate it — a certificate can be recorded regardless of Job state, but the open-deficiency count at that moment is always captured.

---

## 18. Notifications

| Event | Classification |
|---|---|
| Stage submitted for review | **MUST** (→ QC) |
| Requirement rejected | **MUST** (→ responsible Installer) |
| Correction submitted | **MUST** (→ QC) |
| Unresolved Deficiency as planned demobilization approaches | **MUST** (→ QC + Lead Installer) |
| Requirement approved | **SHOULD** (→ Installer) |
| Job assigned | **SHOULD** (→ Installer) |
| SMS/WhatsApp fallback channel for the above | **SHOULD**, not MUST |
| Management digest/summary notifications | **DEFERRED** |

---

## 19. Pilot Instrumentation (mandatory — data preservation, not a dashboard)

Full mapping of pilot questions to the exact fields/events that answer them is in `docs/domain-model.md` (Event Log, `planned_demobilization_date`, Post-Handover Issue Record). **Restated explicitly: none of this requires an analytics UI.** It requires that the underlying events and a few small fields exist and are never deleted.

---

## 20. Non-Functional Requirements

| Area | Requirement | Class |
|---|---|---|
| Authentication | Every user has an individual authenticated account; no shared logins | **MUST** — load-bearing for the whole accountability model. **See `docs/identity-and-auth.md` — the template's current auth does not satisfy this today.** |
| Authorization | Installers act only on Jobs they're assigned to; QC Reviewers can review any assigned Job; Management is read-only on status | **MUST** |
| Auditability | Every state transition recorded in an append-only Event Log; no hard deletes of Evidence or Deficiency records, only supersession | **MUST** |
| Data integrity | Evidence immutable once synced; no in-place edits | **MUST** |
| Offline reliability | Per `docs/evidence-and-offline.md` | **MUST** |
| Media storage | Durable, redundant storage; device is never the sole persistent copy once synced | **MUST** |
| Backups | Standard retention practice across all records | **MUST**, schedule = implementation detail |
| Performance | Evidence capture and local save feel instantaneous regardless of connectivity | **MUST** |
| Availability | Reasonable uptime for the QC-side review interface | **SHOULD**, no fabricated SLA number |
| Privacy | Installer identity/device data and client name handled per applicable data-protection practice; data minimized to what the workflow needs | **MUST**, general |
| Security | Encryption at rest and in transit | **MUST**, implementation-neutral |

---

## 21. MVP Boundary

**MUST BUILD:** individual authenticated roles (Installer, Lead Installer, QC Reviewer, Management-read-only); Guideline→Stage→Requirement structure with versioning; offline-capable evidence capture with idempotent sync; the four-state completeness gate; per-Requirement QC review with mandatory rejection reason and type; Deficiency + Corrective Action loop; "Flag an Issue"; append-only Event Log; certificate recording with open-deficiency capture; Post-Handover Issue Record; the MUST notifications in §18; the pilot-instrumentation data points in §19.

**SHOULD BUILD:** SMS/WhatsApp fallback notifications; approval/job-assigned notifications; GPS metadata capture on evidence.

**DO NOT BUILD (NON-GOAL):** AI computer vision; automated engineering approval; installer scoring; analytics dashboards; generic project/construction management; CRM; ERP; sensors/IoT integrations; blockchain; WhatsApp API automation/ingestion; a broad client portal; a marketplace; verification-as-a-service for other companies; predictive quality intelligence; Deficiency severity scoring.

---

## 22. Acceptance Criteria (representative — apply the same discipline throughout)

1. **Given** a Requirement marked "Evidence Required," **an installer cannot** submit its Stage for review unless evidence exists on it or it is explicitly marked N/A with a non-empty reason.
2. **Given** a QC Reviewer rejects a Requirement, **the system requires** a non-empty comment and a `rejection_type` (Unconvincing Evidence or Defective Work) before the rejection can be saved.
3. **Given** an Installer marks a Requirement N/A, **the Requirement remains** in "Closed-N/A (pending)" until a QC Reviewer explicitly confirms or rejects that claim — it never auto-confirms.
4. **Given** an Evidence Item has been rejected, **the system never deletes it**; a replacement Evidence Item is created with `supersedes_evidence_ref` pointing to the original, and both remain visible in the Requirement's history.
5. **Given** a device is offline, **an Installer can** capture and locally queue evidence, and the queue persists across app restarts until sync succeeds.
6. **Given** an Evidence Item upload is retried after a failed attempt, **the system does not** create a duplicate record — retries are idempotent against the item's client-generated UUID.
7. **Given** a Job reaches "Ready for Handover" state, **this requires** every Requirement across every Stage to be Approved or Closed-N/A (confirmed), with zero open Deficiencies anywhere in the Job.
8. **Given** a Practical Completion Certificate is recorded while Deficiencies are still open, **the system does not block the recording**, but **it does store** `signed_with_open_deficiencies = true` and the exact open count at that timestamp.
9. **Given** any state transition occurs on any governed object, **an Event Log entry is created** with actor, timestamp, and entity reference, and this entry is never edited or deleted afterward.
10. **Given** an Installer uses "Flag an Issue" on a Requirement that has not yet been reviewed by QC, **the system creates** a Deficiency with `rejection_type = Installer-Flagged Issue`, functionally identical in workflow to a QC-initiated rejection.

---

## 23. Edge Cases

Full table in `docs/workflow-state-machine.md` and `docs/evidence-and-offline.md`. Includes: poor/no connectivity, duplicate uploads, failed uploads, device loss/change, multiple installers on one Job, QC rejection paths, N/A handling, Deficiency reopening, demobilization with unresolved Deficiencies, client signing before verification, pause/resume, and multi-tank sites (deferred).

---

## 24. Implementation Boundary

| Category | Definition | Example from this PRD |
|---|---|---|
| **Product Requirement** | What the system must do | "Evidence must be linked to a specific Requirement, never to a Stage or Job directly" |
| **Domain Rule** | A business/workflow rule | "A Requirement cannot be Approved without a QC Reviewer's explicit action" |
| **Technical Constraint** | Required for reliability, not a business rule | "Evidence uploads must be idempotent against a client-generated UUID" |
| **Implementation Detail** | A specific engineering choice, deliberately left open here | Which mobile framework, database engine, or hosting provider is used |

This PRD stays at the first three levels throughout and does not prescribe the fourth. See `docs/documentation-map.md` for which document owns which category.

---

## 25. Governance Classification Summary

| Cluster | Classification |
|---|---|
| Product boundary (§1), governing philosophy and workflow (§2), primary MVP objective (§5) | **FROZEN** |
| Full domain model (§7, `docs/domain-model.md`), including the two Required Architectural Additions | **MUST** |
| Completeness gate's four-state model (§12), per-Requirement QC approval (§13) | **MUST** |
| Stage sequencing / whether later stages block on earlier open Deficiencies | **HYPOTHESIS** |
| Certificate-signing gating by the system | **HYPOTHESIS / business decision, explicitly not made here** |
| SMS/WhatsApp fallback notifications, GPS evidence metadata | **SHOULD** |
| Management digest notifications, "which activities moved off WhatsApp" tracking | **DEFERRED** |
| Verification-as-a-service, predictive quality intelligence, analytics dashboards, installer scoring, WhatsApp API ingestion, sensors, blockchain, CRM/ERP, generic construction management, broad client portal | **NON-GOAL** |
| Actual installation volume, adoption durability, whether the software (vs. the practice) remains necessary long-term | **HYPOTHESIS**, tracked via §19, resolved only by pilot data |

---

## 26. Open Validation Items (pilot learning objectives, not blockers to building)

1. Actual SBS installation volume/frequency.
2. Whether crews consistently adopt the structured workflow rather than defaulting to WhatsApp.
3. Whether QC can realistically review before crew demobilization.
4. Whether WhatsApp remains a shadow system for compliance-critical evidence.
5. Actual rectification cost per post-handover issue.
6. Actual QC travel cost per site visit.
7. Whether the software produces measurable operational savings.
8. Whether SBS keeps using the system across successive Jobs without being prompted.

None of these block MVP construction. All of them are answered by the data this PRD already requires the system to preserve.

---

## 27. Final Product Test

**If SBS uses this product for its next ten Installation Jobs, what happens from creation to handover?**
Each Job is created from the current Guideline version, instantiating its Stages and Requirements. Installers, working offline as needed, capture evidence against specific Requirements as work proceeds; anything without applicable evidence is marked N/A with a reason. When a Stage's completeness gate is met (or overridden with justification), the Lead Installer submits it. A QC Reviewer reviews each Requirement individually — approving, rejecting with a typed reason, or confirming/rejecting N/A claims. Rejections open Deficiencies; installers submit Corrective Actions with new evidence; QC re-reviews until resolved. Once every Stage is Approved or Closed-N/A with zero open Deficiencies, the Job is Ready for Handover — a recommendation, not a legal act. SBS proceeds with its existing certificate process; the system records that event and the open-deficiency count at that moment. Later, Commissioning is recorded the same way, and the Job closes. Every transition lands in the Event Log.

**What is the smallest version of this product that could run those ten jobs reliably?**
Exactly the MUST BUILD list in §21.

**What evidence would prove this has become part of SBS's normal operation, not just an experiment?**
Jobs being created in the system on SBS's own initiative across successive months, without vendor prompting; submission activity spread across multiple installers, not one "champion" user; a falling rate of Jobs with zero system evidence despite being marked in progress; QC consistently completing reviews within the crew's actual demobilization window; and Post-Handover Issue Records trending down relative to SBS's informal pre-pilot baseline.
