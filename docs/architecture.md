# Technical Architecture Specification
## Project: Suyanka App Template
### Version: 1.0.0

---

## 1. System Topology & Technology Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | Next.js 14 (App Router) | React Server Components, server actions, route handlers, modern SEO. |
| **Language** | TypeScript (Strict) | End-to-end type safety, reliable refactoring, IDE autocompletion. |
| **Styling** | Tailwind CSS + PostCSS | Token-based utility styling governed by `docs/design-system.md`. |
| **Icons** | Lucide React | Clean, consistent, tree-shakeable iconography. |
| **State Management** | React Context (`AuthContext`) | Clean client state for auth session, pluggable backend providers. |
| **Backend Option A** | Supabase + Drizzle ORM | Serverless PostgreSQL with type-safe schema queries and row-level security. |
| **Backend Option B** | Firebase + Drizzle | Google Firebase Auth/Firestore with type-safe document schemas. |
| **Agent Foundation** | `.agents/` Architecture | 27 modular agent skills operating under permanent reasoning protocols. |

---

## 2. Directory Layout

```text
├── docs/                             # Authoritative design & architecture contracts
│   ├── PRD.md                        # Product requirements
│   ├── architecture.md               # This document
│   └── design-system.md              # Design tokens and visual rules
├── src/
│   ├── app/                          # Next.js 14 App Router routes
│   │   ├── layout.tsx                # Root layout & theme wrapper
│   │   ├── globals.css               # Design tokens, variables, base styles
│   │   ├── page.tsx                  # Public landing page
│   │   ├── splash/page.tsx           # Splash screen & loader
│   │   ├── auth/page.tsx             # Sign in / Sign up page
│   │   └── dashboard/page.tsx        # Authenticated app shell
│   ├── components/                   # Reusable UI component library
│   │   ├── ui/                       # Primitives: Button, Input, Card, Badge, Tabs
│   │   └── layout/                   # Navbar, Footer, Sidebar, Shell
│   └── lib/                          # Services & Database
│       ├── utils.ts                  # Classname merging and formatting
│       ├── auth/                     # Authentication context and provider
│       └── db/                       # Database clients & schemas
│           ├── drizzle.config.ts     # Drizzle CLI migration configuration
│           ├── supabase/             # Supabase client & PostgreSQL Drizzle schema
│           └── firebase/             # Firebase SDK client & typed collections
├── package.json                      # Project dependencies & scripts
└── tailwind.config.ts                # Token mappings & theme configuration
```

---

## 3. Database Architecture & Switching Strategy

The template includes out-of-the-box configurations for both **Supabase + Drizzle** and **Firebase + Drizzle**. You switch between them simply by setting `DATABASE_PROVIDER` in your `.env.local`:

```bash
# .env.local
DATABASE_PROVIDER=supabase # or "firebase"

# If using Supabase:
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
DATABASE_URL="postgres://postgres:password@db.your-project.supabase.co:5432/postgres"

# If using Firebase:
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
```

### 3.1 Supabase Schema (`src/lib/db/supabase/schema.ts`)
- Defined via Drizzle ORM (`pgTable`):
  - `users`: User identity, profile data, roles, timestamps.
  - `profiles`: Application-specific preferences and metadata.
  - `projects`: Example entity with title, status, timestamps, and ownership foreign key.

### 3.2 Firebase Schema (`src/lib/db/firebase/firestore.ts`)
- Type-safe collection references with Zod / TypeScript interfaces for `users` and `projects`.

---

## 4. Auth State Machine

```
         ┌──────────────────┐
         │ /splash (Load)   │
         └────────┬─────────┘
                  │
          Check Auth Token
          ┌───────┴───────┐
          ▼               ▼
      [ Valid ]       [ None / Invalid ]
          │               │
          ▼               ▼
     /dashboard         /auth (or /)
```

The `AuthContext` provides:
- `user`: Authenticated user object or `null`.
- `isLoading`: Boolean state for hydration.
- `signIn(email, password)`: Authenticates user.
- `signUp(name, email, password)`: Registers user.
- `signInDemo()`: Instant pass-through bypass for rapid UI testing and prototyping.
- `signOut()`: Terminates session and redirects to `/auth`.
