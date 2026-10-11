import type { ReactNode } from "react";
import { Dock } from "@/components/layout/dock";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <Dock />
    </>
  );
}
