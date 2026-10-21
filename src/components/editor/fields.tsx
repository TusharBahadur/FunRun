"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Lock } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { EASE_OUT } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function Section({
  title,
  hint,
  icon,
  children,
  defaultOpen = false,
  badge,
}: {
  title: string;
  hint?: string;
  icon: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  badge?: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <section className="border-b border-line">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={id}
        className="flex w-full items-center gap-4 py-5 text-left"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-paper text-ink/70">{icon}</span>
        <span className="flex-1">
          <span className="type-heading flex items-center gap-2 text-lg">
            {title}
            {badge}
          </span>
          {hint && <span className="type-label block text-[10px] text-muted">{hint}</span>}
        </span>
        <ChevronDown className={cn("size-4 text-muted transition-transform duration-300", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
            className="overflow-hidden"
          >
            <div className="space-y-5 pb-7">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export function Field({
  label,
  hint,
  children,
  counter,
  roomy,
  highlight,
  hideLabel,
}: {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
  counter?: string;
  /** Phone editor: sentence-case labels you can actually read. */
  roomy?: boolean;
  /** Studio: this field is the one tapped in the preview. */
  highlight?: boolean;
  /** Accordion title already names this field. */
  hideLabel?: boolean;
}) {
  return (
    <label className="block">
      {!hideLabel && (
        <span
          className={cn(
            "flex items-baseline justify-between",
            roomy ? "type-heading text-base font-semibold" : "type-label",
            highlight ? "text-rose-deep" : roomy ? "text-ink" : "text-muted",
          )}
        >
          {label}
          {counter && <span className={roomy ? "text-sm font-normal text-muted" : "text-[10px]"}>{counter}</span>}
        </span>
      )}
      <span className={cn(hideLabel ? "block" : "mt-2 block")}>{children}</span>
      {hint && <span className={roomy ? "mt-2 block text-sm leading-snug text-muted" : "mt-1.5 block text-xs text-muted"}>{hint}</span>}
    </label>
  );
}

/** Closed by default. Phone studio: one row until they open it. */
export function Fold({
  title,
  preview,
  open: forceOpen,
  children,
}: {
  title: string;
  preview?: string;
  open?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  useEffect(() => {
    if (forceOpen) setOpen(true);
  }, [forceOpen]);
  return (
    <section className={cn("overflow-hidden rounded-2xl border bg-paper", open ? "border-ink/20" : "border-line")}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className={cn("flex min-h-14 w-full items-center gap-3 px-4 py-3.5 text-left", open && "bg-blush/40")}
      >
        <span className="min-w-0 flex-1">
          <span className="type-heading block text-[1.05rem] font-semibold text-ink">{title}</span>
          {!open && preview ? <span className="mt-1 block truncate text-[15px] text-ink/55">{preview}</span> : null}
        </span>
        <ChevronDown className={cn("size-5 shrink-0 text-ink/40 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div id={id} className="border-t border-ink/10 px-4 py-4">
          {children}
        </div>
      )}
    </section>
  );
}

const inputClass =
  "w-full rounded-2xl border border-line bg-paper px-4 py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-ink/40";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputClass, props.className)} />;
}

/**
 * A number you can actually type. Clamping on every keystroke used to snap
 * the field to min or max (flowers jumped 3 ↔ 7). We keep the draft while
 * typing and only clamp when the field blurs.
 */
export function NumberInput({
  value,
  min,
  max,
  onChange,
  className,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  className?: string;
}) {
  const [raw, setRaw] = useState(String(value));
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setRaw(String(value));
  }, [value]);

  function clamp(n: number) {
    if (!Number.isFinite(n)) return min;
    return Math.min(max, Math.max(min, Math.round(n)));
  }

  function commit(text: string) {
    const next = clamp(text === "" ? min : Number(text));
    setRaw(String(next));
    if (next !== value) onChange(next);
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={raw}
      onFocus={() => {
        focused.current = true;
      }}
      onBlur={() => {
        focused.current = false;
        commit(raw);
      }}
      onChange={(e) => {
        const next = e.target.value.replace(/[^\d]/g, "");
        setRaw(next);
        if (next === "") return;
        const n = Number(next);
        if (Number.isFinite(n) && n >= min && n <= max) onChange(n);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          (e.target as HTMLInputElement).blur();
        }
      }}
      className={cn(inputClass, "tabular-nums", className)}
    />
  );
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(inputClass, "min-h-28 resize-y leading-relaxed", props.className)} />;
}

export function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-line bg-paper p-2 pr-4">
      <span className="relative size-9 shrink-0 overflow-hidden rounded-xl border border-ink/10" style={{ backgroundColor: value }}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 size-full cursor-pointer opacity-0"
          aria-label={label}
        />
      </span>
      <span className="flex-1">
        <span className="type-label block text-[10px] text-muted">{label}</span>
        <span className="font-mono text-xs uppercase">{value}</span>
      </span>
    </label>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className={cn("flex items-center justify-between gap-4 py-1.5", disabled ? "opacity-45" : "cursor-pointer")}>
      <span className="text-[15px]">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300",
          checked ? "bg-ink" : "bg-line",
        )}
      >
        <span
          className={cn(
            "absolute top-1 size-5 rounded-full bg-paper shadow transition-transform duration-300 ease-out-expo",
            checked ? "translate-x-6" : "translate-x-1",
          )}
        />
      </button>
    </label>
  );
}

/** Shown in place of a feature the current package doesn't include. */
export function Locked({
  what,
  tierName,
  price,
  onUnlock,
}: {
  what: string;
  tierName: string;
  price: string;
  onUnlock: () => void;
}) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed border-line p-5">
      <p className="flex items-center gap-2 text-[15px]">
        <Lock className="size-4 text-rose" /> {what}
      </p>
      <button
        type="button"
        onClick={onUnlock}
        className="type-label rounded-full bg-ink px-4 py-2.5 text-paper transition-colors hover:bg-ink-soft"
      >
        Unlock with {tierName} · {price}
      </button>
    </div>
  );
}
