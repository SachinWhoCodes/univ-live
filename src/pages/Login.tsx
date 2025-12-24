import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
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
  
  const navigate = useNavigate();
  const { tenantSlug, isTenantDomain } = useTenant();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return toast.error("Please enter email and password");

    setLoading(true);

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (!userDoc.exists()) {
        throw new Error("User record not found.");
      }

      const userData = userDoc.data();

      // Role Validation
      if (role === "student") {
        if (userData.role !== "STUDENT") {
           throw new Error("This email is registered as an Educator. Please switch tabs.");
        }
        
        // ✅ NEW: Check if student is enrolled in THIS specific tenant
        if (isTenantDomain) {
           const enrolledList = userData.enrolledTenants || []; // Default to empty array
           // Fallback for legacy users who only have 'tenantSlug' string
           const legacyTenant = userData.tenantSlug;
           
           if (!enrolledList.includes(tenantSlug) && legacyTenant !== tenantSlug) {
             throw new Error("You are not registered with this coaching institute. Please Sign Up first to join.");
           }
        } else {
             throw new Error("Students must login from their specific coaching website URL.");
        }

        navigate("/"); 

      } else {
        // Educator Login
        if (userData.role !== "EDUCATOR" && userData.role !== "ADMIN") {
           throw new Error("This email is registered as a Student.");
        }
        navigate("/dashboard");
      }
      
      toast.success("Welcome back!");

    } catch (error: any) {
      console.error("Login error:", error);
      let msg = "Failed to login";
      if (error.code === 'auth/invalid-credential') msg = "Invalid email or password";
      else msg = error.message;
      toast.error(msg);
      auth.signOut(); // Ensure we don't leave a half-logged-in session if validation fails
    } finally {
      setLoading(false);
    }
  };

  // ... (JSX remains exactly the same as previous Login.tsx, just copy-paste the return)
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div 
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         className="w-full max-w-md bg-card border rounded-xl shadow-lg p-8"
      >
        <div className="text-center mb-8">
           <h1 className="text-2xl font-bold">Welcome Back</h1>
           <p className="text-muted-foreground">Login to your account</p>
        </div>

        {/* Role Toggle Tabs */}
        {!isTenantDomain && (
           <div className="grid grid-cols-2 gap-2 bg-muted p-1 rounded-lg mb-6">
             <button
               onClick={() => setRole("educator")}
               className={`py-2 text-sm font-medium rounded-md ${role === "educator" ? "bg-background shadow" : "text-muted-foreground"}`}
             >
               Educator
             </button>
             <button
               onClick={() => setRole("student")}
               className={`py-2 text-sm font-medium rounded-md ${role === "student" ? "bg-background shadow" : "text-muted-foreground"}`}
             >
               Student
             </button>
           </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="name@example.com"
              required 
            />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full gradient-bg text-white" disabled={loading}>
            {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{" "}
          <Link to={`/signup?role=${role}`} className="text-primary font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
