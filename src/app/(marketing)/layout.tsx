import type { ReactNode } from "react";
import { HelpBubble } from "@/components/help/help-bubble";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { getTemplates } from "@/lib/templates";

export default async function MarketingLayout({ children }: { children: ReactNode }) {
  const templates = (await getTemplates()).map((t) => ({ slug: t.slug, name: t.name, occasion: t.occasion, description: t.description }));
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <HelpBubble templates={templates} />
    </>
  );
}
