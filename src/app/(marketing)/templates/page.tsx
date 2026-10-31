import type { Metadata } from "next";
import { TemplatesListing } from "@/components/templates/templates-listing";

export const metadata: Metadata = {
  title: "Digital Gift Templates for Every Occasion",
  description:
    "Personalised digital gift templates for birthdays, anniversaries, love letters, apologies and more. Add your photos and words, then send a private link.",
  alternates: { canonical: "/templates" },
};

export default function TemplatesPage() {
  return <TemplatesListing />;
}
