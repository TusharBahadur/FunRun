import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ComponentProps } from "react";
import { RollText } from "@/components/ui/roll-text";
import { cn } from "@/lib/utils";

/** The look lives in globals.css (.btn): solid rose pills for the main action, light pills for the rest. */
const variants = {
  primary: "btn-ink",
  // rose-deep keeps cream labels above 4.5:1 contrast (plain rose is 3.97:1).
  rose: "btn-rose",
  light: "btn-paper",
  ghost: "btn-ghost",
} as const;

const iconVariants = {
  primary: "",
  rose: "",
  light: "",
  ghost: "",
} as const;

const sizes = {
  sm: { base: "h-10 gap-1.5 px-5 text-sm", icon: "size-4" },
  md: { base: "h-12 gap-2 px-6 text-[15px]", icon: "size-4" },
  lg: { base: "h-14 gap-2 px-8 text-base", icon: "size-5" },
} as const;

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  icon?: boolean;
};

export function ButtonLink({
  variant = "primary",
  size = "md",
  icon = true,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      {...props}
      className={cn(
        "btn group",
        variants[variant],
        sizes[size].base,
        !icon && "px-6",
        className,
      )}
    >
      <RollText>{children}</RollText>
      {icon && (
        <span
          className={cn(
            "relative grid shrink-0 place-items-center overflow-hidden rounded-full",
            sizes[size].icon,
            iconVariants[variant],
          )}
        >
          <ArrowUpRight className="size-4 transition-transform duration-500 ease-out-expo group-hover:translate-x-6 group-hover:-translate-y-6" />
          <ArrowUpRight className="absolute size-4 -translate-x-6 translate-y-6 transition-transform duration-500 ease-out-expo group-hover:translate-x-0 group-hover:translate-y-0" />
        </span>
      )}
    </Link>
  );
}
