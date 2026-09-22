# Evidence Model & Offline-First Architecture

**Authority level:** TECHNICAL CONSTRAINT layer, with one embedded PRODUCT boundary (§1 below) that stays subordinate to `docs/PRD.md`. See `docs/documentation-map.md`.

---

## 1. The Boundary Every Evidence Feature Must Respect

The system does not claim a photograph, video, or document proves a physical or mechanical property it structurally cannot prove — true bolt torque, hidden gasket compression, foundation levelness, coating performance, material properties. This is a **product boundary**, not a technical limitation to be engineered around later: no future sprint should introduce a feature that implies otherwise (e.g., an "AI confidence score" on a photo, or copy that says "verified" when it means "evidence submitted").

Where a Requirement genuinely needs a physical measurement, the answer is a **measurement-note** evidence type — a structured, human-entered reading (e.g., a torque value, optionally paired with a corroborating photo of the instrument) — never a sensor integration. Sensor/IoT integrations are a standing NON-GOAL (PRD §21).

---

## 2. Evidence Item — Behavioral Rules

(Field-level shape lives in `docs/domain-model.md` §7; this document covers *behavior*.)

- Every Evidence Item belongs to exactly one Requirement — never to a Stage or Job directly. This is what makes a specific omission visible instead of buried in a general progress stream (this is the entire reason the product is not "upload photos to WhatsApp" with extra steps).
- **Immutable once synced.** No edit path exists for a submitted Evidence Item's file, type, or submitter. The only lifecycle motion after submission is a `status` change (Pending Review → Approved/Rejected) and, on rejection, the creation of a *new* Evidence Item that references the old one via `supersedes_evidence_id`.
- Rejected evidence is **never deleted**. QC reviewing a Requirement's history sees the full chain: original → rejected (with comment) → replacement → (approved, or rejected again).
- `submitted_at` is server-authoritative, set at successful sync — not at capture time. `device_captured_at` is stored separately and is informational only. A large gap between the two is a legitimate structural flag for QC attention; it is never treated as proof of anything on its own.

---

## 3. Offline-First — What Works Offline vs. What Requires Connectivity

| Works offline | Requires connectivity |
|---|---|
| Viewing the last-synced Job/Stage/Requirement list | Final server-authoritative timestamp assignment |
| Capturing evidence (photo/video/note), queued locally | QC review actions (QC is assumed to be on a connected device) |
| Marking N/A with reason (queued) | Notification send/receive |
| Flagging an issue (queued) | — |

- **Local persistence:** unsynced Evidence Items and state-change requests persist on-device (survive app restarts) until confirmed synced.
- **Synchronization:** background sync when connectivity returns, exponential-backoff retry.
- **Duplicate prevention:** every Evidence Item carries a `client_uuid` generated at creation time on-device. Uploads are idempotent against this value — a retried upload after a partial failure must never produce a second row. This is a hard technical constraint, not a nice-to-have; without it, "how many jobs bypass the system" and other pilot-instrumentation counts (PRD §19) become unreliable.
- **Conflict handling:** deliberately minimal. Evidence Items are additive (many per Requirement) and immutable once synced, so two installers submitting near-simultaneously produces two disambiguated rows, not a field-level conflict to resolve.
- **Failure recovery:** once synced, data is durable server-side regardless of later device loss or replacement. **Accepted, explicitly stated residual risk:** evidence queued but not yet synced is at risk if a device is lost or damaged before sync completes. This is not solved by this architecture and should not be represented to SBS as solved.

---

## 4. Why This Is a Technical Constraint Document and Not Just Implementation Detail

Everything in §3 is deliberately specified here — at the "must behave this way" level, not the "use library X" level — because it is load-bearing for product claims the PRD makes (offline reliability as MUST, PRD §20) and for pilot instrumentation accuracy (PRD §19). The actual mobile framework, storage engine, and sync library used to satisfy these constraints are implementation details, left open here on purpose (see `docs/PRD.md` §24).
