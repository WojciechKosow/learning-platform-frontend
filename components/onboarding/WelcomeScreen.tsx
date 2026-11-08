"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { useOnboarding } from "@/lib/onboarding/context";
import { prefersReducedMotion } from "@/lib/motion";
import { Shell } from "./ui";
import { resumePath } from "./nav";

const STEPS: [string, string, string, string][] = [
  ["01", "About you", "Experience, goal and the technologies you’ve used.", "2 min"],
  ["02", "The interview", "Questions across seven frontend areas that adapt as you answer.", "8 min"],
  ["03", "Knowledge Profile", "What you can do, what to learn next, and the evidence behind it.", ""],
  ["04", "Review", "Tell us where we got it right, and where we didn’t.", "1 min"],
];

export function WelcomeScreen() {
  const { status, answers, ready } = useOnboarding();
  const started = ready && status && (status.stage !== "INTAKE" || !!status.answers);
  const href = started ? resumePath(status, answers) : "/onboarding/about";
  const label = started ? "Continue where you left off" : "Let’s get started";
  const scrollHow = () =>
    document.getElementById("how")?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });

  return (
    <Shell route="welcome">
      <section className="w-hero">
        <div className="w-pill">
          <b>New account</b>Your first 10 minutes
        </div>
        <h1 className="w-title">
          <span className="ln"><span>Welcome.</span></span>
          <span className="ln"><span>Let’s find your starting point.</span></span>
        </h1>
        <p className="w-sub">Before we start building your developer journey, we need to understand where you are right now.</p>
        <p className="w-support">
          This is not an exam. There are no wrong answers. We want to understand your experience, your skills, and how you approach
          building software.
        </p>
        <div className="w-cta">
          <Link className="btn btn-primary btn-lg" href={href} aria-disabled={!ready}>
            {label}
            <Icon name="arrowRight" className="arrow" />
          </Link>
          <button className="btn btn-lg" type="button" onClick={scrollHow}>
            How it works
          </button>
        </div>
        <div className="w-meta">
          <span><Icon name="clock" />About 10 minutes</span>
          <span><Icon name="skip" />Skip anything</span>
          <span><Icon name="check" />Saved as you go</span>
        </div>
      </section>

      <section className="sec" id="how">
        <div className="sec-head">
          <h2>Two steps, one honest picture.</h2>
          <p>We don’t teach programming in the abstract. We help you learn to build software, starting from what you can already do.</p>
        </div>
        <div className="cols-3">
          <div className="intro-col">
            <div className="intro-ico"><Icon name="target" /></div>
            <h3>Personalized assessment</h3>
            <p>A short conversation that adapts to you. Clear answers lead to harder questions; if something is new, you get a simpler one, never a trick.</p>
          </div>
          <div className="intro-col">
            <div className="intro-ico ai"><Icon name="sparkles" /></div>
            <h3>Answers in your own words</h3>
            <p>You write what you’d actually do. The interviewer reads the meaning of your answer, not keywords, and “not sure” is a fine answer.</p>
          </div>
          <div className="intro-col">
            <div className="intro-ico"><Icon name="scale" /></div>
            <h3>A profile built on evidence</h3>
            <p>Seven frontend competencies, each with what you’ve shown, what’s still open, and how sure we are. Unknown is a valid result.</p>
          </div>
        </div>
      </section>

      <section className="sec">
        <div className="steps-row">
          {STEPS.map(([n, t, d, m]) => (
            <div className="sr-item" key={n}>
              <span className="sr-n">{n}</span>
              <b>{t}</b>
              <p>{d}</p>
              {m ? <span className="sr-m">{m}</span> : null}
            </div>
          ))}
        </div>
        <div className="w-final">
          <p>
            <b>We don’t teach programming. We teach people how to build software.</b> It starts with an accurate picture of where you are.
          </p>
          <Link className="btn btn-primary btn-lg" href={href}>
            {label}
            <Icon name="arrowRight" className="arrow" />
          </Link>
        </div>
      </section>
    </Shell>
  );
}
