# Technical Architecture Specification
## Project: SBS Tanks — Installation Verification System
### Version: 1.1.0 (adapted from Suyanka App Template v1.0.0)

> **Sections 1, 2, and 4.1 below are the template's reusable engineering foundation and are preserved as-is** — nothing in the SBS PRD requires changing the stack, directory layout, or the dual Supabase/Firebase pattern. **Section 3 (database) and Section 4 (auth) are project-specific and have been updated** to point at the SBS domain model and to flag a critical gap. See `docs/documentation-map.md` for how this document relates to the others.

---

## 1. System Topology & Technology Stack (unchanged from template)

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | Next.js 14 (App Router) | React Server Components, server actions, route handlers, modern SEO. |
| **Language** | TypeScript (Strict) | End-to-end type safety, reliable refactoring, IDE autocompletion. |
| **Styling** | Tailwind CSS + PostCSS | Token-based utility styling — see `docs/design-system.md` note re: SBS-specific tokens not yet generated. |
| **Icons** | Lucide React | Clean, consistent, tree-shakeable iconography. |
| **State Management** | React Context (`AuthContext`) | See §4 — currently mocked, needs real wiring for this product. |
| **Backend Option A** | Supabase + Drizzle ORM | Serverless PostgreSQL with type-safe schema queries and row-level security. **Recommended for SBS**: the domain model (`docs/domain-model.md`) is relational (Job → Stage → Requirement → Evidence, with foreign keys and an append-only Event Log), which fits Postgres/Drizzle more naturally than Firestore's document model. This is a recommendation, not a frozen decision — an implementer may choose Firebase if there's a reason to; nothing in the PRD requires Postgres specifically. |
| **Backend Option B** | Firebase + Drizzle | Available; see note above. |
| **Agent Foundation** | `.agents/` Architecture | 27 modular agent skills — unchanged, reusable across any project built from this template. |

---

## 2. Directory Layout (unchanged from template)

```text
├── docs/                             # Authoritative design & architecture contracts
│   ├── PRD.md                        # SBS product requirements (replaces template's generic PRD)
│   ├── architecture.md               # This document
│   ├── design-system.md              # Template's frozen tokens — NOT yet SBS-specific, see note below
│   ├── documentation-map.md          # Source-of-truth hierarchy — read this first
│   ├── domain-model.md               # SBS field-level data model
│   ├── workflow-state-machine.md     # SBS lifecycle/state-machine spec
│   ├── evidence-and-offline.md       # Evidence + offline-sync spec
│   ├── identity-and-auth.md          # Critical finding re: template's mock auth
│   ├── sbs-domain-context.md         # Commissioning/handover terminology + scope boundary
│   └── ai-studio-handoff.md          # Phased build instructions for Google AI Studio
├── src/                               # unchanged layout — see template README for details
├── package.json
└── tailwind.config.ts
```

---

## 3. Database Architecture — SBS Domain (replaces template §3)

**Full field-level model:** `docs/domain-model.md`. That document replaces the template's generic `users` / `projects` example schema in `src/lib/db/supabase/schema.ts` and `src/lib/db/firebase/firestore.ts` — those files are application code and have **not** been modified by this documentation package; they are the implementer's next step, following the existing `context-engineering` → `source-driven-development` → `incremental-implementation` skill sequence.

The `DATABASE_PROVIDER` toggle mechanism itself is unchanged and still applies.

---

## 4. Authentication — Critical Gap (replaces template §4)

**See `docs/identity-and-auth.md` for the full finding.** Summary: the template's current `AuthContext` (`src/lib/auth/auth-context.tsx`) is a fully mocked, `localStorage`-based flow with no real backend verification — it does not satisfy the SBS PRD's MUST requirement that every user has an individually authenticated, unspoofable identity (`docs/PRD.md` §20), which the entire accountability model depends on. This must be resolved (wired to real Supabase/Firebase Auth) before any pilot use, not treated as already-solved because the login screen renders.
