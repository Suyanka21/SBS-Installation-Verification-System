import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/server-session";
import { getAllGuidelines, getActiveGuideline } from "@/lib/installation/store";

export async function GET(req: NextRequest) {
  const session = await getServerSession(req);
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized: Valid SBS session required" },
      { status: 401 }
    );
  }

  const guidelines = getAllGuidelines();
  const active = getActiveGuideline();

  return NextResponse.json({
    activeGuideline: active,
    guidelines,
  });
}
