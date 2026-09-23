import { NextRequest, NextResponse } from "next/server";
import { getServerSession, requireRole } from "@/lib/auth/server-session";
import {
  getAllJobs,
  createInstallationJob,
  getPopulatedJob,
  seedInitialJobIfEmpty,
} from "@/lib/installation/store";

export async function GET(req: NextRequest) {
  const session = await getServerSession(req);
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized: Valid SBS session required" },
      { status: 401 }
    );
  }

  // Ensure initial seed job exists for demonstration if empty
  seedInitialJobIfEmpty(session.userId, session.name);

  const rawJobs = getAllJobs();
  const jobsWithDetails = rawJobs.map((job) => {
    const populated = getPopulatedJob(job.jobId);
    const totalStages = populated ? populated.stages.length : 0;
    const totalRequirements = populated
      ? populated.stages.reduce((acc, s) => acc + s.requirements.length, 0)
      : 0;

    return {
      ...job,
      guidelineVersion: populated ? populated.guideline.versionNumber : 1,
      totalStages,
      totalRequirements,
    };
  });

  return NextResponse.json({
    jobs: jobsWithDetails,
    count: jobsWithDetails.length,
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(req);
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized: Valid SBS session required" },
      { status: 401 }
    );
  }

  // Role Gate: Only Lead Installer or Management can create an Installation Job
  try {
    requireRole(session, ["Lead Installer", "Management"]);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Access denied";
    return NextResponse.json({ error: errorMsg }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { siteName, tankModel, plannedDemobilizationDate, guidelineId } = body;

    if (!siteName || typeof siteName !== "string" || !siteName.trim()) {
      return NextResponse.json(
        { error: "Validation error: 'siteName' is required." },
        { status: 400 }
      );
    }

    if (!tankModel || typeof tankModel !== "string" || !tankModel.trim()) {
      return NextResponse.json(
        { error: "Validation error: 'tankModel' is required." },
        { status: 400 }
      );
    }

    // Instantiation logic executes atomically
    const newJob = createInstallationJob({
      siteName: siteName.trim(),
      tankModel: tankModel.trim(),
      plannedDemobilizationDate: plannedDemobilizationDate || null,
      createdBy: session.userId,
      createdByName: session.name,
      guidelineId,
    });

    return NextResponse.json(
      {
        message: "Installation Job created and instantiated from active Guideline.",
        job: newJob,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}
