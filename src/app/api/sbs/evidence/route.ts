import { NextRequest, NextResponse } from "next/server";
import { getServerSession, requireRole } from "@/lib/auth/server-session";
import {
  submitEvidence,
  getEvidenceByRequirementId,
  getAllEvidence,
} from "@/lib/evidence/evidence-store";

export async function GET(req: NextRequest) {
  const session = await getServerSession(req);
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized: Valid SBS session required" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const requirementId = searchParams.get("requirementId");

  if (requirementId) {
    const items = getEvidenceByRequirementId(requirementId);
    return NextResponse.json({ evidence: items });
  }

  const all = getAllEvidence();
  return NextResponse.json({ evidence: all });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(req);
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized: Valid SBS session required" },
      { status: 401 }
    );
  }

  // Role Gate: Evidence submission is an Installer/Lead Installer action
  try {
    requireRole(session, ["Installer", "Lead Installer", "Management"]);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Access denied";
    return NextResponse.json({ error: errorMsg }, { status: 403 });
  }

  try {
    const body = await req.json();
    const result = await submitEvidence(body, session);

    return NextResponse.json(
      {
        message: result.isDuplicate
          ? "Evidence previously synced (idempotent submission acknowledged)."
          : "Evidence item submitted successfully.",
        evidence: result.evidence,
        isDuplicate: result.isDuplicate,
      },
      { status: result.isDuplicate ? 200 : 201 }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error processing evidence";
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}
