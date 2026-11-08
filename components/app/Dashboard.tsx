"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandMark, Icon } from "@/components/ui/Icon";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useRequireAuth } from "@/lib/auth/hooks";
import { onboardingApi } from "@/lib/onboarding/api";
import type { OnboardingStatus } from "@/lib/onboarding/types";

const NEXT_STEP: Record<OnboardingStatus["stage"], { title: string; text: string; href: string; cta: string }> = {
  INTAKE: { title: "Find your starting point", text: "A few questions and a short adaptive interview. About 10 minutes.", href: "/onboarding", cta: "Start onboarding" },
  INTERVIEW: { title: "Your interview is in progress", text: "Pick up where you left off. Your answers are saved.", href: "/onboarding/interview", cta: "Continue the interview" },
  PROFILE_PENDING: { title: "Your interview is done", text: "Build your Knowledge Profile from your answers.", href: "/onboarding/analyzing", cta: "Build my profile" },
  PROFILE_READY: { title: "Your Knowledge Profile is ready", text: "Review it, tell us what we got wrong, and confirm it.", href: "/onboarding/profile", cta: "View my profile" },
  CONFIRMED: { title: "Your Knowledge Profile is confirmed", text: "Your learning roadmap will be generated from it.", href: "/onboarding/profile", cta: "View my profile" },
};

/**
 * First signed-in screen. A placeholder until the real app (assessment,
 * roadmap, workspace) lands — it proves the session works end to end.
 */
export function Dashboard() {
  const { user, loading, logout, authorized } = useRequireAuth();
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);
  const [onboarding, setOnboarding] = useState<OnboardingStatus | null>(null);

  useEffect(() => {
    if (loading || !user) return;
    let cancelled = false;
    authorized((t) => onboardingApi.status(t))
      .then((s) => {
        if (cancelled) return;
        // A brand-new account goes straight into onboarding.
        if (s.stage === "INTAKE" && !s.answers) router.replace("/onboarding");
        else setOnboarding(s);
      })
      .catch(() => {
        /* the dashboard still works without it */
      });
    return () => {
      cancelled = true;
    };
  }, [loading, user, authorized, router]);
  const next = onboarding ? NEXT_STEP[onboarding.stage] : null;

  const onLogout = async () => {
    setLeaving(true);
    await logout();
    router.replace("/login");
  };

  return (
    <div className="app-shell">
      <header className="app-top">
        <Link href="/" className="brand">
          <BrandMark />
          Codetta
        </Link>
        <div className="app-top-r">
          <ThemeToggle />
          <button className="btn btn-ghost" onClick={onLogout} disabled={!user || leaving}>
            <Icon name="arrowLeft" className="sm" />
            Log out
          </button>
        </div>
      </header>
      <main className="app-main">
        {/* Same card for loading and loaded states, so nothing jumps when the session resolves. */}
        <div className="card app-card" aria-busy={loading || !user}>
          <div className="app-card-in">
            <span className="badge badge-act">
              <span className="status-dot live" />
              Signed in
            </span>
            <h1>{user ? `Welcome, ${user.displayName}` : "Loading your account…"}</h1>
            <p className="muted">
              {user ? (
                <>
                  You&apos;re signed in as <b style={{ color: "var(--text)" }}>{user.email}</b>. Your assessment, roadmap and workspace will
                  live here.
                </>
              ) : (
                "Checking your session."
              )}
            </p>
            {next ? (
              <div className="ob"><div className="notice warm" style={{ marginTop: 18, alignItems: "center" }}>
                <Icon name="sparkles" />
                <div style={{ flex: 1 }}>
                  <b>{next.title}.</b> {next.text}
                </div>
                <Link className="btn btn-primary btn-sm" href={next.href}>
                  {next.cta}
                </Link>
              </div></div>
            ) : null}
            <div className="app-facts">
              <div>
                <span>Email</span>
                <b>{user ? (user.emailVerified ? "Verified" : "Not verified yet") : "—"}</b>
              </div>
              <div>
                <span>Account</span>
                <b>{user ? (user.enabled ? "Active" : "Inactive") : "—"}</b>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
