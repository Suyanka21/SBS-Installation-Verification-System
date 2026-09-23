import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/server-session";
import { getPopulatedJob } from "@/lib/installation/store";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(req);
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized: Valid SBS session required" },
      { status: 401 }
    );
  }

  const jobId = params.id;
  const job = getPopulatedJob(jobId);

  if (!job) {
    return NextResponse.json(
      { error: `Installation Job with ID '${jobId}' was not found.` },
      { status: 404 }
    );
  }

  return NextResponse.json({ job });
}
