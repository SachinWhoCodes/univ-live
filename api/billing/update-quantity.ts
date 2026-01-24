import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAdmin } from "../_lib/firebaseAdmin";
import { requireUser } from "../_lib/requireUser";
import { razorpayRequest } from "../_lib/razorpayRequest";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const user = await requireUser(req, { roles: ["EDUCATOR", "ADMIN"] });
    const educatorId = user.uid;

    const qty = Math.max(1, Math.floor(Number(req.body?.quantity || 1)));

    const admin = getAdmin();
    const db = admin.firestore();

    const subRef = db.doc(`educators/${educatorId}/billing/subscription`);
    const subSnap = await subRef.get();
    const sub = subSnap.data() || {};
    const subscriptionId = String(sub.razorpaySubscriptionId || "");
    if (!subscriptionId) return res.status(400).json({ error: "No subscription found" });

    // Prevent lowering below assigned seats
    let used = 0;
    try {
      const agg = await db
        .collection(`educators/${educatorId}/billingSeats`)
        .where("status", "==", "active")
        .count()
        .get();
      used = agg.data().count || 0;
    } catch {
      const snap = await db
        .collection(`educators/${educatorId}/billingSeats`)
        .where("status", "==", "active")
        .get();
      used = snap.size;
    }

    if (qty < used) {
      return res.status(400).json({
        error: `You have ${used} active seats assigned. Remove seats first, then reduce quantity.`,
      });
    }

    const updated = await razorpayRequest(`subscriptions/${subscriptionId}`, "PATCH", {
      quantity: qty,
      schedule_change_at: "now",
      customer_notify: true,
    });

    await subRef.set(
      {
        quantity: qty,
        status: String(updated.status || sub.status || ""),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return res.json({ ok: true, quantity: qty });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e?.message || "Server error" });
  }
}

