"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, type ComponentProps } from "react";
import { ButtonLink } from "@/components/ui/button";

/** "?to=Maya&from=Arjun" from the current address, or "" when there are no names. */
function useNamesQuery() {
  const sp = useSearchParams();
  const to = sp.get("to")?.trim();
  const from = sp.get("from")?.trim();
  if (!to && !from) return { to, from, query: "" };
  const q = new URLSearchParams();
  if (to) q.set("to", to);
  if (from) q.set("from", from);
  return { to, from, query: `?${q.toString()}` };
}

type LinkProps = Omit<ComponentProps<typeof ButtonLink>, "href"> & { href: string };

function NamedLink({ href, ...props }: LinkProps) {
  const { query } = useNamesQuery();
  return <ButtonLink href={`${href}${query}`} {...props} />;
}

/**
 * A button that carries ?to / ?from names along. The names are read in the
 * browser, so the page itself stays static (fast, and the same for search engines).
 */
export function ButtonLinkWithNames(props: LinkProps) {
  return (
    <Suspense fallback={<ButtonLink {...props} />}>
      <NamedLink {...props} />
    </Suspense>
  );
}

function Banner({ accent }: { accent: string }) {
  const { to, from } = useNamesQuery();
  if (!to && !from) return null;
  return (
    <div className="mt-6 flex items-center gap-3 rounded-2xl border px-5 py-3.5 shadow-xs" style={{ borderColor: `${accent}44`, backgroundColor: `${accent}0a` }}>
      <span className="type-label text-muted">Personalized for</span>
      <span className="font-serif text-lg">
        {to && (
          <span className="font-semibold" style={{ color: accent }}>
            {to}
          </span>
        )}
        {to && from && <span className="mx-1.5 text-muted">from</span>}
        {from && <span className="font-semibold">{from}</span>}
      </span>
    </div>
  );
}

/** "Personalized for Maya from Arjun", when the link carries names. */
export function NamesBanner({ accent }: { accent: string }) {
  return (
    <Suspense fallback={null}>
      <Banner accent={accent} />
    </Suspense>
  );
}
