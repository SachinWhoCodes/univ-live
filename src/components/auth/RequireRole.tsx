// src/components/auth/RequireRole.tsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, type UserRole } from "@/contexts/AuthProvider";

type Props = {
  allow: UserRole[];          // roles allowed to access
  redirectTo?: string;        // where to send if not allowed
  children: React.ReactNode;
};

export default function RequireRole({ allow, redirectTo = "/login", children }: Props) {
  const { loading, isAuthed, role } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthed) {
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }

  if (!role || !allow.includes(role)) {
    // If logged in but wrong role, send to home (or you can show a 403 page later)
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

