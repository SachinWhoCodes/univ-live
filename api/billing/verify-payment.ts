import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";
import { getAdmin } from "../_lib/firebaseAdmin.js"; // Remember the .js extension!
import { requireUser } from "../_lib/requireUser.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    // 1. Ensure user is logged in
    const user = await requireUser(req, { roles: ["EDUCATOR", "ADMIN"] });
    const educatorId = user.uid;

    const { 
      razorpay_payment_id, 
      razorpay_subscription_id, 
      razorpay_signature 
    } = req.body;

    if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing payment details" });
    }

    // 2. The "Matching" Logic (Cryptography)
    // Razorpay formula: hmac_sha256(payment_id + "|" + subscription_id, secret)
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(razorpay_payment_id + "|" + razorpay_subscription_id)
      .digest("hex");

    // 3. Confirm the match
    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid payment signature. Potential fraud." });
    }

    // 4. Update Database IMMEDIATELY (Don't wait for webhook)
    const admin = getAdmin();
    const db = admin.firestore();

    await db.doc(`educators/${educatorId}/billing/subscription`).set(
      {
        status: "active", // We trust it's active because signature matched
        razorpaySubscriptionId: razorpay_subscription_id,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return res.json({ ok: true, status: "active" });

  } catch (e: any) {
    console.error("Verification failed:", e);
    return res.status(500).json({ error: "Verification failed" });
  }
}