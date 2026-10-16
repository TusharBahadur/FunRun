import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ComponentProps } from "react";
import { RollText } from "@/components/ui/roll-text";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-ink text-paper hover:bg-ink-soft",
  // rose-deep keeps cream labels above 4.5:1 contrast (plain rose is 3.97:1).
  rose: "bg-rose-deep text-paper hover:bg-wine",
  light: "bg-paper text-ink hover:bg-white",
  ghost: "text-ink hover:bg-ink/5",
} as const;

const iconVariants = {
  primary: "bg-paper/12",
  rose: "bg-paper/15",
  light: "bg-ink text-paper",
  ghost: "bg-ink/6",
} as const;

const sizes = {
  sm: { base: "h-10 gap-2 pl-4 pr-1.5 text-sm", icon: "size-7" },
  md: { base: "h-12 gap-3 pl-5 pr-1.5 text-sm", icon: "size-9" },
  lg: { base: "h-14 gap-4 pl-7 pr-2 text-base", icon: "size-10" },
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
        "group relative inline-flex items-center justify-center rounded-full font-medium tracking-tight transition-colors duration-300",
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
