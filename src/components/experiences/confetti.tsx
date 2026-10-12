"use client";

import { useEffect, useImperativeHandle, useRef, type Ref } from "react";

export type ConfettiHandle = {
  /** Fire a burst from a point in viewport pixels. */
  burst: (x: number, y: number, options?: { count?: number; spread?: number }) => void;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  spin: number;
  size: number;
  color: string;
  shape: 0 | 1 | 2; // ribbon, square, dot
  life: number;
};

const GRAVITY = 0.32;
const DRAG = 0.985;

/** Plain canvas particle loop, kept outside React so it can mutate freely. */
class ConfettiEngine {
  private particles: Particle[] = [];
  private frame: number | null = null;

  constructor(private canvas: HTMLCanvasElement) {}

  resize() {
    const dpr = Math.min(window.devicePixelRatio, 2);
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.canvas.getContext("2d")!.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  burst(x: number, y: number, count: number, spread: number, colors: string[]) {
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1 * spread;
      const speed = 7 + Math.random() * 11;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rotation: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 0.4,
        size: 5 + Math.random() * 7,
        color: colors[i % colors.length],
        shape: (i % 3) as Particle["shape"],
        life: 1,
      });
    }
    this.frame ??= requestAnimationFrame(this.tick);
  }

  destroy() {
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = null;
    this.particles = [];
  }

  private tick = () => {
    const ctx = this.canvas.getContext("2d")!;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    this.particles = this.particles.filter((p) => p.life > 0 && p.y < window.innerHeight + 40);
    for (const p of this.particles) {
      p.vx *= DRAG;
      p.vy = p.vy * DRAG + GRAVITY;
      p.x += p.vx + Math.sin(p.rotation * 2) * 0.6;
      p.y += p.vy;
      p.rotation += p.spin;
      p.life -= 0.0045;

      ctx.save();
      ctx.globalAlpha = Math.min(1, p.life * 2);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      if (p.shape === 0) {
        // Ribbons flip as they tumble.
        ctx.fillRect(-p.size / 2, -p.size / 5, p.size, (p.size / 2.5) * Math.cos(p.rotation * 3));
      } else if (p.shape === 1) {
        ctx.fillRect(-p.size / 3, -p.size / 3, p.size / 1.5, p.size / 1.5);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    this.frame = this.particles.length ? requestAnimationFrame(this.tick) : null;
  };
}

/** Full-screen canvas that draws short-lived confetti bursts on demand. */
export function Confetti({ colors, ref }: { colors: string[]; ref?: Ref<ConfettiHandle> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engine = useRef<ConfettiEngine | null>(null);

  useEffect(() => {
    const instance = new ConfettiEngine(canvasRef.current!);
    engine.current = instance;
    const resize = () => instance.resize();
    resize();
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      instance.destroy();
    };
  }, []);

  useImperativeHandle(ref, () => ({
    burst(x, y, { count = 140, spread = 1 } = {}) {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      engine.current?.burst(x, y, reduced ? Math.round(count / 4) : count, spread, colors);
    },
  }));

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60] h-full w-full"
    />
  );
}
