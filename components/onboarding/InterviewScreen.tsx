"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useUi } from "@/components/ui/UiProvider";
import { ApiError, NetworkError, errorMessage } from "@/lib/auth/api";
import { onboardingApi } from "@/lib/onboarding/api";
import { useOnboarding } from "@/lib/onboarding/context";
import { COMP, COMP_ORDER, LVL_LETTER, LVL_NAME, SKIP_REASON, aboutDone, expDone } from "@/lib/onboarding/options";
import type { AnswerAction, CompetencyId, InterviewView, ThreadItem, UsageAnswer } from "@/lib/onboarding/types";
import { CodeView, Loading, RichText, Shell } from "./ui";
import { reachable } from "./nav";

const MAX_ANSWER = 4000;
const POLL_MS = 2500;

const USAGE: { v: UsageAnswer; t: string; d: string }[] = [
  { v: "NEVER", t: "I haven’t used it", d: "We’ll skip it. Not assessed is not a weakness" },
  { v: "TRIED", t: "I’ve followed a tutorial or two", d: "We’ll start with the basics" },
  { v: "USED", t: "I’ve used it in my own projects", d: "We’ll start at an intermediate level" },
];

type Pending = { action: AnswerAction; text?: string; usage?: UsageAnswer; turn: number };

/**
 * The adaptive interview. Each answer is sent once (the backend rejects
 * duplicates by turn number); while it is evaluated the thread shows a typing
 * indicator. If the request is cut off (timeout, network), the screen asks the
 * server where things stand instead of sending the answer again.
 */
