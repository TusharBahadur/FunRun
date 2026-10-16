import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label="TyniTales home"
      className={cn(
        "type-wordmark group inline-flex items-baseline text-[1.9rem] leading-none",
        className,
      )}
    >
      TyniTales
      <span className="text-rose transition-transform duration-500 ease-out-expo group-hover:-translate-y-1">
        .
      </span>
    </Link>
  );
}
