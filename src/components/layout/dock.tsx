"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { Cake, Gem, Gift, Heart, HeartHandshake, Home, Sparkles, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

const items: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Love", href: "/templates?occasion=love", icon: Heart },
  { label: "Birthday", href: "/templates?occasion=birthday", icon: Cake },
  { label: "Anniversary", href: "/templates?occasion=anniversary", icon: Gem },
  { label: "Girlfriend's Day", href: "/templates?occasion=girlfriend-day", icon: Sparkles },
  { label: "Boyfriend's Day", href: "/templates?occasion=boyfriend-day", icon: HeartHandshake },
  { label: "Friendship", href: "/templates?occasion=friendship", icon: Users },
  { label: "Family", href: "/templates?occasion=family", icon: Home },
];

/** macOS-style magnifying dock for jumping straight into an occasion. */
export function Dock() {
  const mouseX = useMotionValue(Infinity);
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);
  const wide = useMediaQuery("(min-width: 640px)", true);
  const base = wide ? 44 : 38;

  // Show after the hero, tuck away again once the footer arrives.
  useMotionValueEvent(scrollY, "change", (v) => {
    const end = document.documentElement.scrollHeight - window.innerHeight;
    setVisible(v > 520 && v < end - 360);
  });

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          aria-label="Browse by occasion"
          className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center sm:bottom-6"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
        >
          <motion.div
            onMouseMove={(e) => mouseX.set(e.clientX)}
            onMouseLeave={() => mouseX.set(Infinity)}
            className="pointer-events-auto flex items-end gap-1.5 rounded-[1.4rem] border border-white/50 bg-paper/65 px-2.5 pb-2 pt-2 shadow-[0_18px_50px_-15px_rgba(27,18,21,0.4)] backdrop-blur-2xl sm:gap-2"
          >
            {items.map((item) => (
              <DockIcon key={item.href} mouseX={mouseX} base={base} {...item} />
            ))}
            <span className="mx-0.5 h-8 w-px self-center bg-ink/10" />
            <DockIcon mouseX={mouseX} base={base} label="Start gifting" href="/templates" icon={Gift} accent />
          </motion.div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}

function DockIcon({
  mouseX,
  base,
  label,
  href,
  icon: Icon,
  accent,
}: {
  mouseX: MotionValue<number>;
  base: number;
  label: string;
  href: string;
  icon: LucideIcon;
  accent?: boolean;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [hover, setHover] = useState(false);

  const distance = useTransform(mouseX, (x) => {
    const b = ref.current?.getBoundingClientRect();
    return b ? x - b.left - b.width / 2 : Infinity;
  });
  const target = useTransform(distance, [-150, 0, 150], [base, base * 1.75, base]);
  const size = useSpring(target, { mass: 0.1, stiffness: 170, damping: 14 });
  const iconSize = useTransform(size, (s) => s * 0.44);

  return (
    <Link
      ref={ref}
      href={href}
      aria-label={label}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="relative"
    >
      <motion.div
        style={{ width: size, height: size }}
        className={cn(
          "grid place-items-center rounded-[30%] shadow-sm",
          accent ? "bg-rose-deep text-paper" : "border border-line/80 bg-paper text-ink",
        )}
      >
        <motion.div style={{ width: iconSize, height: iconSize }}>
          <Icon className="size-full" strokeWidth={1.6} />
        </motion.div>
      </motion.div>
      <AnimatePresence>
        {hover && (
          <motion.span
            initial={{ opacity: 0, y: 6, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 2, x: "-50%" }}
            className="pointer-events-none absolute -top-10 left-1/2 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1 text-xs font-medium text-paper"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}
