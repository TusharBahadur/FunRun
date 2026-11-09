import type { Metadata } from "next";
import { PolicySection, TextPage } from "@/components/sections/text-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Get in touch with TyniTales by email or WhatsApp for help with a gift, payments or refunds.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  const { email, whatsapp, whatsappLabel, address } = siteConfig.contact;
  return (
    <TextPage
      eyebrow="We usually reply within a day"
      title="Contact"
      accent="us."
      intro={<p>Questions about a gift, a payment or a refund? Write to us and a real person will reply.</p>}
    >
      <PolicySection title="Email">
        <p>
          <a href={`mailto:${email}`}>{email}</a>
        </p>
      </PolicySection>

      <PolicySection title="WhatsApp">
        <p>
          <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer">
            {whatsappLabel}
          </a>
        </p>
      </PolicySection>

      <PolicySection title="Grievance officer">
        <p>
          Tushar Bahadur, Founder · <a href={`mailto:${email}`}>{email}</a>
        </p>
        <p>We acknowledge every complaint within 48 hours and aim to resolve it within one month.</p>
      </PolicySection>

      <PolicySection title="Who runs TyniTales">
        <p>TyniTales (tynitales.com) is run by Tushar Bahadur in India.</p>
        {address && <p>{address}</p>}
      </PolicySection>
    </TextPage>
  );
}
