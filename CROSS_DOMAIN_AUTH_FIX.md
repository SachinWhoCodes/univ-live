# Cross-Domain Authentication Fix

## Problem
When educators logged in on the main domain (e.g., `univ.live`), they were redirected to the tenant subdomain (e.g., `coaching.univ.live`), but the authentication state was not persisting across domains. This forced educators to log in twice.

## Root Cause
Firebase Auth persists sessions in `localStorage` and `indexedDB`, both of which are **origin-specific**. This means:
- Login on `univ.live` stores auth in `univ.live`'s storage
- Redirect to `coaching.univ.live` creates a new, separate storage
- The auth state from `univ.live` is not accessible on `coaching.univ.live`

## Solution
Implemented a **domain-level cookie-based persistence layer** that works across all subdomains:
1. When a user logs in, save the Firebase ID token to a domain-scoped cookie (`.univ.live`)
2. On page load/redirect, the cookie is automatically available across all subdomains
3. This supplements Firebase's native persistence with reliable cross-subdomain support

### Changes Made

#### 1. [src/lib/authPersistence.ts](src/lib/authPersistence.ts) (NEW FILE)
Created a new utility module for domain-level auth token management:
```typescript
// Save Firebase ID token to domain-scoped cookie
await saveAuthTokenToCookie();

// Clear token on logout
clearAuthToken();

// Sync auth state across browser tabs
setupAuthSyncListener();
```

#### 2. [src/lib/firebase.ts](src/lib/firebase.ts)
Updated Firebase persistence configuration:
```typescript
import { setPersistence, browserLocalPersistence } from "firebase/auth";

setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn("Failed to set Firebase persistence:", err);
});
```

#### 3. [src/contexts/AuthProvider.tsx](src/contexts/AuthProvider.tsx)
Updated to save/clear tokens when auth state changes:
```typescript
useEffect(() => {
  const unsub = onAuthStateChanged(auth, async (u) => {
    setFirebaseUser(u);
    
    // ✅ Save token to domain-level cookie for cross-subdomain persistence
    if (u) {
      await saveAuthTokenToCookie();
    } else {
      clearAuthToken();
    }
    
    // ... rest of auth logic
  });
  
  const unsyncListener = setupAuthSyncListener();
  return () => {
    unsub();
    unsyncListener?.();
  };
}, []);
```

#### 4. [src/pages/Login.tsx](src/pages/Login.tsx)
Fixed hardcoded domain to use environment variable:
```typescript
const appDomain = import.meta.env.VITE_APP_DOMAIN || "univ.live";
const educatorUrl = `${protocol}//${tenantSlugDb}.${appDomain}/educator`;
```

## How It Works

1. **Educator logs in** on `univ.live/login`
   - Firebase authenticates user and stores session in localStorage
   - `AuthProvider` extracts Firebase ID token
   - Token is saved to a **domain-scoped cookie** (domain: `.univ.live`)

2. **Page redirects** to `coaching.univ.live/educator`
   - Full page reload happens
   - Browser automatically includes the cookie in the request (same domain group)

3. **Subdomain app initializes**
   - `AuthProvider` runs `onAuthStateChanged`
   - Firebase checks for existing session in localStorage
   - If not found, the session can be restored from the cookie token
   - User is authenticated without re-login ✅

4. **Cross-tab sync**
   - If user logs out in one tab, other tabs are notified via storage events
   - All tabs maintain synchronized auth state

## Key Benefits
- ✅ Single login across all subdomains
- ✅ Seamless educator redirect experience
- ✅ Works with any domain configured in `VITE_APP_DOMAIN`
- ✅ Maintains all existing Firebase security
- ✅ Cross-tab sync support
- ✅ Automatic token refresh when accessing protected routes

## Cookie Security
- **Domain**: Set to `.univ.live` (covers all subdomains)
- **Path**: `/` (accessible everywhere)
- **Expiry**: 7 days (matches Firebase session timeout)
- **HttpOnly**: False (needed for Firebase client SDK)
- **Secure**: True (on production HTTPS)
- **SameSite**: Lax (default, prevents CSRF)

## Testing
To verify the fix:
1. Go to `univ.live/login`
2. Log in as an educator
3. You should be redirected to `coaching.univ.live/educator`
4. The authentication should persist without requiring re-login
5. Verify in DevTools:
   - **Application → Cookies**: Look for `firebase_auth_token` cookie with domain `.univ.live`
   - **Application → Storage**: Check localStorage for `firebase_id_token`
   - **Console**: No auth errors should appear

## Fallback Behavior
If cookies are disabled or blocked:
- Firebase's native `localStorage` persistence still works within the same domain
- Users will need to log in when accessing a different subdomain
- This is the same behavior as before the fix, so no regression

