"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useUi } from "@/components/ui/UiProvider";
import { useOnboarding } from "@/lib/onboarding/context";
import { EXP, LIMITS, aboutDone } from "@/lib/onboarding/options";
import { AsideNote, Loading, OptCards, QGroup, Shell } from "./ui";
import { reachable } from "./nav";

export function ExperienceScreen() {
  const { ready, answers, update, save, status } = useOnboarding();
  const router = useRouter();
  const { toast } = useUi();
  const [busy, setBusy] = useState(false);
  if (!ready) return <Loading route="experience" />;

  const e = answers.experience;
  const n = [e.built, e.noTutorial, e.stuck.length].filter(Boolean).length;
  const set = (k: "built" | "noTutorial", v: string) => update((x) => ({ ...x, experience: { ...x.experience, [k]: v } }));
  const text = (k: "projectName" | "projectDescription" | "extra", v: string) =>
    update((x) => ({ ...x, experience: { ...x.experience, [k]: v } }));
  const toggleStuck = (v: string) =>
    update((x) => ({
      ...x,
      experience: { ...x.experience, stuck: x.experience.stuck.includes(v) ? x.experience.stuck.filter((s) => s !== v) : [...x.experience.stuck, v] },
    }));
  const [pt, ph] =
    e.built === "no"
      ? ["What’s the most complex thing you’ve tried to build?", "A course project, an exercise or something unfinished all count. Optional."]
      : ["What was the most complex project you’ve worked on?", "A name and a few sentences are enough. Optional, but it helps us ask better questions."];
  const start = async () => {
    setBusy(true);
    if (await save()) router.push("/onboarding/interview");
    else toast("We couldn’t save your answers. Check your connection and try again.", "err");
    setBusy(false);
  };
  const descLen = (e.projectDescription ?? "").length;

  return (
    <Shell route="experience" reachable={reachable(status, answers)}>
      <div className="with-aside">
        <div>
          <div className="eyebrow"><Icon name="briefcase" className="sm" />Your experience</div>
          <h1 className="s-title">What have you actually built?</h1>
          <p className="s-sub">Not what you’ve watched or read: what you’ve made. Small things count.</p>
          <QGroup n={1} title="Have you ever built a project from scratch?" answered={!!e.built}>
            <OptCards options={EXP.built} value={e.built} cols="cols-2" onPick={(v) => set("built", v)} />
          </QGroup>
          <QGroup n={2} title={pt} help={ph} answered={!!(e.projectName?.trim() || e.projectDescription?.trim())}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="field">
                <label htmlFor="projName">Project name</label>
                <input id="projName" className="input" maxLength={LIMITS.projectName} placeholder="For example: Movie Finder"
                  value={e.projectName ?? ""} onChange={(ev) => text("projectName", ev.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="projDesc">What did it do, and which parts did you build yourself?</label>
                <textarea id="projDesc" className="textarea" maxLength={LIMITS.projectDescription}
                  placeholder="For example: A React app that searches a movie API and shows results in a grid. I wrote the components and the data fetching. I followed a tutorial for routing."
                  value={e.projectDescription ?? ""} onChange={(ev) => text("projectDescription", ev.target.value)} />
                <span className="field-hint">{descLen ? `${descLen} / ${LIMITS.projectDescription}` : ""}</span>
              </div>
            </div>
          </QGroup>
          <QGroup n={3} title="Have you ever built something without following a tutorial?" answered={!!e.noTutorial}>
            <OptCards options={EXP.noTutorial} value={e.noTutorial} cols="cols-3" onPick={(v) => set("noTutorial", v)} />
          </QGroup>
          <QGroup n={4} title="What usually happens when you get stuck?" help="Select all that apply. Most people pick more than one." answered={e.stuck.length > 0}>
            <OptCards options={EXP.stuck} value={e.stuck} multi cols="cols-1" onPick={toggleStuck} />
          </QGroup>
          <QGroup n={5} title={<>Anything else about how you work? <span className="dim" style={{ fontWeight: 400 }}>(optional)</span></>}
            help="Habits, tools, things you’re proud of, things you avoid." answered={false}>
            <textarea className="textarea" maxLength={LIMITS.extra} aria-label="Anything else"
              placeholder="For example: I’m comfortable with CSS but I avoid anything with async code."
              value={e.extra ?? ""} onChange={(ev) => text("extra", ev.target.value)} />
          </QGroup>
          <div className="foot">
            <Link className="btn btn-ghost" href="/onboarding/technologies"><Icon name="chevLeft" />Back</Link>
            <div className="foot-r">
              <span className="hint">{n === 3 ? (aboutDone(answers) ? "Ready when you are" : "Answer “About you” first") : `${n} of 3 required answered`}</span>
              <button className="btn btn-primary" type="button" disabled={n < 3 || !aboutDone(answers) || busy} onClick={start}>
                Start the interview<Icon name="arrowRight" className="arrow" />
              </button>
            </div>
          </div>
        </div>
        <aside>
          <AsideNote icon="target" title="Honest beats impressive">
            <p>Overstate your experience and your first projects will be too hard. Understate it and they’ll be too easy. Neither helps you grow.</p>
          </AsideNote>
          <AsideNote icon="sparkles" title="Using AI is fine">
            <p>Plenty of developers learn with AI. Knowing how much you rely on it lets us design projects where you build the understanding yourself.</p>
          </AsideNote>
        </aside>
      </div>
    </Shell>
  );
}
