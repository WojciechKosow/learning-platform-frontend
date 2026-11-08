import type { Metadata } from "next";
import { AboutScreen } from "@/components/onboarding/AboutScreen";

export const metadata: Metadata = { title: "About you" };

export default function Page() {
  return <AboutScreen />;
}
