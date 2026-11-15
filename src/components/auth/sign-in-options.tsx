"use client";

import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { GoogleButton } from "./google-button";
import { inAppBrowser } from "@/lib/in-app-browser";
import { sendEmailCode, verifyEmailCode } from "@/lib/supabase/browser";
import { cn } from "@/lib/utils";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Every way to sign in: Google, and a code sent by email. Inside Instagram and
 * other in-app browsers Google refuses to sign anyone in, so there it's email only.
 * Signing in here keeps them on the same page; whatever reads `useUser` updates.
 */
export function SignInOptions({
  disabled,
  onBeforeGoogle,
  className,
}: {
  disabled?: boolean;
  /** Google leaves the page and comes back: a chance to remember anything first. */
  onBeforeGoogle?: () => void;
  className?: string;
}) {
  const [app, setApp] = useState<string | null>(null);
  useEffect(() => {
    const id = setTimeout(() => setApp(inAppBrowser()), 0);
    return () => clearTimeout(id);
  }, []);

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wait, setWait] = useState(0);
  const codeRef = useRef<HTMLInputElement>(null);

  // A short wait before "Send again", so nobody floods their own inbox.
  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  async function send(e?: FormEvent) {
    e?.preventDefault();
    const address = email.trim().toLowerCase();
    if (!EMAIL.test(address)) return setError("That email doesn’t look right.");
    setBusy(true);
    setError(null);
    try {
      await sendEmailCode(address);
      setEmail(address);
      setStep("code");
      setCode("");
      setWait(30);
      setTimeout(() => codeRef.current?.focus(), 50);
    } catch (err) {
      setError(/rate|security purposes/i.test(String((err as Error)?.message)) ? "Too many tries. Please wait a minute and try again." : "Couldn’t send the code. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function verify(e?: FormEvent) {
    e?.preventDefault();
    const digits = code.replace(/\D/g, "");
    if (digits.length < 6) return setError("Enter the code from the email.");
    setBusy(true);
    setError(null);
    try {
      await verifyEmailCode(email, digits);
    } catch {
      setError("That code didn’t work. Check the latest email, or send a new one.");
      setBusy(false);
    }
  }

  const field =
    "block h-12 w-full rounded-full border border-ink/12 bg-white/70 px-5 text-[15px] outline-none transition-colors placeholder:text-ink/35 focus:border-ink/40 focus:bg-white disabled:opacity-50";

  return (
    <div className={cn("text-left", className)}>
      {step === "email" ? (
        <>
          {!app && (
            <>
              <GoogleButton disabled={disabled} onBeforeRedirect={onBeforeGoogle} onError={setError} />
              <p className="my-5 flex items-center gap-3 text-xs text-ink/40 before:h-px before:flex-1 before:bg-ink/10 after:h-px after:flex-1 after:bg-ink/10">or</p>
            </>
          )}
          <form onSubmit={send} className="space-y-2">
            <label className="sr-only" htmlFor="signin-email">
              Email
            </label>
            <input
              id="signin-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@email.com"
              value={email}
              disabled={disabled || busy}
              onChange={(e) => setEmail(e.target.value)}
              className={field}
            />
            <button type="submit" disabled={disabled || busy} className="btn btn-ink flex h-12 w-full items-center justify-center gap-2 text-[15px] disabled:opacity-50">
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />} Continue with email
            </button>
          </form>
        </>
      ) : (
        <form onSubmit={verify} className="space-y-2">
          <p className="text-sm">
            We sent a code to <b>{email}</b>. It can take a minute; check spam too.
          </p>
          <label className="sr-only" htmlFor="signin-code">
            Code
          </label>
          <input
            ref={codeRef}
            id="signin-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="6-digit code"
            maxLength={10}
            value={code}
            disabled={busy}
            onChange={(e) => {
              const next = e.target.value.replace(/\D/g, "");
              setCode(next);
            }}
            className={cn(field, "text-center text-2xl tracking-[0.4em]")}
          />
          <button type="submit" disabled={busy} className="btn btn-ink flex h-12 w-full items-center justify-center gap-2 text-[15px] disabled:opacity-50">
            {busy && <Loader2 className="size-4 animate-spin" />} Sign in
          </button>
          <div className="flex items-center justify-between pt-1 text-sm">
            <button type="button" onClick={() => setStep("email")} className="flex items-center gap-1 text-muted hover:text-ink">
              <ArrowLeft className="size-3.5" /> Different email
            </button>
            <button type="button" disabled={wait > 0 || busy} onClick={() => void send()} className="text-muted hover:text-ink disabled:opacity-50">
              {wait > 0 ? `Send again in ${wait}s` : "Send again"}
            </button>
          </div>
        </form>
      )}
      {error && <p className="mt-3 text-center text-sm text-rose-deep">{error}</p>}
    </div>
  );
}
