"use client";

import { useEffect, useRef, useState } from "react";
import { GoogleMark } from "@/components/profile/sign-in-card";
import { signInWithGoogle, signInWithGoogleToken } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

type Gis = {
  accounts: {
    id: {
      initialize: (o: Record<string, unknown>) => void;
      renderButton: (el: HTMLElement, o: Record<string, unknown>) => void;
    };
  };
};

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

let loading: Promise<Gis> | null = null;
function loadGis(): Promise<Gis> {
  const w = window as unknown as { google?: Gis };
  if (w.google?.accounts?.id) return Promise.resolve(w.google);
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client";
      s.async = true;
      s.onload = () => (w.google?.accounts?.id ? resolve(w.google) : reject(new Error("Google didn't load")));
      s.onerror = () => {
        loading = null;
        s.remove();
        reject(new Error("Google didn't load"));
      };
      document.head.appendChild(s);
    });
  }
  return loading;
}

async function sha256Hex(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * "Continue with Google". With NEXT_PUBLIC_GOOGLE_CLIENT_ID set, it's Google's
 * own button: a popup over our page, which names tynitales.com and never
 * leaves it. Without it (or if Google's script can't load), the old redirect
 * through Supabase.
 */
export function GoogleButton({
  disabled,
  onBeforeRedirect,
  onError,
}: {
  disabled?: boolean;
  /** Only for the redirect fallback, which leaves the page. */
  onBeforeRedirect?: () => void;
  onError: (message: string) => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"loading" | "gis" | "redirect">(CLIENT_ID ? "loading" : "redirect");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!CLIENT_ID || disabled) return;
    let alive = true;
    (async () => {
      try {
        const google = await loadGis();
        // A fresh nonce for each button: Google signs its hash into the token, Supabase checks it.
        const nonce = crypto.randomUUID();
        const hashed = await sha256Hex(nonce);
        if (!alive || !box.current) return;
        google.accounts.id.initialize({
          client_id: CLIENT_ID,
          nonce: hashed,
          use_fedcm_for_prompt: true,
          callback: async (r: { credential?: string }) => {
            if (!r.credential) return onError("Google sign-in didn’t finish. Please try again.");
            setBusy(true);
            try {
              await signInWithGoogleToken(r.credential, nonce);
            } catch {
              onError("Couldn’t sign you in with Google. Please try again.");
            } finally {
              setBusy(false);
            }
          },
        });
        const width = Math.min(400, Math.max(240, Math.round(box.current.getBoundingClientRect().width)));
        google.accounts.id.renderButton(box.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "pill",
          text: "continue_with",
          logo_alignment: "center",
          width,
        });
        setMode("gis");
      } catch {
        if (alive) setMode("redirect");
      }
    })();
    return () => {
      alive = false;
    };
  }, [disabled, onError]);

  if (mode === "redirect" || disabled) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          onBeforeRedirect?.();
          signInWithGoogle().catch(() => onError("Couldn’t open Google sign-in. Please try again."));
        }}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-ink/12 bg-white text-[15px] font-medium transition-colors hover:border-ink/25 disabled:opacity-50"
      >
        <GoogleMark /> Continue with Google
      </button>
    );
  }

  return (
    <div className={cn("relative flex min-h-11 w-full justify-center", busy && "pointer-events-none opacity-60")}>
      {/* Google draws its button into here. */}
      <div ref={box} className="flex w-full max-w-[400px] justify-center" />
      {mode === "loading" && <div aria-hidden className="absolute inset-0 animate-pulse rounded-full bg-line/60" />}
    </div>
  );
}
