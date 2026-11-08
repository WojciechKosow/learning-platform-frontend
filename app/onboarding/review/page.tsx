import type { Metadata } from "next";
import { ReviewScreen } from "@/components/onboarding/ReviewScreen";

export const metadata: Metadata = { title: "Review your profile" };

export default function Page() {
  return <ReviewScreen />;
}
