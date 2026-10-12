import { Check, Minus } from "lucide-react";
import Link from "next/link";
import {
  birthdayTierOrder,
  birthdayTiers,
  type BirthdayFeatures,
  type BirthdayTierId,
} from "@/components/experiences/birthday/tiers";
import { cn, formatInr } from "@/lib/utils";

const tierSlug: Record<BirthdayTierId, string> = {
  candle: "candle",
  wish: "make-a-wish",
  party: "the-party",
};

const rows: { label: string; key?: keyof BirthdayFeatures; values?: Record<BirthdayTierId, string> }[] = [
  { label: "Cake with their age in candles, confetti" , values: { candle: "✓", wish: "✓", party: "✓" } },
  { label: "Unwrap a gift first", key: "unwrap" },
  { label: "Blow into the mic", key: "micBlow" },
  { label: "Your message", values: { candle: "Short note", wish: "Full letter", party: "Full letter" } },
  { label: "Photos", values: { candle: "–", wish: "Up to 6", party: "Up to 20 + timeline" } },
  { label: "By the numbers", key: "numbers" },
  { label: "Unlocks at midnight", values: { candle: "–", wish: "✓", party: "✓" } },
  { label: "Thank-you reply", key: "thankYou" },
  { label: "Friends add wishes", values: { candle: "–", wish: "–", party: "Up to 15" } },
  { label: "Your voice note", key: "voiceNote" },
  { label: "Your own song", key: "ownSong" },
  { label: "Keepsake poster", key: "keepsake" },
];

/** Side-by-side comparison of the three birthday tiers. */
export function BirthdayCompare({ current }: { current: BirthdayTierId }) {
  return (
    <section className="mt-28">
      <p className="type-label text-muted">Three ways to say it</p>
      <h2 className="type-display mt-4 text-[clamp(2.2rem,5vw,4rem)]">
        Pick how <span className="type-accent text-rose">big</span> to go.
      </h2>

      <div className="no-scrollbar -mx-5 mt-12 overflow-x-auto px-5">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr>
              <th className="w-[34%]" />
              {birthdayTierOrder.map((id) => {
                const t = birthdayTiers[id];
                const active = id === current;
                return (
                  <th
                    key={id}
                    className={cn(
                      "rounded-t-[1.5rem] px-5 pb-6 pt-6 align-top font-normal",
                      active ? "bg-ink text-paper" : "",
                    )}
                  >
                    {id === "party" && (
                      <span className="type-label mb-3 inline-block rounded-full bg-rose px-2.5 py-1 text-[10px] text-paper">
                        Best for groups
                      </span>
                    )}
                    <span className="type-accent block text-3xl">{t.name}</span>
                    <span className="type-display mt-2 block text-4xl font-semibold">{formatInr(t.pricePaise)}</span>
                    <span className={cn("type-copy mt-2 block text-[12px]", active ? "text-paper/70" : "text-muted")}>
                      {t.pitch}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-line">
                <td className="type-copy py-4 pr-4 text-[12px] text-muted">{row.label}</td>
                {birthdayTierOrder.map((id) => {
                  const value = row.key ? (birthdayTiers[id].features[row.key] ? "✓" : "–") : row.values![id];
                  const active = id === current;
                  return (
                    <td key={id} className={cn("px-5 py-4 text-sm", active && "bg-ink text-paper")}>
                      {value === "✓" ? (
                        <Check className={cn("size-4", active ? "text-blush" : "text-rose")} />
                      ) : value === "–" ? (
                        <Minus className="size-4 opacity-25" />
                      ) : (
                        value
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr>
              <td />
              {birthdayTierOrder.map((id) => {
                const active = id === current;
                return (
                  <td key={id} className={cn("rounded-b-[1.5rem] px-5 pb-6 pt-4", active && "bg-ink")}>
                    {active ? (
                      <span className="type-label text-paper/60">You&rsquo;re here</span>
                    ) : (
                      <Link
                        href={`/templates/${tierSlug[id]}`}
                        className="type-label text-ink underline-offset-4 hover:underline"
                      >
                        See {birthdayTiers[id].name} →
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