export function InterviewScreen() {
  const { ready, status, answers, authorized, refresh } = useOnboarding();
  const router = useRouter();
  const { openModal } = useUi();
  const [view, setView] = useState<InterviewView | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [pending, setPending] = useState<Pending | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [starting, setStarting] = useState(false);
  const stageRef = useRef<HTMLElement>(null);
  const polling = useRef(false);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    try {
      const v = await authorized((t) => onboardingApi.current(t));
      if (!alive.current) return;
      const live = v && v.status !== "ABANDONED" ? v : null;
      setView(live);
      setError(live && !live.processing ? live.lastError : null);
      if (live?.current?.savedAnswer && !live.processing) setDraft(live.current.savedAnswer);
    } catch (e) {
      if (alive.current) setError(errorMessage(e));
    } finally {
      if (alive.current) setLoaded(true);
    }
  }, [authorized]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loads server state once the session is known
    if (ready) void load();
  }, [ready, load]);

  /** Ask the server until the turn has been evaluated (after a timeout, a busy 409 or a refresh mid-evaluation). */
  const waitForTurn = useCallback(
    async (id: string, turn: number) => {
      if (polling.current) return;
      polling.current = true;
      try {
        while (alive.current) {
          await new Promise((r) => window.setTimeout(r, POLL_MS));
          if (!alive.current) return;
          let v: InterviewView;
          try {
            v = await authorized((t) => onboardingApi.get(t, id));
          } catch {
            continue;
          }
          const moved = v.status !== "IN_PROGRESS" || (v.current != null && v.current.turn !== turn);
          if (moved || !v.processing) {
            if (!alive.current) return;
            setView(v);
            setPending(null);
            if (!moved && v.lastError) {
              setError(v.lastError);
              if (v.current?.savedAnswer) setDraft(v.current.savedAnswer);
            }
            return;
          }
        }
      } finally {
        polling.current = false;
      }
    },
    [authorized],
  );

  // A refresh while an answer is being evaluated: wait for the result.
  useEffect(() => {
    if (view?.processing && view.current) void waitForTurn(view.id, view.current.turn);
  }, [view, waitForTurn]);

  const send = async (p: Omit<Pending, "turn">) => {
    if (!view?.current || pending || view.processing) return;
    const turn = view.current.turn;
    setPending({ ...p, turn });
    setError(null);
    try {
      const v = await authorized((t) =>
        onboardingApi.answer(t, view.id, { turn, action: p.action, answer: p.text, usage: p.usage }),
      );
      if (!alive.current) return;
      setView(v);
      setPending(null);
      setDraft("");
      if (v.status !== "IN_PROGRESS") void refresh();
    } catch (e) {
      if (!alive.current) return;
      if (e instanceof NetworkError || (e instanceof ApiError && e.status === 409 && /being evaluated/i.test(e.message))) {
        // Cut off, or a request from another tab is still running: wait for the outcome.
        void waitForTurn(view.id, turn);
        return;
      }
      setPending(null);
      if (p.text) setDraft(p.text);
      setError(errorMessage(e));
      if (e instanceof ApiError && e.status === 409) void load();
    }
  };

  const start = async (restart = false) => {
    setStarting(true);
    setError(null);
    try {
      const v = await authorized((t) => onboardingApi.start(t, restart));
      setView(v);
      setDraft("");
      void refresh();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setStarting(false);
    }
  };

  const restart = () =>
    openModal({
      title: "Restart the interview?",
      body: <p>Your interview answers will be cleared. Everything from the earlier steps stays.</p>,
      actions: [
        { label: "Cancel" },
        { label: "Restart interview", className: "btn-primary", onClick: () => void start(true) },
      ],
    });

  // Keep the active question (or the typing indicator) in view.
  const anchorKey = `${view?.current?.turn ?? "end"}-${pending || view?.processing ? "p" : "a"}-${view?.status}`;
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const target = stage.querySelector(".qcard.is-active, .iv-end, #ivTyping") as HTMLElement | null;
    if (!target) return;
    const prev = target.previousElementSibling?.classList.contains("msg-ai") ? (target.previousElementSibling as HTMLElement) : target;
    if (stage.scrollHeight > stage.clientHeight + 4) stage.scrollTo({ top: Math.max(0, prev.offsetTop - 90), behavior: "smooth" });
    else window.scrollTo({ top: Math.max(0, prev.getBoundingClientRect().top + window.scrollY - 130), behavior: "smooth" });
  }, [anchorKey]);

  if (!ready || !loaded) return <Loading route="interview" />;
  const reach = reachable(status, answers);

  /* ------------------------------------------------------------ intro */
  if (!view) {
    if (!(aboutDone(answers) && expDone(answers))) {
      return (
        <Shell route="interview" reachable={reach}>
          <div className="iv-intro">
            <div className="eyebrow ai"><Icon name="sparkles" className="sm" />The interview</div>
            <h1 className="ph-title">A few answers first.</h1>
            <p className="ph-lead">The interview starts from what you told us about yourself. Please finish the first three steps.</p>
            <div className="intro-acts">
              <Link className="btn btn-primary btn-lg" href="/onboarding/about">Go to “About you”<Icon name="arrowRight" className="arrow" /></Link>
            </div>
          </div>
        </Shell>
      );
    }
    const sel = answers.tech.selected;
    const gated = (c: CompetencyId) => ["react", "typescript", "nextjs"].includes(c) && !COMP[c].tech.some((t) => sel.includes(t));
    return (
      <Shell route="interview" reachable={reach}>
        <section className="iv-intro">
          <div className="eyebrow ai"><Icon name="sparkles" className="sm" />The interview</div>
          <h1 className="ph-title">A conversation about how you build.</h1>
          <p className="ph-lead">
            Thanks! Now we’d like to understand how you actually work with code. It’s a diagnostic, not an exam: the questions adapt to
            your answers, and we stop as soon as we know enough.
          </p>
          <div className="intro-cols">
            <div><Icon name="route" /><b>Questions adapt</b><span>A clear answer leads to a harder question. A shaky one leads to a simpler question or a follow-up.</span></div>
            <div><Icon name="help" /><b>“Not sure” is a real answer</b><span>It tells us where to start. Guessing only makes your projects a worse fit.</span></div>
            <div><Icon name="circleDashed" /><b>Unknown isn’t a weakness</b><span>If you haven’t used something, we skip it. It shows as Unknown, not as a low score.</span></div>
          </div>
          <div className="intro-plan">
            <div className="intro-plan-head"><b>What we’ll cover</b><span>Up to 18 questions · about 10 minutes</span></div>
            {COMP_ORDER.map((c) => (
              <div className="ip-row" key={c}>
                <Icon name={COMP[c].icon} className="sm" />
                <span className="nm">{COMP[c].name}</span>
                <span className={`ip-st ${gated(c) ? "gate" : ""}`}>
                  {gated(c) ? "We’ll ask first if you’ve used it" : c === "nextjs" ? "If React goes well" : c === "async-javascript" ? "Builds on JavaScript" : "Assessed for everyone"}
                </span>
              </div>
            ))}
          </div>
          <div className="intro-note">
            <Icon name="info" className="sm" />
            <span>
              <b>Answer in your own words.</b> A sentence or two is plenty. The interviewer judges what you mean, not keywords or length, and
              your answers are only used to build your profile.
            </span>
          </div>
          {error ? <p className="ob-error" role="alert">{error}</p> : null}
          <div className="intro-acts">
            <button className="btn btn-primary btn-lg" type="button" onClick={() => start(false)} disabled={starting}>
              {starting ? "Starting…" : "Start the interview"}<Icon name="arrowRight" className="arrow" />
            </button>
            <Link className="btn btn-ghost" href="/onboarding/experience"><Icon name="chevLeft" />Back</Link>
          </div>
        </section>
      </Shell>
    );
  }

  /* ----------------------------------------------------------- thread */
  const cur = view.current;
  const shown: Pending | null =
    pending ?? (view.processing && cur ? { action: "ANSWER", text: cur.savedAnswer ?? undefined, turn: cur.turn } : null);
  const busy = !!shown;
  const curComp = cur?.competency ?? null;
  const doneN = view.competencies.filter((c) => c.status === "finished" || c.status === "skipped").length;
  const answered = view.thread.filter((t) => t.type === "answer" && t.answerKind !== "SKIP" && t.answerKind !== "USAGE").length;
  const nextIdx = view.competencies.findIndex((c) => c.status === "pending");

  const items: React.ReactNode[] = [];
  view.thread.forEach((t, i) => {
    const isActive = !!cur && t.seq === cur.turn && (t.type === "question" || t.type === "usage_check") && view.status === "IN_PROGRESS";
    items.push(
      <ThreadEntry
        key={`${t.type}-${t.seq}-${i}`}
        item={t}
        active={isActive && !busy}
        view={view}
        draft={draft}
        setDraft={setDraft}
        onSend={send}
        error={isActive ? error : null}
        answered={answered}
        onContinue={() => router.push(view.status === "PROFILE_READY" ? "/onboarding/profile" : "/onboarding/analyzing")}
      />,
    );
  });
  if (busy) {
    if (shown?.action === "ANSWER" && shown.text) {
      items.push(<div key="pending-answer" className="msg msg-user"><RichText text={shown.text} /></div>);
    }
    items.push(
      <div className="msg msg-ai" id="ivTyping" key="typing">
        <div className="msg-ai-head"><span className="ai-orb"><Icon name="sparkles" /></span>Interviewer</div>
        <div className="typing" aria-label="Evaluating your answer"><i /><i /><i /></div>
        {shown?.action === "ANSWER" ? <span className="dim ob-small">Reading your answer…</span> : null}
      </div>,
    );
  }

  return (
    <Shell route="interview" reachable={reach} full>
      <div className="iv2">
        <aside className="iv-rail">
          <div className="rail-head"><span className="rail-title">Assessment map</span><span className="num dim">{doneN}/7</span></div>
          <div className="progress thin"><i style={{ width: `${(doneN / 7) * 100}%` }} /></div>
          <div className="rail-list">
            {view.competencies.map((c, i) => {
              const isCur = c.id === curComp && view.status === "IN_PROGRESS";
              const st = c.status === "finished" ? "done" : c.status === "skipped" ? "skipped" : "";
              const sub =
                c.status === "finished" ? `Assessed · ${c.questions} question${c.questions === 1 ? "" : "s"}`
                  : c.status === "skipped" ? (c.skipReason === "NEVER_USED" ? "Not used yet · Unknown" : c.skipReason === "SKIPPED_BY_USER" ? "Skipped" : "Later · Unknown")
                    : isCur ? (cur?.kind === "usage_check" ? "Quick check" : `Now · ${LVL_NAME[cur?.difficulty ?? ""] ?? ""}`)
                      : i === nextIdx ? "Up next" : c.usageCheck ? "Asks first" : "";
              return (
                <div className={`rail-row ${st} ${isCur ? "cur" : ""}`} key={c.id}>
                  <span className="rr-ico"><Icon name={st === "done" ? "checkCircle" : st === "skipped" ? "circleDashed" : isCur ? "circleDot" : "circle"} className="sm" /></span>
                  <div className="rr-txt"><b>{COMP[c.id].name}</b><span>{sub}</span></div>
                  <span className="rr-path">{c.path.map((p, j) => <i className="pd o-asked" key={j}>{p}</i>)}</span>
                </div>
              );
            })}
          </div>
          <div className="rail-legend">
            <span><i className="pd o-asked">B</i>Beginner</span>
            <span><i className="pd o-asked">I</i>Intermediate</span>
            <span><i className="pd o-asked">A</i>Advanced</span>
          </div>
          <div className="rail-note">
            <b>How answers are read</b>
            <span>You answer freely. The interviewer judges meaning and correctness, never keywords, and adapts the next question to what you showed.</span>
          </div>
          <div className="rail-foot">
            <Link className="btn btn-ghost btn-sm" href="/onboarding/experience"><Icon name="chevLeft" className="sm" />Back</Link>
            {view.status === "IN_PROGRESS" ? (
              <button className="btn btn-ghost btn-sm" type="button" onClick={restart} disabled={busy}><Icon name="reset" className="sm" />Restart</button>
            ) : null}
          </div>
        </aside>
        <section className="iv-stage" ref={stageRef}>
          <div className="iv-bar">
            <div className="ivb-l">
              {view.status !== "IN_PROGRESS" ? (
                <><Icon name="checkCircle" className="sm" /><b>Interview complete</b></>
              ) : curComp ? (
                <><Icon name={COMP[curComp].icon} className="sm" /><b>{COMP[curComp].name}</b><span className="dim">· area {COMP_ORDER.indexOf(curComp) + 1} of 7</span></>
              ) : (
                <b>Interview</b>
              )}
            </div>
            <div className="ivb-r"><span className="dim num">{answered} answered</span></div>
          </div>
          <div className="iv-thread" aria-live="polite">
            <div className="iv-col">{items}</div>
          </div>
        </section>
      </div>
    </Shell>
  );
}

