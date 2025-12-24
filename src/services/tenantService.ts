// src/services/tenantService.ts
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

/** ---------------- TYPES ---------------- */

export type TenantStatus = "NOT_CREATED" | "QUEUED" | "IN_PROGRESS" | "LIVE";

export type TenantDoc = {
  tenantSlug: string;
  educatorId: string;
  coachingName: string;
  themeId: string; // "theme1" | "theme2" later
  status: TenantStatus;
};

export type WebsiteConfig = {
  themeId: string;
  branding: {
    coachingName: string;
    logoUrl: string;
    primaryColor: string;
    accentColor: string;
  };
  content: {
    tagline: string;
    about: string;
    achievements: string[];
    contact: {
      phone: string;
      email: string;
      address: string;
    };
    socials: {
      instagram: string;
      youtube: string;
      website: string;
    };
  };
  // Firestore timestamp, but keep it loose to avoid TS issues
  updatedAt?: any;
};

/** ---------------- HELPERS ---------------- */

function normSlug(raw: string) {
  return String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** ---------------- READ APIs ---------------- */

/**
 * Tenant lookup by slug.
 * Later: subdomain -> slug -> tenant doc -> educatorId.
 */
export async function getTenantBySlug(rawSlug: string): Promise<TenantDoc | null> {
  const tenantSlug = normSlug(rawSlug);
  if (!tenantSlug) return null;

  const snap = await getDoc(doc(db, "tenants", tenantSlug));
  if (!snap.exists()) return null;

  const data = snap.data() as any;
  if (typeof data.educatorId !== "string") return null;

  return {
    tenantSlug,
    educatorId: data.educatorId,
    coachingName: String(data.coachingName || ""),
    themeId: String(data.themeId || "theme1"),
    status: (data.status || "NOT_CREATED") as TenantStatus,
  };
}

/**
 * Read website config for a coaching (public-safe doc).
 * Path: educators/{educatorId}/websiteConfig/default
 */
export async function getWebsiteConfig(educatorId: string): Promise<WebsiteConfig | null> {
  if (!educatorId) return null;

  const snap = await getDoc(doc(db, "educators", educatorId, "websiteConfig", "default"));
  if (!snap.exists()) return null;

  const data = snap.data() as any;

  return {
    themeId: String(data.themeId || "theme1"),
    branding: {
      coachingName: String(data?.branding?.coachingName || ""),
      logoUrl: String(data?.branding?.logoUrl || ""),
      primaryColor: String(data?.branding?.primaryColor || "#4F46E5"),
      accentColor: String(data?.branding?.accentColor || "#22C55E"),
    },
    content: {
      tagline: String(data?.content?.tagline || ""),
      about: String(data?.content?.about || ""),
      achievements: Array.isArray(data?.content?.achievements) ? data.content.achievements : [],
      contact: {
        phone: String(data?.content?.contact?.phone || ""),
        email: String(data?.content?.contact?.email || ""),
        address: String(data?.content?.contact?.address || ""),
      },
      socials: {
        instagram: String(data?.content?.socials?.instagram || ""),
        youtube: String(data?.content?.socials?.youtube || ""),
        website: String(data?.content?.socials?.website || ""),
      },
    },
    updatedAt: data?.updatedAt,
  };
}

/**
 * Live subscription for website config (useful for instant preview).
 */
export function subscribeWebsiteConfig(
  educatorId: string,
  cb: (config: WebsiteConfig | null) => void
) {
  if (!educatorId) {
    cb(null);
    return () => {};
  }

  const ref = doc(db, "educators", educatorId, "websiteConfig", "default");
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        cb(null);
        return;
      }
      const data = snap.data() as any;
      cb({
        themeId: String(data.themeId || "theme1"),
        branding: {
          coachingName: String(data?.branding?.coachingName || ""),
          logoUrl: String(data?.branding?.logoUrl || ""),
          primaryColor: String(data?.branding?.primaryColor || "#4F46E5"),
          accentColor: String(data?.branding?.accentColor || "#22C55E"),
        },
        content: {
          tagline: String(data?.content?.tagline || ""),
          about: String(data?.content?.about || ""),
          achievements: Array.isArray(data?.content?.achievements) ? data.content.achievements : [],
          contact: {
            phone: String(data?.content?.contact?.phone || ""),
            email: String(data?.content?.contact?.email || ""),
            address: String(data?.content?.contact?.address || ""),
          },
          socials: {
            instagram: String(data?.content?.socials?.instagram || ""),
            youtube: String(data?.content?.socials?.youtube || ""),
            website: String(data?.content?.socials?.website || ""),
          },
        },
        updatedAt: data?.updatedAt,
      });
    },
    () => cb(null)
  );
}

/** ---------------- WRITE APIs ---------------- */

/**
 * Update website config fields (merge patch).
 * Educator panel will call this from Website Settings page.
 */
export async function updateWebsiteConfig(
  educatorId: string,
  patch: Partial<WebsiteConfig>
) {
  if (!educatorId) throw new Error("Missing educatorId");

  await setDoc(
    doc(db, "educators", educatorId, "websiteConfig", "default"),
    {
      ...patch,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Update website status in educators/{educatorId}
 * (used by educator dashboard to show website state)
 */
export async function setEducatorWebsiteStatus(
  educatorId: string,
  status: TenantStatus
) {
  if (!educatorId) throw new Error("Missing educatorId");

  await updateDoc(doc(db, "educators", educatorId), {
    websiteStatus: status,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Update tenant status in tenants/{tenantSlug}
 * (used later when subdomains become real)
 */
export async function setTenantStatus(
  tenantSlugRaw: string,
  status: TenantStatus
) {
  const tenantSlug = normSlug(tenantSlugRaw);
  if (!tenantSlug) throw new Error("Missing tenantSlug");

  await updateDoc(doc(db, "tenants", tenantSlug), {
    status,
    updatedAt: serverTimestamp(),
  });
}

