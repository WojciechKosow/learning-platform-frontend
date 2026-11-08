import type { Metadata } from "next";
import { OnboardingProvider } from "@/lib/onboarding/context";

export const metadata: Metadata = { title: { default: "Onboarding", template: "%s | Codetta" } };

export default function OnboardingLayout({ children }: LayoutProps<"/onboarding">) {
  return <OnboardingProvider>{children}</OnboardingProvider>;
}
