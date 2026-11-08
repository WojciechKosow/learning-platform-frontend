import type { Metadata } from "next";
import { ExperienceScreen } from "@/components/onboarding/ExperienceScreen";

export const metadata: Metadata = { title: "Your experience" };

export default function Page() {
  return <ExperienceScreen />;
}
