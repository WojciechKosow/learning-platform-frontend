"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useUi } from "@/components/ui/UiProvider";
import { useOnboarding } from "@/lib/onboarding/context";
import { ABOUT, LIMITS } from "@/lib/onboarding/options";
import { AsideNote, Loading, OptCards, QGroup, Shell } from "./ui";
import { reachable } from "./nav";

export function AboutScreen() {
  const { ready, answers, update, save, status } = useOnboarding();
  const router = useRouter();
  const { toast } = useUi();
  const [busy, setBusy] = useState(false);
  if (!ready) return <Loading route="about" />;

  const a = answers.about;
  const n = [a.duration, a.level, a.goal].filter(Boolean).length;
  const set = (k: "duration" | "level" | "goal", v: string) => update((x) => ({ ...x, about: { ...x.about, [k]: v } }));
  const next = async () => {
    setBusy(true);
    if (await save()) router.push("/onboarding/technologies");
    else toast("We couldn’t save your answers. Check your connection and try again.", "err");
    setBusy(false);
  };

  return (
    <Shell route="about" reachable={reachable(status, answers)}>
      <div className="with-aside">
        <div>
          <div className="eyebrow"><Icon name="user" className="sm" />About you</div>
          <h1 className="s-title">Tell us something about yourself</h1>
          <p className="s-sub">Three quick questions to set the starting point. Choose what fits best right now. You can change any of it later.</p>
          <QGroup n={1} title="How long have you been learning programming?" help="Count from when you first started, even with breaks." answered={!!a.duration}>
            <OptCards options={ABOUT.duration} value={a.duration} cols="cols-3" onPick={(v) => set("duration", v)} />
          </QGroup>
          <QGroup n={2} title="How would you currently describe yourself?" help="Your honest gut feeling. We won’t hold you to it." answered={!!a.level}>
            <OptCards options={ABOUT.level} value={a.level} onPick={(v) => set("level", v)} />
          </QGroup>
          <QGroup n={3} title="What is your main goal?" help="This shapes the projects we recommend later." answered={!!a.goal}>
            <OptCards options={ABOUT.goal} value={a.goal} cols="cols-2" icons onPick={(v) => set("goal", v)} />
            {a.goal === "other" ? (
              <div className="opt-inline">
                <input
                  className="input"
                  placeholder="For example: automate parts of my job with small tools"
                  aria-label="Your goal"
                  maxLength={LIMITS.goalOther}
                  value={a.goalOther ?? ""}
                  onChange={(e) => update((x) => ({ ...x, about: { ...x.about, goalOther: e.target.value } }))}
                />
              </div>
            ) : null}
          </QGroup>
          <div className="foot">
            <Link className="btn btn-ghost" href="/onboarding"><Icon name="chevLeft" />Back</Link>
            <div className="foot-r">
              <span className="hint">{n === 3 ? "All set" : `${n} of 3 answered`}</span>
              <button className="btn btn-primary" type="button" disabled={n < 3 || busy} onClick={next}>
                Continue<Icon name="arrowRight" className="arrow" />
              </button>
            </div>
          </div>
        </div>
        <aside>
          <AsideNote icon="info" title="Why we ask">
            <p>These answers decide how the interview starts: which topics come first and how deep the first questions go.</p>
          </AsideNote>
          <AsideNote icon="scale" title="Labels don’t decide your profile">
            <p>If you call yourself a beginner but explain <code>useEffect</code> clearly, your profile will say so. It works the other way too.</p>
          </AsideNote>
        </aside>
      </div>
    </Shell>
  );
}
