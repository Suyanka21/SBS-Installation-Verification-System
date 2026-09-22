import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken, SessionPayload } from "./session-token";
import { SbsRole } from "./roles";

export interface ServerSession {
  userId: string;
  email: string;
  name: string;
  role: SbsRole;
}

/**
 * Extracts and cryptographically verifies the SBS session token from either:
 * 1. The HTTP-only `sbs_session` cookie, or
 * 2. The `Authorization: Bearer <token>` header.
 *
 * Never trusts client headers or unverified payloads.
 */
export async function getServerSession(req?: NextRequest): Promise<ServerSession | null> {
  let token: string | undefined;

  // 1. Check request cookies if available
  if (req) {
    token = req.cookies.get("sbs_session")?.value;
    if (!token) {
      const authHeader = req.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7).trim();
      }
    }
  } else {
    // 2. Fall back to Next.js cookies() in server components / route handlers
    try {
      const cookieStore = cookies();
      token = cookieStore.get("sbs_session")?.value;
    } catch {
      // Outside of request context
    }
  }

  if (!token) return null;

  const payload: SessionPayload | null = await verifySessionToken(token);
  if (!payload) return null;

  return {
    userId: payload.userId,
    email: payload.email,
    name: payload.name,
    role: payload.role,
  };
}

/**
 * Enforces that a valid server session exists.
 * Throws an Error with status 401 if unauthenticated.
 */
export async function requireAuth(req?: NextRequest): Promise<ServerSession> {
  const session = await getServerSession(req);
  if (!session) {
    const error = new Error("Authentication required: Invalid or missing session token");
    (error as unknown as { status: number }).status = 401;
    throw error;
  }
  return session;
}

/**
 * Enforces that the authenticated user possesses one of the allowed SBS roles.
 * Throws an Error with status 403 if unauthorized.
 */
export function requireRole(session: ServerSession, allowedRoles: SbsRole[]): void {
  if (!allowedRoles.includes(session.role)) {
    const error = new Error(
      `Access denied: Action requires one of [${allowedRoles.join(", ")}], but user holds role '${session.role}'`
    );
    (error as unknown as { status: number }).status = 403;
    throw error;
  }
}

/**
 * Resolves the author / actor ID strictly from the verified server session.
 * Rejects and ignores any client-supplied spoofed user ID.
 */
export async function resolveAttributedUser(req: NextRequest): Promise<{ userId: string; role: SbsRole; name: string }> {
  const session = await requireAuth(req);
  return {
    userId: session.userId,
    role: session.role,
    name: session.name,
  };
}
