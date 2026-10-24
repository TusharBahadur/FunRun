"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock, Sparkles, Plus, Calendar, Bell, Volume2, Check, Lock, Unlock } from "lucide-react";
import { Confetti } from "@/components/experiences/confetti";
import { cn } from "@/lib/utils";

interface ActivationTimerProps {
  value: string;
  onChange: (isoString: string) => void;
  accentColor?: string;
  recipientName?: string;
}

/**
 * Interactive Activation Countdown Timer for scheduled publishing.
 * Includes live ticking countdown, quick-preset micro-interactions,
 * time nudgers, and an unlock-moment simulator.
 */
export function ActivationTimer({
  value,
  onChange,
  accentColor = "#e23b54",
  recipientName = "them",
}: ActivationTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalMs: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 });

  const [testUnlocked, setTestUnlocked] = useState(false);
  const [viewMode, setViewMode] = useState<"countdown" | "datetime">("countdown");
  const [chimeEnabled, setChimeEnabled] = useState(true);

  // Parse target date
  const targetDate = value ? new Date(value) : null;

  // Live 1-second countdown calculation
  useEffect(() => {
    if (!targetDate) return;

    const calculate = () => {
      const now = Date.now();
      const diff = targetDate.getTime() - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        totalMs: diff,
      });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [value]);

  // Quick preset handlers with micro-interaction feedback
  const setPreset = useCallback(
    (type: "midnight" | "tomorrow" | "24h" | "weekend") => {
      const d = new Date();
      if (type === "midnight") {
        d.setHours(23, 59, 0, 0);
      } else if (type === "tomorrow") {
        d.setDate(d.getDate() + 1);
        d.setHours(9, 0, 0, 0);
      } else if (type === "24h") {
        d.setTime(d.getTime() + 24 * 60 * 60 * 1000);
      } else if (type === "weekend") {
        const day = d.getDay();
        const diff = (6 - day + 7) % 7 || 7; // next Saturday
        d.setDate(d.getDate() + diff);
        d.setHours(20, 0, 0, 0);
      }

      // Convert to local datetime-local format
      const pad = (n: number) => String(n).padStart(2, "0");
      const localStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      onChange(localStr);
    },
    [onChange],
  );

  // Micro-adjustment nudgers (+1h, +1d)
  const nudgeTime = useCallback(
    (hoursToAdd: number) => {
      const current = value ? new Date(value) : new Date();
      current.setTime(current.getTime() + hoursToAdd * 60 * 60 * 1000);

      const pad = (n: number) => String(n).padStart(2, "0");
      const localStr = `${current.getFullYear()}-${pad(current.getMonth() + 1)}-${pad(current.getDate())}T${pad(current.getHours())}:${pad(current.getMinutes())}`;
      onChange(localStr);
    },
    [value, onChange],
  );

  // Trigger test unlock simulation
  const handleTestUnlock = useCallback(() => {
    setTestUnlocked(true);
    setTimeout(() => {
      setTestUnlocked(false);
    }, 3200);
  }, []);

  return (
    <div className="space-y-3 pt-2">
      {/* Quick Presets with tactile micro-interactions */}
      <div className="flex flex-wrap gap-1.5">
        {[
          { id: "midnight", label: "Midnight 11:59 PM" },
          { id: "tomorrow", label: "Tomorrow 9 AM" },
          { id: "24h", label: "+24 Hours" },
          { id: "weekend", label: "This Weekend" },
        ].map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPreset(p.id as any)}
            className={cn(
              "rounded-full border border-line bg-paper px-3 py-1.5 text-xs font-medium text-ink transition-all",
              "hover:border-ink hover:scale-105 active:scale-95 shadow-2xs",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Datetime Input with Calendar Icon */}
      <div className="relative">
        <input
          type="datetime-local"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full rounded-2xl border border-line bg-paper px-4 py-3 text-[15px] outline-none",
            "focus:border-ink focus:ring-2 focus:ring-ink/10 transition-all font-mono",
          )}
          aria-label="Unlock time"
        />
      </div>

      {/* Live Countdown Display Card (Appears once a target date is selected) */}
      {value && targetDate && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="rounded-2xl border border-line/80 bg-paper p-4 shadow-sm relative overflow-hidden"
        >
          {/* Top Info Bar */}
          <div className="flex items-center justify-between border-b border-line/60 pb-2.5">
            <div className="flex items-center gap-1.5 text-xs text-muted">
              <Clock className="size-3.5" style={{ color: accentColor }} />
              <span>Unlocks in</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Mode Toggle: Countdown vs Exact Date */}
              <button
                type="button"
                onClick={() => setViewMode((m) => (m === "countdown" ? "datetime" : "countdown"))}
                className="rounded-md px-2 py-0.5 text-[11px] font-mono text-muted hover:bg-cream hover:text-ink transition-colors"
              >
                {viewMode === "countdown" ? "Show Date" : "Show Countdown"}
              </button>

              {/* Sound / Chime Toggle */}
              <button
                type="button"
                onClick={() => setChimeEnabled(!chimeEnabled)}
                aria-label="Toggle unlock chime"
                className={cn(
                  "grid size-6 place-items-center rounded-full transition-colors",
                  chimeEnabled ? "bg-amber-100 text-amber-700" : "bg-cream text-muted",
                )}
              >
                <Bell className="size-3" />
              </button>
            </div>
          </div>

          {/* Main Display: Ticking Countdown vs Formatted Date */}
          {viewMode === "countdown" ? (
            <div className="py-3">
              <div className="mx-auto grid max-w-[14rem] grid-cols-2 gap-2 text-center">
                {[
                  { val: timeLeft.days, unit: "days" },
                  { val: timeLeft.hours, unit: "hours" },
                  { val: timeLeft.minutes, unit: "mins" },
                  { val: timeLeft.seconds, unit: "secs" },
                ].map((item) => (
                  <div
                    key={item.unit}
                    className="flex aspect-square flex-col items-center justify-center rounded-xl bg-cream/70 border border-line/40 shadow-2xs"
                  >
                    <span
                      key={item.val}
                      className="font-mono text-xl font-bold tracking-tight text-ink leading-none animate-fade-in"
                    >
                      {String(item.val).padStart(2, "0")}
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-muted mt-1">
                      {item.unit}
                    </span>
                  </div>
                ))}
              </div>

              {/* Live Blinking Indicator */}
              <div className="mt-2.5 flex items-center justify-center gap-1.5 text-xs text-muted">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  {timeLeft.totalMs > 0
                    ? `Countdown active · ${recipientName} can open it at zero`
                    : "Time reached! Gift is unlocked."}
                </span>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center">
              <p className="type-display text-lg font-semibold text-ink">
                {targetDate.toLocaleDateString("en-IN", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              <p className="font-mono text-sm text-muted mt-0.5" style={{ color: accentColor }}>
                {targetDate.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          )}

          {/* Micro-interaction Action Row: Nudgers & Unlock Simulation */}
          <div className="mt-2 flex items-center justify-between border-t border-line/60 pt-2.5">
            {/* Quick Nudgers */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-[11px] text-muted mr-1">Adjust:</span>
              <button
                type="button"
                onClick={() => nudgeTime(1)}
                className="rounded-md border border-line bg-cream px-2 py-0.5 text-[11px] font-mono hover:bg-paper transition-all active:scale-95"
              >
                +1h
              </button>
              <button
                type="button"
                onClick={() => nudgeTime(24)}
                className="rounded-md border border-line bg-cream px-2 py-0.5 text-[11px] font-mono hover:bg-paper transition-all active:scale-95"
              >
                +1d
              </button>
            </div>

            {/* Test Unlock Micro-Interaction Simulator */}
            <button
              type="button"
              onClick={handleTestUnlock}
              className="flex items-center gap-1 rounded-full bg-ink px-2.5 py-1 text-[11px] font-medium text-paper transition-all hover:scale-105 active:scale-95 shadow-xs"
            >
              {testUnlocked ? (
                <>
                  <Unlock className="size-3 text-emerald-400" />
                  <span>Unlocked!</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-3 text-amber-300" />
                  <span>Test unlock effect</span>
                </>
              )}
            </button>
          </div>

          {/* Test Unlock Simulation Overlay */}
          <AnimatePresence>
            {testUnlocked && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-ink/90 p-4 text-center text-paper backdrop-blur-xs"
              >
                <div className="grid size-10 place-items-center rounded-full bg-emerald-500 text-white mb-2 shadow-lg animate-bounce">
                  <Unlock className="size-5" />
                </div>
                <p className="type-display text-lg font-bold">Countdown Reached 0:00!</p>
                <p className="text-xs text-paper/75 mt-0.5">
                  The gift instantly unlocks & confetti bursts for {recipientName} 🎉
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

/**
 * Recipient-Facing Live Countdown Timer for locked gifts (/g/[id])
 */
export function RecipientUnlockCountdown({
  opensAt,
  recipientName,
  accentColor = "#e23b54",
  onUnlock,
}: {
  opensAt: Date;
  recipientName: string;
  accentColor?: string;
  onUnlock?: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalMs: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 1 });

  const [taps, setTaps] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const diff = opensAt.getTime() - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 });
        onUnlock?.();
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        totalMs: diff,
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [opensAt, onUnlock]);

  // Micro-interaction: Tapping creates floating hearts while waiting
  const handleTap = (e: React.MouseEvent) => {
    const id = Date.now();
    setTaps((prev) => [...prev.slice(-10), { id, x: e.clientX, y: e.clientY }]);
    setTimeout(() => {
      setTaps((prev) => prev.filter((t) => t.id !== id));
    }, 1500);
  };

  return (
    <div
      onClick={handleTap}
      className="relative flex flex-col items-center justify-center p-6 text-center select-none cursor-pointer"
    >
      {/* Floating Hearts spawned on tap */}
      {taps.map((t) => (
        <span
          key={t.id}
          className="pointer-events-none fixed z-50 text-2xl animate-float-up"
          style={{ left: t.x - 12, top: t.y - 12 }}
        >
          ❤️
        </span>
      ))}

      <p className="type-label opacity-70 tracking-widest uppercase text-xs">
        A Surprise For {recipientName}
      </p>

      <h1 className="type-display mt-3 text-4xl sm:text-5xl font-semibold">
        Unlocks In <span className="font-semibold" style={{ color: accentColor }}>...</span>
      </h1>

      {/* Ticking Digital Block Countdown */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 max-w-xs w-full">
        {[
          { val: timeLeft.days, label: "Days" },
          { val: timeLeft.hours, label: "Hours" },
          { val: timeLeft.minutes, label: "Mins" },
          { val: timeLeft.seconds, label: "Secs" },
        ].map((item) => (
          <div
            key={item.label}
            className="flex aspect-square flex-col items-center justify-center rounded-2xl bg-white/70 p-3 sm:p-4 shadow-sm backdrop-blur-xs border border-white/40"
          >
            <span
              key={item.val}
              className="font-mono text-2xl sm:text-4xl font-bold tracking-tight text-ink leading-none"
            >
              {String(item.val).padStart(2, "0")}
            </span>
            <span className="font-mono text-[10px] sm:text-xs uppercase tracking-wider opacity-60 mt-2">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Micro-interaction hint */}
      <p className="mt-8 text-sm opacity-60">
        Tap the screen to send warm wishes while waiting 💖
      </p>
      <p className="type-label mt-2 text-[10px] opacity-40">
        Opens {opensAt.toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" })}
      </p>
    </div>
  );
}
