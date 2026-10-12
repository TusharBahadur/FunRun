"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Status = "idle" | "listening" | "denied" | "unsupported";

/**
 * Listens to the microphone and calls `onBlow` when it hears a sustained,
 * breathy burst — what blowing at a phone sounds like. Nothing is recorded
 * or sent anywhere; audio is only measured for loudness in the browser.
 */
export function useBlowDetector(onBlow: () => void) {
  const [status, setStatus] = useState<Status>("idle");
  const cleanup = useRef<(() => void) | null>(null);
  const callback = useRef(onBlow);

  useEffect(() => {
    callback.current = onBlow;
  }, [onBlow]);

  const stop = useCallback(() => {
    cleanup.current?.();
    cleanup.current = null;
    setStatus((s) => (s === "listening" ? "idle" : s));
  }, []);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("unsupported");
      return;
    }
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
    } catch {
      setStatus("denied");
      return;
    }

    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    ctx.createMediaStreamSource(stream).connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);

    let loud = 0;
    let frame = requestAnimationFrame(function listen() {
      analyser.getByteFrequencyData(data);
      // Blowing is broadband noise concentrated in the low bins.
      let sum = 0;
      const bins = Math.floor(data.length / 4);
      for (let i = 0; i < bins; i++) sum += data[i];
      const level = sum / bins / 255;

      loud = level > 0.42 ? loud + 1 : Math.max(0, loud - 1);
      if (loud > 12) {
        callback.current();
        cleanup.current?.();
        cleanup.current = null;
        setStatus("idle");
        return;
      }
      frame = requestAnimationFrame(listen);
    });

    cleanup.current = () => {
      cancelAnimationFrame(frame);
      stream.getTracks().forEach((t) => t.stop());
      void ctx.close();
    };
    setStatus("listening");
  }, []);

  useEffect(() => () => cleanup.current?.(), []);

  return { status, start, stop };
}
