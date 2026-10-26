"use client";

import { motion } from "motion/react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ShareLink } from "@/components/studio/checkout";
import { ButtonLink } from "@/components/ui/button";
import { EASE_OUT } from "@/lib/motion";
import { getSupabase, useUser } from "@/lib/supabase/browser";

type Sent = { slug: string; name: string; recipient: string; unlock_at: string; expires_at: string; created_at: string };

/** Where a sender lands right after making a gift live: the link, ready to share. */
export function SentGift({ slug }: { slug: string }) {
  const user = useUser();
  const [gift, setGift] = useState<Sent | null | undefined>(undefined);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    getSupabase()
      .from("gifts")
      .select("slug, name, recipient, unlock_at, expires_at, created_at")
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data }) => alive && setGift((data as Sent | null) ?? null));
    return () => {
      alive = false;
    };
  }, [user, slug]);

  if (user === undefined || (user && gift === undefined)) return <Loader2 className="mx-auto mt-24 size-6 animate-spin text-muted" />;

  if (!user || !gift) {
    return (
      <div className="text-center">
        <h1 className="type-display text-4xl">We couldn’t find that gift.</h1>
        <p className="mt-3 text-muted">It may belong to a different account.</p>
        <ButtonLink href="/profile" className="mt-8">
          Go to your profile
        </ButtonLink>
      </div>
    );
  }

  const scheduled = new Date(gift.unlock_at).getTime() > new Date(gift.created_at).getTime() + 60_000;

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE_OUT }}>
      <h1 className="text-center text-[clamp(2.6rem,6vw,4.5rem)] type-display">
        It’s on its way to <span className="type-accent text-rose">{gift.recipient}.</span>
      </h1>
      <p className="type-copy mx-auto mt-4 max-w-md text-center text-muted">
        {scheduled ? "Send the link now. It stays locked until the time you picked." : "Send them the link. That’s it."}
      </p>

      <div className="mx-auto mt-10 max-w-lg rounded-[1.75rem] border border-line bg-paper py-2 shadow-card">
        <ShareLink slug={gift.slug} unlockAt={scheduled ? gift.unlock_at : undefined} expiresAt={gift.expires_at} recipient={gift.recipient} />
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <ButtonLink href="/templates" variant="rose">
          Make another gift
        </ButtonLink>
        <Link href="/profile" className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline">
          See all your gifts
        </Link>
      </div>
    </motion.div>
  );
}
