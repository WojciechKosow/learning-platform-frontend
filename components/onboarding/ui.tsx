"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { BrandMark, Icon } from "@/components/ui/Icon";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useUi } from "@/components/ui/UiProvider";
import { onboardingApi } from "@/lib/onboarding/api";
import { useOnboarding } from "@/lib/onboarding/context";
import { highlightJs } from "@/lib/highlight";
import type { IconName } from "@/lib/icons";
import { CONF_LABEL, ST_CLASS, ST_COLOR, ST_LABEL, ST_RANK, type Option } from "@/lib/onboarding/options";
import type { ConfidenceLevel, Level } from "@/lib/onboarding/types";

/* ------------------------------------------------------------------ shell */

export type Route = "welcome" | "about" | "technologies" | "experience" | "interview" | "analyzing" | "profile" | "review";

const STAGES: { id: Exclude<Route, "welcome" | "analyzing">; full: string; short: string }[] = [
  { id: "about", full: "About you", short: "You" },
  { id: "technologies", full: "Technologies", short: "Tech" },
  { id: "experience", full: "Experience", short: "Exp." },
  { id: "interview", full: "Interview", short: "Interview" },
  { id: "profile", full: "Profile", short: "Profile" },
  { id: "review", full: "Review", short: "Review" },
];

/**
 * The onboarding frame: top bar with the stepper and progress line.
 * `reachable` lists the stages the user may jump back to.
 */
export function Shell({ route, reachable = [], children, full = false, wide = true }: {
  route: Route;
  reachable?: string[];
  children: ReactNode;
  full?: boolean;
  wide?: boolean;
}) {
  const stage = route === "analyzing" ? "profile" : route;
  const curIdx = STAGES.findIndex((s) => s.id === stage);
  const pct = route === "welcome" ? 0 : Math.round(((curIdx + (route === "analyzing" ? 0.5 : 1)) / STAGES.length) * 100);
  return (
    <div className="ob">
      <div className="shell">
        <header className="topbar">
          <Link className="brand" href="/" aria-label="Codetta home">
            <BrandMark />
            Codetta
          </Link>
          {route === "welcome" ? (
            <span />
          ) : (
            <nav className="stepper" aria-label="Onboarding progress">
              {STAGES.map((s, i) => {
                const done = i < curIdx;
                const cur = i === curIdx;
                const canGo = !cur && reachable.includes(s.id);
                const cls = `step ${cur ? "cur" : done || canGo ? "done" : ""}`;
                const inner = (
                  <>
                    <span className="dot">{done ? <Icon name="check" /> : i + 1}</span>
                    <span className="lbl-full">{s.full}</span>
                    <span className="lbl-short">{s.short}</span>
                  </>
                );
                return (
                  <span key={s.id} style={{ display: "contents" }}>
                    {i ? <span className="step-sep" /> : null}
                    {canGo ? (
                      <Link className={cls} href={`/onboarding/${s.id}`} title={s.full}>
                        {inner}
                      </Link>
                    ) : (
                      <span className={cls} aria-current={cur ? "step" : undefined} title={s.full}>
                        {inner}
                      </span>
                    )}
                  </span>
                );
              })}
            </nav>
          )}
          <div className="topbar-r">
            {route === "welcome" ? (
              <span className="topbar-meta">
                <Icon name="lock" className="xs" />
                Your answers stay private
              </span>
            ) : (
              <span className="topbar-meta center-meta">
                Step {curIdx + 1} of {STAGES.length} · {STAGES[curIdx]?.full}
              </span>
            )}
            <ExitButton route={route} />
            <ThemeToggle />
          </div>
          {route === "welcome" ? null : (
            <div className="topbar-progress" aria-hidden="true">
              <i style={{ width: `${pct}%` }} />
            </div>
          )}
        </header>
        {full ? children : (
          <main className="main">
            <div className={`col ${wide ? "wide" : ""} screen-in`}>{children}</div>
          </main>
        )}
      </div>
    </div>
  );
}

/**
 * Leaving onboarding. Before the profile exists it is "Finish later": the
 * choice is saved, so the next sign-in lands on the dashboard (which offers to
 * continue) instead of pulling the user back in. Afterwards it is just a link.
 */
function ExitButton({ route }: { route: Route }) {
  const { authorized, refresh } = useOnboarding();
  const router = useRouter();
  const { toast } = useUi();
  const [busy, setBusy] = useState(false);
  if (route === "profile" || route === "review") {
    return (
      <Link className="btn btn-ghost btn-sm" href="/dashboard">
        Dashboard
      </Link>
    );
  }
  const later = async () => {
    setBusy(true);
    try {
      await authorized((t) => onboardingApi.progress(t, "DEFER"));
      void refresh();
      router.push("/dashboard");
    } catch {
      toast("We couldn’t save that. Check your connection and try again.", "err");
      setBusy(false);
    }
  };
  return (
    <button className="btn btn-ghost btn-sm" type="button" onClick={later} disabled={busy} title="Your progress is saved. Continue any time from the dashboard.">
      Finish later
    </button>
  );
}

