"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";

export function Modes() {
  const buildRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  // Fill the Build-mode cap bar once the card is on screen.
  useEffect(() => {
    const el = buildRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="section" id="modes">
      <div className="wrap">
        <div className="section-head">
          <h2>Learn when you want to grow. Build when you need to ship.</h2>
          <p>Two ways to work with AI, named for what they are. You choose per task, and you always know which one counts toward your skills.</p>
        </div>
        <div className="modes">
          <article className="mode-card learn">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <div className="intro-ico">
                <Icon name="book" />
              </div>
              <span className="badge badge-act">
                <Icon name="award" />
                Counts toward skills
              </span>
            </div>
            <h3>Learn mode</h3>
            <p>You write the code. The mentor explains, hints in steps and reviews what you wrote, using your files and your roadmap as context.</p>
            <ul>
              <li><Icon name="check" />Hints from a nudge to a full explanation</li>
              <li><Icon name="check" />Code reviews on every task</li>
              <li><Icon name="check" />Light on credits: 1 to 3 per hint</li>
            </ul>
            <div className="mode-demo">
              <div className="row">
                <span className="msg-ai-head">
                  <span className="ai-orb">
                    <Icon name="sparkles" />
                  </span>
                  Mentor<span className="mode-tag">Hint 2 of 4</span>
                </span>
                <span className="dim" style={{ fontSize: 12 }}>
                  2 credits
                </span>
              </div>
              <p style={{ marginTop: 8, lineHeight: 1.6 }}>
                It&apos;s <code>reduce()</code>. Start the accumulator at <code>{"{ income: 0, expenses: 0 }"}</code>. What decides where each amount
                goes?
              </p>
              <div className="hint-ladder" style={{ marginTop: 10 }}>
                <span className="on" />
                <span className="on" />
                <span />
                <span />
              </div>
            </div>
          </article>
          <article className={`mode-card build ${inView ? "in" : ""}`} ref={buildRef}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <div className="intro-ico ai">
                <Icon name="wand" />
              </div>
              <span className="badge">Marked as AI-written</span>
            </div>
            <h3>Build mode</h3>
            <p>An AI agent writes and edits files across your project, like an AI coding tool. Use it for boilerplate, refactors or a feature you&apos;ve already mastered.</p>
            <ul>
              <li><Icon name="check" />Cost estimate before every run</li>
              <li><Icon name="check" />A per-run cap you control</li>
              <li><Icon name="check" />Its code is marked and never counts toward skills</li>
            </ul>
            <div className="mode-demo">
              <div className="row">
                <b style={{ fontWeight: 600 }}>Add monthly filtering to the list</b>
                <span className="badge badge-ai">Build</span>
              </div>
              <div className="est-box">
                <div>
                  <span>Estimated cost</span>
                  <b>60–90 credits</b>
                </div>
                <div>
                  <span>Your cap</span>
                  <b>120 credits</b>
                </div>
              </div>
              <div className="row" style={{ fontSize: 12, color: "var(--text-3)" }}>
                <span>Touches 3 files</span>
                <span>Balance after run: about 4,130</span>
              </div>
              <div className="cap-track">
                <i />
              </div>
              <div className="row" style={{ marginTop: 12, justifyContent: "flex-end", gap: 8 }}>
                <span className="btn btn-sm btn-ghost">Edit cap</span>
                <span className="btn btn-sm btn-ai">
                  <Icon name="play" />
                  Run
                </span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
