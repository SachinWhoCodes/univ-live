// src/pages/Login.tsx
import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, GraduationCap, Building2 } from "lucide-react";
import { signInWithEmailAndPassword, signOut as firebaseSignOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTenant } from "@/contexts/TenantProvider";

export default function Login() {
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get("role");
  const [role, setRole] = useState<"educator" | "student">(
    roleParam === "student" ? "student" : "educator"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { tenantSlug, isTenantDomain } = useTenant();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Please enter email and password");
      return;
    }

    setIsLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const uid = credential.user.uid;

      // read authoritative profile doc to get role + tenantSlug
      const snap = await getDoc(doc(db, "users", uid));
      if (!snap.exists()) {
        // weird: user has no profile
        await firebaseSignOut(auth);
        toast.error("User profile not found. Contact support.");
        setIsLoading(false);
        return;
      }

      const data = snap.data() as any;
      const roleFromDb = String(data.role || "").toUpperCase();
      const tenantFromDb = typeof data.tenantSlug === "string" ? String(data.tenantSlug) : "";

      if (roleFromDb === "STUDENT") {
        if (!isTenantDomain || !tenantSlug) {
          // Students must login from coaching subdomain
          await firebaseSignOut(auth);
          toast.error("Students must sign in from their coaching subdomain.");
          setIsLoading(false);
          return;
        }

        if (tenantFromDb !== tenantSlug) {
          // student's account does not belong to this subdomain
          await firebaseSignOut(auth);
          toast.error("This account does not belong to this coaching. Please use the correct coaching URL.");
          setIsLoading(false);
          return;
        }

        toast.success("Login successful");
        navigate("/student/dashboard", { replace: true });
        return;
      }

      if (roleFromDb === "EDUCATOR" || roleFromDb === "ADMIN") {
        // educator/admin: redirect to educator dashboard
        toast.success("Login successful");
        navigate("/educator/dashboard", { replace: true });
        return;
      }

      // fallback
      toast.success("Login successful");
      navigate("/", { replace: true });
    } catch (err: any) {
      const msg = typeof err?.message === "string" ? err.message.replace("Firebase: ", "") : "Login failed";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
              <span className="text-white font-display font-bold text-lg">U</span>
            </div>
            <span className="font-display font-bold text-2xl">
              <span className="gradient-text">UNIV</span>
              <span className="text-foreground">.LIVE</span>
            </span>
          </Link>

          <h1 className="text-3xl font-display font-bold mb-2">Welcome back</h1>
          <p className="text-muted-foreground mb-8">Sign in to continue to your dashboard</p>

          {/* Role Selector */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setRole("educator")}
              className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                role === "educator"
                  ? "border-brand-start bg-brand-start/5"
                  : "border-border hover:border-brand-start/50"
              }`}
            >
              <Building2 className={`w-5 h-5 ${role === "educator" ? "text-brand-blue" : "text-muted-foreground"}`} />
              <span className={`font-medium ${role === "educator" ? "text-foreground" : "text-muted-foreground"}`}>
                Educator
              </span>
            </button>
            <button
              onClick={() => setRole("student")}
              className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                role === "student"
                  ? "border-brand-start bg-brand-start/5"
                  : "border-border hover:border-brand-start/50"
              }`}
            >
              <GraduationCap className={`w-5 h-5 ${role === "student" ? "text-brand-blue" : "text-muted-foreground"}`} />
              <span className={`font-medium ${role === "student" ? "text-foreground" : "text-muted-foreground"}`}>Student</span>
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email or Phone</Label>
              <Input id="email" type="text" placeholder="your@email.com" className="h-12" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-sm text-brand-blue hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" className="h-12 pr-12" required value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="hero" size="xl" className="w-full group" disabled={isLoading}>
              {isLoading ? "Signing in..." : (<><span>Sign In</span><ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>)}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* Social Login */}
          <Button variant="outline" className="w-full h-12" type="button">
            Continue with Google
          </Button>

          {/* Sign Up Link */}
          <p className="text-center text-muted-foreground mt-8">
            Don't have an account?{" "}
            <Link to={`/signup?role=${role}`} className="text-brand-blue hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right - Visual */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`, backgroundSize: "32px 32px" }} />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white max-w-md">
            <h2 className="text-4xl font-display font-bold mb-6">Transform Your Coaching with AI</h2>
            <p className="text-lg text-white/80">Join 500+ coaching institutes already using UNIV.LIVE to manage students and grow their business.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

