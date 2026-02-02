import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { doc, onSnapshot, collection, onSnapshot as onSnapshotCol } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthProvider";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

// Helper to load Razorpay SDK
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function Billing() {
  const nav = useNavigate();
  const { firebaseUser, role, loading: authLoading } = useAuth();
  const educatorId = firebaseUser?.uid || "";

  const [sub, setSub] = useState<any>(null);
  const [seatLimit, setSeatLimit] = useState<number>(10);
  const [busy, setBusy] = useState(false);
  const [usedSeats, setUsedSeats] = useState(0);

  // 1. Redirect if not Educator
  useEffect(() => {
    if (!authLoading && role && role !== "EDUCATOR" && role !== "ADMIN") nav("/login?role=educator");
  }, [authLoading, role, nav]);

  // 2. Listen to Subscription & Seat Data
  useEffect(() => {
    if (!educatorId) return;
    
    // Listen to subscription status
    const unsub = onSnapshot(doc(db, "educators", educatorId, "billing", "subscription"), (snap) => {
      const d = snap.exists() ? snap.data() : null;
      setSub(d);
      if (d?.quantity) setSeatLimit(Number(d.quantity));
    });

    // Listen to active seat count
    const unsubSeats = onSnapshotCol(collection(db, "educators", educatorId, "billingSeats"), (snap) => {
      let c = 0;
      snap.docs.forEach((d) => {
        const s = String((d.data() as any)?.status || "").toLowerCase();
        if (s === "active") c++;
      });
      setUsedSeats(c);
    });

    return () => {
      unsub();
      unsubSeats();
    };
  }, [educatorId]);

  // Derived state
  const status = String(sub?.status || "none");
  const subId = String(sub?.razorpaySubscriptionId || "");
  const planKey = String(sub?.planKey || "");
  const limit = Math.max(0, Number(sub?.quantity || seatLimit || 0));

  const isTrialOrActive = useMemo(() => {
    const st = status.toLowerCase();
    if (st === "active" || st === "authenticated") return true;
    if (st === "created") {
      const startAt = sub?.startAt;
      const startMs =
        typeof startAt?.toMillis === "function"
          ? startAt.toMillis()
          : typeof startAt?.seconds === "number"
          ? startAt.seconds * 1000
          : null;
      if (typeof startMs === "number" && Date.now() < startMs) return true;
    }
    return false;
  }, [status, sub]);

  // Helper for API calls
  async function postWithToken(path: string, body: any) {
    if (!firebaseUser) throw new Error("Not logged in");
    const token = await firebaseUser.getIdToken();
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || "Request failed");
    return data;
  }

  // --- CORE CHECKOUT LOGIC ---
  const startCheckout = async (planKey: string) => {
    setBusy(true);
    try {
      // A. Load Razorpay Script FIRST
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) throw new Error("Razorpay SDK failed to load. Check your internet.");

      // B. Create Subscription on Backend
      const data = await postWithToken("/api/billing/create-subscription", { 
        planKey, 
        quantity: seatLimit 
      });

      // C. Open Razorpay Payment Popup
      const options = {
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: "Univ.Live",
        description: `${planKey} Plan Subscription`,
        
        // D. Handle Success
        handler: async function (response: any) {
          try {
            // Call Verification API
            await postWithToken("/api/billing/verify-payment", {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_signature: response.razorpay_signature
            });
            
            toast.success("Payment verified! Plan activated.");
            window.location.reload(); 
          } catch (err) {
            console.error(err);
            toast.error("Payment successful, but verification failed.");
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (e: any) {
      console.error(e);
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const updateQuantity = async () => {
    setBusy(true);
    try {
      await postWithToken("/api/billing/update-quantity", { quantity: Math.max(1, Math.floor(seatLimit || 1)) });
      toast.success("Seat limit updated");
    } catch (e: any) {
      toast.error(e?.message || "Failed to update quantity");
    } finally {
      setBusy(false);
    }
  };

  if (authLoading || !role) {
    return (
      <div className="p-6 flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading...
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        <p className="text-sm text-muted-foreground">
          Status: <b>{status}</b> {isTrialOrActive ? <span className="text-green-600">(usable)</span> : <span className="text-red-600">(not usable)</span>}
          <br />
          Seats used: <b>{usedSeats}</b> / <b>{limit}</b>
          <br />
          Plan: <b>{planKey || "—"}</b>
          <br />
          Subscription ID: <span className="font-mono text-xs">{subId || "—"}</span>
        </p>
      </div>

      <div className="border rounded-lg p-4 space-y-3">
        <div className="font-semibold">Seat Limit</div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            type="number"
            min={1}
            value={seatLimit}
            onChange={(e) => setSeatLimit(Number(e.target.value))}
            className="sm:max-w-xs"
          />
          <Button disabled={busy || !subId} onClick={updateQuantity}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Update Seat Limit
          </Button>
        </div>
        {!subId && <div className="text-sm text-muted-foreground">Buy a plan first to enable quantity updates.</div>}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* ESSENTIAL PLAN */}
        <div className="border rounded-xl p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div>
            <h3 className="text-xl font-bold">Essential</h3>
            <div className="text-3xl font-bold mt-2">₹169<span className="text-sm font-normal text-muted-foreground">/seat</span></div>
            <p className="text-sm text-green-600 font-medium mt-1">Includes 5-Day Free Trial</p>
          </div>
          <ul className="text-sm space-y-2 text-muted-foreground flex-1">
            <li>✓ No restriction on subject selection</li>
            <li>✓ 10 CBT tests per subject</li>
            <li>✓ AI-powered advanced analytics</li>
            <li>✓ Upload your own content</li>
            <li>✓ Email support</li>
          </ul>
          <Button className="w-full" disabled={busy} onClick={() => startCheckout("ESSENTIAL")}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Start Essential Trial
          </Button>
        </div>

        {/* GROWTH PLAN */}
        <div className="border border-primary/50 rounded-xl p-6 flex flex-col gap-4 shadow-md bg-primary/5 relative">
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-bl-lg font-medium">
            MOST POPULAR
          </div>
          <div>
            <h3 className="text-xl font-bold">Growth</h3>
            <div className="text-3xl font-bold mt-2">₹199<span className="text-sm font-normal text-muted-foreground">/seat</span></div>
            <p className="text-sm text-green-600 font-medium mt-1">Includes 5-Day Free Trial</p>
          </div>
          <ul className="text-sm space-y-2 text-muted-foreground flex-1">
            <li className="font-medium text-foreground">Everything in Essential, PLUS:</li>
            <li>✓ Priority call & chat support</li>
            <li>✓ Personalised Preference Sheet</li>
            <li>✓ 1-on-1 mentorship sessions</li>
            <li>✓ Exclusive WhatsApp teacher community</li>
            <li>✓ Complete post-CUET support</li>
          </ul>
          <Button className="w-full" disabled={busy} onClick={() => startCheckout("GROWTH")}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Start Growth Trial
          </Button>
        </div>

        {/* EXECUTIVE PLAN */}
        <div className="border rounded-xl p-6 flex flex-col gap-4 shadow-sm opacity-80">
          <div>
            <h3 className="text-xl font-bold">Executive</h3>
            <div className="text-xl font-bold mt-2">Custom Pricing</div>
            <p className="text-sm text-muted-foreground mt-1">For large institutions</p>
          </div>
          <ul className="text-sm space-y-2 text-muted-foreground flex-1">
            <li>✓ Custom Integrations</li>
            <li>✓ White-labeling options</li>
            <li>✓ Dedicated Account Manager</li>
            <li>✓ Bulk pricing discounts</li>
          </ul>
          <Button variant="outline" className="w-full" onClick={() => window.open("mailto:sales@univ.live")}>
            Contact Sales
          </Button>
        </div>
      </div>
    </div>
  );
}