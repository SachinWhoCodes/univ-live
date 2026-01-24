import { auth, db } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc, updateDoc, arrayUnion } from "firebase/firestore";

function normSlug(raw: string) {
  return String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function tenantExists(slug: string) {
  const t = await getDoc(doc(db, "tenants", slug));
  if (t.exists()) return true;
  // fallback: check educators by tenantSlug
  // (keep lightweight; Signup.tsx also checks)
  return false;
}

export async function signInEmail(email: string, password: string) {
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function signOutApp() {
  await signOut(auth);
}

export type EducatorSignupInput = {
  displayName: string;
  email: string;
  password: string;
  tenantSlug: string;
  coachingName: string;
  phone?: string;
};

export async function signUpEducator(input: EducatorSignupInput) {
  const slug = normSlug(input.tenantSlug);
  if (!slug) throw new Error("Invalid tenant slug");
  if (await tenantExists(slug)) throw new Error("Tenant slug already taken");

  const cred = await createUserWithEmailAndPassword(auth, input.email, input.password);
  await updateProfile(cred.user, { displayName: input.displayName });

  const uid = cred.user.uid;

  await setDoc(
    doc(db, "users", uid),
    {
      uid,
      role: "EDUCATOR",
      displayName: input.displayName,
      email: input.email,
      tenantSlug: slug,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  await setDoc(
    doc(db, "educators", uid),
    {
      tenantSlug: slug,
      coachingName: input.coachingName,
      phone: input.phone || "",
      email: input.email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  await setDoc(
    doc(db, "tenants", slug),
    {
      educatorId: uid,
      tenantSlug: slug,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return { uid, tenantSlug: slug };
}

export type StudentSignupInput = {
  displayName: string;
  email: string;
  password: string;
  tenantSlug: string;
};

export async function signUpStudent(input: StudentSignupInput) {
  const slug = normSlug(input.tenantSlug);
  if (!slug) throw new Error("Invalid tenant slug");

  const cred = await createUserWithEmailAndPassword(auth, input.email, input.password);
  await updateProfile(cred.user, { displayName: input.displayName });

  const uid = cred.user.uid;

  await setDoc(
    doc(db, "users", uid),
    {
      uid,
      role: "STUDENT",
      displayName: input.displayName,
      email: input.email,
      tenantSlug: slug,
      enrolledTenants: arrayUnion(slug),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  // Best-practice: let server register student into educator learners list
  const token = await cred.user.getIdToken();
  await fetch("/api/tenant/register-student", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ tenantSlug: slug, displayName: input.displayName, email: input.email }),
  });

  return { uid, tenantSlug: slug };
}

