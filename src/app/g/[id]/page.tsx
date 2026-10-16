import type { Metadata } from "next";
import { Suspense } from "react";
import { LocalGift } from "@/components/studio/local-gift";

export const metadata: Metadata = { title: "A gift for you", robots: { index: false } };

export default function GiftPage({ params }: PageProps<"/g/[id]">) {
  return (
    <Suspense fallback={<main className="min-h-svh bg-cream" />}>
      <Gift params={params} />
    </Suspense>
  );
}

async function Gift({ params }: Pick<PageProps<"/g/[id]">, "params">) {
  const { id } = await params;
  return <LocalGift id={id} />;
}
