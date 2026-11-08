// Onboarding copy and option ids (the ids are validated by the backend).
// Text follows the approved prototype.
import type { IconName } from "@/lib/icons";
import type { CompetencyId, ConfidenceLevel, Level, OnboardingAnswers } from "./types";

export type Option = { v: string; t: string; d?: string; icon?: IconName };

export const ABOUT: Record<"duration" | "level" | "goal", Option[]> = {
  duration: [
    { v: "start", t: "I’m just starting" },
    { v: "lt6", t: "Less than 6 months" },
    { v: "6-12", t: "6–12 months" },
    { v: "1-2", t: "1–2 years" },
    { v: "2-4", t: "2–4 years" },
    { v: "4+", t: "More than 4 years" },
  ],
  level: [
    { v: "complete", t: "Complete beginner", d: "I haven’t written a program on my own yet" },
    { v: "beginner", t: "Beginner", d: "I can follow tutorials and write small scripts" },
    { v: "intermediate", t: "Intermediate", d: "I’ve built a few things and can find my way around" },
    { v: "advanced", t: "Advanced", d: "I build and ship software without much help" },
    { v: "unsure", t: "I’m not sure", d: "That’s fine. Figuring it out is what this is for" },
  ],
  goal: [
    { v: "job", t: "Get my first developer job", d: "Portfolio-ready projects and real skills", icon: "briefcase" },
    { v: "better", t: "Become a better developer", d: "Close gaps and build with more confidence", icon: "trending" },
    { v: "products", t: "Build my own products", d: "Ideas that turn into working software", icon: "box" },
    { v: "freelance", t: "Become a freelancer", d: "Build things for clients, end to end", icon: "user" },
    { v: "newtech", t: "Learn a new technology", d: "Go deeper in one specific stack", icon: "compass" },
    { v: "other", t: "Other", d: "Tell us in your own words", icon: "more" },
  ],
};

export type TechItem = { id: string; name: string; glyph: string; sub: string };
export const TECH: { group: string; icon: IconName; items: TechItem[] }[] = [
  {
    group: "Frontend",
    icon: "monitor",
    items: [
      { id: "html", name: "HTML", glyph: "</>", sub: "Markup" },
      { id: "css", name: "CSS", glyph: "CSS", sub: "Styling" },
      { id: "js", name: "JavaScript", glyph: "JS", sub: "Language" },
      { id: "ts", name: "TypeScript", glyph: "TS", sub: "Typed JavaScript" },
      { id: "react", name: "React", glyph: "Re", sub: "UI library" },
      { id: "next", name: "Next.js", glyph: "Nx", sub: "React framework" },
    ],
  },
  {
    group: "Tools and practices",
    icon: "wrench",
    items: [
      { id: "git", name: "Git", glyph: "Git", sub: "Version control" },
      { id: "github", name: "GitHub", glyph: "GH", sub: "Collaboration" },
      { id: "testing", name: "Testing", glyph: "Te", sub: "Jest, Vitest" },
      { id: "devtools", name: "DevTools", glyph: "Dt", sub: "Browser debugging" },
      { id: "other", name: "Other", glyph: "+", sub: "Add your own" },
    ],
  },
];

export const EXP: Record<"built" | "noTutorial" | "stuck", Option[]> = {
  built: [
    { v: "several", t: "Yes, several", d: "More than one project, started from an empty folder" },
    { v: "one", t: "Yes, one", d: "One project I built from the ground up" },
    { v: "unfinished", t: "I started, but didn’t finish", d: "Still counts. Tell us about it below" },
    { v: "no", t: "Not yet", d: "Totally fine. It tells us where to start" },
  ],
  noTutorial: [
    { v: "yes", t: "Yes", d: "I planned and built it myself" },
    { v: "adapted", t: "Partly", d: "I started from a tutorial and changed or extended it" },
    { v: "no", t: "Not yet", d: "So far I’ve followed tutorials step by step" },
  ],
  stuck: [
    { v: "independent", t: "I can build things independently", d: "Most of the time I work it out on my own" },
    { v: "docs", t: "I usually need documentation or Google", d: "I search, read and adapt what I find" },
    { v: "tutorials", t: "I often follow tutorials", d: "I look for someone who built something similar" },
    { v: "ai", t: "I rely heavily on AI assistance", d: "I ask an AI tool to explain or write the code" },
    { v: "examples", t: "I understand examples but struggle to create something myself", d: "Reading code is easier than writing it" },
  ],
};

export const LIMITS = { goalOther: 120, projectName: 80, projectDescription: 800, extra: 600, custom: 32, customCount: 10 };

export const emptyAnswers = (): OnboardingAnswers => ({
  about: { duration: null, level: null, goal: null, goalOther: null },
  tech: { selected: [], custom: [] },
  experience: { built: null, projectName: null, projectDescription: null, noTutorial: null, stuck: [], extra: null },
});

export const aboutDone = (a: OnboardingAnswers) => !!(a.about.duration && a.about.level && a.about.goal);
export const expDone = (a: OnboardingAnswers) => !!(a.experience.built && a.experience.noTutorial && a.experience.stuck.length);

/* ------------------------------------------------------------ competencies */

