/**
 * A tiny Web Audio music box. Plays "Happy Birthday to You" (public domain)
 * with a soft, bell-like timbre — no audio files to ship.
 */

const NOTE: Record<string, number> = {
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
};

// [note, beats] in 3/4.
const HAPPY_BIRTHDAY: [string, number][] = [
  ["G4", 0.75], ["G4", 0.25], ["A4", 1], ["G4", 1], ["C5", 1], ["B4", 2],
  ["G4", 0.75], ["G4", 0.25], ["A4", 1], ["G4", 1], ["D5", 1], ["C5", 2],
  ["G4", 0.75], ["G4", 0.25], ["G5", 1], ["E5", 1], ["C5", 1], ["B4", 1], ["A4", 2],
  ["F5", 0.75], ["F5", 0.25], ["E5", 1], ["C5", 1], ["D5", 1], ["C5", 3],
];

const BEAT = 0.46; // seconds

export class MusicBox {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;

  /** Must be called from a user gesture (tap/click) so the browser allows audio. */
  play(onEnd?: () => void) {
    this.stop();
    this.ctx ??= new AudioContext();
    void this.ctx.resume();
    const ctx = this.ctx;

    this.master = ctx.createGain();
    this.master.gain.value = 0.22;
    this.master.connect(ctx.destination);

    let t = ctx.currentTime + 0.08;
    for (const [name, beats] of HAPPY_BIRTHDAY) {
      this.pluck(NOTE[name], t, beats * BEAT);
      t += beats * BEAT;
    }
    const total = (t - ctx.currentTime) * 1000;
    this.timer = setTimeout(() => {
      this.timer = null;
      onEnd?.();
    }, total + 600);
  }

  stop() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    if (this.master && this.ctx) {
      const g = this.master.gain;
      g.cancelScheduledValues(this.ctx.currentTime);
      g.setTargetAtTime(0, this.ctx.currentTime, 0.05);
      const old = this.master;
      setTimeout(() => old.disconnect(), 400);
    }
    this.master = null;
  }

  get playing() {
    return this.timer !== null;
  }

  private pluck(freq: number, start: number, length: number) {
    const ctx = this.ctx!;
    const env = ctx.createGain();
    env.connect(this.master!);
    env.gain.setValueAtTime(0, start);
    env.gain.linearRampToValueAtTime(1, start + 0.008);
    env.gain.exponentialRampToValueAtTime(0.001, start + Math.max(0.9, length * 1.6));

    // Fundamental plus a quiet, slightly detuned overtone reads as a music box.
    for (const [mult, level, type] of [
      [1, 0.8, "sine"],
      [2.01, 0.18, "triangle"],
      [4.02, 0.05, "sine"],
    ] as const) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq * mult;
      gain.gain.value = level;
      osc.connect(gain).connect(env);
      osc.start(start);
      osc.stop(start + Math.max(1, length * 1.7));
    }
  }
}
