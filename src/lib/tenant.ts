// src/lib/tenant.ts
export function getTenantSlugFromHostname(): string | null {
  if (typeof window === "undefined") return null;

  const host = window.location.hostname; // e.g. abc.univ.live or localhost

  // Dev fallback: allow ?tenant=abc on localhost/127.0.0.1
  if (host === "localhost" || host === "127.0.0.1") {
    const q = new URLSearchParams(window.location.search);
    const t = q.get("tenant");
    return t ? String(t).trim().toLowerCase() : null;
  }

  // If the platform domain is univ.live (abc.univ.live)
  const match = host.match(/^([a-z0-9-]+)\.univ\.live$/i);
  if (match) {
    return match[1].toLowerCase();
  }

  // If you have other host patterns, extend here.
  // Default: not a tenant subdomain
  return null;
}

