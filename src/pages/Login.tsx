import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, GraduationCap, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Login() {
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get("role");
  const [role, setRole] = useState<"educator" | "student">(
    roleParam === "student" ? "student" : "educator"
  );
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.success("Login successful! Redirecting...");
    setIsLoading(false);
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
          <p className="text-muted-foreground mb-8">
            Sign in to continue to your dashboard
          </p>

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
              <span className={`font-medium ${role === "student" ? "text-foreground" : "text-muted-foreground"}`}>
                Student
              </span>
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email or Phone</Label>
              <Input
                id="email"
                type="text"
                placeholder="your@email.com"
                className="h-12"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-sm text-brand-blue hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-12 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="hero"
              size="xl"
              className="w-full group"
              disabled={isLoading}
            >
              {isLoading ? (
                "Signing in..."
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
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
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
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
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white max-w-md">
            <h2 className="text-4xl font-display font-bold mb-6">
              Transform Your Coaching with AI
            </h2>
            <p className="text-lg text-white/80">
              Join 500+ coaching institutes already using UNIV.LIVE to manage students and grow their business.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
