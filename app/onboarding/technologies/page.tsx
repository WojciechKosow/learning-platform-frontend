import type { Metadata } from "next";
import { TechnologiesScreen } from "@/components/onboarding/TechnologiesScreen";

export const metadata: Metadata = { title: "Your technologies" };

export default function Page() {
  return <TechnologiesScreen />;
}
