/**
 * Custom auth persistence using domain-level cookies
 * Allows authentication to persist across subdomains (e.g., univ.live and *.univ.live)
 */

import { auth } from "@/lib/firebase";

const COOKIE_NAME = "firebase_auth_token";
const TOKEN_STORAGE_KEY = "firebase_id_token";

/**
 * Get the domain for cookies (e.g., ".univ.live" for both univ.live and *.univ.live)
 */
export function getCookieDomain(): string {
  if (typeof window === "undefined") return "";
  
  const hostname = window.location.hostname;
  
  // localhost: no domain restriction
  if (hostname === "localhost") return "";
  
  // Get app domain from env
  const appDomain = import.meta.env.VITE_APP_DOMAIN || "univ.live";
  
  // Return domain with leading dot for all subdomains
  return "." + appDomain;
}

/**
 * Save the auth token to a domain-level cookie
 */
export async function saveAuthTokenToCookie() {
  if (typeof window === "undefined") return;
  
  try {
    const token = await auth.currentUser?.getIdToken(true);
    if (!token) return;
    
    const domain = getCookieDomain();
    const expires = new Date();
    expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    // Store both in localStorage and cookie for redundancy
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    
    let cookieString = `${COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${7 * 24 * 60 * 60}`;
    if (domain) {
      cookieString += `; domain=${domain}`;
    }
    
    document.cookie = cookieString;
  } catch (error) {
    console.error("Failed to save auth token to cookie:", error);
  }
}

/**
 * Get auth token from localStorage (fallback to cookie if needed)
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

/**
 * Clear auth token from storage and cookies
 */
export function clearAuthToken() {
  if (typeof window === "undefined") return;
  
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  
  // Clear cookie
  const domain = getCookieDomain();
  let cookieString = `${COOKIE_NAME}=; path=/; max-age=0`;
  if (domain) {
    cookieString += `; domain=${domain}`;
  }
  document.cookie = cookieString;
}

/**
 * Sync current user across tabs/windows for the same domain
 */
export function setupAuthSyncListener() {
  if (typeof window === "undefined") return;

  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === TOKEN_STORAGE_KEY) {
      // Token changed in another tab, reload to pick up new auth state
      if (!e.newValue) {
        // Token was cleared, sign out current session
        auth.signOut();
      }
    }
  };

  window.addEventListener("storage", handleStorageChange);
  return () => window.removeEventListener("storage", handleStorageChange);
}
