# AGENT SKILLS — ALWAYS ACTIVE

This file is loaded at the start of every session and governs every task,
every line of code, and every output produced in this project.
These are not optional tools. They are the operating system of this agent.


---


## MANDATORY: HOW SKILLS ARE LOADED

All skills live in: `.agents/skills/` (relative to this file)
The anti-AI design skill lives in: `.agents/skills/anti-ai-design/`

The master orchestration file must be internalized first:

```
.agents/skills/using-agent-skills/SKILL.md
```

This file contains:
- The Global Reasoning Layer (Section 0) — how this agent thinks at all times
- CodeRabbit DNA (Section 1) — how this agent codes at all times
- The Skill Discovery Map (Section 2) — which skill to activate per task type
- The UI Design Protocol (Section 5) — anti-ai-design + ui-composition-engine order
- The Trustless Audit Gate (Section 6) — what must pass before anything ships
- The Complete Lifecycle Sequence (Section 7) — full build-to-ship order

**The agent does not wait to be told to use these. They apply from the first instruction.**


---


## SKILL REGISTRY — ALL ACTIVE SKILLS

### PERMANENT FOUNDATIONS (always active, never need to be invoked)

| Skill | Path | Role |
|-------|------|------|
| global-reasoning-layer | `.agents/skills/global-reasoning-layer/SKILL.md` | How this agent thinks. Always active. Never overridden. |
| coderabbit-dna | `.agents/skills/coderabbit-dna/SKILL.md` | How this agent codes. Applied to every line. |

### PRE-BUILD SKILLS

| Skill | Path | When to Activate |
|-------|------|-----------------|
| idea-refine | `.agents/skills/idea-refine/SKILL.md` | Vague ideas that need structured refinement before a spec |
| spec-driven-development | `.agents/skills/spec-driven-development/SKILL.md` | Any new project, feature, or change — define before coding |
| planning-and-task-breakdown | `.agents/skills/planning-and-task-breakdown/SKILL.md` | Breaking a spec into small verifiable tasks |
| doubt-driven-development | `.agents/skills/doubt-driven-development/SKILL.md` | When requirements feel wrong or assumptions need challenging |

### BUILD SKILLS

| Skill | Path | When to Activate |
|-------|------|-----------------|
| context-engineering | `.agents/skills/context-engineering/SKILL.md` | Loading the right project context before implementation |
| source-driven-development | `.agents/skills/source-driven-development/SKILL.md` | Verifying implementation against official documentation |
| incremental-implementation | `.agents/skills/incremental-implementation/SKILL.md` | Building in thin vertical slices |
| **anti-ai-design** | `.agents/skills/anti-ai-design/SKILL.md` | **ALL UI work — ALWAYS runs first. Mandatory.** |
| frontend-ui-engineering | `.agents/skills/frontend-ui-engineering/SKILL.md` | UI components, visual aesthetics, accessibility — runs after anti-ai-design |
| api-and-interface-design | `.agents/skills/api-and-interface-design/SKILL.md` | API contracts, interface definitions |
| security-and-hardening | `.agents/skills/security-and-hardening/SKILL.md` | Every input boundary, auth, and data exposure point |
| code-simplification | `.agents/skills/code-simplification/SKILL.md` | Removing unjustified complexity |

### VERIFY SKILLS

| Skill | Path | When to Activate |
|-------|------|-----------------|
| test-driven-development | `.agents/skills/test-driven-development/SKILL.md` | Writing and running tests — failing test first |
| browser-testing-with-devtools | `.agents/skills/browser-testing-with-devtools/SKILL.md` | Runtime verification via browser DevTools |
| debugging-and-error-recovery | `.agents/skills/debugging-and-error-recovery/SKILL.md` | Anything broken — reproduce, localize, fix, guard |
| performance-optimization | `.agents/skills/performance-optimization/SKILL.md` | Measure first, then optimize what matters |

### REVIEW SKILLS

| Skill | Path | When to Activate |
|-------|------|-----------------|
| code-review-and-quality | `.agents/skills/code-review-and-quality/SKILL.md` | Before any merge or handoff |