export const COMP: Record<CompetencyId, { name: string; icon: IconName; tech: string[] }> = {
  "html-css": { name: "HTML & CSS", icon: "layers", tech: ["html", "css"] },
  javascript: { name: "JavaScript Fundamentals", icon: "code", tech: ["js"] },
  "async-javascript": { name: "Asynchronous JavaScript", icon: "clock", tech: ["js"] },
  react: { name: "React", icon: "atom", tech: ["react", "next"] },
  typescript: { name: "TypeScript", icon: "braces", tech: ["ts"] },
  nextjs: { name: "Next.js", icon: "route", tech: ["next"] },
  "frontend-practices": { name: "Frontend Practices", icon: "wrench", tech: ["git", "github", "testing", "devtools"] },
};
export const COMP_ORDER = Object.keys(COMP) as CompetencyId[];

/** What the interview will cover, given the selected technologies (aside on the Technologies screen). */
export function coverage(sel: string[]): [string, string, boolean][] {
  const has = (...ids: string[]) => ids.some((id) => sel.includes(id));
  return [
    ["HTML & CSS", "Assessed for everyone", true],
    ["JavaScript fundamentals", "Assessed for everyone", true],
    ["Asynchronous JavaScript", "Builds on JavaScript", true],
    ["React", has("react", "next") ? "Because you selected it" : "We’ll ask first if you’ve used it", has("react", "next")],
    ["TypeScript", has("ts") ? "Because you selected it" : "We’ll ask first if you’ve used it", has("ts")],
    ["Next.js", has("next") ? "If React goes well" : "We’ll ask first if you’ve used it", has("next")],
    ["Debugging, Git and testing", "Assessed for everyone", true],
  ];
}

export const LVL_NAME: Record<string, string> = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" };
export const LVL_LETTER: Record<string, string> = { beginner: "B", intermediate: "I", advanced: "A" };

export const ST_LABEL: Record<Level, string> = {
  unknown: "Unknown",
  not_demonstrated: "Not demonstrated",
  practicing: "Practicing",
  proficient: "Proficient",
  mastered: "Mastered",
};
/** CSS class suffix used by the prototype styles. */
export const ST_CLASS: Record<Level, string> = {
  unknown: "unknown",
  not_demonstrated: "notdem",
  practicing: "practicing",
  proficient: "proficient",
  mastered: "mastered",
};
export const ST_RANK: Record<Level, number> = { unknown: 0, not_demonstrated: 1, practicing: 2, proficient: 3, mastered: 4 };
export const ST_COLOR: Record<Level, string> = {
  unknown: "var(--text-4)",
  not_demonstrated: "var(--text-3)",
  practicing: "var(--warn)",
  proficient: "var(--ok)",
  mastered: "var(--ai)",
};
export const ST_DESC: Record<Level, string> = {
  unknown: "Not enough evidence to say. Not a weakness.",
  not_demonstrated: "Not shown in this assessment. Doesn’t mean zero knowledge.",
  practicing: "Understands some concepts, still needs guidance.",
  proficient: "Applies it independently in practical situations.",
  mastered: "Strong understanding across different contexts.",
};
export const CONF_LABEL: Record<ConfidenceLevel, string> = { low: "Low", medium: "Medium", high: "High" };
export const CONF_RANK: Record<ConfidenceLevel, number> = { low: 1, medium: 2, high: 3 };

export const STATUS_TXT: Record<string, string> = {
  not_used_yet: "You told us you haven’t used it yet, so we didn’t ask.",
  prerequisite_not_met: "Skipped because it builds on fundamentals that come first.",
  skipped_by_candidate: "You skipped this area, so we didn’t guess.",
  not_reached: "The interview ended before this area.",
};

export const SKIP_REASON: Record<string, (name: string) => string> = {
  NEVER_USED: (n) => `Not assessed. You haven’t used ${n} yet, so it stays Unknown. That’s a starting point, not a weakness.`,
  PREREQUISITE: (n) => `Not assessed. ${n} builds on fundamentals that come first, so we’ll come back to it later.`,
  SKIPPED_BY_USER: (n) => `${n}: you skipped this, so we stopped here instead of guessing.`,
  NOT_REACHED: (n) => `${n}: not reached in this interview. It stays Unknown.`,
};

export const STAGE_LABEL: Record<string, string> = {
  beginner: "Beginner",
  advanced_beginner: "Advanced beginner",
  early_intermediate: "Early intermediate",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

/** "You told us → we saw" comparison (prototype `compare`). */
export function compareClaim(claim: { selected: boolean; usage: string | null }, level: Level): [string, string] {
  const strong = level === "proficient" || level === "mastered";
  const claimed = claim.selected || claim.usage === "used";
  if (level === "unknown") return claim.usage === "never" ? ["neutral", "Not used yet"] : claimed ? ["muted", "Claimed, not assessed"] : ["muted", "Not assessed"];
  if (claimed) return strong ? ["ok", "Matches"] : level === "practicing" ? ["warn", "Partly shown"] : ["muted", "Not shown yet"];
  if (strong) return ["ai", "More than claimed"];
  if (level === "practicing") return claim.usage === "tried" ? ["ok", "Matches"] : ["ai", "Shown, not claimed"];
  return ["muted", "Not shown yet"];
}

export const OUTCOME_LABEL: Record<string, string> = {
  strong: "Clear and correct",
  partial: "Partly correct",
  incorrect: "Not quite",
  uncertain: "Not sure yet",
  skipped: "Skipped",
};
export const OUTCOME_CLASS: Record<string, string> = {
  strong: "correct",
  partial: "partial",
  incorrect: "incorrect",
  uncertain: "unsure",
  skipped: "skip",
};
export const OUTCOME_ICON: Record<string, IconName> = {
  strong: "checkCircle",
  partial: "circleHalf",
  incorrect: "circle",
  uncertain: "circleDashed",
  skipped: "skip",
};
