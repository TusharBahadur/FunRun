import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";

/** Any address that doesn't exist: friendly, on-brand, with a way back. */
export default function NotFound() {
  return (
    <main className="grid min-h-svh place-items-center bg-cream px-6 text-center text-ink">
      <div className="max-w-sm">
        <Logo className="text-3xl" />
        <p className="type-label mt-10 text-muted">Page not found</p>
        <h1 className="type-display mt-3 text-[2.6rem] leading-none">
          Nothing <span className="type-accent text-rose-deep">here.</span>
        </h1>
        <p className="mt-4 text-muted">This page doesn’t exist, or the link has a typo in it.</p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <ButtonLink href="/templates" variant="rose">
            Browse templates
          </ButtonLink>
          <Link href="/" className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