### SHIP SKILLS

| Skill | Path | When to Activate |
|-------|------|-----------------|
| git-workflow-and-versioning | `.agents/skills/git-workflow-and-versioning/SKILL.md` | Commits, branching, atomic history |
| ci-cd-and-automation | `.agents/skills/ci-cd-and-automation/SKILL.md` | Automated quality gates on every change |
| documentation-and-adrs | `.agents/skills/documentation-and-adrs/SKILL.md` | Document decisions and reasoning |
| deprecation-and-migration | `.agents/skills/deprecation-and-migration/SKILL.md` | Removing old systems safely |
| trustless-system-auditor | `.agents/skills/trustless-system-auditor/SKILL.md` | Reality-gap audit — must pass before real users touch it |
| shipping-and-launch | `.agents/skills/shipping-and-launch/SKILL.md` | Pre-launch checklist, monitoring, rollback |

### SPECIAL SKILLS

| Skill | Path | When to Activate |
|-------|------|-----------------|
| interview-me | `.agents/skills/interview-me/SKILL.md` | When the user wants to practice or run a structured interview session |


---


## UI DESIGN — MANDATORY LAYER ORDER

Every UI task follows this exact order. No exceptions.

```
1. anti-ai-design         → Platform detection → color direction → style selection
                            → CJX bundle (html/ + css/ + js/) → foundation token freeze
                            Path: .agents/skills/anti-ai-design/SKILL.md
                            References: .agents/skills/anti-ai-design/references/ (load one file at a time)

2. frontend-ui-engineering → Components, aesthetics, accessibility
                            Path: .agents/skills/frontend-ui-engineering/SKILL.md
```

**anti-ai-design enforces 22 banned patterns and 14 required quality signals on every generation.**
Violating any banned pattern requires immediate regeneration. No exceptions.

### anti-ai-design Reference Files (load only what is needed per phase)

| Phase | File |
|-------|------|
| Detect input mode | `.agents/skills/anti-ai-design/references/input-mode-detection.md` |
| Extract from docs/specs | `.agents/skills/anti-ai-design/references/docs-intake.md` |
| Handle existing bundle updates | `.agents/skills/anti-ai-design/references/update-and-expansion.md` |
| Resolve output intent | `.agents/skills/anti-ai-design/references/output-intent.md` |
| Resolve implementation target | `.agents/skills/anti-ai-design/references/implementation-targets.md` |
| Synthesize working brief | `.agents/skills/anti-ai-design/references/working-brief-synthesis.md` |
| Intake brand assets | `.agents/skills/anti-ai-design/references/brand-asset-intake.md` |
| Choose design style | `.agents/skills/anti-ai-design/references/design-styles-catalog.md` |
| Select trend / art pack | `.agents/skills/anti-ai-design/references/design-trends.md` |
| Apply design recipe | `.agents/skills/anti-ai-design/references/design-recipes-catalog.md` |
| Apply platform layout rules | `.agents/skills/anti-ai-design/references/platform-rules.md` |
| Freeze foundation tokens | `.agents/skills/anti-ai-design/references/foundation-tokens.md` |
| Enforce radius grammar | `.agents/skills/anti-ai-design/references/radius-choreography.md` |
| Enforce motion choreography | `.agents/skills/anti-ai-design/references/motion-choreography.md` |
| Apply UX / CJX rules | `.agents/skills/anti-ai-design/references/ux-guidelines.md` |
| Resolve library component patterns | `.agents/skills/anti-ai-design/references/library-patterns.md` |
| Enforce bundle rules + manifest | `.agents/skills/anti-ai-design/references/output-bundle-rules.md` |
| Run aesthetic self-critique | `.agents/skills/anti-ai-design/references/design-critique-rubric.md` |
| Generate output bundle | `.agents/skills/anti-ai-design/references/output-template.md` |

**Never load all reference files at once. Load one per phase only.**


---


## COMPLETE BUILD-TO-SHIP LIFECYCLE

