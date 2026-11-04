"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { highlightJs } from "@/lib/highlight";
import { money, SOLUTION } from "@/lib/landing-data";
import { prefersReducedMotion, tween } from "@/lib/motion";
import type { IconName } from "@/lib/icons";

const HERO_HEAD = `/**
 * Task: Implement expense calculation
 */
`;
const FULL = HERO_HEAD + SOLUTION.trimEnd();
const CARET = '<span class="caret"></span>';
const gutterFor = (txt: string) => txt.split("\n").map((_, k) => k + 1).join("<br>");
// Server render shows the header comment with a caret; typing starts on the client.
const INITIAL_CODE = highlightJs(HERO_HEAD) + CARET;
const INITIAL_GUT = gutterFor(HERO_HEAD);

const TREE: [IconName, string, number, string, boolean?][] = [
  ["folderOpen", "expense-tracker", 0, "fi-folder"],
  ["folderOpen", "src", 1, "fi-folder"],
  ["folder", "components", 2, "fi-folder"],
  ["folderOpen", "utils", 2, "fi-folder"],
  ["file", "calculateTotals.js", 3, "fi-js", true],
  ["file", "formatCurrency.js", 3, "fi-js"],
  ["file", "App.jsx", 2, "fi-jsx"],
  ["file", "main.jsx", 2, "fi-jsx"],
  ["file", "styles.css", 2, "fi-css"],
  ["file", "index.html", 1, "fi-html"],
  ["file", "package.json", 1, "fi-json"],
];

const TARGET = { bal: 2445.3, inc: 3840, exp: 1394.7 };

/**
 * The hero workspace: the solution types itself, the terminal logs an HMR
 * update, the preview's numbers count up and the mentor posts a review.
 * Every panel has a fixed size, so none of this changes the page height.
 */
