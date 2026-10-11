import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

export const metadata: Metadata = { title: "Sign in" };

// Placeholder — the auth flow (e.g. Better Auth) lands in this route group.
export default function SignInPage() {
  return (
    <main className="grid min-h-svh place-items-center px-5">
      <div className="w-full max-w-md rounded-[2rem] border border-line bg-paper p-10 text-center">
        <Logo className="text-4xl" />
        <h1 className="mt-8 font-serif text-4xl italic leading-tight">Accounts are almost here.</h1>
        <p className="mt-4 text-muted">
          Soon you’ll be able to save drafts, track who opened your gifts, and keep every note
          you’ve ever sent.
        </p>
        <ButtonLink href="/" className="mt-8">
          Back home
        </ButtonLink>
      </div>
    </main>
  );
}
