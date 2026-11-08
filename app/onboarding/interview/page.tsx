import type { Metadata } from "next";
import { InterviewScreen } from "@/components/onboarding/InterviewScreen";

export const metadata: Metadata = { title: "The interview" };

export default function Page() {
  return <InterviewScreen />;
}
