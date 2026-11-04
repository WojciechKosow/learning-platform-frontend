"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Icon } from "@/components/ui/Icon";
import { MODULES, type Module } from "@/lib/landing-data";
import { prefersReducedMotion } from "@/lib/motion";

type Pt = [number, number];
const POS: Record<string, Pt> = { "html-css": [85, 300], javascript: [280, 300], typescript: [490, 140], react: [490, 300], node: [490, 465], nextjs: [700, 215], sql: [700, 465], fullstack: [895, 330] };
const POS_V: Record<string, Pt> = { "html-css": [200, 80], javascript: [200, 250], typescript: [70, 440], react: [200, 440], node: [330, 440], nextjs: [120, 650], sql: [300, 680], fullstack: [200, 900] };
const EDGES: [string, string][] = [["html-css", "javascript"], ["javascript", "typescript"], ["javascript", "react"], ["javascript", "node"], ["typescript", "nextjs"], ["react", "nextjs"], ["node", "sql"], ["nextjs", "fullstack"], ["node", "fullstack"], ["sql", "fullstack"]];
const GLYPH: Record<string, string> = { "html-css": "</>", javascript: "JS", typescript: "TS", react: "Re", nextjs: "Nx", node: "Nd", sql: "SQL", fullstack: "FS" };
const ORDER = ["html-css", "javascript", "typescript", "react", "node", "nextjs", "sql", "fullstack"];
const RING_R = 36;
const RING_C = 2 * Math.PI * RING_R;

type NodeState = "done" | "cur" | "started" | "todo";
const STATE_LABEL: Record<NodeState, string> = { done: "Demonstrated", cur: "In progress", started: "Started", todo: "Not started" };

const BY_ID: Record<string, Module> = Object.fromEntries(MODULES.map((m) => [m.id, m]));
const CUR = MODULES.find((m) => m.progress < 100)?.id ?? null;
const STATES: Record<string, NodeState> = Object.fromEntries(
  MODULES.map((m) => [m.id, m.progress >= 100 ? "done" : m.id === CUR ? "cur" : m.progress > 0 ? "started" : "todo"]),
);

const ancestors = (id: string, acc = new Set<string>()): Set<string> => {
  EDGES.filter((e) => e[1] === id).forEach(([a]) => {
    if (!acc.has(a)) {
      acc.add(a);
      ancestors(a, acc);
    }
  });
  return acc;
};
const descendants = (id: string, acc = new Set<string>()): Set<string> => {
  EDGES.filter((e) => e[0] === id).forEach(([, b]) => {
    if (!acc.has(b)) {
      acc.add(b);
      descendants(b, acc);
    }
  });
  return acc;
};

function edgeClass(a: Module, b: Module) {
  if (a.progress >= 100 && b.progress >= 100) return "done";
  if (a.progress >= 100) return "active";
  return "";
}

