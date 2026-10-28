"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { RecipientUnlockCountdown } from "@/components/studio/activation-timer";

type Palette = { bg?: string; fg?: string; accent?: string };

/** Scheduled gifts: a countdown, then the gift loads the moment it opens. */
export function LockedGift({ opensAt, recipient, palette }: { opensAt: string; recipient: string; palette: Palette }) {
  const router = useRouter();
  return (
    <main className="grid min-h-svh place-items-center px-6 text-center" style={{ backgroundColor: palette.bg ?? "#fbf8f3", color: palette.fg ?? "#1b1215" }}>
      <RecipientUnlockCountdown opensAt={new Date(opensAt)} recipientName={recipient} accentColor={palette.accent} onUnlock={() => router.refresh()} />
    </main>
  );
}

/** Only for a few very old gifts from when links used to close. New gifts never expire. */
export function WrappedUp({ recipient, sender, palette }: { recipient: string; sender: string; palette: Palette }) {
  return (
    <main className="grid min-h-svh place-items-center px-6 text-center" style={{ backgroundColor: palette.bg ?? "#fbf8f3", color: palette.fg ?? "#1b1215" }}>
      <div className="max-w-sm">
        <p className="type-label opacity-60">A gift for {recipient}</p>
        <h1 className="type-display mt-3 text-4xl">
          This gift has <span className="type-accent" style={{ color: palette.accent }}>wrapped up.</span>
        </h1>
        <p className="mt-4 opacity-70">
          {sender} made this for you, and it was here for a while. The link has now closed, but the feeling doesn’t have to.
        </p>
        <Link href="/templates" className="mt-6 inline-block rounded-full px-6 py-3 text-white" style={{ backgroundColor: palette.accent ?? "#1b1215" }}>
          Make one for someone
        </Link>
      </div>
    </main>
  );
}
