"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useUi } from "@/components/ui/UiProvider";
import { errorMessage } from "@/lib/auth/api";
import { onboardingApi } from "@/lib/onboarding/api";
import { useOnboarding } from "@/lib/onboarding/context";
import { COMP, STATUS_TXT, ST_DESC, ST_LABEL } from "@/lib/onboarding/options";
import type { CompetencyProfile, Level, ReviewAction } from "@/lib/onboarding/types";
import { ConfChip, Loading, RichText, Shell, StatusChip } from "./ui";
import { reachable } from "./nav";
import { useKnowledgeProfile } from "./ProfileScreen";

const ACTS: [string, Parameters<typeof Icon>[0]["name"], string][] = [
  ["agree", "thumbsUp", "I agree"],
  ["partial", "circleHalf", "Partially correct"],
  ["dontknow", "help", "I don’t know this yet"],
  ["wrong", "alertCircle", "AI misunderstood my experience"],
];

const OUTCOME_TEXT: Record<string, (level: string) => string> = {
  confirmed: (l) => `Confirmed. This stays ${l}.`,
  lowered: (l) => `Updated to ${l}. Lowering takes your word for it. Your first projects won’t skip over this.`,
  unchanged: (l) => `Noted. It stays ${l}.`,
  flagged: (l) => `Flagged for a re-check. Confidence is now Low, and the level stays ${l} until new evidence comes in.`,
  needs_evidence: (l) => `Noted. The level stays ${l} for now: a claim isn’t evidence, so your first projects will check it and it can move up from there.`,
  noted: (l) => `Note saved. The level stays ${l}. Your note will be considered when your roadmap is generated.`,
};