/* ====================================================================== */

function ThreadEntry({ item: t, active, view, draft, setDraft, onSend, error, answered, onContinue }: {
  item: ThreadItem;
  active: boolean;
  view: InterviewView;
  draft: string;
  setDraft: (s: string) => void;
  onSend: (p: { action: AnswerAction; text?: string; usage?: UsageAnswer }) => void;
  error: string | null;
  answered: number;
  onContinue: () => void;
}) {
  const comp = t.competency ? COMP[t.competency] : null;
  switch (t.type) {
    case "lead":
      return (
        <div className="msg msg-ai">
          <div className="msg-ai-head"><span className="ai-orb"><Icon name="sparkles" /></span>Interviewer</div>
          <div className="msg-body"><p><RichText text={t.text} /></p></div>
        </div>
      );
    case "question": {
      const meta = (
        <div className="q-meta">
          <span className="q-comp">{comp ? <Icon name={comp.icon} className="sm" /> : null}{comp?.name}</span>
          {t.difficulty ? <span className={`lvl-pill l-${LVL_LETTER[t.difficulty]}`}>{LVL_NAME[t.difficulty]}</span> : null}
          {t.questionType ? <span className="q-type">{t.questionType}</span> : null}
        </div>
      );
      if (!active) {
        return (
          <article className="qcard is-past">
            {meta}
            <p className="qcard-q sm"><RichText text={t.text} /></p>
            {t.code ? (
              <details className="code-peek">
                <summary><Icon name="code" className="xs" />Show code</summary>
                <CodeView code={t.code} file={t.codeFile} lang={t.codeLanguage} />
              </details>
            ) : null}
          </article>
        );
      }
      return <ActiveQuestion meta={meta} item={t} draft={draft} setDraft={setDraft} onSend={onSend} error={error} />;
    }
    case "usage_check":
      return (
        <article className={`qcard ${active ? "is-active" : "is-past"}`}>
          <div className="q-meta">
            <span className="q-comp">{comp ? <Icon name={comp.icon} className="sm" /> : null}{comp?.name}</span>
            <span className="q-type">Quick check</span>
          </div>
          <h2 className={`qcard-q ${active ? "" : "sm"}`}>You didn’t select {comp?.name} earlier. Have you worked with it?</h2>
          {active ? (
            <>
              <p className="qcard-sub">We only ask about technologies you’ve actually used. Either answer is fine.</p>
              <div className="ans-list" style={{ marginTop: 16 }}>
                {USAGE.map((u, i) => (
                  <button key={u.v} type="button" className="ans" onClick={() => onSend({ action: "USAGE", usage: u.v })}>
                    <span className="ans-k">{String.fromCharCode(65 + i)}</span>
                    <span className="ans-t"><b>{u.t}</b><small>{u.d}</small></span>
                  </button>
                ))}
              </div>
              {error ? <p className="ob-error" role="alert">{error}</p> : null}
            </>
          ) : null}
        </article>
      );
    case "answer":
      if (t.answerKind === "SKIP") return <div className="msg msg-user skip"><Icon name="skip" className="sm" />Skipped</div>;
      return <div className="msg msg-user"><RichText text={t.text} /></div>;
    case "system": {
      const [kind, reason] = (t.reason ?? "").split(":");
      const name = comp?.name ?? "";
      const done = kind === "competency_done";
      return (
        <div className={`sysline ${done ? "done" : "skip"}`}>
          <Icon name={done ? "checkCircle" : "circleDashed"} className="sm" />
          <span>{done ? `${name}: enough evidence collected.` : (SKIP_REASON[reason] ?? SKIP_REASON.NOT_REACHED)(name)}</span>
        </div>
      );
    }
    case "end": {
      const assessed = view.competencies.filter((c) => c.status === "finished").length;
      return (
        <>
          {t.text ? (
            <div className="msg msg-ai">
              <div className="msg-ai-head"><span className="ai-orb"><Icon name="sparkles" /></span>Interviewer</div>
              <div className="msg-body"><p><RichText text={t.text} /></p></div>
            </div>
          ) : null}
          <div className="iv-end">
            <div className="iv-end-head">
              <span className="check-burst sm"><Icon name="check" /></span>
              <div><h2>Interview complete</h2><p>Thanks. That gave us a clear picture of how you work.</p></div>
            </div>
            <div className="iv-end-stats">
              <div><b>{answered}</b><span>questions answered</span></div>
              <div><b>{assessed} of 7</b><span>areas assessed</span></div>
              <div><b>{7 - assessed}</b><span>not assessed, and that’s fine</span></div>
            </div>
            <div className="iv-end-acts">
              <button className="btn btn-primary" type="button" onClick={onContinue}>
                {view.status === "PROFILE_READY" ? "View your Knowledge Profile" : "Build my Knowledge Profile"}
                <Icon name="arrowRight" className="arrow" />
              </button>
              <span className="dim">Next: your Knowledge Profile, built from these answers</span>
            </div>
          </div>
        </>
      );
    }
    default:
      return null;
  }
}

