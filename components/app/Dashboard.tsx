"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandMark, Icon } from "@/components/ui/Icon";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useRequireAuth } from "@/lib/auth/hooks";
import { onboardingApi } from "@/lib/onboarding/api";
import type { OnboardingStatus } from "@/lib/onboarding/types";
import { resumePath } from "@/components/onboarding/nav";

type NextStep = { title: string; text: string; href: string; cta: string; resume?: boolean };

/** What the dashboard offers, by onboarding stage. Opening the dashboard never redirects. */
function nextStep(s: OnboardingStatus): NextStep {
  switch (s.stage) {
    case "INTERVIEW":
      return { title: "Your interview is waiting", text: "Pick up where you left off. Your answers are saved.", href: "/onboarding/interview", cta: "Continue the interview", resume: true };
    case "PROFILE_PENDING":
      return { title: "Your interview is done", text: "Build your Knowledge Profile from your answers.", href: "/onboarding/analyzing", cta: "Build my profile", resume: true };
    case "PROFILE_READY":
      return { title: "Your Knowledge Profile is ready", text: "Review it, tell us what we got wrong, and confirm it.", href: "/onboarding/profile", cta: "View my profile" };
    case "CONFIRMED":
      return { title: "Your Knowledge Profile is confirmed", text: "Your learning roadmap will be generated from it.", href: "/onboarding/profile", cta: "View my profile" };
    default:
      return s.answers && (s.answers.about.duration || s.answers.about.level || s.answers.about.goal || s.answers.tech.selected.length || s.answers.experience.built)
        ? { title: "Finish finding your starting point", text: "A few questions and a short adaptive interview. Your answers so far are saved.", href: resumePath(s, s.answers), cta: "Continue onboarding", resume: true }
        : { title: "Find your starting point", text: "A few questions and a short adaptive interview. About 10 minutes.", href: s.introSeen ? "/onboarding/about" : "/onboarding", cta: "Start onboarding", resume: true };
  }
}

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
      .then((s) => !cancelled && setOnboarding(s))
      .catch(() => {
        /* the dashboard still works without it */
      });
    return () => {
      cancelled = true;
    };
  }, [loading, user, authorized]);

  // Continuing after "finish later": clear it, so the next sign-in resumes again.
  const go = async (n: NextStep) => {
    if (n.resume && onboarding?.deferred) {
      try {
        await authorized((t) => onboardingApi.progress(t, "RESUME"));
      } catch {
        /* navigation still works; the flag is cleared on the next save */
      }
    }
    router.push(n.href);
  };
  const next = onboarding ? nextStep(onboarding) : null;

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
                <button className="btn btn-primary btn-sm" type="button" onClick={() => void go(next)}>
                  {next.cta}
                </button>
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
