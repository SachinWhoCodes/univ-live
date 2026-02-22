import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import { getAdmin } from "../_lib/firebaseAdmin.js";
import { requireUser } from "../_lib/requireUser.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const user = await requireUser(req, { roles: ["EDUCATOR", "ADMIN"] });
    const educatorId = user.uid;

    const {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
    } = req.body || {};

    if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing payment details" });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) return res.status(500).json({ error: "Server missing Razorpay secret" });

    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(String(razorpay_payment_id) + "|" + String(razorpay_subscription_id))
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    const admin = getAdmin();
    const db = admin.firestore();

    const subRef = db.doc(`educators/${educatorId}/billing/subscription`);
    const subSnap = await subRef.get();
    const sub = subSnap.data() || {};
    const existingSubId = String(sub.razorpaySubscriptionId || "");

    if (existingSubId && existingSubId !== String(razorpay_subscription_id)) {
      return res.status(400).json({ error: "Subscription mismatch for this educator" });
    }

    await subRef.set(
      {
        status: "authenticated",
        razorpaySubscriptionId: String(razorpay_subscription_id),
        lastVerifiedPaymentId: String(razorpay_payment_id),
        lastVerifiedSignature: String(razorpay_signature),
        lastVerifiedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return res.json({ ok: true, status: "authenticated" });
  } catch (e: any) {
    console.error("Verification failed:", e);
    return res.status(500).json({ error: e?.message || "Verification failed" });
  }
}
