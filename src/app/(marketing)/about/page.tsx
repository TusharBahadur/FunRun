import type { Metadata } from "next";
import Link from "next/link";
import { PolicySection, TextPage } from "@/components/sections/text-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "TyniTales makes personalised digital gifts: little websites with your photos, words and inside jokes, sent as one private link. Made in India.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const { email } = siteConfig.contact;
  return (
    <TextPage
      eyebrow="About"
      title="Small gifts,"
      accent="big feelings."
      intro={
        <p>
          TyniTales turns the things you never quite say out loud into a little website made for one person. Pick a
          template, add your photos and words, and send a private link they can open on any phone.
        </p>
      }
    >
      <PolicySection title="Why we made it">
        <p>
          A text gets read once. A card gets lost. We wanted something in between: a gift that feels handmade, takes a
          few minutes to put together, and gets opened again and again. Something with a candle to blow out, a letter that
          unseals, a quiz only they could pass.
        </p>
      </PolicySection>
      <PolicySection title="What you can make">
        <ul>
          <li>Birthday surprises, anniversary pages and love letters</li>
          <li>Friendship and best friend gifts full of inside jokes</li>
          <li>Apologies that say more than “sorry”</li>
          <li>Gifts for Maa, Papa, Bhai and Didi</li>
        </ul>
        <p>
          Every template is free to try. When you’re happy with it, making it live costs ₹99, once. The link stays online
          for good.
        </p>
      </PolicySection>
      <PolicySection title="Who’s behind it">
        <p>
          TyniTales is made in India by Tushar Bahadur, with a lot of help from people who were happy to be practised on.
          If you have an idea, a request for a custom gift, or something that didn’t work, write to{" "}
          <a href={`mailto:${email}`}>{email}</a>. A real person reads every message.
        </p>
        <p>
          <Link href="/templates">Browse the templates</Link> or read the <Link href="/faq">FAQ</Link>.
        </p>
      </PolicySection>
    </TextPage>
  );
}
