import test from "node:test";
import assert from "node:assert/strict";
import {
  createInstallationJob,
  getAllJobs,
  getJobById,
  getPopulatedJob,
  getActiveGuideline,
  registerGuideline,
  initializeInstallationStore,
} from "../src/lib/installation/store.ts";
import { requireRole, ServerSession } from "../src/lib/auth/server-session.ts";
import {
  InstallationGuideline,
  StageTemplate,
  RequirementTemplate,
} from "../src/lib/installation/types.ts";

test("Slice 1 Acceptance Suite — Guideline → Job → Stage → Requirement Structure", async (t) => {
  // Ensure store has initial state
  initializeInstallationStore(true);

  const leadInstallerSession: ServerSession = {
    userId: "usr_lead_001",
    email: "lead.installer@sbstanks.com",
    name: "Samuel Kiprop",
    role: "Lead Installer",
  };

  const fieldInstallerSession: ServerSession = {
    userId: "usr_inst_001",
    email: "installer.john@sbstanks.com",
    name: "John Mwangi",
    role: "Installer",
  };

  await t.test("1. Access Control: Role enforcement for Job creation", () => {
    // Lead Installer is authorized to create jobs
    assert.doesNotThrow(() => {
      requireRole(leadInstallerSession, ["Lead Installer", "Management"]);
    }, "Lead Installer must be permitted to create installation jobs");

    // Field Installer is NOT authorized to create jobs
    assert.throws(
      () => {
        requireRole(fieldInstallerSession, ["Lead Installer", "Management"]);
      },
      /Access denied: Action requires one of \[Lead Installer, Management\]/,
      "Field Installer must be forbidden from creating installation jobs"
    );
  });

  await t.test("2. Validation: Creating job requires siteName, tankModel, and createdBy", () => {
    assert.throws(
      () => {
        createInstallationJob({
          siteName: "",
          tankModel: "SBS Cyclonic 250kL",
          createdBy: leadInstallerSession.userId,
        });
      },
      /Validation failed: siteName is required/,
      "Missing site name must fail validation"
    );

    assert.throws(
      () => {
        createInstallationJob({
          siteName: "Eldoret Water Treatment",
          tankModel: "  ",
          createdBy: leadInstallerSession.userId,
        });
      },
      /Validation failed: tankModel is required/,
      "Empty tank model must fail validation"
    );

    assert.throws(
      () => {
        createInstallationJob({
          siteName: "Eldoret Water Treatment",
          tankModel: "SBS Cyclonic 250kL",
          createdBy: "",
        });
      },
      /Validation failed: createdBy user ID is required for attribution/,
      "Missing createdBy attribution must fail validation"
    );
  });

  await t.test("3. Job Creation & Active Guideline Association", () => {
    const activeGdl = getActiveGuideline();
    assert.ok(activeGdl, "An active published guideline must exist");
    assert.strictEqual(activeGdl.status, "Published");
    assert.strictEqual(activeGdl.versionNumber, 1);

    const createdJob = createInstallationJob({
      siteName: "Mombasa Grain Terminal Bulk Storage",
      tankModel: "SBS Cyclonic 500kL (Fire & Potable)",
      plannedDemobilizationDate: "2026-11-30",
      createdBy: leadInstallerSession.userId,
      createdByName: leadInstallerSession.name,
    });

    assert.ok(createdJob.jobId.startsWith("job_"), "Job ID must be generated");
    assert.strictEqual(createdJob.siteName, "Mombasa Grain Terminal Bulk Storage");
    assert.strictEqual(createdJob.tankModel, "SBS Cyclonic 500kL (Fire & Potable)");
    assert.strictEqual(createdJob.status, "Not Started");
    assert.strictEqual(createdJob.createdBy, leadInstallerSession.userId);
    assert.strictEqual(createdJob.guidelineId, activeGdl.guidelineId);
    assert.strictEqual(createdJob.guideline.versionNumber, 1);
  });

  await t.test("4. Stage Instantiation: All guideline stages instantiated with status 'Not Started'", () => {
    const job = createInstallationJob({
      siteName: "Athi River EPZ Water Reserve",
      tankModel: "SBS Standard 150kL",
      createdBy: leadInstallerSession.userId,
    });

    assert.strictEqual(job.stages.length, 6, "Must instantiate all 6 guideline stages");

    // Verify ordering
    for (let i = 0; i < job.stages.length; i++) {
      assert.strictEqual(job.stages[i].template.sequenceOrder, i + 1);
      assert.strictEqual(job.stages[i].status, "Not Started");
      assert.strictEqual(job.stages[i].jobId, job.jobId);
      assert.strictEqual(job.stages[i].submittedBy, null);
      assert.strictEqual(job.stages[i].submittedAt, null);
    }

    // Verify specific documented stages exist (e.g. Anchorage from domain-model.md §3)
    const anchorageStage = job.stages.find((s) => s.template.title === "Anchorage");
    assert.ok(anchorageStage, "Anchorage stage from docs/domain-model.md §3 must be present");
    assert.strictEqual(anchorageStage.template.sequenceOrder, 2);
  });

  await t.test("5. Requirement Instantiation: Requirements instantiated under relevant stage as unpopulated checklist", () => {
    const job = createInstallationJob({
      siteName: "Nakuru Commercial Hub",
      tankModel: "SBS Cyclonic 300kL",
      createdBy: leadInstallerSession.userId,
    });

    const anchorageStage = job.stages.find((s) => s.template.title === "Anchorage");
    assert.ok(anchorageStage);

    assert.ok(
      anchorageStage.requirements.length >= 2,
      "Anchorage stage must contain its template requirements"
    );

    for (const req of anchorageStage.requirements) {
      assert.strictEqual(req.status, "Not Started", "Instantiated requirement must be 'Not Started'");
      assert.strictEqual(req.stageId, anchorageStage.stageId);
      assert.strictEqual(req.naReason, null);
      assert.strictEqual(req.openDeficiencyId, null);
      assert.ok(req.template.title.length > 0);
      assert.ok(req.template.evidenceTypesAllowed.length > 0);
    }

    // Verify torque verification requirement
    const torqueReq = anchorageStage.requirements.find(
      (r) => r.template.title === "Anchor Bolt Torque Verification"
    );
    assert.ok(torqueReq, "Torque verification requirement must be present");
    assert.ok(
      torqueReq.template.evidenceTypesAllowed.includes("measurement_note"),
      "Torque requirement must allow measurement_note per docs/PRD.md §9"
    );
  });

  await t.test("6. Persistence: Structure is retrievable by ID and listed in jobs", () => {
    const created = createInstallationJob({
      siteName: "Kisumu Fish Processing Plant",
      tankModel: "SBS Standard 200kL",
      createdBy: leadInstallerSession.userId,
    });

    const persisted = getPopulatedJob(created.jobId);
    assert.ok(persisted, "Persisted job must be retrievable");
    assert.strictEqual(persisted.jobId, created.jobId);
    assert.strictEqual(persisted.siteName, created.siteName);
    assert.strictEqual(persisted.stages.length, created.stages.length);

    const all = getAllJobs();
    assert.ok(all.some((j) => j.jobId === created.jobId), "Job must be listed in all jobs");
  });

  await t.test("7. Guideline Immutability: Newer guideline version does NOT alter existing jobs", () => {
    // 1. Create job under v1
    const jobV1 = createInstallationJob({
      siteName: "Original Site V1",
      tankModel: "SBS 100kL",
      createdBy: leadInstallerSession.userId,
    });
    assert.strictEqual(jobV1.guideline.versionNumber, 1);

    // 2. Register and publish v2 of the guideline with different stages
    const v2Guideline: InstallationGuideline = {
      guidelineId: "gdl_sbs_v2_0",
      versionNumber: 2,
      title: "SBS Kenya Standard Tank Installation Guideline v2.0",
      effectiveDate: "2026-06-01T00:00:00.000Z",
      status: "Published",
      createdAt: "2026-06-01T00:00:00.000Z",
    };

    const v2Stage: StageTemplate = {
      stageTemplateId: "stg_tpl_v2_special",
      guidelineId: "gdl_sbs_v2_0",
      title: "Specialized Elevated Stand Verification",
      sequenceOrder: 1,
    };

    const v2Req: RequirementTemplate = {
      requirementTemplateId: "req_tpl_v2_01",
      stageTemplateId: "stg_tpl_v2_special",
      title: "Tower Pylon Verticality",
      description: "Laser plumb verification of vertical pylon members",
      evidenceRequired: true,
      evidenceTypesAllowed: ["measurement_note"],
      minEvidenceCount: 1,
      allowsNa: false,
    };

    registerGuideline(v2Guideline, [v2Stage], [v2Req]);

    // Active guideline is now v2
    const currentActive = getActiveGuideline();
    assert.ok(currentActive);
    assert.strictEqual(currentActive.versionNumber, 2);

    // 3. Create job under v2
    const jobV2 = createInstallationJob({
      siteName: "New Site V2",
      tankModel: "SBS Elevated 100kL",
      createdBy: leadInstallerSession.userId,
    });
    assert.strictEqual(jobV2.guideline.versionNumber, 2);
    assert.strictEqual(jobV2.stages.length, 1);
    assert.strictEqual(jobV2.stages[0].template.title, "Specialized Elevated Stand Verification");

    // 4. Critical verification: Job V1 remains strictly bound to v1 and its 6 stages
    const refreshedV1 = getPopulatedJob(jobV1.jobId);
    assert.ok(refreshedV1);
    assert.strictEqual(refreshedV1.guideline.versionNumber, 1, "Job V1 must not be repointed to v2");
    assert.strictEqual(
      refreshedV1.stages.length,
      6,
      "Job V1 must retain its exact 6 original stages"
    );
  });
});
