import { redirect } from "next/navigation";
import { Suspense } from "react";

const tierSlug: Record<string, string> = { candle: "candle", wish: "make-a-wish", party: "the-party" };

/** The old birthday editor moved into the studio; keep its links working. */
export default function MakePage({ searchParams }: PageProps<"/make">) {
  return (
    <Suspense fallback={null}>
      <Redirect searchParams={searchParams} />
    </Suspense>
  );
}

async function Redirect({ searchParams }: Pick<PageProps<"/make">, "searchParams">) {
  const { tier } = await searchParams;
  redirect(`/studio/${tierSlug[String(tier)] ?? "make-a-wish"}`);
  return null;
}
