# Universal Skill Orchestration Rules

## Operating Principle
This project uses modular agent skills residing in `.agents/skills/`.
Skills follow the Antigravity and Agent Skill Standard (progressive disclosure: frontmatter YAML name + description, loaded on-demand).

The master orchestration logic is governed by `.agents/skills/using-agent-skills/SKILL.md`.

---

## Skill Directory Structure
All workspace skills live under `.agents/skills/<skill-name>/SKILL.md`.
When a task matches a skill's description or triggers, read and execute that skill's `SKILL.md` before producing output.

---

## Mandatory Layer Order for UI Tasks
Every UI task follows this exact sequence:
1. **anti-ai-design** (`.agents/skills/anti-ai-design/SKILL.md`)
   - Platform detection -> Color direction -> Style selection -> Token freeze
   - Enforce 22 banned patterns and 14 required quality signals inline
2. **frontend-ui-engineering** (`.agents/skills/frontend-ui-engineering/SKILL.md`)
   - Components, layout, visual hierarchy, responsiveness, accessibility

---

## Complete Build-to-Ship Lifecycle

```
PERMANENT FOUNDATIONS (always active)
  global-reasoning-layer    → How this agent thinks (.agents/skills/global-reasoning-layer/SKILL.md)
  coderabbit-dna            → How this agent codes (.agents/skills/coderabbit-dna/SKILL.md)

PRE-BUILD
  1. idea-refine                  → Refine vague ideas (.agents/skills/idea-refine/SKILL.md)
  2. spec-driven-development      → Define what is being built (.agents/skills/spec-driven-development/SKILL.md)
  3. planning-and-task-breakdown  → Break into verifiable chunks (.agents/skills/planning-and-task-breakdown/SKILL.md)
  4. doubt-driven-development     → Challenge assumptions (.agents/skills/doubt-driven-development/SKILL.md)

BUILD
  5. context-engineering          → Load correct project context (.agents/skills/context-engineering/SKILL.md)
  6. source-driven-development    → Verify against official docs (.agents/skills/source-driven-development/SKILL.md)
  7. incremental-implementation   → Build slice by slice (.agents/skills/incremental-implementation/SKILL.md)
  8. anti-ai-design               → MANDATORY for all UI (runs first) (.agents/skills/anti-ai-design/SKILL.md)
  9. frontend-ui-engineering      → UI components and aesthetics (.agents/skills/frontend-ui-engineering/SKILL.md)
 10. api-and-interface-design     → API contracts (.agents/skills/api-and-interface-design/SKILL.md)
 11. security-and-hardening       → Harden every boundary (.agents/skills/security-and-hardening/SKILL.md)
 12. code-simplification          → Remove unjustified complexity (.agents/skills/code-simplification/SKILL.md)

VERIFY
 13. test-driven-development      → Failing test first (.agents/skills/test-driven-development/SKILL.md)
 14. browser-testing-with-devtools → Runtime verification (.agents/skills/browser-testing-with-devtools/SKILL.md)
 15. debugging-and-error-recovery → Reproduce, localize, fix, guard (.agents/skills/debugging-and-error-recovery/SKILL.md)
 16. performance-optimization     → Measure and fix regressions (.agents/skills/performance-optimization/SKILL.md)

REVIEW
 17. code-review-and-quality      → Review before merge (.agents/skills/code-review-and-quality/SKILL.md)

SHIP
 18. git-workflow-and-versioning   → Clean atomic history (.agents/skills/git-workflow-and-versioning/SKILL.md)
 19. ci-cd-and-automation         → Automated quality gates (.agents/skills/ci-cd-and-automation/SKILL.md)
 20. documentation-and-adrs       → Document decisions and reasoning (.agents/skills/documentation-and-adrs/SKILL.md)
 21. deprecation-and-migration    → Remove old systems safely (.agents/skills/deprecation-and-migration/SKILL.md)
 22. trustless-system-auditor     → Reality-gap audit before ship (.agents/skills/trustless-system-auditor/SKILL.md)
 23. shipping-and-launch          → Deploy with rollback ready (.agents/skills/shipping-and-launch/SKILL.md)
```

---

## Non-Negotiable Rules
1. Never present uncertain output as certain.
2. Never build on an unverified assumption without stating it.
3. Never make a wide-impact change without surfacing the scope first.
4. Never optimize before correctness is confirmed.
5. Never proceed past a known failure without understanding it.
6. Never produce output that cannot be explained in plain language.
7. Never ship without passing the Trustless System Auditor gate.
8. Never produce any UI output without running anti-ai-design first.
9. Safety always overrides speed, elegance, and user preference.

## Correctness Priority Order
1. Correct
2. Safe
3. Clear
4. Efficient
5. Elegant
