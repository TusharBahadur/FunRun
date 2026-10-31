/**
 * A tiny Web Audio ambient felt-piano synthesizer — warm, relaxing, and soothing.
 * Designed to sound like a gentle acoustic electric piano / warm kalimba, avoiding
 * any harsh, eerie, or high-pitched music-box tones.
 */

const NOTE: Record<string, number> = {
  // Octave 3 (warm, soothing base)
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  F3: 174.61,
  G3: 196.00,
  A3: 220.00,
  B3: 246.94,
  // Octave 4 (warm center)
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.00,
  A4: 440.00,
  B4: 493.88,
  // Octave 5 (gentle highs)
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
  A5: 880.00,
};

/** [note, beats]; "R" is a rest. */
export type Melody = { notes: [string, number][]; beat: number };

// Soothing, gentle acoustic birthday melody in a warm, relaxed octave
const HAPPY_BIRTHDAY: [string, number][] = [
  ["G3", 0.75], ["G3", 0.25], ["A3", 1], ["G3", 1], ["C4", 1], ["B3", 2],
  ["G3", 0.75], ["G3", 0.25], ["A3", 1], ["G3", 1], ["D4", 1], ["C4", 2],
  ["G3", 0.75], ["G3", 0.25], ["G4", 1], ["E4", 1], ["C4", 1], ["B3", 1], ["A3", 2],
  ["F4", 0.75], ["F4", 0.25], ["E4", 1], ["C4", 1], ["D4", 1], ["C4", 3],
];

export const HAPPY_BIRTHDAY_MELODY: Melody = { notes: HAPPY_BIRTHDAY, beat: 0.52 };

export class MusicBox {
  private ctx: AudioContext | null = null;
  private filter: BiquadFilterNode | null = null;
  private master: GainNode | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;

  /** Must be called from a user gesture (tap/click) so the browser allows audio. */
  play(onEnd?: () => void, melody: Melody = HAPPY_BIRTHDAY_MELODY) {
    this.stop();
    this.ctx ??= new AudioContext();
    void this.ctx.resume();
    const ctx = this.ctx;

    // Warm acoustic lowpass filter: softens all edges, giving a warm felt-piano/Rhodes timbre
    this.filter = ctx.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.frequency.value = 1350;
    this.filter.Q.value = 0.6;

    this.master = ctx.createGain();
    this.master.gain.value = 0.26;

    this.filter.connect(this.master);
    this.master.connect(ctx.destination);

    let t = ctx.currentTime + 0.08;
    for (const [name, beats] of melody.notes) {
      if (name !== "R" && NOTE[name]) {
        this.pluck(NOTE[name], t, beats * melody.beat);
      }
      t += beats * melody.beat;
    }
    const total = (t - ctx.currentTime) * 1000;
    this.timer = setTimeout(() => {
      this.timer = null;
      onEnd?.();
    }, total + 800);
  }

  stop() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    if (this.master && this.ctx) {
      const g = this.master.gain;
      g.cancelScheduledValues(this.ctx.currentTime);
      g.setTargetAtTime(0, this.ctx.currentTime, 0.08);
      const old = this.master;
      const oldFilter = this.filter;
      setTimeout(() => {
        try {
          old.disconnect();
          oldFilter?.disconnect();
        } catch {}
      }, 400);
    }
    this.master = null;
    this.filter = null;
  }

  get playing() {
    return this.timer !== null;
  }

  private pluck(freq: number, start: number, length: number) {
    const ctx = this.ctx!;
    const env = ctx.createGain();
    env.connect(this.filter!);

    // Soft, warm attack (avoids clicks and harsh transients)
    env.gain.setValueAtTime(0, start);
    env.gain.linearRampToValueAtTime(1, start + 0.022);
    // Warm natural exponential decay
    env.gain.exponentialRampToValueAtTime(0.0008, start + Math.max(1.3, length * 2.2));

    // Pure, in-tune harmonic profile for a soothing, mellow acoustic sound
    for (const [mult, level, type] of [
      [1, 0.74, "sine"],       // Pure fundamental
      [2, 0.16, "sine"],       // Clean 1st octave overtone
      [0.5, 0.14, "sine"],     // Sub-harmonic warmth
      [3, 0.03, "sine"],       // Subtle warm glow
    ] as const) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq * mult;
      gain.gain.value = level;
      osc.connect(gain).connect(env);
      osc.start(start);
      osc.stop(start + Math.max(1.4, length * 2.3));
    }
  }
}
