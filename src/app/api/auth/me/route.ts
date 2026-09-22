import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/server-session";
import { findUserById } from "@/lib/auth/user-store";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(req);
    if (!session) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Verify user still exists in database
    const stored = await findUserById(session.userId);
    if (!stored) {
      // User was deleted/revoked
      const response = NextResponse.json({ user: null }, { status: 200 });
      response.cookies.delete("sbs_session");
      return response;
    }

    return NextResponse.json(
      {
        user: {
          id: stored.id,
          name: stored.name,
          email: stored.email,
          role: stored.role,
          createdAt: stored.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Session verification failed";
    return NextResponse.json({ error: message, user: null }, { status: 500 });
  }
}
