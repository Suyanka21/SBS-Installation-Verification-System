import test from "node:test";
import assert from "node:assert/strict";
import {
  createInstallationJob,
  initializeInstallationStore,
  getPopulatedJob,
  getRequirementById,
} from "../src/lib/installation/store.ts";
import {
  submitEvidence,
  getEvidenceByRequirementId,
  simulateQcRejection,
} from "../src/lib/evidence/evidence-store.ts";
import { ServerSession } from "../src/lib/auth/server-session.ts";

test("Slice 2 Acceptance Suite — Attributable Requirement-Linked Evidence Capture", async (t) => {
  initializeInstallationStore(true);

  const installerSession: ServerSession = {
    userId: "usr_inst_001",
    email: "installer.john@sbstanks.com",
    name: "John Mwangi",
    role: "Installer",
  };

  const leadSession: ServerSession = {
    userId: "usr_lead_001",
    email: "lead.installer@sbstanks.com",
    name: "Samuel Kiprop",
    role: "Lead Installer",
  };

  // Seed a job for evidence capture
  const job = createInstallationJob({
    siteName: "Eldoret Industrial Agro-Hub",
    tankModel: "SBS Cyclonic 250kL",
    createdBy: leadSession.userId,
    createdByName: leadSession.name,
  });

  const anchorageStage = job.stages.find((s) => s.template.title === "Anchorage")!;
  assert.ok(anchorageStage);

  const torqueReq = anchorageStage.requirements.find(
    (r) => r.template.title === "Anchor Bolt Torque Verification"
  )!;
  assert.ok(torqueReq);

  const holeAlignReq = anchorageStage.requirements.find(
    (r) => r.template.title === "Anchor Bracket Positioning & Hole Alignment"
  )!;
  assert.ok(holeAlignReq);

  await t.test("1. Authenticated Evidence Submission & Strict Attribution", async () => {
    const clientUuid = `test_cli_${Date.now()}_1`;
    const res = await submitEvidence(
      {
        clientUuid,
        requirementId: torqueReq.requirementId,
        type: "measurement_note",
        measurementValue: "85",
        measurementUnit: "Nm",
      },
      installerSession
    );

    assert.strictEqual(res.isDuplicate, false);
    assert.strictEqual(res.evidence.clientUuid, clientUuid);
    assert.strictEqual(res.evidence.requirementId, torqueReq.requirementId);
    assert.strictEqual(res.evidence.submittedBy, installerSession.userId);
    assert.strictEqual(res.evidence.submittedByName, installerSession.name);
    assert.ok(res.evidence.submittedAt, "Must assign server-authoritative timestamp");
    assert.strictEqual(
      res.evidence.status,
      "Pending Review",
      "Submitted evidence must be Pending Review, never auto-approved"
    );
  });

  await t.test("2. Requirement Linkage & Template Type Enforcement", async () => {
    // Attempting to submit an invalid/unallowed type (e.g. video to a photo-only requirement)
    await assert.rejects(
      async () => {
        await submitEvidence(
          {
            clientUuid: `test_cli_${Date.now()}_invalid_type`,
            requirementId: holeAlignReq.requirementId, // allows only photo
            type: "video",
          },
          installerSession
        );
      },
      /is not allowed for this requirement/,
      "Must reject evidence types not permitted by requirement template"
    );

    // Attempting to submit measurement note without value
    await assert.rejects(
      async () => {
        await submitEvidence(
          {
            clientUuid: `test_cli_${Date.now()}_missing_val`,
            requirementId: torqueReq.requirementId,
            type: "measurement_note",
            measurementValue: "", // empty
          },
          installerSession
        );
      },
      /measurementValue is required/,
      "Measurement note must enforce non-empty reading value"
    );
  });

  await t.test("3. Upload Idempotency: Duplicate submissions against client_uuid are rejected from duplicate insertion", async () => {
    const clientUuid = `test_cli_idempotent_${Date.now()}`;

    // First upload attempt
    const firstRes = await submitEvidence(
      {
        clientUuid,
        requirementId: holeAlignReq.requirementId,
        type: "photo",
        fileRef: "https://storage.sbstanks.com/evidence/bracket_1.jpg",
        fileName: "bracket_1.jpg",
      },
      installerSession
    );

    assert.strictEqual(firstRes.isDuplicate, false);
    const initialEvidenceId = firstRes.evidence.evidenceId;

    // Retried upload attempt with identical client_uuid (e.g. after network drop / reconnect)
    const retryRes = await submitEvidence(
      {
        clientUuid,
        requirementId: holeAlignReq.requirementId,
        type: "photo",
        fileRef: "https://storage.sbstanks.com/evidence/bracket_1.jpg",
      },
      installerSession
    );

    assert.strictEqual(retryRes.isDuplicate, true, "Retried upload must be marked isDuplicate");
    assert.strictEqual(
      retryRes.evidence.evidenceId,
      initialEvidenceId,
      "Retried upload must return existing evidence item without creating second row"
    );

    // Verify evidence list contains only ONE item for this clientUuid
    const items = getEvidenceByRequirementId(holeAlignReq.requirementId);
    const matching = items.filter((i) => i.clientUuid === clientUuid);
    assert.strictEqual(matching.length, 1, "Idempotency must prevent multiple database records");
  });

  await t.test("4. Workflow Progression: Submitting evidence advances Requirement to 'Evidence Submitted'", async () => {
    const updatedReq = getRequirementById(torqueReq.requirementId);
    assert.ok(updatedReq);
    assert.strictEqual(
      updatedReq.status,
      "Evidence Submitted",
      "Requirement status must advance from Not Started to Evidence Submitted"
    );

    const refreshedJob = getPopulatedJob(job.jobId);
    assert.ok(refreshedJob);
    assert.strictEqual(
      refreshedJob.status,
      "In Progress",
      "Job status must advance to In Progress upon evidence submission"
    );
  });

  await t.test("5. Immutability & Replacement Chain (docs/PRD.md §22 #4)", async () => {
    // 1. Submit initial photo
    const originalClientUuid = `test_orig_${Date.now()}`;
    const initial = await submitEvidence(
      {
        clientUuid: originalClientUuid,
        requirementId: holeAlignReq.requirementId,
        type: "photo",
        fileRef: "https://storage.sbstanks.com/evidence/hole_original.jpg",
      },
      installerSession
    );

    // 2. Simulate QC rejection with technical comment
    simulateQcRejection(
      initial.evidence.evidenceId,
      "Image is blurry and does not show bolt anchor depth marker clearly."
    );

    // 3. Submit replacement photo referencing the rejected item
    const replacementClientUuid = `test_repl_${Date.now()}`;
    const replacement = await submitEvidence(
      {
        clientUuid: replacementClientUuid,
        requirementId: holeAlignReq.requirementId,
        type: "photo",
        fileRef: "https://storage.sbstanks.com/evidence/hole_replacement_crisp.jpg",
        supersedesEvidenceId: initial.evidence.evidenceId,
      },
      installerSession
    );

    assert.strictEqual(replacement.evidence.supersedesEvidenceId, initial.evidence.evidenceId);

    // 4. Verify History: Both items are preserved (PRD §22 #4: never delete)
    const history = getEvidenceByRequirementId(holeAlignReq.requirementId);
    const originalInHistory = history.find((i) => i.evidenceId === initial.evidence.evidenceId);
    const replacementInHistory = history.find(
      (i) => i.evidenceId === replacement.evidence.evidenceId
    );

    assert.ok(originalInHistory, "Rejected original evidence must NOT be deleted");
    assert.strictEqual(
      originalInHistory.status,
      "Superseded",
      "Original evidence status must be updated to Superseded"
    );
    assert.strictEqual(originalInHistory.rejectionComment?.length! > 0, true);

    assert.ok(replacementInHistory, "Replacement evidence must exist in history");
    assert.strictEqual(replacementInHistory.status, "Pending Review");
  });
});
