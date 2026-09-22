# Suyanka App Template
> **The Autonomous Full-Stack Starter Template**: Powered by 27 modular agent skills, Next.js 14 App Router, defensive engineering standards, and anti-AI design systems.

---

<!-- AI_AGENT_DIRECTIVE_START -->
> ### 🤖 SYSTEM DIRECTIVE FOR ALL AI CODING AGENTS
> **Applies to**: Claude Code, Cursor, Antigravity, Kilo Code, Windsurf, VS Code (Cline / Roo / Copilot), Lovable, Bolt.new, v0.dev, Google AI Studio, or any LLM-powered coding environment.
>
> 1. **Immediate Ingestion & Source of Truth**:
>    - You are operating inside the **Suyanka App Template**.
>    - All development decisions, feature additions, and schema extensions must derive from the **`/docs` directory**:
>      - [`docs/PRD.md`](docs/PRD.md) — Master product requirements document and user journeys.
>      - [`docs/architecture.md`](docs/architecture.md) — Technical topology and backend configuration.
>      - [`docs/design-system.md`](docs/design-system.md) — Anti-AI design tokens and typography rules.
>    - Your master orchestration contracts are [AGENTS.md](AGENTS.md) and [.agents/rules/skill-orchestration.md](.agents/rules/skill-orchestration.md).
> 2. **Permanent Cognitive Foundations** (Always Active):
>    - `.agents/skills/global-reasoning-layer/SKILL.md`: You are a defensive reasoning engineer who writes code, not an unverified next-token generator.
>    - `.agents/skills/coderabbit-dna/SKILL.md`: Defensive engineering applied to every change, boundary, and edge condition.
> 3. **Mandatory UI Order**:
>    - For ANY UI screen, component, or layout work, you MUST execute `.agents/skills/anti-ai-design/SKILL.md` FIRST before `.agents/skills/frontend-ui-engineering/SKILL.md`.
> 4. **Progressive Skill Loading**:
>    - Discover skills in `.agents/skills/<skill-name>/SKILL.md` via their frontmatter descriptions. Activate and execute on-demand.
> 5. **Change Summary**:
>    - Conclude every completed task with the formal `CHANGE SUMMARY` required by `AGENTS.md`.
<!-- AI_AGENT_DIRECTIVE_END -->

---

## 📱 What's Included in the Frontend

- **Splash Screen (`/splash`)**: Minimalist branded entrance with progress indicator and auto/manual transition.
- **Authentication (`/auth`)**: Tabbed Sign In and Sign Up with validation, password strength meters, error states, and an **Instant Demo Pass-Through** mode for rapid prototyping.
- **Landing Page (`/`)**: Editorial, non-generic landing page showcasing the 27 agent skills, quickstart commands, and feature pillars.
- **Dashboard Shell (`/dashboard`)**: Production-ready app shell with sidebar navigation, metric cards, searchable data table, and resilient empty state UX.
- **UI Primitives (`src/components/ui/`)**: Accessible Button, Input, Card, Badge, and Tabs components.

---

## 🗄️ Backend & ORM: Dual Choice

Switch between **Supabase + Drizzle** or **Firebase** by setting `DATABASE_PROVIDER` in your `.env.local`:

```bash
# Toggle between 'supabase' or 'firebase'
DATABASE_PROVIDER=supabase

# Supabase + Drizzle Config (src/lib/db/supabase/)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
DATABASE_URL="postgres://postgres:password@db.your-project.supabase.co:5432/postgres"

# Firebase Config (src/lib/db/firebase/)
NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
```

---

## 🚀 Quickstart for New Projects

### 1. Clone or Use as GitHub Template
```bash
git clone https://github.com/Suyanka21/agent-skills-starter-template.git my-app
cd my-app
```

### 2. Install Dependencies & Run Locally
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the landing page, splash screen, and dashboard.

### 3. Build Features with Any AI Agent
Whenever you want to build a new feature or pivot this template to a new idea:
1. Update [`docs/PRD.md`](docs/PRD.md) with your target features.
2. Prompt your AI coder (Claude Code, Cursor, Antigravity, Kilo Code):
   ```text
   Read docs/PRD.md and implement the next feature using the active .agents/skills.
   ```

---

## 🗂️ Project Directory Architecture

```text
├── .agents/
│   ├── skills/                       # 27 modular agent skills
│   │   ├── anti-ai-design/           # Mandatory UI engine + 19 design references
│   │   ├── global-reasoning-layer/   # Foundation: How the agent thinks
│   │   ├── coderabbit-dna/           # Foundation: Defensive coding standards
│   │   ├── using-agent-skills/       # Master orchestrator & lifecycle decision tree
│   │   └── ... (23 additional skills)
│   └── rules/
│       └── skill-orchestration.md    # Always-on execution rules
├── docs/                             # Source of Truth
│   ├── PRD.md                        # Product Requirements Document
│   ├── architecture.md               # Technical Topology & Backend Guide
│   └── design-system.md              # Design tokens and visual standards
├── src/
│   ├── app/                          # Next.js 14 App Router
│   │   ├── layout.tsx                # Root layout & AuthProvider wrapper
│   │   ├── globals.css               # Design system tokens and custom CSS
│   │   ├── page.tsx                  # Public landing page
│   │   ├── splash/page.tsx           # Splash screen & loader
│   │   ├── auth/page.tsx             # Sign in / Sign up page
│   │   └── dashboard/page.tsx        # Authenticated app shell
│   ├── components/                   # UI Primitives & Layouts
│   │   ├── ui/                       # Button, Input, Card, Badge, Tabs
│   │   └── layout/                   # Navbar, Footer
│   └── lib/                          # Services & Database
│       ├── utils.ts                  # Classname merging and formatting
│       ├── auth/                     # AuthContext & Session management
│       └── db/                       # Supabase + Drizzle and Firebase clients
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── AGENTS.md                         # Universal agent contract
├── GEMINI.md                         # Antigravity & Gemini engine contract
├── CLAUDE.md                         # Claude Code CLI configuration
└── setup-new-project.ps1             # Local 1-click project bootstrapper
```

---

## 📚 27 Active Agent Skills Registry

| Category | Skills Included |
| :--- | :--- |
| **Foundations** | `global-reasoning-layer`, `coderabbit-dna`, `using-agent-skills` |
| **Pre-Build** | `idea-refine`, `spec-driven-development`, `planning-and-task-breakdown`, `doubt-driven-development` |
| **Build** | `context-engineering`, `source-driven-development`, `incremental-implementation`, `anti-ai-design`, `frontend-ui-engineering`, `api-and-interface-design`, `security-and-hardening`, `code-simplification` |
| **Verify** | `test-driven-development`, `browser-testing-with-devtools`, `debugging-and-error-recovery`, `performance-optimization` |
| **Review & Ship** | `code-review-and-quality`, `git-workflow-and-versioning`, `ci-cd-and-automation`, `documentation-and-adrs`, `deprecation-and-migration`, `trustless-system-auditor`, `shipping-and-launch` |
| **Special** | `interview-me` |

---

## 📄 License
MIT © Suyanka
