import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTenant } from "@/contexts/TenantProvider";

import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { arrayUnion, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type RoleUI = "student" | "educator";

function normSlug(raw: string) {
  return String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function Signup() {
  const [searchParams] = useSearchParams();
  const nav = useNavigate();
  const { isTenantDomain, tenantSlug, tenant, loading: tenantLoading } = useTenant();

  const roleParam = (searchParams.get("role") || "").toLowerCase();
  const [role, setRole] = useState<RoleUI>(roleParam === "educator" ? "educator" : "student");
  const effectiveRole: RoleUI = isTenantDomain ? "student" : role;

  const [name, setName] = useState("");
  const [coachingName, setCoachingName] = useState("");
  const [desiredSlug, setDesiredSlug] = useState("");
  const [phone, setPhone] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = useMemo(() => {
    if (tenantLoading) return "Loading…";
    if (isTenantDomain) return `Student Signup for ${tenantSlug || "your coaching"}`;
    return effectiveRole === "educator" ? "Educator Signup" : "Student Signup";
  }, [tenantLoading, isTenantDomain, tenantSlug, effectiveRole]);

  async function callRegisterStudent(token: string) {
    if (!tenantSlug) return;
    await fetch("/api/tenant/register-student", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ tenantSlug }),
    });
  }

  async function checkSlugAvailable(slug: string) {
    const s = await getDoc(doc(db, "tenants", slug));
    return !s.exists();
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (effectiveRole === "student") {
        if (!isTenantDomain || !tenantSlug || !tenant?.educatorId) {
          toast.error("Students must signup from a valid coaching URL.");
          setLoading(false);
          return;
        }

        try {
          const cred = await createUserWithEmailAndPassword(auth, email, password);
          await updateProfile(cred.user, { displayName: name });

          await setDoc(
            doc(db, "users", cred.user.uid),
            {
              uid: cred.user.uid,
              role: "STUDENT",
              displayName: name,
              email,
              educatorId: tenant.educatorId,
              tenantSlug, // legacy
              enrolledTenants: arrayUnion(tenantSlug),
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );

          const token = await cred.user.getIdToken();
          await callRegisterStudent(token).catch(() => {});
          toast.success("Account created!");
          nav("/student");
          return;
        } catch (err: any) {
          // if email exists, try "join" by signing in
          if (err?.code === "auth/email-already-in-use") {
            try {
              const cred2 = await signInWithEmailAndPassword(auth, email, password);
              await setDoc(
                doc(db, "users", cred2.user.uid),
                {
                  role: "STUDENT",
                  tenantSlug,
                  enrolledTenants: arrayUnion(tenantSlug),
                  updatedAt: serverTimestamp(),
                },
                { merge: true }
              );

              const token = await cred2.user.getIdToken();
              await callRegisterStudent(token).catch(() => {});
              toast.success("Signed in and enrolled!");
              nav("/student");
              return;
            } catch {
              toast.error("Account already exists. Please login instead.");
              return;
            }
          }
          throw err;
        }
      }

      // Educator signup (main domain only)
      if (isTenantDomain) {
        toast.error("Educators must signup from the main website, not the coaching URL.");
        return;
      }

      const slug = normSlug(desiredSlug);
      if (!slug) throw new Error("Please enter a valid tenant slug");
      if (!(await checkSlugAvailable(slug))) throw new Error("Tenant slug already taken");

      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });

      const uid = cred.user.uid;

      await setDoc(
        doc(db, "users", uid),
        {
          uid,
          role: "EDUCATOR",
          displayName: name,
          email,
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
          coachingName: coachingName || name,
          phone: phone || "",
          email,
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

      toast.success("Educator account created!");
      nav("/educator");
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">{title}</h1>

          {!isTenantDomain && (
            <div className="flex gap-2 justify-center">
              <Button type="button" variant={effectiveRole === "student" ? "default" : "outline"} onClick={() => setRole("student")}>
                Student
              </Button>
              <Button type="button" variant={effectiveRole === "educator" ? "default" : "outline"} onClick={() => setRole("educator")}>
                Educator
              </Button>
            </div>
          )}
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>

          {effectiveRole === "educator" && (
            <>
              <div className="space-y-2">
                <Label>Coaching Name</Label>
                <Input value={coachingName} onChange={(e) => setCoachingName(e.target.value)} placeholder="My Coaching" />
              </div>
              <div className="space-y-2">
                <Label>Tenant Slug (subdomain)</Label>
                <Input value={desiredSlug} onChange={(e) => setDesiredSlug(e.target.value)} placeholder="e.g. abc-coaching" />
              </div>
              <div className="space-y-2">
                <Label>Phone (optional)</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9876543210" />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
          </div>

          <div className="space-y-2">
            <Label>Password</Label>
            <div className="relative">
              <Input value={password} onChange={(e) => setPassword(e.target.value)} type={show ? "text" : "password"} placeholder="••••••••" />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link className="underline" to={`/login?role=${effectiveRole}`}>
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

