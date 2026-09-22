# SBS Workflow & State Machine Specification

**Authority level:** DOMAIN/WORKFLOW RULE layer. Subordinate to `docs/PRD.md` on scope; authoritative on transition-level behavior. See `docs/documentation-map.md`.

This document exists so a backend implementation agent can build the state machine directly, without re-deriving it from PRD prose. Where the PRD marks something HYPOTHESIS or a non-frozen business decision, that classification is repeated here rather than quietly resolved.

---

## 1. Requirement-Level State Machine

| From | To | Actor | Trigger | Prerequisite | Evidence required? | Notified? |
|---|---|---|---|---|---|---|
| Not Started | Evidence Submitted | Installer | captures evidence | — | yes | no |
| Not Started | Closed-N/A (Pending) | Installer | marks N/A | reason text required | no | no |
| Evidence Submitted | Under Review | QC Reviewer | Stage submitted, opens for review | Stage submission occurred | — | no |
| Under Review | Approved | QC Reviewer | approves | evidence judged sufficient and correct | — | yes → Installer |
| Under Review | Deficiency Opened | QC Reviewer | rejects | mandatory comment + `rejection_type` | — | yes → responsible user |
| Closed-N/A (Pending) | Closed-N/A (Confirmed) | QC Reviewer | confirms N/A | — | — | no |
| Closed-N/A (Pending) | Not Started | QC Reviewer | rejects N/A claim | comment required | — | yes → Installer |
| Deficiency Opened | Correction Submitted | Installer | submits Corrective Action + new evidence | — | yes | yes → QC |
| Correction Submitted | Approved / Deficiency Reopened | QC Reviewer | re-reviews | — | — | yes |

**The one rule everything else in this document exists to protect:** an Installer's own claim of completeness has zero system effect. Completeness (evidence present, or N/A + reason) is necessary to *submit*; it is never sufficient to *approve*. Only an explicit QC Reviewer action produces `Approved`.

---

## 2. The Completeness Gate — Four States, Never Collapsed

| State | Meaning | Who resolves | How |
|---|---|---|---|
| **Missing Evidence** | Structural — nothing submitted against a mandatory Requirement | System blocks Stage submission by default | Installer submits evidence, or marks N/A + reason (override) |
| **Unconvincing Evidence** | Evidence exists, QC judges it insufficient | Human judgment only | `rejection_type = Unconvincing Evidence`; installer re-shoots/resubmits evidence only — no rework implied |
| **Defective Work** | The installation itself is judged deficient | Human judgment only | `rejection_type = Defective Work`; installer performs Corrective Action, then submits new evidence |
| **N/A** | Requirement genuinely doesn't apply | Installer proposes, QC confirms | Reason required; QC can reject the claim, which reopens the Requirement at `Not Started` |

**Why this matters enough to repeat:** collapsing these into one pass/fail field is the single easiest way to accidentally rebuild "digital checklist" (which the venture's own research found doesn't stop concealment) instead of the accountability system the PRD actually specifies.

---

## 3. Stage-Level State Machine

`Not Started → In Progress → Submitted for Review → Under Review → Approved (all Requirements Approved/Closed-N/A) | Has Open Deficiencies (any Requirement rejected)`

**Submission gate:** a Lead Installer can move a Stage to `Submitted for Review` only when every mandatory Requirement in it is past `Missing Evidence` (i.e., has evidence or a proposed N/A). This is the one completeness check the system enforces mechanically.

**Sequencing — HYPOTHESIS, not frozen:** Stages are ordered (`sequence_order`) for guideline clarity, but the system does **not** hard-block starting Stage N+1 while Stage N has open Deficiencies. Real fieldwork ordering constraints are unvalidated. Do not add this constraint without a documented reason and a corresponding PRD update.

---

## 4. Job-Level State Machine

`Not Started → In Progress → Ready for Handover (all Stages Approved, zero open Deficiencies anywhere in the Job) → Practical Completion Recorded → Closed–Awaiting Commissioning → Commissioning Recorded → Closed`

