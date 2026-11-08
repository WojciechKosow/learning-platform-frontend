import { aboutDone, expDone } from "@/lib/onboarding/options";
import type { OnboardingAnswers, OnboardingStatus } from "@/lib/onboarding/types";

/** Stages the stepper lets the user jump to. */
export function reachable(status: OnboardingStatus | null, answers: OnboardingAnswers): string[] {
  const out = ["about"];
  if (aboutDone(answers)) out.push("technologies", "experience");
  const stage = status?.stage ?? "INTAKE";
  if ((aboutDone(answers) && expDone(answers)) || stage !== "INTAKE") out.push("interview");
  if (stage === "PROFILE_READY" || stage === "CONFIRMED") out.push("profile", "review");
  return out;
}

/** Where "continue" should take the user. */
export function resumePath(status: OnboardingStatus | null, answers: OnboardingAnswers): string {
  switch (status?.stage) {
    case "INTERVIEW":
      return "/onboarding/interview";
    case "PROFILE_PENDING":
      return "/onboarding/analyzing";
    case "PROFILE_READY":
    case "CONFIRMED":
      return "/onboarding/profile";
    default:
      if (!aboutDone(answers)) return "/onboarding/about";
      if (!expDone(answers)) return "/onboarding/experience";
      return "/onboarding/interview";
  }
}
