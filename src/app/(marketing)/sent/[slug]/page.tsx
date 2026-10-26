import type { Metadata } from "next";
import { Suspense } from "react";
import { SentGift } from "@/components/gift/sent";

export const metadata: Metadata = { title: "Your gift is ready", robots: { index: false, follow: false } };

export default function SentPage({ params }: PageProps<"/sent/[slug]">) {
  return (
    <main className="mx-auto min-h-svh w-full max-w-3xl px-5 pb-28 pt-32 md:pt-40">
      <Suspense fallback={null}>
        <Sent params={params} />
      </Suspense>
    </main>
  );
}

async function Sent({ params }: Pick<PageProps<"/sent/[slug]">, "params">) {
  const { slug } = await params;
  return <SentGift slug={slug} />;
}
