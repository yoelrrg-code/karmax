"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const STORAGE_KEY = "karmax_session_views";

export function VisitTracker() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;

    // Do not track admin backoffice, api endpoints, or internal files
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/api") ||
      pathname.startsWith("/_next")
    ) {
      return;
    }

    const normalizedPath =
      pathname.length > 1 && pathname.endsWith("/")
        ? pathname.replace(/\/+$/, "")
        : pathname;

    // Avoid duplicate execution in the same render cycle
    if (lastTrackedPath.current === normalizedPath) return;
    lastTrackedPath.current = normalizedPath;

    try {
      const rawStored = sessionStorage.getItem(STORAGE_KEY);
      const visitedList: string[] = rawStored ? JSON.parse(rawStored) : [];

      // If already visited in this browser session, skip network request entirely
      if (visitedList.includes(normalizedPath)) {
        return;
      }

      // Mark as visited for this session
      visitedList.push(normalizedPath);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(visitedList));

      // Asynchronous, non-blocking ping with keepalive
      fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: normalizedPath }),
        keepalive: true,
      }).catch(() => {
        // Silent catch: analytics failure must never interrupt the user experience
      });
    } catch {
      // sessionStorage unavailable (e.g. strict private mode restrictions)
    }
  }, [pathname]);

  return null;
}
