# Documentation Map & Source-of-Truth Hierarchy

**Read this file first, before any other file in `docs/`.** It exists so no AI coding agent ever has to guess which document to believe.

---

## 1. The Hierarchy

```
1. docs/PRD.md
   ↓ (defines WHAT and WHY; scope, roles, boundaries, MVP list, classifications)
2. docs/domain-model.md  +  docs/workflow-state-machine.md  +  docs/evidence-and-offline.md
   ↓ (define the DOMAIN RULES and DATA SHAPE the PRD implies — authoritative on field-level
      and transition-level detail once the PRD has settled scope)
3. docs/identity-and-auth.md  +  docs/sbs-domain-context.md
   ↓ (EXPLANATORY / TECHNICAL CONSTRAINT — protect specific boundaries the layers above
      set; never introduce new scope on their own authority)
4. docs/architecture.md  +  docs/design-system.md
   ↓ (technical topology and visual system — how the layers above get built, not what
      gets built)
5. AGENTS.md  +  .agents/rules/skill-orchestration.md  +  .agents/skills/**/SKILL.md
   (HOW the agent thinks, codes, and sequences work — reusable across any project built
    from this template; unchanged by this documentation package)
6. docs/ai-studio-handoff.md
   (ORCHESTRATION — how to move through layers 1–5 in the right order, in Google AI Studio
    specifically)
```

**Rule for resolving any apparent conflict:** the lower the number, the more specific and more recently-governed the document is about *product* questions (1–3); the higher the number, the more it governs *process and mechanics* rather than product scope (4–6). A process document (5–6) never overrides a product document (1–3) on a question of scope, even if the process document says something more convenient to implement. If `docs/domain-model.md` and `docs/PRD.md` ever appear to disagree, `docs/PRD.md` wins — and this should be reported as a discovered inconsistency, not silently resolved by picking whichever is easier to build.

## 2. What Each File Is Actually For

| File | Answers | Consumed by |
|---|---|---|
| `docs/PRD.md` | What is this product, who is it for, what's in/out of MVP, what's frozen vs. hypothesis | Everyone, first |
| `docs/domain-model.md` | What tables/objects exist, what fields they have, who owns them | Backend implementer |
| `docs/workflow-state-machine.md` | What states exist, what triggers a transition, who's allowed to trigger it | Backend implementer |
| `docs/evidence-and-offline.md` | How evidence capture and sync must behave, and what it must never claim to prove | Backend + frontend implementer |
| `docs/identity-and-auth.md` | Why the template's current auth is not good enough for this product, and what "good enough" means here | Whoever touches `src/lib/auth/` first |
| `docs/sbs-domain-context.md` | Terminology mapping and one specific scope boundary (data-book creep) | Anyone confused by SBS's own public material about commissioning/handover |
| `docs/architecture.md` | Stack, directory layout, which parts are reusable vs. SBS-specific | Everyone, early |
| `docs/design-system.md` | Visual tokens — currently generic, flagged as not-yet-SBS-specific | Whoever runs `anti-ai-design` first |
| `AGENTS.md` / `.agents/rules/skill-orchestration.md` / `.agents/skills/**` | How the agent reasons, codes defensively, and sequences skills | Every agent, every session, unconditionally |
| `docs/ai-studio-handoff.md` | What order to do all of the above in, specifically in Google AI Studio | Whoever is running the AI Studio session |

## 3. Files Deliberately Not Created (and why)

- **A separate API contracts document** — premature. The domain model and workflow spec are precise enough that `api-and-interface-design` (already in `.agents/skills/`) can derive contracts per vertical slice as implementation proceeds. Writing them now, before any slice exists, would be guessing at a level of detail the PRD's own Implementation Boundary (§24) says to leave open.
- **A separate testing-strategy or security document** — the existing `test-driven-development`, `trustless-system-auditor`, and `security-and-hardening` skills already cover this generically and correctly; the SBS-specific test cases that matter are already the Acceptance Criteria and Edge Cases in `docs/PRD.md` §22–23 and the tables in `docs/workflow-state-machine.md`. Duplicating instructions the skills already give would violate the "avoid instruction duplication" instruction this documentation package was built under.
- **A separate deployment/environment document** — nothing SBS-specific changes about how this template is deployed; the existing `DATABASE_PROVIDER` env-var pattern is unchanged.

## 4. One Known, Pre-Existing Repository Inconsistency (not caused by this project, not fixed by this package)

`.agents/skills/using-agent-skills/SKILL.md`, `AGENTS.md`, and `GEMINI.md` all reference a `ui-composition-engine` skill (for "non-generic/spatial" UI decisions) that does not exist as a directory under `.agents/skills/` in this repository checkout. This is a template-level gap, unrelated to SBS, and this documentation package does not fix it (per the instruction not to rewrite the reusable skill system). **Practical guidance for this project:** the SBS product is workflow/forms/review-queue software, not spatial/landing-page design work, so this branch of the skill-discovery tree is unlikely to be triggered. If it ever is, fall back to `anti-ai-design` → `frontend-ui-engineering` directly and proceed — do not block waiting for a skill that isn't present in this checkout.
