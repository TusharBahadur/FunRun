import type { Metadata } from "next";
import Link from "next/link";
import { TextPage } from "@/components/sections/text-page";
import { guides } from "@/data/guides";

export const metadata: Metadata = {
  title: "Guides: love letters, birthday messages & more",
  description:
    "Simple, honest guides for saying what you feel: how to write a love letter, what to write in a birthday message, how to apologise, with real examples.",
  alternates: { canonical: "/guides" },
};

export default function GuidesPage() {
  return (
    <TextPage
      eyebrow="Guides"
      title="Help with"
      accent="the words."
      intro={<p>Simple, honest guides for the things that are hard to say, with real examples you can make your own.</p>}
    >
      <ul className="divide-y divide-line border-y border-line">
        {guides.map((g) => (
          <li key={g.slug}>
            <Link href={`/guides/${g.slug}`} className="group block py-6">
              <h2 className="type-heading text-xl group-hover:text-rose-deep md:text-2xl">
                {g.title} {g.accent}
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-muted">{g.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </TextPage>
  );
}
