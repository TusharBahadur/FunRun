"use client";

import { ArrowUpRight, Check, Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const field =
  "w-full rounded-2xl border border-line bg-cream/50 px-4 text-[15px] text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-ink/35 focus:bg-paper";

/** Leave us your email and a note; we write back. Falls back to the mail app if sending isn't set up. */
export function EnquiryForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const message = String(form.get("message") ?? "");
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, message, company: form.get("company") }),
      });
      if (res.ok) return setState("sent");
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.status === 400 && data.error) {
        setError(data.error);
        return setState("error");
      }
      // Sending isn't available right now: hand it to their email app instead.
      const subject = encodeURIComponent("TyniTales enquiry");
      const body = encodeURIComponent(`${message}\n\n— ${email}`);
      window.location.href = `mailto:${siteConfig.contact.email}?subject=${subject}&body=${body}`;
      setState("idle");
    } catch {
      setError("Couldn’t send just now. Try WhatsApp or email instead.");
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div className="flex min-h-[11.5rem] flex-col items-start justify-center gap-2 rounded-3xl border border-line bg-cream/40 p-6">
        <span className="grid size-9 place-items-center rounded-full bg-rose text-paper">
          <Check className="size-4" strokeWidth={3} />
        </span>
        <p className="font-medium text-ink">Got it, thank you.</p>
        <p className="text-sm text-muted">We’ll write back to {email}, usually within a day.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2.5">
      <label className="sr-only" htmlFor="enquiry-email">Your email</label>
      <input
        id="enquiry-email"
        type="email"
        required
        autoComplete="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={cn(field, "h-11")}
      />
      <label className="sr-only" htmlFor="enquiry-message">Your message</label>
      <textarea
        id="enquiry-message"
        name="message"
        required
        rows={3}
        maxLength={3000}
        placeholder="A question, an idea, a custom gift…"
        className={cn(field, "block resize-none py-3 leading-snug")}
      />
      {/* Honeypot for bots; hidden from people and screen readers. */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <div className="flex items-center justify-between gap-3">
        <p role="status" className={cn("text-sm", state === "error" ? "text-rose-deep" : "text-muted")}>
          {state === "error" ? error : "We reply within a day."}
        </p>
        <button type="submit" disabled={state === "sending"} className="btn btn-rose h-10 shrink-0 px-5 text-sm">
          {state === "sending" ? <Loader2 className="size-4 animate-spin" /> : <>Send <ArrowUpRight className="size-4" /></>}
        </button>
      </div>
    </form>
  );
}