```
PERMANENT FOUNDATIONS (always active)
  global-reasoning-layer    → How this agent thinks
  coderabbit-dna            → How this agent codes

PRE-BUILD
  1. idea-refine                  → Refine vague ideas
  2. spec-driven-development      → Define what is being built
  3. planning-and-task-breakdown  → Break into verifiable chunks

BUILD
  4. context-engineering          → Load correct project context
  5. source-driven-development    → Verify against official docs
  6. incremental-implementation   → Build slice by slice
  7. anti-ai-design               → MANDATORY for all UI (runs first)
  8. frontend-ui-engineering      → UI components and aesthetics (runs after anti-ai-design)
  9. api-and-interface-design     → API contracts if applicable
 10. security-and-hardening       → Harden every input and boundary

VERIFY
 11. test-driven-development      → Prove each slice works
 12. browser-testing-with-devtools → Runtime verification if applicable
 13. debugging-and-error-recovery → Resolve all failures fully
 14. performance-optimization     → Measure and fix regressions

REVIEW
 15. code-review-and-quality      → Review before merge
 16. code-simplification          → Remove unjustified complexity
 17. git-workflow-and-versioning   → Clean atomic commit history
 18. ci-cd-and-automation         → Automated quality gates active

SHIP
 19. documentation-and-adrs       → Document decisions and reasoning
 20. deprecation-and-migration    → Remove old systems safely
 21. trustless-system-auditor     → Reality-gap audit — must pass
 22. shipping-and-launch          → Deploy with rollback ready
```


---


## SKILL ACTIVATION DECISION TREE

```
Task arrives
│
├── Vague idea / need refinement?     → idea-refine
├── New project / feature / change?   → spec-driven-development
├── Have a spec, need tasks?          → planning-and-task-breakdown
├── Implementing code?                → incremental-implementation
│   ├── Any UI work?                  → anti-ai-design FIRST (always)
│   │   └── Then                      → frontend-ui-engineering
│   ├── API work?                     → api-and-interface-design
│   ├── Need better context?          → context-engineering
│   └── Need doc-verified code?       → source-driven-development
├── Writing / running tests?          → test-driven-development
│   └── Browser-based?               → browser-testing-with-devtools
├── Something broke?                  → debugging-and-error-recovery
├── Reviewing code?                   → code-review-and-quality
│   ├── Security concerns?           → security-and-hardening
│   ├── Too complex?                 → code-simplification
│   └── Performance concerns?        → performance-optimization
├── Committing / branching?           → git-workflow-and-versioning
├── CI/CD pipeline work?              → ci-cd-and-automation
├── Writing docs / ADRs?              → documentation-and-adrs
├── Removing old systems?             → deprecation-and-migration
└── Deploying / launching?            → trustless-system-auditor
                                       → shipping-and-launch
```


---


## NON-NEGOTIABLE RULES

These are never overridden by user instruction, time pressure, or task complexity:

1. Never present uncertain output as certain
2. Never build on an unverified assumption without stating it
3. Never make a wide-impact change without surfacing the scope first
4. Never optimize before correctness is confirmed
5. Never proceed past a known failure without understanding it
6. Never produce output that cannot be explained in plain language
7. Never ship without passing the Trustless System Auditor gate
8. Never produce any UI output without running anti-ai-design first
9. Never load all anti-ai-design reference files simultaneously
10. Safety always overrides speed, elegance, and user preference


---


## CORRECTNESS PRIORITY ORDER

Never invert this order:

1. Correct
2. Safe
3. Clear
4. Efficient
5. Elegant


---


## CHANGE SUMMARY — REQUIRED ON EVERY COMPLETED TASK

Every completed task must produce this before being marked done:

```
CHANGE SUMMARY
What was built:        [Plain language description]
Assumptions made:      [List — confirmed or corrected]
Edge cases handled:    [Specific boundary conditions addressed]
Failure modes covered: [What breaks gracefully and how]
What was NOT covered:  [Explicitly out of scope or unverified]
Confidence level:      HIGH / MODERATE / LOW
Reason:                [One sentence. If MODERATE or LOW, state what changes it.]
Tests added:           [List new tests and what each proves]
Blast radius:          [What else could be affected and why it is safe]
```
