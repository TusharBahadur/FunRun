import type { ReactNode } from "react";

/** Shared shell for the quieter pages (About, FAQ, Privacy, Terms). */
export function TextPage({
  eyebrow,
  title,
  accent,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  accent: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto max-w-3xl px-5 pb-24 pt-32 md:pt-40">
      <p className="type-label text-rose-deep">{eyebrow}</p>
      <h1 className="mt-3 text-[clamp(2.4rem,5vw,4rem)] type-display">
        {title} <span className="type-accent text-rose">{accent}</span>
      </h1>
      {intro && <div className="type-copy mt-5 max-w-2xl text-muted">{intro}</div>}
      <div className="mt-12">{children}</div>
    </main>
  );
}

/** One numbered-free section of a policy page. */
export function PolicySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-line py-8 first:border-t-0 first:pt-0">
      <h2 className="type-heading text-xl md:text-2xl">{title}</h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-ink/80 [&_a]:underline [&_a]:decoration-line [&_a]:underline-offset-4 hover:[&_a]:decoration-ink/40 [&_li]:pl-1 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}
