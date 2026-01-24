type HttpMethod = "GET" | "POST" | "PATCH";

export async function razorpayRequest(path: string, method: HttpMethod, body?: any) {
  const keyId = process.env.RAZORPAY_KEY_ID!;
  const keySecret = process.env.RAZORPAY_KEY_SECRET!;
  if (!keyId || !keySecret) throw new Error("Missing Razorpay env vars");

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const res = await fetch(`https://api.razorpay.com/v1/${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.description || data?.error?.message || "Razorpay request failed";
    throw new Error(msg);
  }
  return data;
}
