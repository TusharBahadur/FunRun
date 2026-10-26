import type { Metadata } from "next";
import { SignInCard } from "@/components/profile/sign-in-card";
import { Logo } from "@/components/ui/logo";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default function SignInPage() {
  return (
    <main className="grid min-h-svh place-items-center px-5">
      <div className="w-full max-w-md text-center">
        <Logo className="text-4xl" />
        <div className="mt-8">
          <SignInCard next="/profile" />
        </div>
      </div>
    </main>
  );
}
