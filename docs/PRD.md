# Product Requirements Document (PRD)
## Project Name: Suyanka App Template
### Version: 1.0.0
### Status: Approved Base Template

---

## 1. Executive Summary & Vision
**Suyanka App Template** is a developer-first, full-stack application starter designed for rapid product creation. It couples an authoritative agent-skills cognitive layer (`.agents/skills/`) with an opinionated, modern Next.js 14 App Router frontend and flexible backend integrations (Supabase + Drizzle ORM or Firebase + Drizzle).

Any AI agent (Claude Code, Cursor, Antigravity, Kilo Code, VS Code / Cline, Lovable, Bolt.new, v0.dev) or human engineer cloning this repository starts with an already functioning, non-generic application shell that can be progressively expanded by updating this PRD.

---

## 2. Core User Personas
- **Developer / Creator**: Wants to bootstrap a SaaS, marketplace, or mobile-first web app without reinventing auth, design tokens, responsive layout, or ORM configurations.
- **AI Coding Agent**: Requires an unambiguous, single-source-of-truth document (`/docs`) to determine what features exist, how navigation flows, and what conventions to adhere to.
- **End User**: Experiences an ultra-fast, visually bespoke web app with zero generic AI tropes (no bloated gradients, no broken mobile viewports, full error state handling).

---

## 3. Product User Journey & Navigation Flow

```
[ Unauthenticated User ]
          │
          ▼
   /splash (Optional entrance with animated loader & auto-redirect)
          │
          ├──▶ / (Landing Page with Product Showcase & Features)
          │         │
          │         ▼
          └──▶ /auth (Tabbed Sign In & Sign Up with Validation)
                    │
                    ▼
          [ Authenticated User ]
                    │
                    ▼
          /dashboard (Application Core Shell)
              ├── Overview & Metrics
              ├── Interactive Data Table / List
              ├── Empty State Demo with Action Modal
              └── User Settings & Sign-out
```

---

## 4. Key Functional Requirements

### 4.1 Splash Screen (`/splash`)
- Minimalist branded animation displaying project identity.
- Auto-redirect or manual "Enter App" button.
- Reads auth status from `useAuth` hook and routes appropriately.

### 4.2 Authentication (`/auth`)
- Accessible tabbed form supporting:
  - **Sign In**: Email & Password with validation, "Forgot Password" mock, and error banners.
  - **Sign Up**: Full Name, Email, Password, and Confirmation with strength meter.
  - **Direct Pass-Through Mode**: A dedicated "Quick Demo Sign-In" button allowing developers and test agents to bypass credential entry during design & prototyping.
- Integrated with `AuthContext` with pluggable Supabase or Firebase handlers.

### 4.3 Landing Page (`/`)
- Bespoke, non-generic typography and layout (anti-ai-design compliant).
- Sticky navigation bar with mobile drawer and quick link to `/auth` and `/dashboard`.
- Hero section explaining the value proposition.
- "How it Works" and Feature Grid showcasing the 27 agent skills.
- Call to Action linking directly to project initialization and documentation.

### 4.4 Dashboard Shell (`/dashboard`)
- Collapsible responsive sidebar navigation.
- Key Metrics Cards (Users, Activity, Conversion, Performance).
- Filterable and searchable table/list component.
- Dedicated empty state card with action modal to demonstrate graceful fallback UX.
- User profile menu with sign-out capability returning the user to `/auth`.

---

## 5. Non-Functional & Quality Requirements
1. **Anti-AI Design**: Must avoid generic purple/blue gradients, centered cartoon icons, and boring cards. Must enforce intentional 3+ hue palettes, editorial display typography, and smooth micro-animations.
2. **Defensive Engineering (CodeRabbit DNA)**:
   - Every async data call must render a Loading state, Empty state, and Error state.
   - Form inputs must validate boundaries and sanitize input.
3. **Accessibility**: High-contrast ratios, keyboard focus indicators (`focus-visible:ring-2`), and ARIA labels on all interactive controls.
4. **Mobile Responsiveness**: Designed mobile-first, ensuring responsive touch targets on small screens.
