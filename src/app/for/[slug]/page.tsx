import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { GiftPassword } from "@/components/gift/gift-password";
import { LockedGift, WrappedUp } from "@/components/gift/gift-states";
import { OpenBeacon } from "@/components/gift/open-beacon";
import { StoryPlayer } from "@/components/story/story-player";
import type { Story } from "@/components/story/types";
import { tokenMatches, unlockCookie } from "@/lib/gift-secrets";
import { getAdmin } from "@/lib/supabase/admin";

// Deliberately generic: link previews (WhatsApp, iMessage) shouldn't spoil the surprise.
export const metadata: Metadata = {
  title: "A gift for you",
  description: "Someone made you something. Tap to open it.",
  robots: { index: false, follow: false },
  openGraph: { title: "A gift for you 🎁", description: "Someone made you something. Tap to open it.", siteName: "TyniTales", type: "website" },
};

export default function GiftPage({ params }: PageProps<"/for/[slug]">) {
  return (
    <Suspense fallback={<main className="min-h-svh bg-cream" />}>
      <Gift params={params} />
    </Suspense>
  );
}

type Palette = { bg?: string; fg?: string; accent?: string };

/**
 * Each gift is fetched once and cached. Saving changes (allowed for 7 days
 * after it goes live) invalidates the tag so the new version shows.
 */
async function loadGift(slug: string) {
  "use cache";
  cacheLife("days");
  cacheTag(`gift:${slug}`);
  const { data, error } = await getAdmin()
    .from("gifts")
    .select("template_slug, recipient, sender, story, palette, status, unlock_at, password_hash")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error("Couldn't load this gift. Please refresh in a moment.");
  return data as {
    template_slug: string;
    recipient: string;
    sender: string;
    story: Story | null;
    palette: Palette | null;
    status: "live" | "expired";
    unlock_at: string;
    password_hash: string | null;
  } | null;
}

async function Gift({ params }: Pick<PageProps<"/for/[slug]">, "params">) {
  const { slug } = await params;
  if (!/^[a-z0-9-]{3,48}$/.test(slug)) notFound();

  const gift = await loadGift(slug);
  if (!gift) notFound();

  // Unlocking depends on the time of this visit, so check it per request.
  await connection();
  const palette = gift.palette ?? {};
  const now = requestTime();

  // Gifts never expire now; only a few very old ones were wrapped up.
  if (gift.status === "expired" || !gift.story) {
    return <WrappedUp recipient={gift.recipient} sender={gift.sender} palette={palette} />;
  }

  // Before it unlocks, only the countdown is sent: none of the gift itself.
  if (new Date(gift.unlock_at).getTime() > now) {
    return <LockedGift opensAt={gift.unlock_at} recipient={gift.recipient} palette={palette} />;
  }

  // A password-protected gift sends nothing of itself until the password is right.
  if (gift.password_hash) {
    const token = (await cookies()).get(unlockCookie(slug))?.value;
    if (!tokenMatches(token, slug, gift.password_hash)) {
      return <GiftPassword slug={slug} recipient={gift.recipient} palette={palette} />;
    }
  }

  return (
    <>
      <OpenBeacon slug={slug} />
      <StoryPlayer story={gift.story} slug={gift.template_slug} />
    </>
  );
}

/** The time this request is served (after connection(), so it's never baked into a cached page). */
function requestTime() {
  return Date.now();
}
