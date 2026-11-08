import type { Metadata } from "next";
import { AnalyzingScreen } from "@/components/onboarding/AnalyzingScreen";

export const metadata: Metadata = { title: "Building your profile" };

export default function Page() {
  return <AnalyzingScreen />;
}
