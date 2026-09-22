import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/auth/user-store";
import { createSessionToken } from "@/lib/auth/session-token";
import { SbsRole } from "@/lib/auth/auth-context";

export async function POST(req: NextRequest) {
  // Feature flag enforcement per docs/identity-and-auth.md §3
  const isDemoExplicitlyDisabled = process.env.ENABLE_DEMO_AUTH === "false";
  const isProduction = process.env.NODE_ENV === "production" && process.env.ENABLE_DEMO_AUTH !== "true";

  if (isDemoExplicitlyDisabled || isProduction) {
    return NextResponse.json(
      {
        error:
          "Demo pass-through mode is disabled for this build. Individual authenticated login is required per docs/identity-and-auth.md.",
      },
      { status: 403 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const role: SbsRole = body.role || "Lead Installer";

    // Map role to pre-seeded authenticated account
    let targetEmail = "lead.installer@sbstanks.com";
    if (role === "QC Reviewer") {
      targetEmail = "qc.reviewer@sbstanks.com";
    } else if (role === "Installer") {
      targetEmail = "installer.john@sbstanks.com";
    } else if (role === "Management") {
      targetEmail = "mgmt@sbstanks.com";
    }

    const user = await findUserByEmail(targetEmail);
    if (!user) {
      return NextResponse.json({ error: "Demo user not found." }, { status: 404 });
    }

    // Generate real, cryptographically verifiable session token
    const token = await createSessionToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      demoMode: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });

    response.cookies.set({
      name: "sbs_session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Demo authentication failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
