"use client";

// Onboarding state shared by every screen under /onboarding. Answers are kept
// here while the user moves between steps and saved to the backend when they
// continue (and debounced while typing), so a refresh or another device picks
// up where they left off.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRequireAuth } from "@/lib/auth/hooks";
import { errorMessage } from "@/lib/auth/api";
import { onboardingApi } from "./api";
import { aboutDone, emptyAnswers, expDone } from "./options";
import type { OnboardingAnswers, OnboardingStatus } from "./types";

interface OnboardingState {
  ready: boolean;
  loadError: string | null;
  status: OnboardingStatus | null;
  answers: OnboardingAnswers;
  update: (fn: (a: OnboardingAnswers) => OnboardingAnswers) => void;
  /** Saves now (call before navigating to the next step). */
  save: () => Promise<boolean>;
  refresh: () => Promise<void>;
  authorized: ReturnType<typeof useRequireAuth>["authorized"];
}

const Ctx = createContext<OnboardingState | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { user, loading, authorized } = useRequireAuth();
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [answers, setAnswers] = useState<OnboardingAnswers>(emptyAnswers);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const latest = useRef(answers);
  const dirty = useRef(false);
  const timer = useRef<number | null>(null);

  const refresh = useCallback(async () => {
    try {
      const s = await authorized((t) => onboardingApi.status(t));
      setStatus(s);
      if (s.answers && !dirty.current) {
        const merged = { ...emptyAnswers(), ...s.answers };
        latest.current = merged;
        setAnswers(merged);
      }
      setLoadError(null);
    } catch (e) {
      setLoadError(errorMessage(e));
    } finally {
      setReady(true);
    }
  }, [authorized]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loads server state once the session is known
    if (!loading && user) void refresh();
  }, [loading, user, refresh]);

  const save = useCallback(async () => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
    if (!dirty.current) return true;
    try {
      const saved = await authorized((t) => onboardingApi.save(t, latest.current));
      dirty.current = false;
      setStatus((s) => (s ? { ...s, answers: saved, answersComplete: aboutDone(saved) && expDone(saved) } : s));
      return true;
    } catch {
      return false;
    }
  }, [authorized]);

  const update = useCallback(
    (fn: (a: OnboardingAnswers) => OnboardingAnswers) => {
      const next = fn(latest.current);
      latest.current = next;
      dirty.current = true;
      setAnswers(next);
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => void save(), 1200);
    },
    [save],
  );

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  const value = useMemo<OnboardingState>(
    () => ({ ready: ready && !loading && !!user, loadError, status, answers, update, save, refresh, authorized }),
    [ready, loading, user, loadError, status, answers, update, save, refresh, authorized],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useOnboarding(): OnboardingState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useOnboarding must be used inside <OnboardingProvider>");
  return ctx;
}
