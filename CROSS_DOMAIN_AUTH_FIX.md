# Cross-Domain Authentication Fix

## Problem
When educators logged in on the main domain (e.g., `univ.live`), they were redirected to the tenant subdomain (e.g., `coaching.univ.live`), but the authentication state was not persisting across domains. This forced educators to log in twice.

## Root Cause
Firebase Auth uses `localStorage` by default for persistence, which is **origin-specific**. This means:
- Login on `univ.live` stores auth in `univ.live`'s localStorage
- Redirect to `coaching.univ.live` creates a new, separate localStorage
- The auth state from `univ.live` is not accessible on `coaching.univ.live`

## Solution
Changed Firebase Auth persistence from `localStorage` to `indexedDBLocalPersistence`, which is **domain-level** and shared across:
- Main domain: `univ.live`
- All subdomains: `*.univ.live` (e.g., `coaching.univ.live`, `xyz.univ.live`, etc.)

### Changes Made

#### 1. [src/lib/firebase.ts](src/lib/firebase.ts)
**Added:**
```typescript
import { setPersistence, indexedDBLocalPersistence } from "firebase/auth";

// Configure persistence to use indexedDB for cross-subdomain support
setPersistence(auth, indexedDBLocalPersistence).catch((err) => {
  console.warn("Failed to set Firebase persistence:", err);
});
```

This ensures the Firebase Auth session persists in IndexedDB, which is accessible across all subdomains of `univ.live`.

#### 2. [src/pages/Login.tsx](src/pages/Login.tsx)
**Fixed hardcoded domain:**
```typescript
// Before:
const educatorUrl = `${protocol}//${tenantSlugDb}.univ.live/educator`;

// After:
const appDomain = import.meta.env.VITE_APP_DOMAIN || "univ.live";
const educatorUrl = `${protocol}//${tenantSlugDb}.${appDomain}/educator`;
```

This makes the redirect dynamic and configurable via `VITE_APP_DOMAIN` environment variable.

## How It Works
1. Educator logs in on `univ.live/login`
2. Firebase Auth stores the session in **IndexedDB** (domain-level)
3. Educator is redirected to `coaching.univ.live/educator`
4. The subdomain can access the same IndexedDB persistence layer
5. `AuthProvider` in the subdomain reads the existing Firebase session
6. No re-login required ✅

## Testing
To verify the fix:
1. Go to `univ.live/login`
2. Log in as an educator
3. You should be redirected to `coaching.univ.live/educator`
4. The authentication state should persist without requiring re-login
5. Verify in DevTools → Application → IndexedDB that `firebase` database exists

## Benefits
- ✅ Single login across all subdomains
- ✅ Seamless educator experience
- ✅ Standard Firebase best practice
- ✅ Works with any domain configured in `VITE_APP_DOMAIN`
- ✅ Maintains all existing security features
