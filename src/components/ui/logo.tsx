import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label="Amore home"
      className={cn(
        "group inline-flex items-baseline font-serif text-[1.75rem] italic leading-none tracking-tight",
        className,
      )}
    >
      amore
      <span className="ml-0.5 inline-block size-[0.2em] rounded-full bg-rose transition-transform duration-500 ease-out-expo group-hover:scale-150" />
    </Link>
  );
}
