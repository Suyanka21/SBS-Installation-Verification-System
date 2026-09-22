import { collection, doc, getDoc, getDocs, setDoc, query, where } from "firebase/firestore";
import { firestore } from "./client";

export interface FirebaseUser {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export interface FirebaseProject {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: "active" | "archived" | "draft";
  createdAt: string;
}

export const usersCollection = collection(firestore, "users");
export const projectsCollection = collection(firestore, "projects");

export async function getUserProfile(userId: string): Promise<FirebaseUser | null> {
  const ref = doc(firestore, "users", userId);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as FirebaseUser) : null;
}

export async function getProjectsForUser(userId: string): Promise<FirebaseProject[]> {
  const q = query(projectsCollection, where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirebaseProject));
}
