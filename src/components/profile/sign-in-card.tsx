"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signInWithGoogle, useUser } from "@/lib/supabase/browser";

/** Google sign-in. Once signed in, goes on to `next`. */
export function SignInCard({ next }: { next: string }) {
  const user = useUser();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && window.location.pathname !== next) router.replace(next);
  }, [user, next, router]);

  return (
    <div className="mx-auto w-full max-w-md rounded-[2rem] border border-line bg-paper p-10 text-center shadow-card">
      <h2 className="type-display text-4xl">
        Your gifts, <span className="type-accent text-rose">all in one place.</span>
      </h2>
      <p className="type-copy mt-4 text-muted">Sign in to see every gift you’ve made, who’s opened them, and when each link closes.</p>
      <button
        type="button"
        disabled={user === undefined}
        onClick={() => signInWithGoogle().catch(() => setError("Couldn't open Google sign-in. Please try again."))}
        className="mt-8 flex h-14 w-full items-center justify-center gap-3 rounded-full border border-line bg-cream font-medium shadow-sm transition-colors hover:bg-white disabled:opacity-40"
      >
        <GoogleMark /> Continue with Google
      </button>
      {error && <p className="mt-3 text-sm text-rose-deep">{error}</p>}
    </div>
  );
}

export function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8Z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1Z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9Z" />
    </svg>
  );
}
