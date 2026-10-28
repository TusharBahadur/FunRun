"use client";

import { motion } from "motion/react";
import { Loader2, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type Palette = { bg?: string; fg?: string; accent?: string };

/** The door in front of a password-protected gift. Nothing of the gift is on this page. */
export function GiftPassword({ slug, recipient, palette }: { slug: string; recipient: string; palette: Palette }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(0);
  const accent = palette.accent ?? "#bf2840";

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!password.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/gifts/${slug}/unlock`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(json.error ?? "Couldn't check that. Please try again.");
        setShake((n) => n + 1);
        setBusy(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Couldn't check that. Check your connection and try again.");
      setBusy(false);
    }
  }

  return (
    <main
      className="grid min-h-svh place-items-center px-6 text-center"
      style={{ backgroundColor: palette.bg ?? "#fbf8f3", color: palette.fg ?? "#1b1215" }}
    >
      <motion.form
        onSubmit={submit}
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="mx-auto grid size-16 place-items-center rounded-full text-white" style={{ backgroundColor: accent }}>
          <Lock className="size-6" />
        </span>
        <p className="type-label mt-6 opacity-60">A gift for {recipient}</p>
        <h1 className="type-display mt-2 text-4xl">
          It’s <span className="type-accent" style={{ color: accent }}>locked.</span>
        </h1>
        <p className="mt-3 opacity-70">Whoever sent this gave it a password. Type it in to open your gift.</p>

        <motion.div key={shake} animate={shake ? { x: [0, -10, 10, -6, 6, 0] } : undefined} transition={{ duration: 0.4 }}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            autoComplete="off"
            placeholder="Password"
            aria-label="Password"
            className="mt-6 block h-13 w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3.5 text-center text-lg outline-none focus:border-black/30"
          />
        </motion.div>
        {error && <p className="mt-2 text-sm" style={{ color: accent }}>{error}</p>}
        <button
          type="submit"
          disabled={!password.trim() || busy}
          className="btn btn-tint mt-4 h-12 w-full text-base"
          style={{ "--btn-bg": accent } as React.CSSProperties}
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : "Open my gift"}
        </button>
      </motion.form>
    </main>
  );
}
