import type { Metadata } from "next";
import { IntroSequence } from "@/components/onboarding/IntroSequence";

export const metadata: Metadata = { title: "Welcome" };

/** The first-run intro. Sign-in only sends a brand-new account here; it can always be opened again. */
export default function Page() {
  return <IntroSequence />;
}
