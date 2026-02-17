export function getTenantSlugFromHostname(hostnameArg?: string): string | null {
  const hostname =
    (hostnameArg || (typeof window !== "undefined" ? window.location.hostname : "")).toLowerCase();

  const appDomain = (import.meta.env.VITE_APP_DOMAIN || "univ.live").toLowerCase();

  // LOCAL DEV SUPPORT
  if (hostname === "localhost") {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    return params.get("tenant");
  }

  const parts = hostname.split(".");
  const domainParts = appDomain.split(".");

  const hostSuffix = parts.slice(-domainParts.length).join(".");
  if (hostSuffix !== appDomain) return null;

  if (parts.length === domainParts.length) return null;

  const subdomain = parts[0];
  if (subdomain === "www") return null;

  return subdomain;
}

