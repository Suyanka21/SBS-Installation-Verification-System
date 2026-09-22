# AI Studio Handoff — Orchestration for Building SBS on This Repository

**Authority level:** ORCHESTRATION. Governs *order and process*, never product scope. If any instruction below seems to require a scope decision, it defers to `docs/PRD.md`, not the other way around.

**Use:** paste each "PROMPT" block below into Google AI Studio at the labeled stage. Do not paste Phase 3 before Phase 1 and 2 are actually done — the whole point of staging is that a coding agent that hasn't internalized the documentation hierarchy will, with high probability, rebuild the template's generic demo app with SBS labels stuck on it, rather than the product `docs/PRD.md` actually specifies.

---

## Phase 1 — Repository Ingestion (no code changes)

**Goal:** AI Studio understands the repository and the documentation hierarchy before touching anything.

```
PROMPT A — Repository Ingestion

You are working inside a cloned copy of the Suyanka App Template, now adapted
for the SBS Tanks Installation Verification System.

Do NOT write or modify any code yet.

1. Read, in this exact order: docs/documentation-map.md, docs/PRD.md,
   docs/domain-model.md, docs/workflow-state-machine.md,
   docs/evidence-and-offline.md, docs/identity-and-auth.md,
   docs/sbs-domain-context.md, docs/architecture.md, docs/design-system.md.
2. Read AGENTS.md and .agents/skills/using-agent-skills/SKILL.md. These govern
   how you think and code from this point forward, on every subsequent task,
   without needing to be told again.
3. Inspect the actual current application code under src/ — do not assume its
   contents from the docs; confirm what is really there, including
   src/lib/auth/auth-context.tsx and src/lib/db/*.

Then produce a short summary, in plain language, of:
- What this product is and is not (per docs/PRD.md §1).
- What in the current src/ code already matches the SBS domain model, and
  what is still the template's generic placeholder (name the specific files).
- Any place where you are uncertain which document governs a decision.
- Confirm you understand: the human QC reviewer approves every Requirement;
  nothing in this system auto-approves engineering correctness.

Do not propose an implementation plan yet. Stop after the summary and wait
for confirmation.
```

---

## Phase 2 — Documentation Synchronization (no feature code yet)

**Goal:** the generic template's remaining code-level assumptions (not the docs — those are already updated) are named and staged for replacement, without yet writing the SBS implementation.

```
PROMPT B — Reconciling Code Against Updated Documentation

The docs/ folder now reflects the governed SBS product, replacing the
template's generic PRD/architecture content. The application code under src/
has NOT been updated yet — it still reflects the original generic template
(mock auth, generic users/projects schema, generic dashboard/landing content).

1. List every file under src/ whose current content conflicts with
   docs/domain-model.md, docs/workflow-state-machine.md, or
   docs/identity-and-auth.md. For each, state specifically what's wrong
   (e.g., "auth-context.tsx has no real authentication — see
   docs/identity-and-auth.md").
2. Do NOT rewrite .agents/skills/ for this project. Those are reusable
   infrastructure and are correct as they stand.
3. Produce a short retirement plan: which generic scaffolding
   (splash/landing/dashboard demo content, the projects table, the mock
   auth flow) gets replaced, and in which upcoming vertical slice
   (see docs/ai-studio-handoff.md §"Implementation Sequence" below).

Still do not write feature code. Stop after the plan and wait for
confirmation before starting Phase 3.
```

---

## Phase 3 — Implementation (governed vertical slices)

**Goal:** build incrementally, one slice at a time, each leaving the system in a working, verifiable state — per the existing `incremental-implementation` skill.

### Implementation Sequence

