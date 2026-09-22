import { collection, doc, getDoc, getDocs, setDoc, query, where } from "firebase/firestore";
import { firestore } from "./client";
import { SbsRole } from "@/lib/auth/auth-context";

export interface FirebaseUser {
  id: string;
  email: string;
  name: string;
  role: SbsRole;
  createdAt: string;
}

export interface FirebaseJob {
  id: string;
  guidelineId: string;
  siteName: string;
  tankModel: string;
  status: string;
  createdBy: string;
  plannedDemobilizationDate?: string;
  createdAt: string;
}

export const usersCollection = collection(firestore, "users");
export const jobsCollection = collection(firestore, "installation_jobs");

export async function getUserProfile(userId: string): Promise<FirebaseUser | null> {
  const ref = doc(firestore, "users", userId);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as FirebaseUser) : null;
}

export async function getJobsForUser(userId: string): Promise<FirebaseJob[]> {
  const q = query(jobsCollection, where("createdBy", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirebaseJob));
}
