import type { Metadata } from "next";
import { PolicySection, TextPage } from "@/components/sections/text-page";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What TyniTales collects, why, who helps us run the service, and how to delete your gifts and account.",
  alternates: { canonical: "/privacy" },
};

const UPDATED = "30 October 2026";

export default function PrivacyPage() {
  const { email } = siteConfig.contact;
  const mail = <a href={`mailto:${email}`}>{email}</a>;
  return (
    <TextPage
      eyebrow={`Last updated ${UPDATED}`}
      title="Privacy"
      accent="policy."
      intro={
        <p>
          TyniTales (tynitales.com) is run by Tushar Bahadur in India (“we”, “us”). This policy explains what we collect when
          you make or open a gift, why, and the choices you have. We keep it short and we don’t sell your data.
        </p>
      }
    >
      <PolicySection title="What we collect">
        <ul>
          <li>
            <strong>Your account.</strong> If you sign in with Google, we receive your name, email address and profile
            picture from Google.
          </li>
          <li>
            <strong>Your gifts.</strong> When you make a gift live, we store what’s in it: the names, text, photos, stickers
            and music choice you added, its link, and when it’s scheduled to open.
          </li>
          <li>
            <strong>Gift passwords.</strong> If you lock a gift, we store only a one-way scrambled (hashed) version of the
            password, never the password itself.
          </li>
          <li>
            <strong>Opens.</strong> We count how many times a gift is opened and when it was first and last opened, so you
            can see it. We don’t record who opened it.
          </li>
          <li>
            <strong>Payments.</strong> Razorpay processes payments. We receive confirmation that you paid and a payment
            reference, never your card, UPI or bank details.
          </li>
          <li>
            <strong>Messages.</strong> If you contact us, we keep your email address and message so we can reply.
          </li>
          <li>
            <strong>Technical data.</strong> Like every website, our servers see basic request data (such as IP address and
            browser type) for security and to keep the site running. We measure page speed with Vercel Speed Insights,
            which doesn’t use cookies or identify you.
          </li>
        </ul>
      </PolicySection>

      <PolicySection title="What stays on your device">
        <p>
          Drafts you’re working on, including photos you add, are saved in your browser’s local storage on your device. They
          only reach our servers when you make a gift live. Clearing your browser data deletes unsent drafts.
        </p>
      </PolicySection>

      <PolicySection title="How we use it">
        <ul>
          <li>To build, show and deliver your gift to the person you send it to</li>
          <li>To let you sign in, see your gifts and change them</li>
          <li>To take payments and issue refunds</li>
          <li>To answer your messages and help when something goes wrong</li>
          <li>To keep the service secure and prevent abuse</li>
        </ul>
        <p>We don’t use your gifts or photos for advertising, and we don’t sell or rent personal data to anyone.</p>
      </PolicySection>

      <PolicySection title="Who can see a gift">
        <p>
          A gift can be opened by anyone who has its link (and its password, if you set one). Photos in a live gift are
          stored at hard-to-guess web addresses so they can load in the gift. Gift pages are marked so search engines don’t
          index them, and we never list them publicly. Share your link only with people you want to see it.
        </p>
      </PolicySection>

      <PolicySection title="Services that help us run TyniTales">
        <ul>
          <li>
            <strong>Vercel</strong>: hosts the website
          </li>
          <li>
            <strong>Supabase</strong>: stores accounts, gifts and photos, and handles sign-in
          </li>
          <li>
            <strong>Google</strong>: “Sign in with Google”
          </li>
          <li>
            <strong>Razorpay</strong>: payments and refunds
          </li>
          <li>
            <strong>Resend</strong>: delivers messages you send us through the contact form
          </li>
          <li>
            <strong>YouTube</strong>: plays a gift’s song, through its privacy-enhanced (no-cookie) player, when the person
            opening the gift presses play
          </li>
        </ul>
        <p>
          These providers process data for us under their own privacy policies and may store it outside India. We share
          only what each one needs to do its job. We may also disclose information if the law requires it.
        </p>
      </PolicySection>

      <PolicySection title="How long we keep it">
        <p>
          Live gifts stay online for good, until you delete them or your account. Account details are kept while your
          account exists. Payment records are kept for as long as tax and accounting laws require. Messages are kept as long
          as needed to help you.
        </p>
      </PolicySection>

      <PolicySection title="Your choices and rights">
        <ul>
          <li>See and change your gifts from your profile while they’re editable</li>
          <li>Delete your account from your profile; this deletes your gifts and their photos</li>
          <li>Ask us for a copy of your data, to correct it, or to take down a single gift, by emailing {mail}</li>
        </ul>
        <p>
          These rights apply under India’s Digital Personal Data Protection Act, 2023, and we extend them to everyone who
          uses TyniTales.
        </p>
      </PolicySection>

      <PolicySection title="Children">
        <p>
          TyniTales is meant for people aged 18 and over, or younger people using it with a parent or guardian’s permission.
          Don’t put information about children into a gift without their parent or guardian’s okay.
        </p>
      </PolicySection>

      <PolicySection title="Cookies and storage">
        <p>
          We use only what the site needs to work: browser storage for your drafts and sign-in, and to remember small
          things like whether you’ve seen the studio tour. No advertising or tracking cookies.
        </p>
      </PolicySection>

      <PolicySection title="Changes and contact">
        <p>
          If we change this policy, we’ll update the date at the top, and tell you if the change is significant. Questions,
          requests or complaints: Tushar Bahadur (grievance officer), {mail}. We aim to reply within a few days.
        </p>
      </PolicySection>
    </TextPage>
  );
}