**The one hard Job-level gate:** a Job cannot reach `Ready for Handover` while *any* Stage anywhere in it has an open Deficiency — regardless of stage order (this is what actually matters; stage sequencing above does not).

**Handover override — non-frozen business decision, repeated here deliberately:** a Practical Completion Certificate can be recorded even when the Job is not system-flagged `Ready for Handover`. The system does not block this — SBS's authority over its own certificate process is not the software's to override — but every such recording sets `signed_with_open_deficiencies` and the exact count. This is how the "client signs before technical verification" edge case is handled: made visible, not prevented.

---

## 5. QC Review — Capabilities and Automatic Flags

**QC Reviewer can:** see submitted Jobs/Stages/Requirements; inspect full evidence history per Requirement (including superseded/rejected items); approve or reject **per Requirement**, never a blanket per-stage approval; provide mandatory rejection reason + type; confirm or reject N/A claims; open/track Deficiencies; review Corrective Actions; determine Job-level handover readiness.

**System automatically flags (structural signals only — never a correctness judgment):**
- Missing evidence on a mandatory Requirement at submission attempt (this one is a hard block, not just a flag).
- A Stage with untouched Requirements.
- Any Job with unresolved Deficiencies as `planned_demobilization_date` approaches.
- N/A claims lacking a reason (blocked from submission entirely).
- Evidence where `device_captured_at` is far earlier than `submitted_at`.

**Explicitly, permanently out of scope — this is not a phase-2 feature, it is a boundary:** any automatic determination of whether the installed work is engineeringly correct. There is no confidence score, no ML classifier, no "likely defect" flag on evidence content itself. If a future stakeholder asks for this, it is a product-strategy question for Venture Foundry, not an implementation detail for this repository.

---

## 6. Deficiency → Corrective Action Loop

`Requirement rejected (or self-flagged) → Deficiency (Open) → Corrective Action + new Evidence (Correction Submitted) → QC re-review → Resolved | Reopened (loop back to Correction Submitted)`

- Reopening a Resolved Deficiency creates a **new Corrective Action row against the same Deficiency**, never a new Deficiency record.
- No severity field exists anywhere in this loop (PRD §7.5/§14, NON-GOAL).

---

## 7. Accountability-Relevant Behavior That Belongs Here, Not Just in Prose

- **"Flag an Issue"** creates a Deficiency with `rejection_type = Installer-Flagged Issue`. It must be reachable from any Requirement's UI at any time — including before any QC review has happened on it — and its resulting workflow (Correction Submitted → re-review → Resolved) is **identical in every mechanical respect** to a QC-initiated rejection. No status field, label, or downstream report may distinguish "installer disclosed this" from "QC caught this" in a way visible to Management. If an implementer needs to distinguish them internally for debugging, that distinction must not leak into any user-facing surface.

---

## 8. Edge Case → Behavior Map

| Edge case | Defined behavior |
|---|---|
| Poor/no connectivity | See `docs/evidence-and-offline.md` |
| QC rejects evidence (not the work itself) | `rejection_type = Unconvincing Evidence`; no Corrective Action required unless QC separately flags defective work |
| QC rejects the work itself | `rejection_type = Defective Work`; Corrective Action + new evidence required before re-review |
| One installer submits evidence "for" another | Not distinguished by the system — attribution is to the authenticated submitter only. This is a training/process matter, explicitly not solved by software. |
| Multiple installers on one Job | Each Evidence Item independently attributed via `submitted_by`; no team-level attribution exists anywhere |
| Job reaches demobilization with unresolved Deficiencies | System surfaces the MUST notification in advance (PRD §18); it cannot and does not force the crew to stay |
| Client signs before technical verification | Recording is not blocked (§4 above); `signed_with_open_deficiencies` captured regardless |
| Installation paused / resumed | Job simply stays `In Progress`; no forced timeout, no state reset on a gap in activity |
| Multi-tank site | Out of scope for MVP as a modeled concept — deferred, see `docs/domain-model.md` §14 |
