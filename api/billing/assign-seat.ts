import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAdmin } from "../_lib/firebaseAdmin.js";
import { requireUser } from "../_lib/requireUser.js";

function isSubscriptionUsable(sub: any): boolean {
  const status = String(sub?.status || "").toLowerCase();
  if (status === "active" || status === "authenticated") return true;

  // trial: created is allowed only until startAt
  if (status === "created") {
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
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const user = await requireUser(req, { roles: ["EDUCATOR", "ADMIN"] });
    const educatorId = user.uid;

    const studentId = String(req.body?.studentId || "").trim();
    if (!studentId) return res.status(400).json({ error: "Missing studentId" });

    const admin = getAdmin();
    const db = admin.firestore();

    const subSnap = await db.doc(`educators/${educatorId}/billing/subscription`).get();
    const sub = subSnap.data() || {};
    if (!isSubscriptionUsable(sub)) {
      return res.status(403).json({ error: "Subscription not active/trial. Buy a plan first." });
    }

    const seatLimit = Math.max(0, Number(sub.quantity || 0));
    if (seatLimit <= 0) return res.status(400).json({ error: "Seat limit is 0. Update quantity in Billing." });

    // must exist in learners list
    const studentSnap = await db.doc(`educators/${educatorId}/students/${studentId}`).get();
    if (!studentSnap.exists) return res.status(400).json({ error: "Student not found in your learners list." });

    const seatRef = db.doc(`educators/${educatorId}/billingSeats/${studentId}`);
    const seatSnap = await seatRef.get();
    const curStatus = String(seatSnap.data()?.status || "").toLowerCase();
    if (curStatus === "active") return res.json({ ok: true, alreadyAssigned: true });

    // count active seats
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

    if (used >= seatLimit) {
      return res.status(400).json({ error: "Seat limit reached. Increase quantity or revoke another seat." });
    }

    await seatRef.set(
      {
        status: "active",
        assignedAt: admin.firestore.FieldValue.serverTimestamp(),
        assignedBy: educatorId,
        revokedAt: null,
      },
      { merge: true }
    );

    return res.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e?.message || "Server error" });
  }
}

