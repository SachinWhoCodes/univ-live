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

  // 1. Fetch Tenant Data (Coaching info)
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
        const q = query(collection(db, "educators"), where("slug", "==", tenantSlug));
        const snap = await getDocs(q);
        
        if (mounted) {
          if (!snap.empty) {
            const data = snap.docs[0].data();
            setTenant({
              educatorId: snap.docs[0].id,
              tenantSlug: data.slug,
              coachingName: data.coachingName,
              tagline: data.tagline,
              websiteConfig: data.websiteConfig,
            });
          } else {
            setTenant(null);
          }
        }
      } catch (err) {
        console.error("Failed to load tenant", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadTenant();
    return () => { mounted = false; };
  }, [tenantSlug]);

  // 2. Security Check: Enforce Tenant Membership for Students
  useEffect(() => {
    if (!profile || !isTenantDomain) return;

    if (profile.role === "STUDENT") {
      // ✅ NEW: Check Array
      const enrolledList = profile.enrolledTenants || [];
      // Fallback for old data
      const legacyTenant = profile.tenantSlug;
      
      const isEnrolled = enrolledList.includes(tenantSlug!) || legacyTenant === tenantSlug;

      if (!isEnrolled) {
        (async () => {
          try {
            await signOut(auth);
          } catch (e) {
            // ignore
          } finally {
            toast.error("You are not registered with this coaching. Please register first.");
          }
        })();
      }
    }
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
