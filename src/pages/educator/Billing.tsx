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

  useEffect(() => {
    if (!authLoading && role && role !== "EDUCATOR" && role !== "ADMIN") nav("/login?role=educator");
  }, [authLoading, role, nav]);

  useEffect(() => {
    if (!educatorId) return;
    const unsub = onSnapshot(doc(db, "educators", educatorId, "billing", "subscription"), (snap) => {
      const d = snap.exists() ? snap.data() : null;
      setSub(d);
      if (d?.quantity) setSeatLimit(Number(d.quantity));
    });

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

  const startCheckout = async (plan: "ESSENTIAL" | "GROWTH") => {
    setBusy(true);
    try {
      const ok = await loadRazorpayScript();
      if (!ok) throw new Error("Failed to load Razorpay");

      const data = await postWithToken("/api/billing/create-subscription", {
        planKey: plan,
        quantity: Math.max(1, Math.floor(seatLimit || 1)),
      });

      const options = {
        key: data.keyId,
        name: "UNIV.LIVE",
        description: `${plan} plan`,
        subscription_id: data.subscriptionId,
        handler: () => toast.success("Checkout completed. Webhook will update status shortly."),
        modal: { ondismiss: () => toast("Checkout closed") },
      };

      const rz = new window.Razorpay(options);
      rz.open();
    } catch (e: any) {
      toast.error(e?.message || "Checkout failed");
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
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
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

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border rounded-lg p-4 space-y-2">
          <div className="font-semibold">ESSENTIAL</div>
          <div className="text-sm text-muted-foreground">Basic plan with seat limit control.</div>
          <Button disabled={busy} onClick={() => startCheckout("ESSENTIAL")}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Buy / Start Trial
          </Button>
        </div>

        <div className="border rounded-lg p-4 space-y-2">
          <div className="font-semibold">GROWTH</div>
          <div className="text-sm text-muted-foreground">Higher plan for scaling coaching.</div>
          <Button disabled={busy} onClick={() => startCheckout("GROWTH")}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Buy / Start Trial
          </Button>
        </div>
      </div>
    </div>
  );
}

