import type { Metadata } from "next";
import { PolicySection, TextPage } from "@/components/sections/text-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Shipping and delivery policy",
  description: "TyniTales gifts are digital: nothing is shipped. Your gift link is delivered on screen as soon as payment succeeds.",
  alternates: { canonical: "/delivery" },
};

const UPDATED = "9 November 2026";

export default function DeliveryPage() {
  const { email } = siteConfig.contact;
  const mail = <a href={`mailto:${email}`}>{email}</a>;
  return (
    <TextPage
      eyebrow={`Last updated ${UPDATED}`}
      title="Shipping and"
      accent="delivery."
      intro={<p>TyniTales gifts are digital. Nothing is shipped, and there are no delivery charges.</p>}
    >
      <PolicySection title="When you get your gift">
        <p>
          As soon as your payment succeeds, your gift’s private link appears on screen, ready to copy or send on WhatsApp.
          It’s also saved in your profile, so you can find it again any time.
        </p>
      </PolicySection>

      <PolicySection title="Scheduled gifts">
        <p>
          If you pick an opening time, the link works straight away and shows a countdown until then. You send it whenever
          you like; it opens at the moment you chose.
        </p>
      </PolicySection>

      <PolicySection title="Where it works">
        <p>Your gift opens in any web browser, on any phone, tablet or computer, anywhere in the world. Nothing to install.</p>
      </PolicySection>

      <PolicySection title="Didn’t get your link?">
        <p>Write to {mail} with the email you paid with, and we’ll send it to you or refund you in full.</p>
      </PolicySection>
    </TextPage>
  );
}
