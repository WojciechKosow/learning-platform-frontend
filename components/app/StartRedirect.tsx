"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { BrandMark } from "@/components/ui/Icon";
import { useRequireAuth } from "@/lib/auth/hooks";
import { onboardingApi } from "@/lib/onboarding/api";
import { emptyAnswers } from "@/lib/onboarding/options";
import { resumePath } from "@/components/onboarding/nav";

/**
 * Runs once after sign-in (and when a signed-in user opens /login). The
 * backend decides the landing:
 * - INTRO: a brand-new account sees the first-run intro, once;
 * - CONTINUE: onboarding isn't finished, so back to the step they left;
 * - DASHBOARD: onboarding is finished, or they chose "finish later".
 * Opening /dashboard directly never redirects, so this isn't forced on every visit.
 */
export function StartRedirect() {
  const { user, loading, authorized } = useRequireAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading || !user) return;
    let cancelled = false;
    authorized((t) => onboardingApi.status(t))
      .then((s) => {
        if (cancelled) return;
        if (s.landing === "INTRO") router.replace("/onboarding");
        else if (s.landing === "CONTINUE") router.replace(resumePath(s, s.answers ?? emptyAnswers()));
        else router.replace("/dashboard");
      })
      .catch(() => !cancelled && router.replace("/dashboard"));
    return () => {
      cancelled = true;
    };
  }, [loading, user, authorized, router]);

  return (
    <div className="ob">
      <div className="ob-loading" style={{ minHeight: "100svh" }} aria-busy="true">
        <BrandMark />
        <span className="spinner" />
      </div>
    </div>
  );
}
