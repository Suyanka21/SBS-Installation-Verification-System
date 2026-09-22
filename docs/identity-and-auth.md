# Identity & Authentication — Critical Finding

**Authority level:** TECHNICAL CONSTRAINT layer, protecting a FROZEN product boundary. See `docs/documentation-map.md`.

**Read this before touching `src/lib/auth/` or `src/app/auth/page.tsx`.**

---

## 1. The Finding

The template's current `src/lib/auth/auth-context.tsx` is **not real authentication**. Its `signIn` function simulates a network delay, then manufactures a mock user object from whatever email string was typed, with `role` fixed to `"admin"`, and persists it to `localStorage`. There is no password check, no server-side session, and no connection to either of the already-present database clients (`src/lib/db/supabase/client.ts`, `src/lib/db/firebase/client.ts`) despite both being configured and available. A `signInDemo()` instant pass-through mode exists on top of this for prototyping.

## 2. Why This Is Not a Minor Gap for This Product

The SBS PRD's accountability model (`docs/PRD.md` §15, and every Requirement/Evidence/Deficiency rule downstream of it) is built entirely on one load-bearing assumption: **evidence is attributable to a real, individual, unspoofable identity.** PRD §20 states this as a MUST — "every user has an individual authenticated account; no shared logins" — and calls it out explicitly as *load-bearing for the whole accountability model*.

A mock auth system where anyone can become "admin" by typing any email does not satisfy that requirement even approximately. If this ships as-is, every Evidence Item's `submitted_by` field is attributable to a name someone typed, not to a verified person — the entire premise of "named evidence, no shared logins" silently collapses, and nobody building on top of this repository would necessarily notice, because the UI would look like it works.

## 3. What Must Change (Domain Rule / Technical Constraint — not optional)

- `AuthContext` must be wired to real authentication against whichever backend `DATABASE_PROVIDER` selects (Supabase Auth or Firebase Auth) — both SDKs are already dependencies of this template; this is completing existing scaffolding, not adding a new one.
- The generic `role: "admin" | "member" | "viewer"` enum on the `User` type must be replaced with the SBS roles from `docs/domain-model.md` §10: `Installer`, `Lead Installer`, `QC Reviewer`, `Management`.
- Every write to Evidence Item, Deficiency, Corrective Action, and Certificate tables must resolve `submitted_by` / `opened_by` / `recorded_by` from the real, server-verified session — never from a client-supplied name or email string.
- The `signInDemo()` instant pass-through is useful during early scaffolding and design review, but **must be disabled (feature-flagged off) before any build is used to run a real SBS pilot job.** Do not silently delete it — SBS/Venture Foundry may still want it for demos — but it must not be reachable in a build where real evidence attribution matters. Flag this explicitly to the person managing the build; do not decide it silently either way.

## 4. What This Document Does Not Decide

This document does not pick a specific auth flow (magic link vs. password, session cookie vs. JWT, etc.) — that is an Implementation Detail per `docs/PRD.md` §24, and belongs to whoever implements it, following the existing `security-and-hardening` skill (`.agents/skills/security-and-hardening/SKILL.md`), which already governs "verify authentication explicitly on every endpoint that touches sensitive data or privileged operations." Nothing SBS-specific needs to be added to that skill — it already says the right thing. This document exists only to make sure the *requirement* (real, individual identity) is not lost in translation from PRD prose into a repository where a plausible-looking but fake auth flow already exists and could easily be mistaken for "done."

## 5. Verification Before This Is Considered Resolved

Per the template's own `trustless-system-auditor` skill discipline: this is not resolved because code exists that calls a real SDK method. It is resolved when someone can show that two different people, on two different devices, with two different real accounts, produce Evidence Items whose `submitted_by` cannot be spoofed by one impersonating the other from the client side alone.
