import type { Metadata } from "next";
import { ProfileScreen } from "@/components/onboarding/ProfileScreen";

export const metadata: Metadata = { title: "Your Knowledge Profile" };

export default function Page() {
  return <ProfileScreen />;
}
