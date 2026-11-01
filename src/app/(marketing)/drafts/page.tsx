import type { Metadata } from "next";
import { DraftsList } from "@/components/drafts/drafts-list";

export const metadata: Metadata = { title: "Your drafts", robots: { index: false, follow: false } };

export default function DraftsPage() {
  return (
    <main className="mx-auto min-h-svh w-full max-w-3xl px-4 pb-28 pt-28 sm:px-5 md:pt-32">
      <DraftsList />
    </main>
  );
}