function ActiveQuestion({ meta, item, draft, setDraft, onSend, error }: {
  meta: React.ReactNode;
  item: ThreadItem;
  draft: string;
  setDraft: (s: string) => void;
  onSend: (p: { action: AnswerAction; text?: string }) => void;
  error: string | null;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, [item.seq]);
  const text = draft.trim();
  const tooLong = draft.length > MAX_ANSWER;
  const submit = () => {
    if (text && !tooLong) onSend({ action: "ANSWER", text });
  };
  return (
    <article className="qcard is-active">
      {meta}
      <h2 className="qcard-q"><RichText text={item.text} /></h2>
      {item.code ? <CodeView code={item.code} file={item.codeFile} lang={item.codeLanguage} /> : null}
      <div className="ans-head">
        <span>Answer in your own words</span>
        <span className="proto-tag"><Icon name="info" className="xs" />A sentence or two is plenty</span>
      </div>
      <div className="own">
        <textarea
          ref={ref}
          className="textarea"
          placeholder="What would you do, and why?"
          aria-label="Your answer"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              submit();
            }
          }}
        />
      </div>
      {error ? <p className="ob-error" role="alert">{error}</p> : null}
      <div className="qcard-foot">
        <button className="btn btn-ghost btn-sm" type="button" onClick={() => onSend({ action: "UNSURE" })}>
          <Icon name="help" className="sm" />I’m not sure
        </button>
        <button className="btn btn-ghost btn-sm" type="button" onClick={() => onSend({ action: "SKIP" })}>
          <Icon name="skip" className="sm" />Skip this question
        </button>
        <span className={`ob-count ${tooLong ? "over" : ""}`}>{draft.length > MAX_ANSWER - 600 ? `${draft.length} / ${MAX_ANSWER}` : ""}</span>
        <button className="btn btn-primary btn-sm" type="button" style={{ marginLeft: "auto" }} disabled={!text || tooLong} onClick={submit}
          title="Ctrl + Enter">
          <Icon name="send" className="sm" />Submit answer
        </button>
      </div>
    </article>
  );
}
