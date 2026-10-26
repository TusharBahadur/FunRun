import type { Metadata } from "next";
import { ProfilePage } from "@/components/profile/profile";

export const metadata: Metadata = { title: "Your profile", robots: { index: false, follow: false } };

export default function Profile() {
  return (
    <main className="mx-auto min-h-svh w-full max-w-5xl px-4 pb-28 pt-28 sm:px-5 md:pt-32">
      <ProfilePage />
    </main>
  );
}
