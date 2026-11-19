import Link from "next/link";
import { Logo } from "@/components/ui/logo";

/** A gift link that doesn't match any gift: usually a typo or a cut-off link. */
export default function GiftNotFound() {
  return (
    <main className="grid min-h-svh place-items-center bg-cream px-6 text-center text-ink">
      <div className="max-w-sm">
        <Logo className="text-3xl" />
        <p className="type-label mt-10 text-muted">Gift not found</p>
        <h1 className="type-display mt-3 text-[2.4rem] leading-none">
          This link doesn’t <span className="type-accent text-rose-deep">open a gift.</span>
        </h1>
        <p className="mt-4 text-muted">
          It may have been copied with a letter missing. Ask whoever sent it to share the link again. It ends with six
          letters and numbers.
        </p>
        <Link href="/" className="mt-8 inline-block text-sm text-muted underline-offset-4 hover:text-ink hover:underline">
          What is TyniTales?
        </Link>
      </div>
    </main>
  );
}
