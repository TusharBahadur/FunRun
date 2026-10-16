import { Check, Minus } from "lucide-react";
import Link from "next/link";
import { storyFacts } from "@/components/story/labels";
import type { Template } from "@/lib/templates";
import { cn, formatInr } from "@/lib/utils";

const levelName = { little: "Little", classic: "Classic", grand: "Grand" } as const;

/** The three templates of one occasion, side by side, so the upgrade is obvious. */
export function LevelCompare({ current, siblings }: { current: Template; siblings: Template[] }) {
  const order = ["little", "classic", "grand"] as const;
  const cols = order.map((l) => siblings.find((t) => t.level === l)).filter((t): t is Template => !!t?.story);
  if (cols.length < 2) return null;
  const facts = cols.map((t) => storyFacts(t.story!.scenes));

  const rows: { label: string; value: (i: number) => string | boolean }[] = [
    { label: "Pages", value: (i) => String(facts[i].pages) },
    { label: "Mini-games", value: (i) => String(facts[i].games) },
    { label: "Your letter", value: (i) => facts[i].letter },
    { label: "By the numbers", value: (i) => facts[i].numbers },
    { label: "Friends’ wishes", value: (i) => facts[i].wishes },
    { label: "Your voice note", value: (i) => facts[i].voice },
    { label: "Thank-you reply", value: (i) => facts[i].thankYou },
    { label: "Keepsake poster", value: (i) => facts[i].keepsake },
  ];

  return (
    <section className="mt-28">
      <p className="type-label text-muted">Three ways to say it</p>
      <h2 className="type-display mt-4 text-[clamp(2.2rem,5vw,4rem)]">
        Pick how <span className="type-accent text-rose">big</span> to go.
      </h2>
      <div className="no-scrollbar -mx-5 mt-12 overflow-x-auto px-5">
        <table className="w-full min-w-[600px] border-collapse text-left">
          <thead>
            <tr>
              <th className="w-[30%]" />
              {cols.map((t) => {
                const active = t.slug === current.slug;
                return (
                  <th key={t.slug} className={cn("rounded-t-[1.5rem] px-5 pb-6 pt-6 align-top font-normal", active && "bg-ink text-paper")}>
                    <span className={cn("type-label block text-[10px]", active ? "text-paper/60" : "text-muted")}>{levelName[t.level!]}</span>
                    <span className="type-accent mt-1 block text-2xl leading-tight">{t.name}</span>
                    <span className="type-display mt-2 block text-4xl font-semibold">{formatInr(t.pricePaise)}</span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-line">
                <td className="type-copy py-4 pr-4 text-[12px] text-muted">{row.label}</td>
                {cols.map((t, i) => {
                  const v = row.value(i);
                  const active = t.slug === current.slug;
                  return (
                    <td key={t.slug} className={cn("px-5 py-4 text-sm tabular-nums", active && "bg-ink text-paper")}>
                      {v === true ? (
                        <Check className={cn("size-4", active ? "text-blush" : "text-rose-deep")} />
                      ) : v === false ? (
                        <Minus className="size-4 opacity-25" />
                      ) : (
                        v
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr>
              <td />
              {cols.map((t) => {
                const active = t.slug === current.slug;
                return (
                  <td key={t.slug} className={cn("rounded-b-[1.5rem] px-5 pb-6 pt-4", active && "bg-ink")}>
                    {active ? (
                      <span className="type-label text-paper/60">You’re here</span>
                    ) : (
                      <Link href={`/templates/${t.slug}`} className="type-label text-ink underline-offset-4 hover:underline">
                        See {t.name} →
                      </Link>
                    )}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
