// src/lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth, setPersistence, indexedDBLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Analytics is optional (and should only run in browser)
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string | undefined,
};

// Prevent re-initializing in Vite HMR
export const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Configure persistence to use indexedDB for cross-subdomain support
// This allows auth state to be shared across univ.live and *.univ.live subdomains
setPersistence(auth, indexedDBLocalPersistence).catch((err) => {
  console.warn("Failed to set Firebase persistence:", err);
});

// Optional analytics (safe)
export async function initAnalytics() {
  try {
    const ok = await isSupported();
    if (!ok) return null;
    return getAnalytics(app);
  } catch {
    return null;
  }
}

