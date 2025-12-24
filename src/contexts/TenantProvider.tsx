// src/contexts/TenantProvider.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { getTenantSlugFromHostname } from "@/lib/tenant";
import { db, auth } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthProvider";
import { signOut } from "firebase/auth";
import { toast } from "sonner";

export type TenantProfile = {
  educatorId: string;
  tenantSlug: string;
  coachingName?: string;
  tagline?: string;
  contact?: { phone?: string; email?: string; address?: string };
  socials?: Record<string, string | null>;
  websiteConfig?: any;
};

type TenantContextValue = {
  tenant: TenantProfile | null;
  tenantSlug: string | null;
  loading: boolean;
  isTenantDomain: boolean;
};

const TenantContext = createContext<TenantContextValue | null>(null);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth(); // AuthProvider MUST wrap TenantProvider
  const [tenant, setTenant] = useState<TenantProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const tenantSlug = getTenantSlugFromHostname();
  const isTenantDomain = !!tenantSlug;

  useEffect(() => {
    let mounted = true;
    async function loadTenant() {
      setLoading(true);
      setTenant(null);
      if (!tenantSlug) {
        setLoading(false);
        return;
      }

      try {
        // Query educator profiles where tenantSlug matches (tenantSlug is stored on educator doc)
        const q = query(collection(db, "educators"), where("tenantSlug", "==", tenantSlug));
        const snaps = await getDocs(q);
        if (!mounted) return;

        if (!snaps.empty) {
          const d = snaps.docs[0].data() as any;
          setTenant({
            educatorId: snaps.docs[0].id,
            tenantSlug: tenantSlug,
            coachingName: typeof d.coachingName === "string" ? d.coachingName : "",
            tagline: typeof d.tagline === "string" ? d.tagline : "",
            contact: d.contact || {},
            socials: d.socials || {},
            websiteConfig: d.websiteConfig || null,
          });
        } else {
          // Tenant slug not found in DB – keep tenant null
          setTenant(null);
        }
      } catch (err) {
        console.error("Failed to load tenant", err);
        setTenant(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadTenant();
    return () => {
      mounted = false;
    };
  }, [tenantSlug]);

  // Enforce: if there is a logged-in STUDENT and their profile.tenantSlug != current tenantSlug then sign them out.
  useEffect(() => {
    if (!profile || !isTenantDomain) return;

    if (profile.role === "STUDENT") {
      // if user's tenantSlug doesn't match current subdomain, sign them out
      if ((profile.tenantSlug || "") !== (tenantSlug || "")) {
        // sign out and show friendly error
        (async () => {
          try {
            await signOut(auth);
          } catch (e) {
            // ignore
          } finally {
            toast.error("This account does not belong to this coaching website. Please login from your coaching subdomain.");
          }
        })();
      }
    }
    // Educators: no forced sign-out (they may manage from main domain)
  }, [profile, isTenantDomain, tenantSlug]);

  const value: TenantContextValue = {
    tenant,
    tenantSlug,
    loading,
    isTenantDomain,
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) {
    throw new Error("useTenant must be used within TenantProvider");
  }
  return ctx;
}