export function HeroMock() {
  const stageRef = useRef<HTMLDivElement>(null);
  const mockRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLPreElement>(null);
  const gutRef = useRef<HTMLDivElement>(null);
  const balRef = useRef<HTMLElement>(null);
  const incRef = useRef<HTMLElement>(null);
  const expRef = useRef<HTMLElement>(null);
  const [finished, setFinished] = useState(false);

  // Typing animation. Writes straight to the DOM: no React render per keystroke.
  useEffect(() => {
    let i = HERO_HEAD.length;
    let timer = 0;
    let cancelTween = () => {};
    const paint = (n: number, done: boolean) => {
      const txt = FULL.slice(0, n);
      if (codeRef.current) codeRef.current.innerHTML = highlightJs(txt) + (done ? "" : CARET);
      if (gutRef.current) gutRef.current.innerHTML = gutterFor(txt);
    };
    const finish = () => {
      paint(FULL.length, true);
      setFinished(true);
      cancelTween = tween(0, 1, 900, (k) => {
        if (balRef.current) balRef.current.textContent = money(TARGET.bal * k);
        if (incRef.current) incRef.current.textContent = money(TARGET.inc * k);
        if (expRef.current) expRef.current.textContent = money(TARGET.exp * k);
      });
    };
    if (prefersReducedMotion()) {
      finish();
      return () => cancelTween();
    }
    const start = window.setTimeout(() => {
      timer = window.setInterval(() => {
        i += 2;
        if (i >= FULL.length) {
          clearInterval(timer);
          finish();
        } else paint(i, false);
      }, 26);
    }, 1700);
    return () => {
      clearTimeout(start);
      clearInterval(timer);
      cancelTween();
    };
  }, []);

  // Subtle 3D tilt that follows the pointer (transform only).
  useEffect(() => {
    const stage = stageRef.current;
    const mock = mockRef.current;
    if (!stage || !mock || prefersReducedMotion()) return;
    const floats = Array.from(stage.querySelectorAll<HTMLElement>(".mock-float"));
    const onMove = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      mock.style.setProperty("--ry", (px * 4).toFixed(2) + "deg");
      mock.style.setProperty("--rx", (-py * 3).toFixed(2) + "deg");
      floats.forEach((f) => {
        f.style.setProperty("--fx", px * 18 + "px");
        f.style.setProperty("--fy", py * 14 + "px");
      });
    };
    const onLeave = () => {
      mock.style.setProperty("--ry", "0deg");
      mock.style.setProperty("--rx", "0deg");
      floats.forEach((f) => {
        f.style.setProperty("--fx", "0px");
        f.style.setProperty("--fy", "0px");
      });
    };
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerleave", onLeave);
    return () => {
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div className="hero-stage" ref={stageRef}>
      <div className="mock" ref={mockRef} aria-label="Codetta workspace preview" role="img">
        <div className="mock-bar">
          <div className="mock-lights">
            <i />
            <i />
            <i />
          </div>
          <span style={{ marginLeft: 8, color: "var(--text)" }}>
            <b>expense-tracker</b>
          </span>
          <span className="branch">
            <Icon name="branch" className="sm" />
            main
          </span>
          <span style={{ marginLeft: "auto" }} className="badge badge-ok">
            <span className="status-dot live" />
            localhost:5173
          </span>
        </div>
        <div className="mock-grid">
          <div className="mock-tree">
            {TREE.map(([icon, name, depth, cls, on]) => (
              <div key={name} className={on ? "on" : undefined} style={{ paddingLeft: 12 + depth * 12 }}>
                <Icon name={icon} className={`sm ${cls}`} />
                {name}
              </div>
            ))}
          </div>
          <div className="mock-center">
            <div className="mock-tabs">
              <span className="on">calculateTotals.js</span>
              <span>App.jsx</span>
              <span>ExpenseList.jsx</span>
            </div>
            <div className="mock-code">
              <div className="gut" ref={gutRef} dangerouslySetInnerHTML={{ __html: INITIAL_GUT }} />
              <pre ref={codeRef} dangerouslySetInnerHTML={{ __html: INITIAL_CODE }} />
            </div>
            <div className="mock-term">
              <div>
                <span className="tc-act">❯</span> npm run dev
              </div>
              <div className="tc-dim">{"  VITE v7.1.4  ready in 320 ms"}</div>
              <div>
                {"  ➜  Local:   "}
                <span className="tc-cyan">http://localhost:5173/</span>
              </div>
              {finished && (
                <div style={{ animation: "fadeUp .4s var(--ease-out)" }}>
                  <span className="tc-dim">10:42:13 PM</span> <span className="tc-cyan">[vite]</span> hmr update{" "}
                  <span className="tc-dim">/src/utils/calculateTotals.js</span>
                </div>
              )}
            </div>
          </div>
          <div className="mock-side">
            <div className="mock-side-head">
              <Icon name="sparkles" className="sm" />
              AI Mentor
              <span className="badge" style={{ marginLeft: "auto", height: 20 }}>
                Help me
              </span>
            </div>
            <div className="mock-msgs">
              <div className="msg msg-user" style={{ fontSize: 12.5 }}>
                My balance shows $0.00. What am I missing?
              </div>
              <div className="msg msg-ai">
                <div className="msg-ai-head">
                  <span className="ai-orb">
                    <Icon name="sparkles" />
                  </span>
                  Mentor<span className="mode-tag">Hint 1 of 4</span>
                </div>
                <div className="msg-body" style={{ fontSize: 12.5 }}>
                  Your function returns fixed zeros. Which array method turns a list into a single value?
                </div>
                <div className="hint-ladder">
                  <span className="on" />
                  <span />
                  <span />
                  <span />
                </div>
              </div>
              {finished && (
                <div className="msg msg-ai">
                  <div className="msg-ai-head">
                    <span className="ai-orb">
                      <Icon name="sparkles" />
                    </span>
                    Mentor<span className="mode-tag">Code Review</span>
                  </div>
                  <div className="msg-body" style={{ fontSize: 12.5 }}>
                    All 4 completion criteria pass. Nice use of destructuring in the reducer.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="mock-float mock-preview" aria-hidden="true">
        <div className="xt" style={{ padding: "16px 14px 18px", minHeight: 0 }}>
          <div className="xt-head" style={{ marginBottom: 10 }}>
            <h1 style={{ fontSize: 15 }}>Expense Tracker</h1>
            <span style={{ fontSize: 11 }}>Nov 2026</span>
          </div>
          <div className="xt-bal" style={{ padding: "12px 14px" }}>
            <span style={{ fontSize: 11 }}>Current balance</span>
            <b ref={balRef} style={{ fontSize: 24 }}>
              {money(0)}
            </b>
          </div>
          <div className="xt-ie" style={{ marginTop: 8 }}>
            <div className="inc" style={{ padding: "8px 10px" }}>
              <span style={{ fontSize: 11 }}>Income</span>
              <b ref={incRef} style={{ fontSize: 14 }}>
                {money(0)}
              </b>
            </div>
            <div className="exp" style={{ padding: "8px 10px" }}>
              <span style={{ fontSize: 11 }}>Expenses</span>
              <b ref={expRef} style={{ fontSize: 14 }}>
                {money(0)}
              </b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
