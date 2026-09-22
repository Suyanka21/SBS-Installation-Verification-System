# SBS Domain Context — Commissioning, Handover, and Terminology

**Authority level:** EXPLANATORY. Clarifies vocabulary and boundary; does not add, remove, or reweight any PRD requirement. If anything here appears to conflict with `docs/PRD.md`, the PRD wins — see `docs/documentation-map.md`.

**Sources:** (1) SBS Kenya insider evidence and prior governed venture analysis — already fully incorporated into `docs/PRD.md` and treated there as authoritative for this venture. (2) SBS Tanks' own published article, *"When Is a Water Tank Actually Finished? From Final QC to Commissioning and Handover"* (sbstanks.com) — used here only as **supporting domain evidence**, per instruction, never as a replacement for the Kenya-specific process already governed.

---

## 1. Two Vocabularies Describing Related but Not Identical Processes

| SBS Kenya (governed, used by this system) | SBS corporate/global article (supporting context only) |
|---|---|
| Practical Completion Certificate — signed at physical installation completion, even before filling | "Mechanical completion" — installation work substantially done |
| *(gap the article fills in)* | Final QC / snag list / non-conformance closure — inspection and correction activity between mechanical completion and commissioning |
| Commissioning Certificate — signed after the tank is filled | Commissioning — filling, leak observation, functional checks: an added verification layer confirming the installation performs correctly once put into its intended operating condition |
| *(not modeled by this system — see §3)* | Handover — formal transfer of responsibility to the client, supported by a compiled "data book" of records |

**What this means for implementation:** use the Kenya-specific terms (Practical Completion Certificate, Commissioning Certificate, Deficiency) everywhere in this system's UI, data model, and code. The corporate article's terms ("mechanical completion," "snag," "non-conformance," "data book") are useful for understanding *why* SBS's process is structured this way — they should not appear as field names, enum values, or user-facing labels anywhere in this build.

## 2. What the Article Confirms, Not Contradicts

The article independently corroborates the venture's core premise from SBS's own public-facing material, without reference to the Kenya-specific evidence this venture was built on: the entire point of a final inspection pass, in SBS's own words about its broader business, is to catch problems while the crew is still on site and before the asset goes into service — which is exactly the operational proposition PRD §5 tests. Nothing here required a change to that proposition — it strengthens confidence in it.

The article also distinguishes a **snag** (an informal outstanding item) from a **non-conformance** (a formal quality-process failure), noting terminology varies by contract. This is a genuine severity/formality distinction that this system's `Deficiency` object deliberately does not model (`docs/domain-model.md` §8 — no severity field, a NON-GOAL per PRD §7.5/§14). **This is noted here as domain vocabulary context only. It is not a signal to add a snag/non-conformance distinction to the product** — doing so would silently reopen a governance decision that was made deliberately, for a different reason (avoiding an installer-blame proxy), and this document does not have the authority to reopen it.

## 3. The Boundary This System Must Not Cross: "Data Book" Scope Creep

The article frames full project handover as including a compiled **data book** — approved drawings, material/manufacturing certificates, inspection records, non-conformance closures, commissioning records, handover certificates, and maintenance guidance. This is a real and legitimate SBS process. It is also a natural-sounding but incorrect direction to expand this product toward.

**This system's scope stops at:** requirement-linked evidence, deficiency/correction tracking, and QC approval, through to a recorded Practical Completion / Commissioning event with its open-deficiency status. **This system's scope does not include:** compiling or managing drawings, manufacturing/material certificates, or any document-management function beyond what's already specified. If SBS's broader data book process needs those records too, they live in whatever process already produces them (manufacturing, procurement, contracts) — this Installation Verification System is one contributor to that eventual record set, not its manager. This is consistent with the already-established NON-GOALs (not a CRM, not an ERP, not generic construction management) and is restated here specifically because the commissioning/handover article makes document-compilation sound like a natural next feature. It is not, for MVP, and expanding into it should go through the same governance process as any other scope question (Venture Foundry review), not get absorbed silently because it sounded adjacent.

## 4. Maintenance Guidance (Article: "Handover should establish the maintenance baseline")

The article notes that SBS provides post-handover maintenance guidance (inspection, housekeeping, drainage/scour checks, liner cleaning) once responsibility transfers. **This is explicitly outside this system's scope.** The Installation Verification System's Job record ends at Closed (after Commissioning is recorded); anything about the tank's operational life afterward — except a Post-Handover Issue Record if a rectification visit occurs (`docs/domain-model.md` §13) — belongs to a different SBS process this product does not touch.
