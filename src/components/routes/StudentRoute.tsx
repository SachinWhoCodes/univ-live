import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthProvider";
import { useTenant } from "@/contexts/TenantProvider";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useEffect } from "react";

export default function StudentRoute() {
  const { profile, loading: authLoading } = useAuth();
  const { tenantSlug, isTenantDomain, loading: tenantLoading } = useTenant();

  // 1. Wait for everything to load
  if (authLoading || tenantLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // 2. Not Logged In? -> Login Page
  if (!profile) {
    return <Navigate to="/login?role=student" replace />;
  }

  // 3. Not a Student? -> Dashboard (or home)
  if (profile.role !== "STUDENT") {
    return <Navigate to="/dashboard" replace />;
  }

  // 4. Security Check: Are they enrolled in THIS tenant?
  if (isTenantDomain) {
    const enrolledList = profile.enrolledTenants || [];
    
    // Check match
    const isEnrolled = enrolledList.includes(tenantSlug!) || profile.tenantSlug === tenantSlug;

    if (!isEnrolled) {
      // If not enrolled, kick them out to the HOME page of this tenant
      return <RedirectToHomeWithError />;
    }
  }

  // 5. Allowed
  return <Outlet />;
}

// Small helper to show the error message after redirect
function RedirectToHomeWithError() {
  useEffect(() => {
    setTimeout(() => {
        toast.error("You are not enrolled in this coaching. Please Register first.");
    }, 100);
  }, []);
  
  return <Navigate to="/" replace />;
}
