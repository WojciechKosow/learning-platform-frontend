"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { BrandMark } from "@/components/ui/Icon";
import { onboardingApi } from "@/lib/onboarding/api";
import { useOnboarding } from "@/lib/onboarding/context";
import { prefersReducedMotion } from "@/lib/motion";

const NEXT = "/onboarding/about";
/** How long "Welcome to Scrivetta." stays before the onboarding questions start. */
const HOLD_MS = 3400;
const OUT_MS = 600;

/**
 * First-run welcome: "Welcome to Scrivetta." fades in, holds, fades out, and
 * the onboarding questions (then the interview) follow. Click, Enter, Space
 * or → continues straight away. Sign-in shows it automatically only once per
 * account: INTRO_SEEN is recorded when it moves on.
 */
export function IntroSequence() {
  const { authorized, refresh } = useOnboarding();
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    router.prefetch(NEXT);
  }, [router]);

  const next = useCallback(() => {
    if (done.current) return;
    done.current = true;
    setLeaving(true);
    // Recorded in parallel with the fade-out; a failure only means the
    // welcome may show once more on the next sign-in.
    const seen = authorized((t) => onboardingApi.progress(t, "INTRO_SEEN"))
      .then(() => void refresh())
      .catch(() => undefined);
    const fade = new Promise((r) => window.setTimeout(r, prefersReducedMotion() ? 0 : OUT_MS));
    void Promise.all([seen, fade]).then(() => router.push(NEXT));
  }, [authorized, refresh, router]);

  useEffect(() => {
    const t = window.setTimeout(next, prefersReducedMotion() ? 1200 : HOLD_MS);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") {
        e.preventDefault();
        next();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
    };
  }, [next]);

  return (
    <div className="ob">
      <div className="welcome" onClick={next} role="button" tabIndex={-1} aria-label="Continue">
        <div className="welcome-top"><BrandMark /></div>
        <div className={`welcome-stage ${leaving ? "out" : ""}`}>
          <h1 className="welcome-hero">
            <span className="w1">Welcome</span>
            <span className="w2">to Scrivetta.</span>
          </h1>
        </div>
      </div>
    </div>
  );
}