/** Centered placeholder while the session / data loads (same frame, so nothing jumps). */
export function Loading({ route, text = "Loading…" }: { route: Route; text?: string }) {
  return (
    <Shell route={route}>
      <div className="ob-loading" aria-busy="true">
        <span className="spinner" />
        <span className="dim">{text}</span>
      </div>
    </Shell>
  );
}

/* ------------------------------------------------------------ text & code */

/** Plain text with `inline code`. Everything is rendered as text nodes (no HTML). */
export function RichText({ text }: { text: string | null | undefined }) {
  if (!text) return null;
  const parts = text.split(/`([^`]+)`/g);
  return (
    <>
      {parts.map((p, i) => (i % 2 ? <code key={i}>{p}</code> : <span key={i}>{p}</span>))}
    </>
  );
}

const LANG_LABEL: Record<string, string> = {
  javascript: "JavaScript", jsx: "JSX", typescript: "TypeScript", tsx: "TSX", css: "CSS", html: "HTML",
  console: "Console", bash: "Shell", json: "JSON", text: "Text",
};

/** Line-numbered code. highlightJs escapes every token before it is injected. */
export function CodeView({ code, file, lang }: { code: string; file?: string | null; lang?: string | null }) {
  const lines = code.replace(/\n$/, "").split("\n");
  return (
    <div className="codeblock">
      <div className="codeblock-head">
        <span>
          <Icon name="fileCode" className="xs" />
          {file || LANG_LABEL[lang || "javascript"] || "Code"}
        </span>
        {file ? <span>{LANG_LABEL[lang || "javascript"] || ""}</span> : null}
      </div>
      <pre>
        {lines.map((l, i) => (
          <span key={i} className="cl" dangerouslySetInnerHTML={{ __html: highlightJs(l) || " " }} />
        ))}
      </pre>
    </div>
  );
}

/* ------------------------------------------------------------- controls */

export function OptCards({ options, value, multi = false, cols = "", icons = false, onPick }: {
  options: Option[];
  value: string | string[] | null;
  multi?: boolean;
  cols?: string;
  icons?: boolean;
  onPick: (v: string) => void;
}) {
  return (
    <div className={`opt-grid ${cols}`} role={multi ? "group" : "radiogroup"}>
      {options.map((o) => {
        const on = multi ? ((value as string[]) || []).includes(o.v) : value === o.v;
        return (
          <button
            key={o.v}
            type="button"
            className={`opt-card ${on ? "on" : ""}`}
            role={multi ? undefined : "radio"}
            aria-checked={multi ? undefined : on}
            aria-pressed={multi ? on : undefined}
            onClick={() => onPick(o.v)}
          >
            <span className={`radio ${multi ? "sq" : ""}`} />
            <span className="txt">
              <b>{o.t}</b>
              {o.d ? <span>{o.d}</span> : null}
            </span>
            {icons && o.icon ? (
              <span className="o-ico">
                <Icon name={o.icon} />
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function QGroup({ n, title, help, answered, children, id }: {
  n: number;
  title: ReactNode;
  help?: ReactNode;
  answered: boolean;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section className={`qgroup ${answered ? "answered" : ""}`} id={id}>
      <div className="qgroup-head">
        <span className="qnum">{answered ? <Icon name="check" className="xs" /> : n}</span>
        <div>
          <h3>{title}</h3>
          {help ? <p>{help}</p> : null}
        </div>
      </div>
      <div className="qgroup-body">{children}</div>
    </section>
  );
}

export function AsideNote({ icon, title, children }: { icon: IconName; title: string; children: ReactNode }) {
  return (
    <div className="aside-note">
      <h4>
        <Icon name={icon} className="sm" />
        {title}
      </h4>
      {children}
    </div>
  );
}

/* --------------------------------------------------------- level chips */

export function StatusChip({ level }: { level: Level }) {
  return (
    <span className={`status st-${ST_CLASS[level]}`}>
      <i />
      {ST_LABEL[level]}
    </span>
  );
}

export function Scale({ level }: { level: Level }) {
  if (level === "unknown") {
    return (
      <span className="scale unknown" aria-hidden="true">
        <i /><i /><i /><i />
      </span>
    );
  }
  return (
    <span className={`scale lv${ST_RANK[level]}`} style={{ ["--c" as string]: ST_COLOR[level] }} aria-hidden="true">
      <i /><i /><i /><i />
    </span>
  );
}

export function ConfChip({ confidence, level }: { confidence: ConfidenceLevel; level: Level }) {
  if (level === "unknown") {
    return (
      <span className="conf">
        <span className="conf-bars"><i /><i /><i /></span>n/a
      </span>
    );
  }
  const c = confidence === "low" ? 1 : confidence === "medium" ? 2 : 3;
  return (
    <span className={`conf c${c}`} title="How sure we are: more consistent answers mean higher confidence">
      <span className="conf-bars"><i /><i /><i /></span>
      {CONF_LABEL[confidence]}
    </span>
  );
}
