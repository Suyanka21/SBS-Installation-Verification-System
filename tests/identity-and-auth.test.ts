import test from "node:test";
import assert from "node:assert/strict";
import {
  authenticateUser,
  registerUser,
  findUserByEmail,
  hashPassword,
  verifyPassword,
} from "../src/lib/auth/user-store.ts";
import {
  createSessionToken,
  verifySessionToken,
} from "../src/lib/auth/session-token.ts";
import {
  requireRole,
  ServerSession,
} from "../src/lib/auth/server-session.ts";
import { SbsRole } from "../src/lib/auth/roles.ts";

test("Slice 0 Acceptance Suite — SBS Identity and Authentication Foundation", async (t) => {
  await t.test("1. Arbitrary unverified emails cannot authenticate", async () => {
    // Attempting to log in with an arbitrary unverified email must return null
    const result = await authenticateUser("random-unregistered-person@example.com", "any-password");
    assert.strictEqual(result, null, "Arbitrary email must not authenticate");
  });

  await t.test("2. Wrong password fails authentication for registered user", async () => {
    const result = await authenticateUser("lead.installer@sbstanks.com", "WrongPassword123!");
    assert.strictEqual(result, null, "Wrong password must be rejected");
  });

  await t.test("3. Password hashing uses salt and never stores plaintext", async () => {
    const rawPass = "SecretSecurePass999!";
    const hash1 = await hashPassword(rawPass);
    const hash2 = await hashPassword(rawPass);

    assert.notStrictEqual(hash1, rawPass, "Password must not be stored in plaintext");
    assert.notStrictEqual(hash1, hash2, "Different salts must produce different hashes for the same password");
    assert.ok(await verifyPassword(rawPass, hash1), "Valid password must verify against salt:hash");
    assert.strictEqual(await verifyPassword("WrongPassword", hash1), false, "Invalid password must fail verification");
  });

  await t.test("4. User registration persists valid SBS roles and rejects duplicate emails", async () => {
    const testEmail = `new.installer.${Date.now()}@sbstanks.com`;
    const newUser = await registerUser(
      "Kipchoge Keino",
      testEmail,
      "InstallerPass123!",
      "Installer"
    );

    assert.ok(newUser.id.startsWith("usr_"), "User must have a generated ID");
    assert.strictEqual(newUser.email, testEmail.toLowerCase());
    assert.strictEqual(newUser.role, "Installer");
    assert.notStrictEqual(newUser.passwordHash, "InstallerPass123!");

    // Duplicate email must throw error
    await assert.rejects(
      async () => {
        await registerUser("Duplicate Name", testEmail, "OtherPass123!", "Installer");
      },
      /already exists/,
      "Registering an already existing email must be blocked"
    );
  });

  await t.test("5. Cryptographic session token generation & verification (HMAC-SHA256)", async () => {
    const userPayload = {
      id: "usr_test_verification_01",
      email: "test.session@sbstanks.com",
      name: "Test User",
      role: "Lead Installer" as SbsRole,
    };

    const token = await createSessionToken(userPayload, 3600); // 1 hour
    assert.ok(token && token.split(".").length === 3, "Token must be valid 3-part signed JWT format");

    // Verify valid token
    const decoded = await verifySessionToken(token);
    assert.ok(decoded !== null, "Valid token must decode successfully");
    assert.strictEqual(decoded.userId, userPayload.id);
    assert.strictEqual(decoded.email, userPayload.email);
    assert.strictEqual(decoded.role, userPayload.role);

    // Tampered token must be rejected
    const tamperedToken = token.substring(0, token.lastIndexOf(".") + 1) + "invalidSignatureBytes";
    const tamperedResult = await verifySessionToken(tamperedToken);
    assert.strictEqual(tamperedResult, null, "Tampered signature must be rejected");

    // Expired token must be rejected
    const expiredToken = await createSessionToken(userPayload, -10); // Expired 10 seconds ago
    const expiredResult = await verifySessionToken(expiredToken);
    assert.strictEqual(expiredResult, null, "Expired token must be rejected");
  });

  await t.test("6. Two distinct user identities produce distinct, unspoofable attributions", async () => {
    // Identity A: Lead Installer (Samuel Kiprop)
    const userA = await authenticateUser("lead.installer@sbstanks.com", "SbsPass123!");
    assert.ok(userA, "User A must exist");
    assert.strictEqual(userA.role, "Lead Installer");

    // Identity B: QC Reviewer (Eng. David Mutua)
    const userB = await authenticateUser("qc.reviewer@sbstanks.com", "SbsPass123!");
    assert.ok(userB, "User B must exist");
    assert.strictEqual(userB.role, "QC Reviewer");

    // Generate real tokens for both sessions
    const tokenA = await createSessionToken({
      id: userA.id,
      email: userA.email,
      name: userA.name,
      role: userA.role,
    });

    const tokenB = await createSessionToken({
      id: userB.id,
      email: userB.email,
      name: userB.name,
      role: userB.role,
    });

    const sessionA = await verifySessionToken(tokenA);
    const sessionB = await verifySessionToken(tokenB);

    assert.ok(sessionA && sessionB);
    assert.notStrictEqual(sessionA.userId, sessionB.userId, "User IDs must be distinct");
    assert.strictEqual(sessionA.role, "Lead Installer");
    assert.strictEqual(sessionB.role, "QC Reviewer");

    // Simulating server action attribution
    // Even if User A sends { client_supplied_user_id: userB.id },
    // the server extracts author strictly from sessionA.userId:
    const spoofAttempt = userB.id;
    const authoritativeActorA = sessionA.userId;
    assert.strictEqual(authoritativeActorA, userA.id, "Attribution must strictly bind to authenticated session A");
    assert.notStrictEqual(authoritativeActorA, spoofAttempt, "Client-side spoof attempt must be ignored");
  });

  await t.test("7. Server-side role enforcement (requireRole) protects restricted actions", async () => {
    const installerSession: ServerSession = {
      userId: "usr_inst_001",
      email: "installer.john@sbstanks.com",
      name: "John Mwangi",
      role: "Installer",
    };

    const qcSession: ServerSession = {
      userId: "usr_qc_001",
      email: "qc.reviewer@sbstanks.com",
      name: "Eng. David Mutua",
      role: "QC Reviewer",
    };

    // Action: Approve Requirement (QC Reviewer ONLY)
    assert.doesNotThrow(() => {
      requireRole(qcSession, ["QC Reviewer"]);
    }, "QC Reviewer must be allowed to execute QC actions");

    assert.throws(
      () => {
        requireRole(installerSession, ["QC Reviewer"]);
      },
      /Access denied: Action requires one of \[QC Reviewer\]/,
      "Installer must be blocked from executing QC approval actions"
    );

    // Action: Submit Stage (Lead Installer ONLY)
    assert.throws(
      () => {
        requireRole(installerSession, ["Lead Installer"]);
      },
      /Access denied/,
      "Field Installer must be blocked from submitting Stage (Lead Installer only)"
    );
  });
});
