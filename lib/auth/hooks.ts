"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { safeNextPath, useAuth } from "./auth-context";

/** `?next=` from the current URL, validated (read at call time — no Suspense needed). */
export function nextFromUrl(fallback = "/dashboard"): string {
  if (typeof window === "undefined") return fallback;
  return safeNextPath(new URLSearchParams(window.location.search).get("next"), fallback);
}

/** On login/register screens: a signed-in visitor goes straight to the app. */
export function useRedirectIfSignedIn() {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && user) router.replace(nextFromUrl());
  }, [user, loading, router]);
}

/** On app screens: an anonymous visitor goes to /login and comes back afterwards. */
export function useRequireAuth() {
  const auth = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!auth.loading && !auth.user) {
      router.replace(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
    }
  }, [auth.loading, auth.user, router]);
  return auth;
}
