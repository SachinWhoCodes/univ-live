// src/lib/imagekitUpload.ts
import { auth } from "@/lib/firebase";

async function getIdToken(): Promise<string | null> {
  try {
    const u = auth.currentUser;
    if (!u) return null;
    return await u.getIdToken();
  } catch {
    return null;
  }
}

export async function uploadToImageKit(file: Blob, fileName: string, folder = "/question-bank") {
  const publicKey = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY as string;
  if (!publicKey) throw new Error("Missing VITE_IMAGEKIT_PUBLIC_KEY");

  // IMPORTANT: do NOT reuse token/signature. Fetch fresh auth params for every upload.
  const idToken = await getIdToken();
  const authRes = await fetch("/api/imagekit-auth", {
    method: "GET",
    headers: idToken ? { Authorization: `Bearer ${idToken}` } : undefined,
  });

  if (!authRes.ok) {
    const txt = await authRes.text().catch(() => "");
    throw new Error(`Failed to get ImageKit auth: ${authRes.status} ${txt}`);
  }

  const { token, expire, signature } = (await authRes.json()) as {
    token: string;
    expire: number;
    signature: string;
  };

  const form = new FormData();
  form.append("file", file);
  form.append("fileName", fileName);
  form.append("publicKey", publicKey);
  form.append("signature", signature);
  form.append("expire", String(expire));
  form.append("token", token);
  form.append("folder", folder);
  form.append("useUniqueFileName", "true");

  const uploadRes = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    body: form,
  });

  if (!uploadRes.ok) {
    const txt = await uploadRes.text().catch(() => "");
    throw new Error(`ImageKit upload failed: ${uploadRes.status} ${txt}`);
  }

  const json = await uploadRes.json();

  return {
    url: json.url as string,
    fileId: json.fileId as string,
    name: json.name as string,
  };
}