export function ReviewScreen() {
  const { ready, status, answers, authorized, refresh } = useOnboarding();
  const { profile: view, setProfile, loaded, error } = useKnowledgeProfile();
  const { toast } = useUi();
  const [openId, setOpenId] = useState<string | null>(null);
  const [mode, setMode] = useState<"partial" | "wrong" | null>(null);
  const [dir, setDir] = useState<"MORE" | "LOWER" | "FLAG" | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  if (!ready || !loaded) return <Loading route="review" />;
  if (!view) {
    return (
      <Shell route="review" reachable={reachable(status, answers)}>
        <div className="iv-intro">
          <h1 className="ph-title">Nothing to review yet.</h1>
          <p className="ph-lead">{error && !/no knowledge profile/i.test(error) ? error : "Your Knowledge Profile appears here once the interview is done."}</p>
          <div className="intro-acts"><Link className="btn btn-primary btn-lg" href="/onboarding/interview">Go to the interview</Link></div>
        </div>
      </Shell>
    );
  }

  const act = async (action: ReviewAction, competency?: string, text?: string) => {
    setBusy(true);
    try {
      const v = await authorized((t) => onboardingApi.review(t, { action, competency, note: text }));
      setProfile(v);
      setOpenId(null);
      setMode(null);
      setDir(null);
      setNote("");
      if (action === "CONFIRM") {
        void refresh();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (e) {
      toast(errorMessage(e), "err");
    } finally {
      setBusy(false);
    }
  };

  const openPanel = (id: string, m: "partial" | "wrong") => {
    if (openId === id && mode === m) {
      setOpenId(null);
      setMode(null);
      return;
    }
    setOpenId(id);
    setMode(m);
    setDir(null);
    setNote(view.review[id]?.note ?? "");
  };

  const items = Object.entries(view.review);
  const changed = view.profile.competencies.filter((c) => view.originalLevels[c.id] !== c.level).length;

  return (
    <Shell route="review" reachable={reachable(status, answers)}>
      <header className="ph">
        <div className="ph-main">
          <div className="eyebrow"><Icon name="pencil" className="sm" />Review</div>
          <h1 className="ph-title">Review your profile.</h1>
          <p className="ph-lead">Tell us where we got it right and where we didn’t. Your feedback counts, but it works differently in each direction.</p>
        </div>
        <div className="ph-acts"><Link className="btn" href="/onboarding/profile"><Icon name="chevLeft" />Back to profile</Link></div>
      </header>

      {view.confirmed ? (
        <div className="confirmed">
          <span className="check-burst"><Icon name="check" /></span>
          <div>
            <h2>Your Knowledge Profile is confirmed.</h2>
            <p>This is the foundation for what comes next: it will be used to generate your learning roadmap and choose your first project. It updates every time you build something.</p>
            <div className="final-acts">
              <Link className="btn btn-primary" href="/onboarding/profile">View your profile</Link>
              <Link className="btn" href="/dashboard">Go to your dashboard</Link>
            </div>
          </div>
        </div>
      ) : null}

      <div className="rv-rule">
        <div className="down"><Icon name="arrowDownRight" className="lg" /><div><b>Lowering takes your word for it</b><span>If you say you know less than this, we update it right away. You know that better than any test.</span></div></div>
        <div className="up"><Icon name="arrowUpRight" className="lg" /><div><b>Raising needs evidence</b><span>Tell us, and your first projects will check it. A level only goes up when there’s new evidence.</span></div></div>
      </div>

      <div className="rv-layout">
        <div className="rv-list">
          {view.profile.competencies.map((c) => (
            <Item key={c.id} c={c} original={view.originalLevels[c.id]} review={view.review[c.id]}
              open={openId === c.id} mode={openId === c.id ? mode : null} dir={dir} setDir={setDir} note={note} setNote={setNote} busy={busy}
              onAct={(a) => act(a, c.id)} onOpen={(m) => openPanel(c.id, m)} onSubmit={(a, text) => act(a, c.id, text)} />
          ))}
        </div>
        <aside className="rv-side">
          <div className="card">
            <div className="rv-count">
              <div className="big"><span>{items.length}</span><span> / 7</span></div>
              <p>competencies reviewed</p>
              <div className="progress thin"><i style={{ width: `${(items.length / 7) * 100}%` }} /></div>
            </div>
            <div className="rv-tally">
              <div><b>{items.filter(([, v]) => v.verdict === "AGREE").length}</b>Agreed</div>
              <div><b>{changed}</b>Level changed</div>
              <div><b>{items.filter(([, v]) => v.note).length}</b>Notes added</div>
              <div><b>{items.filter(([, v]) => v.flagged).length}</b>Flagged</div>
            </div>
          </div>
          <div className="card">
            <div className="card-head"><h3><Icon name="reset" className="sm" />Changes</h3></div>
            <div className="changelog">
              {view.reviewLog.length ? view.reviewLog.filter((l) => l.competency).map((l, i) => (
                <div className="cl-item" key={i}>
                  <b>{COMP[l.competency as keyof typeof COMP]?.name}</b>
                  <span>{LOG_TEXT[l.action] ?? l.action}{l.from && l.to && l.from !== l.to ? ` · ${ST_LABEL[l.from as Level]} → ${ST_LABEL[l.to as Level]}` : ""}</span>
                </div>
              )) : <p className="cl-empty">Nothing changed yet. Every change you make is listed here, so the review stays transparent.</p>}
            </div>
          </div>
          <button className="btn btn-primary btn-lg" type="button" disabled={busy || view.confirmed} onClick={() => act("CONFIRM")}>
            <Icon name="check" />{view.confirmed ? "Profile confirmed" : "Confirm my profile"}
          </button>
          <p className="dim" style={{ fontSize: 12, textAlign: "center", marginTop: -4 }}>You don’t need to review every item to confirm.</p>
        </aside>
      </div>
    </Shell>
  );
}

const LOG_TEXT: Record<string, string> = {
  AGREE: "Confirmed by you",
  LOWER: "You said you know less",
  DONT_KNOW: "You said you don’t know this yet",
  NOTE: "Note added, level unchanged",
  MORE: "You said you know more · to be checked in projects",
  FLAG: "Evidence flagged, confidence lowered",
};

function Item({ c, original, review, open, mode, dir, setDir, note, setNote, busy, onAct, onOpen, onSubmit }: {
  c: CompetencyProfile;
  original: Level;
  review?: { verdict: string; note: string | null; flagged: boolean; outcome: string };
  open: boolean;
  mode: "partial" | "wrong" | null;
  dir: "MORE" | "LOWER" | "FLAG" | null;
  setDir: (d: "MORE" | "LOWER" | "FLAG") => void;
  note: string;
  setNote: (s: string) => void;
  busy: boolean;
  onAct: (a: ReviewAction) => void;
  onOpen: (m: "partial" | "wrong") => void;
  onSubmit: (a: ReviewAction, note?: string) => void;
}) {
  const changed = original !== c.level || review?.flagged;
  const verdict = review?.verdict;
  const onKey = (k: string) =>
    (k === "agree" && verdict === "AGREE") || (k === "dontknow" && verdict === "DONT_KNOW") || (k === "partial" && (mode === "partial" || verdict === "NOTE"))
    || (k === "wrong" && (mode === "wrong" || ["MORE", "LOWER", "FLAG"].includes(verdict ?? "")));
  return (
    <div className={`rv-item ${verdict === "AGREE" ? "agreed" : ""} ${changed ? "changed" : ""} ${open ? "open" : ""}`}>
      <div className="rv-top">
        <div>
          <h3><Icon name={COMP[c.id].icon} className="sm" />{c.name}</h3>
          <p><RichText text={c.level === "unknown" ? STATUS_TXT[c.status] ?? "Not assessed." : c.demonstratedSkills[0] ?? c.weaknesses[0] ?? ST_DESC[c.level]} /></p>
        </div>
        <div className="rv-st">
          {original !== c.level ? <><span className="was"><StatusChip level={original} /></span><span className="arrow-chg"><Icon name="arrowRight" className="sm" /></span></> : null}
          <StatusChip level={c.level} />
          <ConfChip confidence={c.confidence} level={c.level} />
        </div>
      </div>
      <div className="rv-acts">
        {ACTS.map(([k, icon, label]) => (
          <button key={k} type="button" disabled={busy} className={`rv-btn ${onKey(k) ? `on ${k}` : ""}`}
            onClick={() => (k === "agree" ? onAct("AGREE") : k === "dontknow" ? onAct("DONT_KNOW") : onOpen(k as "partial" | "wrong"))}>
            <Icon name={icon} />{label}
          </button>
        ))}
      </div>
      <div className="rv-panel">
        <div>
          <div className="rv-panel-in" hidden={!open}>
            {open && mode === "partial" ? (
              <>
                <div><h5>What’s inaccurate or missing?</h5>
                  <textarea className="textarea" maxLength={500} value={note} onChange={(e) => setNote(e.target.value)}
                    placeholder="For example: I use useEffect with dependencies at work, it just didn’t come up." /></div>
                <div className="rv-panel-acts">
                  <span className="grow">A note adds context. It doesn’t change the level on its own.</span>
                  <button className="btn btn-sm" type="button" disabled={busy || !note.trim()} onClick={() => onSubmit("NOTE", note.trim())}>Save note</button>
                </div>
              </>
            ) : null}
            {open && mode === "wrong" ? (
              <>
                <div><h5>What did we misunderstand?</h5>
                  <div className="dir-opts">
                    {([["MORE", "I know more than this"], ["LOWER", "I know less than this"], ["FLAG", "The evidence is wrong"]] as const).map(([k, l]) => (
                      <button key={k} type="button" className={`chip ${dir === k ? "on" : ""}`} onClick={() => setDir(k)}>{l}</button>
                    ))}
                  </div>
                </div>
                <div><h5>Tell us more <span style={{ fontWeight: 400 }}>(optional)</span></h5>
                  <textarea className="textarea" maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} placeholder="What should we know?" /></div>
                <div className="rv-panel-acts">
                  <span className="grow">
                    {dir === "MORE" ? "Your first projects will check it. A level only goes up with new evidence."
                      : dir === "LOWER" ? "The level moves down one step right away."
                        : dir === "FLAG" ? "Confidence drops to Low and this gets re-checked in your first project." : "Choose one option above."}
                  </span>
                  <button className="btn btn-primary btn-sm" type="button" disabled={!dir || busy} onClick={() => dir && onSubmit(dir, note.trim() || undefined)}>
                    {dir === "MORE" ? "Tell us" : dir === "LOWER" ? "Lower this level" : dir === "FLAG" ? "Flag the evidence" : "Submit"}
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
      {review?.outcome && !open ? (
        <div className={`rv-outcome ${review.outcome === "lowered" ? "down" : review.outcome === "confirmed" ? "ok" : "same"}`}>
          <Icon name={review.outcome === "lowered" ? "arrowDownRight" : review.outcome === "confirmed" ? "checkCircle" : "info"} />
          <span>{(OUTCOME_TEXT[review.outcome] ?? OUTCOME_TEXT.unchanged)(ST_LABEL[c.level])}</span>
        </div>
      ) : null}
    </div>
  );
}
