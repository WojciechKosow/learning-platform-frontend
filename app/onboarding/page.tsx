import type { Metadata } from "next";
import { WelcomeScreen } from "@/components/onboarding/WelcomeScreen";

export const metadata: Metadata = { title: "Welcome" };

export default function Page() {
  return <WelcomeScreen />;
}
