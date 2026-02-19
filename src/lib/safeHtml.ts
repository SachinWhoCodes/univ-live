import React from "react";
import { cn } from "@/lib/utils";

// Basic, dependency-free sanitization.
// Admin content is trusted, but this blocks obvious script injection.
export function sanitizeHtmlBasic(html: string) {
  if (!html) return "";
  return String(html)
    // strip script tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // strip inline handlers (onclick=...)
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    // strip javascript: urls
    .replace(/javascript:/gi, "");
}

export function stripHtml(html: string) {
  return String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractImgUrls(html: string) {
  const out: string[] = [];
  const s = String(html || "");
  const re = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    if (m[1]) out.push(m[1]);
  }
  return Array.from(new Set(out));
}

export function extractImgUrlsFromParts(parts: string[]) {
  const urls = parts.flatMap((p) => extractImgUrls(p));
  return Array.from(new Set(urls));
}

export function HtmlView({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  const safe = sanitizeHtmlBasic(html);

  return (
    <div
      className={cn(
        "leading-relaxed",
        "[&>img]:max-w-full [&>img]:h-auto [&_img]:max-w-full [&_img]:h-auto",
        "[&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2",
        className
      )}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}

