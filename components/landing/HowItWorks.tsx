"use client";

import { useEffect, useRef, useState, type AnimationEvent } from "react";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { Icon } from "@/components/ui/Icon";
import { HOW, SOLUTION } from "@/lib/landing-data";
import { prefersReducedMotion } from "@/lib/motion";
import { RoadmapMap } from "./RoadmapMap";

function Scene({ i }: { i: number }) {
  if (i === 0)
    return (
      <div className="step-scene">
        <div className="q-topic">
          <Icon name="code" className="sm" />
          JavaScript
        </div>
        <div style={{ fontSize: 19, fontWeight: 600, letterSpacing: "-.02em" }}>What does this code log?</div>
        <CodeBlock code={`[1, 2, 3, 4]\n  .filter((n) => n % 2 === 0)\n  .map((n) => n * 10);`} head="snippet.js" />
        <div className="options" style={{ marginTop: 14 }}>
          <div className="option">
            <span className="opt-k">A</span>
            <code>[10, 30]</code>
          </div>
          <div className="option on" style={{ animation: "pop .5s .6s var(--ease-out) both" }}>
            <span className="opt-k">B</span>
            <code>[20, 40]</code>
          </div>
        </div>
      </div>
    );
  if (i === 1)
    return (
      <div className="step-scene" style={{ maxWidth: 640 }}>
        <RoadmapMap compact bare />
      </div>
    );
  if (i === 2)
    return (
      <div className="step-scene">
        <CodeBlock code={SOLUTION.trimEnd().split("\n").slice(0, 9).join("\n")} head="src/utils/calculateTotals.js" />
        <div className="card" style={{ marginTop: 12, padding: "14px 16px", animation: "fadeUp .6s .5s var(--ease-out) both" }}>
          <div className="msg-ai-head">
            <span className="ai-orb">
              <Icon name="sparkles" />
            </span>
            Mentor<span className="mode-tag">Code Review</span>
          </div>
          <p style={{ marginTop: 6, fontSize: 13.5 }}>All 4 completion criteria pass. Nice use of destructuring in the reducer.</p>
        </div>
      </div>
    );
  return (
    <div className="step-scene">
      <div className="delta-list">
        <div className="delta">
          <Icon name="checkCircle" className="sm" />
          Functions<span className="from">In progress</span>
          <span className="to" style={{ marginLeft: 8 }}>
            Demonstrated
          </span>
        </div>
        <div className="delta">
          <Icon name="checkCircle" className="sm" />
          Array methods<span className="from">In progress</span>
          <span className="to" style={{ marginLeft: 8 }}>
            Demonstrated
          </span>
        </div>
        <div className="delta">
          <Icon name="route" className="sm" />
          JavaScript module<span className="from">55%</span>
          <span className="to" style={{ marginLeft: 8 }}>
            72%
          </span>
        </div>
        <div className="delta">
          <Icon name="unlock" className="sm" />
          Weather Dashboard<span className="to">Unlocked</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Four steps that advance on their own (5.5 s each, driven by the progress
 * bar's CSS animation). The stage has a fixed height and the step list never
 * changes size, so the auto-advance can't move anything else on the page.
 */
export function HowItWorks() {
  const boxRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [auto, setAuto] = useState(true);

  // Only run the timer while the section is on screen.
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const io = new IntersectionObserver((es) => setVisible(es.some((e) => e.isIntersecting)), { threshold: 0.2 });
    io.observe(box);
    return () => io.disconnect();
  }, []);

  // With reduced motion the bar animation is instant: don't auto-advance at all.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads a client-only preference once
    if (prefersReducedMotion()) setAuto(false);
  }, []);

  const onBarEnd = (e: AnimationEvent) => {
    if (auto && e.animationName === "stepBar") setStep((s) => (s + 1) % HOW.length);
  };

  return (
    <div
      ref={boxRef}
      className={`how ${hovered || !visible || !auto ? "paused" : ""}`}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <div className="step-tabs" role="tablist" aria-label="How it works">
        {HOW.map(([title, desc], i) => (
          <button
            key={title}
            role="tab"
            aria-selected={step === i}
            aria-controls="how-stage"
            className={`step-tab ${step === i ? "on" : ""}`}
            onClick={() => setStep(i)}
          >
            <span className="n">0{i + 1}</span>
            <h3>{title}</h3>
            <span className="step-desc">
              <span>
                <span className="step-p">{desc}</span>
              </span>
            </span>
            <span className="bar">
              <i key={step === i ? `on-${step}` : "off"} onAnimationEnd={onBarEnd} />
            </span>
          </button>
        ))}
      </div>
      {/* Narrow screens: one description slot, as tall as the longest text. */}
      <div className="step-mobile-desc swap" aria-hidden="true">
        {HOW.map(([title, desc], i) => (
          <p key={title} className={step === i ? "on" : undefined}>
            {desc}
          </p>
        ))}
      </div>
      <div className="step-stage" id="how-stage" role="tabpanel">
        <Scene key={step} i={step} />
      </div>
    </div>
  );
}
