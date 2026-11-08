"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { ApiError, errorMessage } from "@/lib/auth/api";
import { onboardingApi } from "@/lib/onboarding/api";
import { useOnboarding } from "@/lib/onboarding/context";
import { COMP, COMP_ORDER } from "@/lib/onboarding/options";
import type { KnowledgeProfileView } from "@/lib/onboarding/types";
import { prefersReducedMotion } from "@/lib/motion";
import { Loading, Shell, StatusChip } from "./ui";
import { reachable } from "./nav";

const STEPS = [
  "Reviewing your answers",
  "Evaluating technical understanding",
  "Separating claims from evidence",
  "Checking confidence for each area",
  "Preparing your Knowledge Profile",
];
const SOURCES: [Parameters<typeof Icon>[0]["name"], string, string][] = [
  ["user", "What you told us", "Experience, goal, technologies"],
  ["message", "Interview", "Your answers and how they were evaluated"],
  ["scale", "Assessment rules", "Levels from evidence only"],
];

/**
 * Generates the Knowledge Profile (one synthesis request on the server) while
 * showing progress. The request is idempotent, so a refresh simply picks up the
 * stored profile.
 */
export function AnalyzingScreen() {
  const { ready, status, answers, authorized, refresh } = useOnboarding();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<KnowledgeProfileView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  const run = useCallback(async () => {
    setError(null);
    const assessmentId = status?.assessmentId;
    if (!assessmentId) {
      router.replace("/onboarding/interview");
      return;
    }
    // Another tab may already be generating it: wait and ask again (the call is idempotent).
    for (let attempt = 0; attempt < 40; attempt++) {
      try {
        const p = await authorized((t) => onboardingApi.generateProfile(t, assessmentId));
        setProfile(p);
        void refresh();
        return;
      } catch (e) {
        if (e instanceof ApiError && e.status === 409 && /already being prepared/i.test(e.message)) {
          await new Promise((r) => window.setTimeout(r, 3000));
          continue;
        }
        setError(errorMessage(e));
        return;
      }
    }
    setError("Preparing your profile is taking longer than expected. Please try again.");
  }, [authorized, refresh, router, status?.assessmentId]);

  useEffect(() => {
    if (!ready || started.current) return;
    if (status?.stage === "PROFILE_READY" || status?.stage === "CONFIRMED") {
      router.replace("/onboarding/profile");
      return;
    }
    if (status?.stage !== "PROFILE_PENDING") {
      router.replace("/onboarding/interview");
      return;
    }
    started.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- starts the (idempotent) generation once
    void run();
  }, [ready, status, run, router]);

  // Steps advance on their own while the request runs; the last one waits for the result.
  useEffect(() => {
    if (error) return;
    const delay = prefersReducedMotion() ? 200 : 1100;
    if (step < STEPS.length - 1 || profile) {
      const t = window.setTimeout(() => setStep((s) => Math.min(s + 1, STEPS.length)), delay);
      return () => window.clearTimeout(t);
    }
  }, [step, profile, error]);

  useEffect(() => {
    if (profile && step >= STEPS.length) {
      const t = window.setTimeout(() => router.push("/onboarding/profile"), prefersReducedMotion() ? 100 : 700);
      return () => window.clearTimeout(t);
    }
  }, [profile, step, router]);

  if (!ready) return <Loading route="analyzing" />;
  const pct = Math.round((Math.min(step, STEPS.length) / STEPS.length) * 100);
  const levels = new Map(profile?.profile.competencies.map((c) => [c.id, c.level]) ?? []);
  const shown = profile ? Math.min(7, Math.round((step / STEPS.length) * 7)) : 0;

  return (
    <Shell route="analyzing" reachable={reachable(status, answers)}>
      <section className="an-wrap">
        <div>
          <div className="eyebrow ai"><Icon name="sparkles" className="sm" />Analyzing your knowledge</div>
          <h1 className="an-title">Building your Knowledge Profile.</h1>
          <p className="s-sub">We’re combining your answers and the evidence from the interview to understand your current capabilities.</p>
          <div className="an-steps">
            {STEPS.map((t, i) => {
              const done = i < step && (i < STEPS.length - 1 || !!profile);
              const on = !done && i === Math.min(step, STEPS.length - 1) && !error;
              return (
                <div className={`an-step ${on ? "on" : ""} ${done ? "done" : ""}`} key={t}>
                  <span className="an-ico">{done ? <Icon name="check" /> : on ? <span className="spinner" /> : <span className="idle" />}</span>
                  {t}
                </div>
              );
            })}
          </div>
          <div className="an-bar"><div className="progress"><i style={{ width: `${pct}%` }} /></div><span>{pct}%</span></div>
          {error ? (
            <div style={{ marginTop: 18 }}>
              <p className="ob-error" role="alert">{error}</p>
              <button className="btn btn-primary" type="button" style={{ marginTop: 12 }} onClick={() => void run()}>
                <Icon name="reset" />Try again
              </button>
            </div>
          ) : null}
        </div>
        <div className="an-stage" aria-hidden="true">
          {SOURCES.map(([icon, t, d], n) => (
            <div className={`an-src ${step % SOURCES.length === n && !profile ? "lit" : ""}`} key={t} style={{ top: `${8 + n * 30}%` }}>
              <span className="s-ico"><Icon name={icon} /></span>
              <div><b>{t}</b><span>{d}</span></div>
            </div>
          ))}
          <div className="an-out">
            <div className="an-out-head"><Icon name="layers" className="sm" />Knowledge Profile<span className="dim" style={{ marginLeft: "auto", fontWeight: 500 }}>{shown} / 7</span></div>
            <div className="an-out-body">
              {COMP_ORDER.map((c, i) => (
                <div className="an-row" key={c}>
                  <span className="nm">{COMP[c].name}</span>
                  {i < shown && levels.get(c) ? <span className="st"><StatusChip level={levels.get(c)!} /></span> : <span className="skeleton" style={{ width: 72 }} />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Shell>
  );
}
