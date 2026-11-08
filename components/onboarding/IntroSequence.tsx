"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { BrandMark, Icon } from "@/components/ui/Icon";
import { useUi } from "@/components/ui/UiProvider";
import { onboardingApi } from "@/lib/onboarding/api";
import { useOnboarding } from "@/lib/onboarding/context";
import { prefersReducedMotion } from "@/lib/motion";

type Scene = { dur: number; final?: boolean; body: ReactNode };

const PROFILE_PREVIEW: [string, number][] = [
  ["HTML & CSS", 3], ["JavaScript", 3], ["Async JavaScript", 2], ["React", 2], ["TypeScript", 2], ["Next.js", 0], ["Practices", 3],
];

/**
 * First-run intro (from the approved prototype): a short timed sequence that
 * introduces the interview. Click, Space or → moves on, ← goes back, Esc or
 * "Skip intro" jumps to the end. Shown automatically only once per account
 * (the backend records INTRO_SEEN when the user begins or puts it off).
 */
export function IntroSequence() {
  const { authorized, refresh } = useOnboarding();
  const router = useRouter();
  const { toast } = useUi();
  const [i, setI] = useState(0);
  const [leaving, setLeaving] = useState<number | null>(null);
  const [back, setBack] = useState(false);
  const [busy, setBusy] = useState(false);
  const beginRef = useRef<HTMLButtonElement>(null);

  const leave = async (action: "INTRO_SEEN" | "DEFER", to: string) => {
    setBusy(true);
    try {
      await authorized((t) => onboardingApi.progress(t, action));
      void refresh();
      router.push(to);
    } catch {
      toast("We couldn’t save that. Check your connection and try again.", "err");
      setBusy(false);
    }
  };

  const scenes: Scene[] = [
    { dur: 3400, body: <h1 className="sc-hero"><span className="sc-w">Welcome</span><span className="sc-to"> to Codetta.</span></h1> },
    { dur: 3600, body: <><p className="sc-l">We don’t teach programming.</p><p className="sc-l sc-l2">We help you learn to build software.</p></> },
    { dur: 3400, body: <><p className="sc-l">Every path here starts with one question:</p><p className="sc-l sc-l2 sc-em">where are you right now?</p></> },
    {
      dur: 4400,
      body: (
        <>
          <p className="sc-l">So before anything else, we’ll talk.</p>
          <div className="sc-chips">
            <span><Icon name="box" className="sm" />What you’ve built</span>
            <span><Icon name="code" className="sm" />How you think about code</span>
            <span><Icon name="help" className="sm" />Where you get stuck</span>
          </div>
          <p className="sc-note">About ten minutes.</p>
        </>
      ),
    },
    { dur: 4000, body: <><p className="sc-l">It isn’t an exam.</p><p className="sc-l sc-l2">“I don’t know” is a good answer.<br />It tells us more than a guess.</p></> },
    {
      dur: 5200,
      body: (
        <>
          <p className="sc-l">The questions adapt to you.</p>
          <div className="sc-ladder" aria-hidden="true">
            <div className="lad-row"><span>Advanced</span><i /></div>
            <div className="lad-row"><span>Intermediate</span><i /></div>
            <div className="lad-row"><span>Beginner</span><i /></div>
            <b className="lad-dot" />
          </div>
          <p className="sc-note">Answer well and they go deeper. Struggle and they get simpler.<br />Never used something? We skip it.</p>
        </>
      ),
    },
    {
      dur: 5200,
      body: (
        <>
          <p className="sc-l">At the end, you get your Knowledge Profile.</p>
          <div className="sc-profile" aria-hidden="true">
            {PROFILE_PREVIEW.map(([n, l], k) => (
              <div className="sp-row" key={n} style={{ "--d": `${k * 90}ms` } as CSSProperties}>
                <span>{n}</span>
                <span className={`sp-bar ${l ? `l${l}` : "u"}`}><i /><i /><i /><i /></span>
              </div>
            ))}
          </div>
          <p className="sc-note">What you can do, what to learn next, and the evidence behind both.</p>
        </>
      ),
    },
    {
      dur: 0,
      final: true,
      body: (
        <>
          <h2 className="sc-final">Let’s find your starting point.</h2>
          <div className="sc-cta">
            <button ref={beginRef} className="btn btn-primary btn-lg" type="button" disabled={busy}
              onClick={() => leave("INTRO_SEEN", "/onboarding/about")}>
              Begin<Icon name="arrowRight" className="arrow" />
            </button>
          </div>
          <p className="sc-note">
            About 10 minutes · progress is saved · skip anything
            <br />
            <button className="link sc-later" type="button" disabled={busy} onClick={() => leave("DEFER", "/dashboard")}>
              Not now, take me to my dashboard
            </button>
          </p>
        </>
      ),
    },
  ];
  const last = scenes.length - 1;

  const show = useCallback(
    (n: number) => {
      if (n < 0 || n > last || n === i) return;
      setBack(n < i);
      setLeaving(i);
      setI(n);
    },
    [i, last],
  );

  // The previous scene fades out, then is removed.
  useEffect(() => {
    if (leaving === null) return;
    const t = window.setTimeout(() => setLeaving(null), 600);
    return () => window.clearTimeout(t);
  }, [leaving]);

  // Scenes advance on their own (not with reduced motion).
  const dur = scenes[i].dur;
  useEffect(() => {
    if (!dur || prefersReducedMotion()) return;
    const t = window.setTimeout(() => show(i + 1), dur);
    return () => window.clearTimeout(t);
  }, [i, dur, show]);

  useEffect(() => {
    if (i !== last) return;
    const t = window.setTimeout(() => beginRef.current?.focus({ preventScroll: true }), 700);
    return () => window.clearTimeout(t);
  }, [i, last]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || (e.key === " " && i !== last)) {
        e.preventDefault();
        show(i + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        show(i - 1);
      } else if (e.key === "Escape") {
        show(last);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [i, last, show]);

  return (
    <div className="ob">
      <div className="intro-seq">
        <div className="seq-top">
          <BrandMark />
          {i !== last ? (
            <button className="seq-skip" type="button" onClick={() => show(last)}>
              Skip intro<Icon name="chevRight" className="xs" />
            </button>
          ) : <span />}
        </div>
        <div
          className="seq-stage"
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("button, a") || i === last) return;
            show(i + 1);
          }}
        >
          {/* Keyed by scene: the outgoing scene stays the same element and only gets "out",
              so its text fades away instead of re-mounting and replaying its entrance. Sorted, so
              React never moves an existing node (a move would restart its animations). */}
          {(leaving !== null && leaving !== i ? [leaving, i].sort((a, b) => a - b) : [i]).map((k) => (
            <div key={`scene-${k}`} className={`sc ${k !== i ? "out" : ""} ${k === i && back ? "back" : ""} ${scenes[k].final ? "final" : ""}`}>
              {scenes[k].body}
            </div>
          ))}
        </div>
        <div className="seq-dots">
          {scenes.map((s, k) => (
            <button key={k} type="button" aria-label={`Scene ${k + 1}`} onClick={() => show(k)}
              className={k < i ? "done" : k === i ? "on" : ""} style={{ "--dur": `${s.dur || 1}ms` } as CSSProperties}>
              <i />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
