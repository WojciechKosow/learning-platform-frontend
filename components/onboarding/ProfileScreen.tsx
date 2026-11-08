"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { errorMessage } from "@/lib/auth/api";
import { onboardingApi } from "@/lib/onboarding/api";
import { useOnboarding } from "@/lib/onboarding/context";
import {
  COMP,
  CONF_LABEL,
  LVL_LETTER,
  LVL_NAME,
  OUTCOME_CLASS,
  OUTCOME_ICON,
  OUTCOME_LABEL,
  STAGE_LABEL,
  STATUS_TXT,
  ST_DESC,
  ST_RANK,
  compareClaim,
} from "@/lib/onboarding/options";
import type { CompetencyProfile, KnowledgeProfileView, Level } from "@/lib/onboarding/types";
import { prefersReducedMotion } from "@/lib/motion";
import { ConfChip, Loading, RichText, Scale, Shell, StatusChip } from "./ui";
import { reachable } from "./nav";

const isStrong = (l: Level) => l === "proficient" || l === "mastered";

export function useKnowledgeProfile() {
  const { ready, authorized } = useOnboarding();
  const [profile, setProfile] = useState<KnowledgeProfileView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    authorized((t) => onboardingApi.profile(t))
      .then((p) => !cancelled && setProfile(p))
      .catch((e) => !cancelled && setError(errorMessage(e)))
      .finally(() => !cancelled && setLoaded(true));
    return () => {
      cancelled = true;
    };
  }, [ready, authorized]);
  return { profile, setProfile, error, loaded };
}

