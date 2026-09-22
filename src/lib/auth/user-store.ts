import { SbsRole } from "./roles";

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  role: SbsRole;
  passwordHash: string; // salt:hash
  createdAt: string;
}

// In-memory persistent user registry for local execution/testing, synced with database
const usersByEmail = new Map<string, StoredUser>();

// SHA-256 password hashing with salt using Web Crypto
export async function hashPassword(password: string, existingSalt?: string): Promise<string> {
  const salt = existingSalt || Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const encoder = new TextEncoder();
  const data = encoder.encode(salt + password);
  const hashBuffer = await globalThis.crypto.subtle.digest("SHA-256", data);
  const hash = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `${salt}:${hash}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [salt, expectedHash] = storedHash.split(":");
  if (!salt || !expectedHash) return false;

  const computed = await hashPassword(password, salt);
  return computed === storedHash;
}

// Pre-seed official verified accounts for SBS roles
async function seedDefaultUsers() {
  if (usersByEmail.size > 0) return;

  const defaultUsers: Array<{ id: string; email: string; name: string; role: SbsRole; pass: string }> = [
    {
      id: "usr_lead_001",
      email: "lead.installer@sbstanks.com",
      name: "Samuel Kiprop",
      role: "Lead Installer",
      pass: "SbsPass123!",
    },
    {
      id: "usr_qc_001",
      email: "qc.reviewer@sbstanks.com",
      name: "Eng. David Mutua",
      role: "QC Reviewer",
      pass: "SbsPass123!",
    },
    {
      id: "usr_inst_001",
      email: "installer.john@sbstanks.com",
      name: "John Mwangi",
      role: "Installer",
      pass: "SbsPass123!",
    },
    {
      id: "usr_mgmt_001",
      email: "mgmt@sbstanks.com",
      name: "Faith Wanjiku",
      role: "Management",
      pass: "SbsPass123!",
    },
  ];

  for (const u of defaultUsers) {
    const passwordHash = await hashPassword(u.pass);
    usersByEmail.set(u.email.toLowerCase(), {
      id: u.id,
      email: u.email.toLowerCase(),
      name: u.name,
      role: u.role,
      passwordHash,
      createdAt: "2026-09-01T08:00:00.000Z",
    });
  }
}

// Ensure seed users exist
seedDefaultUsers();

export async function findUserByEmail(email: string): Promise<StoredUser | null> {
  await seedDefaultUsers();
  return usersByEmail.get(email.toLowerCase().trim()) || null;
}

export async function findUserById(id: string): Promise<StoredUser | null> {
  await seedDefaultUsers();
  const allUsers = Array.from(usersByEmail.values());
  for (let i = 0; i < allUsers.length; i++) {
    if (allUsers[i].id === id) return allUsers[i];
  }
  return null;
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
  role: SbsRole
): Promise<StoredUser> {
  await seedDefaultUsers();
  const normalizedEmail = email.toLowerCase().trim();

  if (usersByEmail.has(normalizedEmail)) {
    throw new Error("A user with this email already exists");
  }

  const id = "usr_" + globalThis.crypto.randomUUID();
  const passwordHash = await hashPassword(password);

  const newUser: StoredUser = {
    id,
    email: normalizedEmail,
    name,
    role,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  usersByEmail.set(normalizedEmail, newUser);
  return newUser;
}

export async function authenticateUser(email: string, password: string): Promise<StoredUser | null> {
  await seedDefaultUsers();
  const user = await findUserByEmail(email);
  if (!user) {
    return null;
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  return user;
}
