# Design System & Token Specification
## Project: Suyanka App Template (generic demo screens — not yet adapted for SBS)
### Standards: Anti-AI Design Protocol Compliant

> **Note for the SBS project:** the tokens below are the template's frozen output from a previous `anti-ai-design` run on its own generic demo screens (splash/auth/landing/dashboard SaaS shell). They are **not validated for the SBS product** — a field-verification tool used by installers outdoors and QC reviewers at a desk has a different context than a SaaS dashboard demo. Per `AGENTS.md`, `anti-ai-design` must run first for any SBS UI work; it should be given the SBS product context (users, platform, tone) via `docs/PRD.md` and `docs/domain-model.md` as input, and allowed to re-select or re-freeze tokens for this product rather than assuming the tokens below carry over. This documentation package does not prescribe new colors or tokens itself — that is UI design work, out of scope for a documentation task, and belongs to whoever runs `anti-ai-design` for the first SBS screen.

---

## 1. Aesthetic Identity & Anti-AI Rules
This design system adheres to `.agents/skills/anti-ai-design/SKILL.md`:
- **No generic AI purple/blue gradients**.
- **No centered generic card stacks**.
- **High typographic contrast**: Clean display serif/sans pairing.
- **Micro-interactions**: Subtle hover state transitions with explicit cubic-bezier curves (no `transition: all`).
- **Resilient 4 UX States**: Every surface supports Loading, Empty, Error, and Success.

---

## 2. Color Palette & Semantic Tokens

### 2.1 Color Tokens
- **Background Deep**: `#090A0F` (rich obsidian, not flat black)
- **Surface Elevation 1**: `#12141D` (subtle border boundary)
- **Surface Elevation 2**: `#1A1D2B` (hover & card background)
- **Border Subtle**: `rgba(255, 255, 255, 0.08)`
- **Border Focus**: `rgba(56, 189, 248, 0.5)`
- **Primary Accent**: `#38BDF8` (Sky Teal - dynamic, precise)
- **Secondary Accent**: `#F43F5E` (Rose Coral - deliberate emphasis)
- **Tertiary Accent**: `#10B981` (Emerald - verification / success)
- **Text High-Contrast**: `#F8FAFC` (Slate 50)
- **Text Muted**: `#94A3B8` (Slate 400)
- **Text Subtle**: `#64748B` (Slate 500)

---

## 3. Typography Hierarchy

- **Display 1**: 48px / 1.1 line-height, bold, tracking tight.
- **Display 2**: 36px / 1.2 line-height, semibold.
- **Heading 1**: 28px / 1.25 line-height, semibold.
- **Heading 2**: 22px / 1.3 line-height, medium.
- **Body Regular**: 15px / 1.5 line-height, normal text.
- **Body Small**: 13px / 1.4 line-height, secondary metadata.
- **Caption / Mono**: 11px / 1.4 line-height, badges, timestamps, code.

---

## 4. Radius Grammar & Elevation

- **Small Radius (`rounded-md`)**: 6px — Badges, small inputs, buttons.
- **Medium Radius (`rounded-lg`)**: 10px — Cards, modals, dialog surfaces.
- **Large Radius (`rounded-xl`)**: 16px — Feature panels, dashboard shells.
- **Pill (`rounded-full`)**: Tag indicators and avatar pills.

---

## 5. Required Component States (The 4 UX Pillars)

Every interactive list and view must include:
1. **Loading State**: Shimmer skeleton layout with pulsating placeholder blocks.
2. **Empty State**: Purpose-built empty card with clear explanation and a primary action button.
3. **Error State**: Inline dismissible alert banner with retry capability.
4. **Success State**: Active, populated state with affirmative visual cues.