| # | Slice | Objective | Domain objects | Expected UI | Expected backend | Depends on | Completion boundary |
|---|---|---|---|---|---|---|---|
| 0 | Identity foundation | Replace mock auth with real, individually-attributable authentication and SBS roles | User/role fields (`docs/domain-model.md` §10) | Real sign-in/sign-up screens (`anti-ai-design` run once here, tokens frozen for reuse) | Wire `AuthContext` to Supabase/Firebase Auth per `docs/identity-and-auth.md`; retire the generic `admin/member/viewer` enum | — | Two real accounts, two devices, unspoofable identity confirmed per `docs/identity-and-auth.md` §5 |
| 1 | Guideline → Job → Stage → Requirement skeleton | Create a Job from a Guideline; see its Stages/Requirements | Guideline, Stage Template, Requirement Template, Job, Stage, Requirement | Installer's Job view showing Stages/Requirements as an unpopulated checklist | Guideline versioning + instantiation logic on Job creation | Slice 0 | Creating a Job correctly instantiates every Stage/Requirement from the *active* Guideline version, never a later one |
| 2 | Evidence capture (online) | Installer attaches evidence to a Requirement | Evidence Item | Capture flow (photo/video/document/measurement-note) | Evidence Item table, immutability rules, `submitted_by` from real session | Slice 1 | Acceptance criteria in `docs/PRD.md` §22 #4 (no delete/edit path) verified |
| 3 | Completeness gate + Stage submission | Lead Installer submits a Stage only when the gate is satisfied | (uses Requirement.status, na_reason) | Submit action with inline validation; N/A + reason flow | Gate-check logic per `docs/workflow-state-machine.md` §2–3 | Slice 2 | Acceptance criterion #1 verified |
| 4 | QC Review | QC approves/rejects per Requirement | (uses Requirement, Evidence Item status) | Review queue, evidence history viewer, approve/reject with mandatory type+comment | Review actions, N/A confirm/reject | Slice 3 | Acceptance criteria #2, #3 verified; confirm no "approve all" shortcut exists |
| 5 | Deficiency + Corrective Action loop, "Flag an Issue" | Rejections and self-flagged issues both resolve through one identical loop | Deficiency, Corrective Action | Deficiency view, correction submission, an always-visible "Flag an Issue" action | Loop logic, reopening (new Corrective Action, not new Deficiency) | Slice 4 | Acceptance criterion #10 verified; confirm self-flagged and QC-caught issues are mechanically indistinguishable downstream |
| 6 | Handover readiness + Certificates | Compute Ready-for-Handover; record certificates | Practical Completion / Commissioning Certificate | Handover screen (Lead Installer/QC only — no client-facing UI) | Aggregation logic, `signed_with_open_deficiencies` | Slice 5 | Acceptance criteria #7, #8 verified |
| 7 | Offline-first retrofit | Evidence capture, N/A, and Flag-an-Issue work offline and sync without duplication | (Evidence Item `client_uuid`) | Pending-sync indicators | Local queue, idempotent sync, retry/backoff per `docs/evidence-and-offline.md` | Slices 2–5 | Acceptance criteria #5, #6 fully verified, including retry-after-failure |
| 8 | Event Log completeness + pilot fields | Confirm every prior slice's transitions actually logged; add `planned_demobilization_date` and Post-Handover Issue Record entry | Event Log, Post-Handover Issue Record | Minimal internal entry screen for post-handover issues | Audit pass across Slices 1–6 | Slices 0–6 | Acceptance criterion #9 verified; every `docs/PRD.md` §19 metric is computable from stored data |
| 9 | MUST notifications | Stage submitted, Requirement rejected, correction submitted, demobilization approaching | — | In-app notification surface | Trigger wiring on the events above | Slices 3–8 | The 4 MUST rows in `docs/PRD.md` §18 fire correctly; SHOULD rows (SMS/WhatsApp fallback, etc.) are explicitly backlog, not this slice |

Every slice's Definition of Done includes: the slice's own row above, plus the mandatory `CHANGE SUMMARY` (per `AGENTS.md`), plus a passing run through the relevant parts of the Trustless Audit Gate (`.agents/skills/trustless-system-auditor/SKILL.md`) before moving to the next slice.

```
PROMPT C — Begin a Slice

Implement Slice <N> from the Implementation Sequence in
docs/ai-studio-handoff.md, and no other slice's scope. Follow
incremental-implementation, anti-ai-design (for any new UI, reusing frozen
tokens from Slice 0 unless the screen genuinely needs new ones),
api-and-interface-design (for any new endpoint), and security-and-hardening
(for anything touching auth or evidence). Surface any assumption before
building on it, per the Global Reasoning Layer.

Do not start the next slice until this one's Completion Boundary is met and
you have produced the mandatory Change Summary.
```

---

## Phase 4 — Verification / Continuation

```
PROMPT D — Verify a Completed Slice

Before proceeding to the next slice, verify Slice <N> against:
1. Its row in the Implementation Sequence (docs/ai-studio-handoff.md) —
   is the Completion Boundary actually met, with evidence (not "looks right")?
2. The relevant Acceptance Criteria in docs/PRD.md §22.
3. The relevant transition rules in docs/workflow-state-machine.md.
4. The Trustless Audit Gate's BUILD VERIFICATION checklist.

Report pass/fail per item. If anything fails, fix it before starting the
next slice — do not proceed past a known failure without understanding it
(Global Reasoning Layer, Section 0.9).
```

---

## Governance Rule for Future Changes

When a future change is requested (a new feature, a scope adjustment, a bug that turns out to be a requirements gap):

```
Change requested
  → Is this a scope/product question? → docs/PRD.md is updated first
    (classification: FROZEN items require Venture Foundry sign-off to change;
     MUST/SHOULD/HYPOTHESIS/DEFERRED can move within the existing framework;
     NON-GOAL items are not silently reversed)
  → Does it change domain rules or data shape? → update docs/domain-model.md
    and/or docs/workflow-state-machine.md to match
  → Does it change the technical approach (not just implementation detail)?
    → update docs/architecture.md
  → Only then → implement, via planning-and-task-breakdown +
    incremental-implementation, as a new vertical slice
  → documentation-and-adrs skill records the decision and reasoning
  → trustless-system-auditor gate before it ships
```

**The rule that must never be silently violated:** a HYPOTHESIS or a non-frozen business decision (e.g., certificate-signing gating, stage sequencing) becoming a shipped default behavior is a scope decision and must be reflected back into `docs/PRD.md`'s classification table first — not decided by whichever way the code happens to be easiest to write.