function pathD(p1: Pt, p2: Pt, vertical: boolean) {
  let [x1, y1] = p1;
  let [x2, y2] = p2;
  // Start and end at the edge of each orb, not its centre.
  if (vertical) {
    y1 += 34;
    y2 -= 34;
    const dy = (y2 - y1) / 2;
    return `M${x1} ${y1} C${x1} ${y1 + dy}, ${x2} ${y2 - dy}, ${x2} ${y2}`;
  }
  x1 += 36;
  x2 -= 36;
  const dx = (x2 - x1) / 2;
  return `M${x1} ${y1} C${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
}

/** Approximate length of the edge curve, for the "draw in" dash animation. */
function pathLen(p1: Pt, p2: Pt, vertical: boolean) {
  const n = pathD(p1, p2, vertical).match(/-?\d+(\.\d+)?/g)!.map(Number);
  const [x0, y0, x1, y1, x2, y2, x3, y3] = n;
  let len = 0;
  let px = x0;
  let py = y0;
  for (let k = 1; k <= 24; k++) {
    const t = k / 24;
    const u = 1 - t;
    const x = u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3;
    const y = u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3;
    len += Math.hypot(x - px, y - py);
    px = x;
    py = y;
  }
  return len;
}

type Props = {
  /** Smaller map without the legend (used inside "How it works"). */
  compact?: boolean;
  /** No board background or border. */
  bare?: boolean;
  /** Show the module details card under the map. */
  inline?: boolean;
};

/**
 * Interactive dependency graph of the demo roadmap. Hover traces a module's
 * path; click opens its details. Switches to a vertical layout on narrow
 * boards. The entrance animation starts when the map scrolls into view.
 */
export function RoadmapMap({ compact = false, bare = false, inline = false }: Props) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [vertical, setVertical] = useState(false);
  const [lit, setLit] = useState<string | null>(null);
  const [sel, setSel] = useState<string>(CUR ?? "javascript");
  // "idle": final state, no entrance (server render, or already on screen).
  // "armed": off-screen and hidden, waiting. "play": entrance running.
  // The compact map only ever mounts on the client (inside a step scene).
  const [phase, setPhase] = useState<"idle" | "armed" | "play">(compact ? "play" : "idle");

  // Layout switch with hysteresis, so a width near the breakpoint can't flip
  // the (much taller) vertical layout back and forth.
  useEffect(() => {
    const board = boardRef.current;
    if (!board || compact) return;
    const decide = () => {
      const w = board.clientWidth;
      setVertical((v) => (v ? w < 640 : w < 600));
    };
    decide();
    const ro = new ResizeObserver(decide);
    ro.observe(board);
    return () => ro.disconnect();
  }, [compact]);

  useEffect(() => {
    const board = boardRef.current;
    if (!board || compact || prefersReducedMotion()) return;
    const r = board.getBoundingClientRect();
    // Already visible on mount (e.g. a reload mid-page): keep it as rendered.
    if (r.top < window.innerHeight && r.bottom > 0) return;
    setPhase("armed");
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setPhase("play");
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(board);
    return () => io.disconnect();
  }, [compact]);

  const P = vertical ? POS_V : POS;
  const vb = vertical ? "0 0 400 1020" : compact ? "0 85 1000 460" : "0 0 1000 580";
  const [vx, vy, vw, vh] = vb.split(" ").map(Number);

  const litSet = useMemo(() => (lit ? new Set([lit, ...ancestors(lit), ...descendants(lit)]) : null), [lit]);
  const edgeLit = (a: string, b: string) => {
    if (!lit || !litSet) return false;
    return litSet.has(a) && litSet.has(b) && (a === lit || b === lit || ancestors(lit).has(b) || descendants(lit).has(a));
  };

  // Rings start empty while armed / at the start of the entrance, then fill.
  const [ringsFull, setRingsFull] = useState(false);
  useEffect(() => {
    if (phase !== "play") return;
    const t = window.setTimeout(() => setRingsFull(true), 350);
    return () => clearTimeout(t);
  }, [phase]);
  const ringPct = (m: Module) => (phase === "armed" || (phase === "play" && !ringsFull) ? 0 : m.progress);

  // Drop the one-off entrance classes once they have finished.
  const [settled, setSettled] = useState(false);
  useEffect(() => {
    if (phase !== "play") return;
    const t = window.setTimeout(() => setSettled(true), 1900);
    return () => clearTimeout(t);
  }, [phase]);
  const playing = phase === "play" && !settled;

  return (
    <>
      <div className="rm-shell no-drawer">
        <div className={`rm-board ${bare ? "bare" : ""} ${vertical ? "is-vertical" : ""}`} ref={boardRef}>
          {!compact && !bare && (
            <div className="rm-tools">
              <span>Hover a module to trace its path. Click to open it.</span>
              <div className="rm-legend">
                <span>
                  <i style={{ background: "var(--act)" }} />
                  Demonstrated
                </span>
                <span>
                  <i style={{ background: "transparent", border: "1.5px solid var(--act)" }} />
                  In progress
                </span>
                <span>
                  <i style={{ background: "var(--line-3)" }} />
                  Not started
                </span>
              </div>
            </div>
          )}
          <div
            className={`rm ${compact ? "compact" : ""} ${vertical ? "vertical" : ""} ${lit ? "focus" : ""} ${phase === "armed" ? "armed" : ""}`}
            onPointerLeave={() => setLit(null)}
            onBlur={() => setLit(null)}
          >
            <svg className="rm-edges" viewBox={vb} preserveAspectRatio="none" aria-hidden="true">
              {EDGES.map(([a, b], i) => (
                <path
                  key={`${a}>${b}${vertical ? "v" : ""}`}
                  className={`rm-edge ${edgeClass(BY_ID[a], BY_ID[b])} ${edgeLit(a, b) ? "lit" : ""} ${playing ? "drawing" : ""}`}
                  d={pathD(P[a], P[b], vertical)}
                  style={playing ? ({ "--len": pathLen(P[a], P[b], vertical).toFixed(0), animationDelay: `${150 + i * 60}ms` } as CSSProperties) : undefined}
                />
              ))}
            </svg>
            {ORDER.map((id, i) => {
              const m = BY_ID[id];
              const s = STATES[id];
              const [x, y] = P[id];
              const pct = ringPct(m);
              return (
                <button
                  key={id}
                  type="button"
                  className={`rm-node ${s} ${!compact && inline && sel === id ? "sel" : ""} ${playing ? "in" : ""} ${litSet?.has(id) ? "lit" : ""}`}
                  style={{ left: `${((x - vx) / vw) * 100}%`, top: `${((y - vy) / vh) * 100}%`, animationDelay: `${i * 55}ms` }}
                  aria-label={`${m.title}, ${STATE_LABEL[s]}, ${m.progress}%`}
                  aria-pressed={inline ? sel === id : undefined}
                  tabIndex={compact ? -1 : undefined}
                  onPointerEnter={() => setLit(id)}
                  onFocus={() => setLit(id)}
                  onClick={() => inline && setSel(id)}
                >
                  <span className="rm-orb">
                    <svg className="rm-ring" viewBox="0 0 78 78">
                      <circle className="track" cx="39" cy="39" r={RING_R} fill="none" strokeWidth="2.5" />
                      <circle
                        className="val"
                        cx="39"
                        cy="39"
                        r={RING_R}
                        fill="none"
                        strokeWidth="2.5"
                        strokeDasharray={RING_C.toFixed(1)}
                        style={{ strokeDashoffset: (RING_C * (1 - pct / 100)).toFixed(1) }}
                      />
                    </svg>
                    <span className="rm-glyph">{GLYPH[id]}</span>
                  </span>
                  <span className="rm-label">{id === "fullstack" ? "Full-stack apps" : m.title}</span>
                  <span className="rm-sub">{s === "done" ? "Demonstrated" : `${m.progress}%  ${m.effort}`}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {inline && (
        <div className="rm-inline">
          <div className="card">
            {/* All modules are rendered in one grid cell; the card is always as
                tall as the longest one, so switching never moves the page. */}
            <div className="swap" aria-live="polite">
              {MODULES.map((m) => (
                <div key={m.id} className={sel === m.id ? "on" : undefined}>
                  <ModuleDetails m={m} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ModuleDetails({ m }: { m: Module }) {
  const s = STATES[m.id];
  const unlocks = EDGES.filter((e) => e[0] === m.id).map((e) => BY_ID[e[1]].title);
  const cta =
    s === "cur" ? (
      <Link className="btn btn-primary btn-block" href="/register">
        <Icon name="code" />
        Continue: Implement expense calculation
      </Link>
    ) : s === "done" ? (
      <Link className="btn btn-block" href="/register">
        <Icon name="target" />
        Refresh with a quick challenge
      </Link>
    ) : (
      <Link className="btn btn-block" href="/register">
        <Icon name="folder" />
        Preview the first project
      </Link>
    );
  return (
    <div className="rm-drawer-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className={`badge ${s === "done" ? "badge-ok" : s === "cur" ? "badge-act" : ""}`}>{STATE_LABEL[s]}</span>
        <span className="dim mono" style={{ fontSize: 12 }}>
          {GLYPH[m.id]}
        </span>
      </div>
      <div>
        <h3>{m.title}</h3>
        <p className="muted" style={{ marginTop: 6, lineHeight: 1.6 }}>
          {m.summary}
        </p>
      </div>
      <div className="rm-facts">
        <div>
          <span>Difficulty</span>
          <b>{m.diff.replace("Beginner to intermediate", "Beginner+")}</b>
        </div>
        <div>
          <span>Effort</span>
          <b>{m.effort}</b>
        </div>
        <div>
          <span>Progress</span>
          <b className="num">{m.progress}%</b>
        </div>
      </div>
      <div className={`progress ${m.progress === 100 ? "ok" : ""}`}>
        <i style={{ width: `${m.progress}%` }} />
      </div>
      <div>
        <h5>Competencies</h5>
        <div className="comp-list">
          {m.comps.map(([n, cs]) => (
            <div key={n} className={`comp ${cs}`}>
              <Icon name={cs === "done" ? "checkCircle" : cs === "progress" ? "circleDot" : cs === "next" ? "arrowRight" : "circle"} />
              {n}
              <span className="dim" style={{ fontSize: 11.5, marginLeft: "auto" }}>
                {cs === "done" ? "Demonstrated" : cs === "progress" ? "In progress" : cs === "next" ? "Up next" : ""}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="rm-deps">
        <div>
          <h5>Depends on</h5>
          <div className="tags">
            {m.deps.length ? m.deps.map((d) => <span key={d} className="badge">{d}</span>) : <span className="dim" style={{ fontSize: 12.5 }}>Nothing</span>}
          </div>
        </div>
        <div>
          <h5>Unlocks</h5>
          <div className="tags">
            {unlocks.length ? unlocks.map((d) => <span key={d} className="badge">{d}</span>) : <span className="dim" style={{ fontSize: 12.5 }}>Your first product</span>}
          </div>
        </div>
      </div>
      <div>
        <h5>Projects that prove it</h5>
        <div className="comp-list">
          {m.projects.map((p) => (
            <span key={p} className="comp">
              <Icon name="folder" />
              <span>{p}</span>
            </span>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{cta}</div>
    </div>
  );
}
