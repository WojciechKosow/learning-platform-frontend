import type { Metadata } from "next";
import { StartRedirect } from "@/components/app/StartRedirect";

export const metadata: Metadata = { title: "Loading" };

/** Where sign-in lands: decides between the first-run intro, resuming onboarding and the dashboard. */
export default function StartPage() {
  return <StartRedirect />;
}