export function ProfileScreen() {
  const { ready, status, answers } = useOnboarding();
  const { profile: view, error, loaded } = useKnowledgeProfile();
  const [open, setOpen] = useState<Record<string, boolean>>({});

  if (!ready || !loaded) return <Loading route="profile" />;
  if (!view) {
    return (
      <Shell route="profile" reachable={reachable(status, answers)}>
        <div className="iv-intro">
          <h1 className="ph-title">No Knowledge Profile yet.</h1>
          <p className="ph-lead">{error && !/no knowledge profile/i.test(error) ? error : "Finish the interview and we’ll build it from your answers."}</p>
          <div className="intro-acts">
            <Link className="btn btn-primary btn-lg" href="/onboarding/interview">Go to the interview<Icon name="arrowRight" className="arrow" /></Link>
          </div>
        </div>
      </Shell>
    );
  }

  const P = view.profile;
  const comps = P.competencies;
  const strong = comps.filter((c) => isStrong(c.level));
  const growth = comps.filter((c) => c.level === "practicing" || c.level === "not_demonstrated");
  const unknown = comps.filter((c) => c.level === "unknown");
  const top = [...comps].filter((c) => c.level !== "unknown").sort((a, b) => ST_RANK[b.level] - ST_RANK[a.level])[0];
  const focus = P.learningPriorities[0] ? COMP[P.learningPriorities[0].competency] : growth[0] ? COMP[growth[0].id] : null;
  const date = new Date(view.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const reviewed = Object.keys(view.review).length;
  const allOpen = comps.every((c) => open[c.id]);
  const jump = (id: string) => {
    setOpen((o) => ({ ...o, [id]: true }));
    const el = document.getElementById(`cd-${id}`);
    el?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
    el?.classList.add("flash");
    window.setTimeout(() => el?.classList.remove("flash"), 1600);
  };

  return (
    <Shell route="profile" reachable={reachable(status, answers)}>
      <header className="ph">
        <div className="ph-main">
          <div className="eyebrow">
            <Icon name="layers" className="sm" />Knowledge Profile · {date}
            {view.confirmed ? <> · <span style={{ color: "var(--ok)" }}>Confirmed by you</span></> : reviewed ? ` · ${reviewed} reviewed` : ""}
          </div>
          <h1 className="ph-title">Your Knowledge Profile.</h1>
          <p className="ph-lead">Here’s what we understand about your current frontend capabilities, and exactly what each conclusion is based on.</p>
        </div>
        <div className="ph-acts">
          <button className="btn" type="button" onClick={() => window.print()}><Icon name="download" />Print / save PDF</button>
          <Link className="btn btn-primary" href="/onboarding/review"><Icon name="pencil" />Review your profile</Link>
        </div>
      </header>

      <section className="kp-top">
        <div className="kp-narr">
          <div className="lbl"><Icon name="sparkles" className="sm" />Summary</div>
          <p><RichText text={P.overallSummary} /></p>
          <span className="kp-basis">
            Based on {P.stats.questionsAnswered} interview answer{P.stats.questionsAnswered === 1 ? "" : "s"}. What you told us earlier is shown
            alongside, but never counted as evidence.
          </span>
        </div>
        <div className="kp-stats">
          <div><span>Current stage</span><b>{STAGE_LABEL[P.currentStage] ?? P.currentStage}</b></div>
          <div><span>Assessed</span><b>{7 - unknown.length} of 7 areas</b></div>
          <div><span>Strongest area</span><b>{top ? top.name : "—"}</b></div>
          <div><span>Focus next</span><b>{focus ? focus.name : "—"}</b></div>
        </div>
      </section>

      <section className="sec2">
        <div className="sec-head">
          <h2>Skill map.</h2>
          <p>Level is what you demonstrated. Confidence is how sure we are. The last column compares it with what you told us.</p>
        </div>
        <div className="legend5">
          {(["unknown", "not_demonstrated", "practicing", "proficient", "mastered"] as Level[]).map((s) => (
            <div key={s}><StatusChip level={s} /><p>{ST_DESC[s]}</p></div>
          ))}
        </div>
        <div className="smap" role="table">
          <div className="smap-row smap-h" role="row"><span>Competency</span><span>Level</span><span>Confidence</span><span>You told us → we saw</span><span /></div>
          {comps.map((c) => {
            const [k, t] = compareClaim(c.claim, c.level);
            return (
              <button className="smap-row" role="row" key={c.id} type="button" onClick={() => jump(c.id)}>
                <span className="sm-name"><Icon name={COMP[c.id].icon} className="sm" /><b>{c.name}</b></span>
                <span className="sm-lvl"><Scale level={c.level} /><StatusChip level={c.level} /></span>
                <span><ConfChip confidence={c.confidence} level={c.level} /></span>
                <span className="sm-cmp"><span className="dim">{c.claim.label}</span><Icon name="arrowRight" className="xs" /><span className={`cmp cmp-${k}`}>{t}</span></span>
                <span className="sm-go"><Icon name="chevRight" className="sm" /></span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="sec2">
        <div className="trio">
          <div>
            <h4><Icon name="checkCircle" />Ready to use</h4>
            <p>Proficient or mastered: you apply these on your own.</p>
            <ul>
              {strong.length ? strong.map((c) => <li key={c.id}><b>{c.name}</b><span><RichText text={c.demonstratedSkills[0] ?? ""} /></span></li>)
                : <li className="empty">Nothing at this level yet, and that’s normal early on.</li>}
            </ul>
          </div>
          <div>
            <h4><Icon name="circleHalf" />Still practicing</h4>
            <p>Partly in place, or not shown yet. This is where projects push.</p>
            <ul>
              {growth.length ? growth.map((c) => <li key={c.id}><b>{c.name}</b><span><RichText text={c.weaknesses[0] ?? ST_DESC[c.level]} /></span></li>)
                : <li className="empty">No area below proficient in what we assessed.</li>}
            </ul>
          </div>
          <div>
            <h4><Icon name="circleDashed" />Not assessed yet</h4>
            <p>Unknown is not a weakness. We just haven’t seen it.</p>
            <ul>
              {unknown.length ? unknown.map((c) => <li key={c.id}><b>{c.name}</b><span>{STATUS_TXT[c.status] ?? "Not enough evidence was collected."}</span></li>)
                : <li className="empty">Every area has evidence.</li>}
            </ul>
          </div>
        </div>
      </section>

      <section className="sec2">
        <div className="sec-head row">
          <div><h2>Competency details.</h2><p>What you understand, what you struggle with, the evidence behind it, and the next step for each area.</p></div>
          <button className="btn btn-sm" type="button" onClick={() => setOpen(Object.fromEntries(comps.map((c) => [c.id, !allOpen])))}>
            {allOpen ? "Collapse all" : "Expand all"}
          </button>
        </div>
        <div className="cd-list-wrap">
          {comps.map((c) => (
            <article className={`cd ${open[c.id] ? "open" : ""}`} id={`cd-${c.id}`} key={c.id}>
              <button className="cd-head" type="button" aria-expanded={!!open[c.id]} onClick={() => setOpen((o) => ({ ...o, [c.id]: !o[c.id] }))}>
                <span className="cd-ico"><Icon name={COMP[c.id].icon} /></span>
                <span className="cd-name">
                  <b>{c.name}</b>
                  <span><RichText text={c.level === "unknown" ? STATUS_TXT[c.status] ?? "Not assessed" : c.demonstratedSkills[0] ?? c.weaknesses[0] ?? ST_DESC[c.level]} /></span>
                </span>
                <span className="cd-st"><StatusChip level={c.level} /><ConfChip confidence={c.confidence} level={c.level} /></span>
                <span className="cd-chev"><Icon name="chevRight" /></span>
              </button>
              <div className="cd-body"><div><Detail c={c} review={view.review[c.id]} /></div></div>
            </article>
          ))}
        </div>
      </section>

      <section className="sec2">
        <div className="sec-head">
          <h2>What this profile feeds into.</h2>
          <p>Your learning roadmap is generated from these results in the next stage. This is the input it will receive.</p>
        </div>
        <div className="feed">
          <div className="feed-pri">
            <h5>Learning priorities, in order</h5>
            {P.learningPriorities.length ? P.learningPriorities.map((p, i) => {
              const lvl = comps.find((c) => c.id === p.competency)?.level ?? "unknown";
              return (
                <div className="pri" key={p.topic}>
                  <span className="pri-n">{String(i + 1).padStart(2, "0")}</span>
                  <div><b>{COMP[p.competency]?.name}: {p.topic.replace(`${p.competency}-`, "").replace(/-/g, " ")}</b><span><RichText text={p.reason} /></span></div>
                  <StatusChip level={lvl} />
                </div>
              );
            }) : <p className="dim">No priorities: every assessed area is proficient or above.</p>}
          </div>
          <div className="feed-proj">
            <span className="badge badge-dash">Roadmap input</span>
            <h5>Starting point</h5>
            <b className="fp-name">{(P.roadmap.recommendedStartingDifficulty || "beginner").replace(/^./, (x) => x.toUpperCase())} projects</b>
            <div className="tags">
              {P.roadmap.developmentPriorities.slice(0, 6).map((t) => <span className="tech" key={t}>{t}</span>)}
            </div>
            <p>Evidence coverage: {P.roadmap.evidenceCoverage}. {P.roadmap.unknownAreas.length ? `Not yet assessed: ${P.roadmap.unknownAreas.map((u) => COMP[u as keyof typeof COMP]?.name ?? u).join(", ")}.` : "Every area has evidence."}</p>
          </div>
        </div>
      </section>

      <section className="sec2 final2">
        <div>
          <h2>Does this look right?</h2>
          <p>Review each competency. Telling us you know less takes effect right away. Raising a level needs new evidence, because a claim on its own isn’t evidence.</p>
        </div>
        <div className="final2-acts">
          <Link className="btn btn-primary btn-lg" href="/onboarding/review"><Icon name="pencil" />Review your profile</Link>
          {view.confirmed ? <span className="badge badge-ok" style={{ height: 32, padding: "0 12px" }}><Icon name="check" />Confirmed</span> : null}
        </div>
      </section>
    </Shell>
  );
}

function Detail({ c, review }: { c: CompetencyProfile; review?: { note: string | null; flagged: boolean; verdict: string } }) {
  const [k, t] = compareClaim(c.claim, c.level);
  if (c.level === "unknown") {
    return (
      <div className="cd-unknown">
        <div><h5>Why it’s Unknown</h5><p>{STATUS_TXT[c.status] ?? "Not enough evidence was collected."} Unknown is a valid result: it means “not seen yet”, not “weak”.</p></div>
        <div><h5>What you told us</h5><p>{c.claim.label}</p></div>
        <div className="cd-next"><Icon name="route" className="sm" /><div><b>Recommended next step</b><span><RichText text={c.nextLearningDirection} /></span></div></div>
      </div>
    );
  }
  const answered = c.evidence.filter((e) => e.outcome !== "skipped").length;
  return (
    <div className="cd-grid">
      <div className="cd-col">
        <div>
          <h5><Icon name="check" className="xs" />Demonstrated</h5>
          {c.demonstratedSkills.length ? <ul className="cd-list ok">{c.demonstratedSkills.map((s) => <li key={s}><RichText text={s} /></li>)}</ul>
            : <p className="dim">Nothing demonstrated yet in this area.</p>}
        </div>
        <div>
          <h5><Icon name="circleHalf" className="xs" />Needs improvement</h5>
          {c.weaknesses.length || c.misconceptions.length ? (
            <ul className="cd-list gap">
              {c.weaknesses.map((s) => <li key={s}><RichText text={s} /></li>)}
              {c.misconceptions.map((s) => <li key={s}><RichText text={`Misconception: ${s}`} /></li>)}
            </ul>
          ) : <p className="dim">No gaps showed up in the questions asked.</p>}
        </div>
        {c.untestedSubskills.length ? (
          <div><h5><Icon name="circleDashed" className="xs" />Not assessed yet</h5><div className="tags">{c.untestedSubskills.map((s) => <span className="tag-na" key={s.id}>{s.label}</span>)}</div></div>
        ) : null}
      </div>
      <div className="cd-col">
        <div>
          <h5><Icon name="message" className="xs" />Evidence from the interview</h5>
          <div className="cd-evs">
            {c.evidence.map((e) => (
              <div className="cd-ev" key={e.seq}>
                {e.difficulty ? <span className={`lvl-pill l-${LVL_LETTER[e.difficulty]}`}>{LVL_NAME[e.difficulty]}</span> : null}
                <span className="cd-ev-q"><RichText text={e.question && e.question.length > 110 ? `${e.question.slice(0, 108).replace(/\s\S*$/, "")}…` : e.question} /></span>
                <span className={`o-chip o-${OUTCOME_CLASS[e.outcome] ?? "skip"}`}><Icon name={OUTCOME_ICON[e.outcome] ?? "circle"} className="xs" />{OUTCOME_LABEL[e.outcome] ?? e.outcome}</span>
              </div>
            ))}
            {review?.note ? <div className="cd-ev"><span className="lvl-pill l-R">Review</span><span className="cd-ev-q">Your note: “{review.note}”</span></div> : null}
          </div>
          <p className="cd-why">{c.evidenceSummary} {answered} answer{answered === 1 ? "" : "s"} · confidence {CONF_LABEL[c.confidence].toLowerCase()}{review?.flagged ? ", evidence flagged by you for a re-check" : ""}.</p>
        </div>
        <div><h5><Icon name="user" className="xs" />What you told us</h5><p className="cd-claim">{c.claim.label} <span className={`cmp cmp-${k}`}>{t}</span></p></div>
        <div className="cd-next"><Icon name="route" className="sm" /><div><b>Recommended next step</b><span><RichText text={c.nextLearningDirection} /></span></div></div>
      </div>
    </div>
  );
}
