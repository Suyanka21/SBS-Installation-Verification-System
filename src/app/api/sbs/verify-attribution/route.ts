import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/server-session";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(req);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized: Valid SBS authenticated session required" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { action, client_supplied_user_id } = body;

    // Hard boundary: Client-supplied IDs are NEVER trusted as the authority
    const actualActorId = session.userId;
    const isSpoofAttempt = Boolean(
      client_supplied_user_id && client_supplied_user_id !== actualActorId
    );

    return NextResponse.json({
      success: true,
      message: "Action verified and attributable to server-verified session",
      attribution: {
        action: action || "evidence_submission",
        attributed_to_user_id: actualActorId,
        authenticated_user_email: session.email,
        authenticated_role: session.role,
        authenticated_name: session.name,
        timestamp: new Date().toISOString(),
      },
      security_audit: {
        client_supplied_user_id: client_supplied_user_id || null,
        client_spoof_attempt_detected: isSpoofAttempt,
        client_spoof_rejected: isSpoofAttempt,
        authoritative_attribution_enforced: true,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Attribution verification failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
