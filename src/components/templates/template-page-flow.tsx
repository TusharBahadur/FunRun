"use client";

import { useEffect, useState } from "react";
import { Sparkles, Timer, Smartphone, Layers } from "lucide-react";
import type { Template } from "@/lib/templates";
import { ScreenPeek, readGift, PhoneFrame } from "./story-mockup";
import { sceneLabels } from "@/components/story/labels";

/**
 * 1-Second Timer Flow Player:
 * While playing, advances through every page inside the template one after another,
 * displaying each page for exactly 1 second with a live 1s countdown indicator.
 */
export function TemplatePageFlow({
  template,
  playing,
}: {
  template: Template;
  playing: boolean;
}) {
  if (!template.story) return null;
  return <StoryPageFlow template={template} playing={playing} />;
}

function StoryPageFlow({
  template,
  playing,
}: {
  template: Template;
  playing: boolean;
}) {
  const g = readGift(template);
  const scenes = g.scenes;
  const total = scenes.length;
  const [index, setIndex] = useState(0);
  const [key, setKey] = useState(0);

  // Exact 1-second interval timer per page
  useEffect(() => {
    if (!playing) {
      setIndex(0);
      setKey(0);
      return;
    }

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % total);
      setKey((k) => k + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [playing, total]);

  const currentScene = scenes[index];
  const label = currentScene ? sceneLabels[currentScene.type] : "Page";
  const { p } = g;

  return (
    <div
      className="relative h-full w-full overflow-hidden select-none"
      style={{ backgroundColor: p.bg, color: p.fg }}
    >
      {/* Dark vignette backdrop for high-contrast viewing */}
      <div className="absolute inset-0 bg-radial from-black/10 via-transparent to-black/40 pointer-events-none z-10" />

      {/* Top Header Bar: 1s Countdown Timer + Page Counter */}
      <div className="absolute inset-x-0 top-0 z-30 p-[4cqw] flex flex-col gap-[2cqw]">
        {/* Story Segments: highlights the current active page */}
        <div className="grid gap-[1cqw] w-full" style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}>
          {scenes.map((_, i) => (
            <div
              key={i}
              className="h-[0.8cqw] rounded-full overflow-hidden bg-black/25 backdrop-blur-xs relative"
            >
              {i < index && (
                <div className="h-full w-full rounded-full" style={{ backgroundColor: p.accent }} />
              )}
              {i === index && (
                <div
                  key={key}
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: p.accent,
                    animation: "oneSecFill 1s linear forwards",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Live Timer Pill & Step Label */}
        <div className="flex items-center justify-between text-[2.4cqw] font-mono uppercase tracking-wider">
          <div className="flex items-center gap-[1.2cqw] rounded-full bg-black/60 px-[2.6cqw] py-[0.8cqw] text-white backdrop-blur-md">
            <span className="size-[1.6cqw] rounded-full bg-rose-500 animate-pulse" />
            <span className="font-semibold text-[2.2cqw]">1.0s TIMER</span>
          </div>

          <div
            className="rounded-full bg-white/30 px-[2.4cqw] py-[0.7cqw] text-[2.2cqw] font-semibold text-ink backdrop-blur-md flex items-center gap-[1cqw]"
          >
            <Layers className="size-[2.8cqw]" />
            <span>PAGE {index + 1} OF {total}</span>
          </div>
        </div>
      </div>

      {/* Centered Phone Screen with live 1s page swap */}
      <div className="absolute inset-x-[16%] bottom-[4%] top-[11%] overflow-hidden rounded-[5.5cqw] border-[1.2cqw] border-[#1b1215] bg-[#1b1215] shadow-[0_8cqw_16cqw_-6cqw_rgba(0,0,0,0.6)]">
        {/* iOS Dynamic Island */}
        <div className="absolute left-1/2 top-[1.2cqw] z-30 h-[1.8cqw] w-[14cqw] -translate-x-1/2 rounded-full bg-black" />

        {/* Scene Container with smooth 1s transition */}
        <div
          key={index}
          className="relative h-full w-full flex flex-col justify-center animate-fade-in"
          style={{ animation: "pageSwapFade 0.25s ease-out forwards" }}
        >
          <ScreenPeek scene={currentScene} g={g} className="h-full justify-center px-[3cqw] pt-[6cqw]" />

          {/* Interactive touch indicator on first scene */}
          {index === 0 && (
            <div className="pointer-events-none absolute bottom-[18%] right-[20%] grid size-[7cqw] place-items-center rounded-full bg-white text-ink shadow-lg animate-bounce">
              <Sparkles className="size-[3.5cqw] text-amber-500" />
            </div>
          )}

          {/* Celebration confetti on final scene */}
          {index === total - 1 && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {[
                { left: "20%", top: "25%", color: "#f59e0b", size: "2.5cqw" },
                { left: "75%", top: "30%", color: "#ef4444", size: "3cqw" },
                { left: "30%", top: "70%", color: "#3b82f6", size: "2cqw" },
                { left: "70%", top: "65%", color: "#10b981", size: "2.8cqw" },
                { left: "50%", top: "20%", color: "#ec4899", size: "3.2cqw" },
              ].map((c, idx) => (
                <span
                  key={idx}
                  className="absolute rounded-full animate-ping"
                  style={{
                    left: c.left,
                    top: c.top,
                    backgroundColor: c.color,
                    width: c.size,
                    height: c.size,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Sub-Caption displaying the scene description */}
      <div className="absolute inset-x-0 bottom-0 z-20 py-[2.5cqw] px-[4cqw] flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent">
        <span className="font-mono text-[2cqw] uppercase tracking-wider text-white/90 truncate max-w-[70%]">
          {label}
        </span>
        <span className="font-mono text-[2cqw] text-amber-300 font-bold">
          {index + 1}s / {total}s
        </span>
      </div>
    </div>
  );
}
