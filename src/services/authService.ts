// src/services/authService.ts
import { auth, db } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

// ---------- Types ----------
export type UserRole = "ADMIN" | "EDUCATOR" | "STUDENT";

export type EducatorSignupInput = {
  name: string;
  email: string;
  password: string;
  coachingName: string;
  tenantSlug: string; // for now manually, later from onboarding/slug generator
};

export type StudentSignupInput = {
  name: string;
  email: string;
  password: string;
  // For now we ask a coaching code / slug.
  // Later we will auto-detect from subdomain.
  tenantSlug: string;
};

// ---------- Helpers ----------
function normSlug(raw: string) {
  return String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function tenantExists(slug: string) {
  const snap = await getDoc(doc(db, "tenants", slug));
  return snap.exists();
}

async function getTenant(slug: string): Promise<{ educatorId: string } | null> {
  const snap = await getDoc(doc(db, "tenants", slug));
  if (!snap.exists()) return null;
  const data = snap.data() as any;
  if (typeof data.educatorId !== "string") return null;
  return { educatorId: data.educatorId };
}

// ---------- Auth APIs ----------
export async function signInEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signOutApp() {
  await signOut(auth);
}

// ---------- Signup: Educator ----------
export async function signUpEducator(input: EducatorSignupInput) {
  const tenantSlug = normSlug(input.tenantSlug);
  if (!tenantSlug) {
    throw new Error("Please enter a valid coaching subdomain/slug.");
  }

  // prevent collision
  if (await tenantExists(tenantSlug)) {
    throw new Error("This coaching slug is already taken. Try another one.");
  }

  const cred = await createUserWithEmailAndPassword(auth, input.email, input.password);

  // Set display name in Firebase Auth
  await updateProfile(cred.user, { displayName: input.name });

  const educatorId = cred.user.uid;

  // users/{uid}
  await setDoc(
    doc(db, "users", educatorId),
    {
      role: "EDUCATOR" as UserRole,
      educatorId,
      tenantSlug,
      displayName: input.name,
      email: input.email,
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

  // educators/{educatorId}
  await setDoc(
    doc(db, "educators", educatorId),
    {
      ownerUid: educatorId,
      coachingName: input.coachingName,
      tenantSlug,
      websiteStatus: "NOT_CREATED", // later: QUEUED/IN_PROGRESS/LIVE
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

  // tenants/{tenantSlug} -> educatorId mapping
  await setDoc(
    doc(db, "tenants", tenantSlug),
    {
      educatorId,
      coachingName: input.coachingName,
      themeId: "theme1",
      status: "NOT_CREATED",
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

  // educators/{educatorId}/websiteConfig/default
  await setDoc(
    doc(db, "educators", educatorId, "websiteConfig", "default"),
    {
      themeId: "theme1",
      branding: {
        coachingName: input.coachingName,
        logoUrl: "",
        primaryColor: "#4F46E5",
        accentColor: "#22C55E",
      },
      content: {
        tagline: "CUET-focused coaching for top universities",
        about:
          "Welcome to our CUET coaching institute. Update this About section from Website Settings.",
        achievements: [],
        contact: {
          phone: "",
          email: input.email,
          address: "",
        },
        socials: {
          instagram: "",
          youtube: "",
          website: "",
        },
      },
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return cred.user;
}

// ---------- Signup: Student ----------
export async function signUpStudent(input: StudentSignupInput) {
  const tenantSlug = normSlug(input.tenantSlug);
  if (!tenantSlug) {
    throw new Error("Enter your coaching code/subdomain.");
  }

  const tenant = await getTenant(tenantSlug);
  if (!tenant) {
    throw new Error("Coaching not found. Please check your coaching code.");
  }

  const cred = await createUserWithEmailAndPassword(auth, input.email, input.password);
  await updateProfile(cred.user, { displayName: input.name });

  const uid = cred.user.uid;
  const educatorId = tenant.educatorId;

  // users/{uid}
  await setDoc(
    doc(db, "users", uid),
    {
      role: "STUDENT" as UserRole,
      educatorId,
      displayName: input.name,
      email: input.email,
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

  // educators/{educatorId}/students/{uid}
  await setDoc(
    doc(db, "educators", educatorId, "students", uid),
    {
      uid,
      name: input.name,
      email: input.email,
      status: "ACTIVE",
      joinedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return cred.user;
}

