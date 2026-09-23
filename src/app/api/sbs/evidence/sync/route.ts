import { NextRequest, NextResponse } from "next/server";
import { getServerSession, requireRole } from "@/lib/auth/server-session";
import { submitEvidence } from "@/lib/evidence/evidence-store";

export async function POST(req: NextRequest) {
  const session = await getServerSession(req);
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized: Valid SBS session required" },
      { status: 401 }
    );
  }

  try {
    requireRole(session, ["Installer", "Lead Installer", "Management"]);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Access denied";
    return NextResponse.json({ error: errorMsg }, { status: 403 });
  }

  try {
    const body = await req.json();
    const items = Array.isArray(body.items) ? body.items : [];

    const results = [];
    let synced = 0;
    let duplicates = 0;

    for (const item of items) {
      try {
        const res = await submitEvidence(item, session);
        results.push({
          clientUuid: item.clientUuid,
          status: "success",
          isDuplicate: res.isDuplicate,
          evidenceId: res.evidence.evidenceId,
        });
        if (res.isDuplicate) duplicates++;
        else synced++;
      } catch (err: unknown) {
        results.push({
          clientUuid: item.clientUuid,
          status: "error",
          error: err instanceof Error ? err.message : "Submission failure",
        });
      }
    }

    return NextResponse.json({
      message: `Batch sync completed: ${synced} new items, ${duplicates} duplicates recognized.`,
      syncedCount: synced,
      duplicateCount: duplicates,
      totalProcessed: items.length,
      results,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Batch sync failed";
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}
