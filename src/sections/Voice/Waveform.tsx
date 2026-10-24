import { useEffect, useRef } from "react";
import type { Phase, Speaker } from "./demo";
import { createWaveform, type WaveformEngine } from "./signal";
import styles from "./Waveform.module.css";

type WaveformProps = {
  speaker: Speaker;
  phase: Phase;
  /** Changes whenever a cycle (re)starts. */
  run: number;
  /** False while paused or before the load choreography ends. */
  playing: boolean;
  reduced: boolean;
};

export function Waveform({ speaker, phase, run, playing, reduced }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<WaveformEngine | null>(null);
  const flags = useRef({ playing, reduced });
  const syncRef = useRef<() => void>(() => {});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = createWaveform(canvas);
    engineRef.current = engine;

    let onScreen = false;
    let tabVisible = !document.hidden;
    let frame = 0;
    let last = 0;

    const tick = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      engine.step(dt);
      engine.draw();
      frame = requestAnimationFrame(tick);
    };

    const sync = () => {
      const active = onScreen && tabVisible && flags.current.playing && !flags.current.reduced;
      if (active && !frame) {
        last = 0;
        engine.resume();
        frame = requestAnimationFrame(tick);
      } else if (!active && frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };
    syncRef.current = sync;

    const resizeObserver = new ResizeObserver((entries) => {
      const box = entries[0].contentRect;
      engine.resize(box.width, box.height, window.devicePixelRatio || 1);
      engine.draw();
    });
    resizeObserver.observe(canvas);

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    intersectionObserver.observe(canvas);

    const onVisibility = () => {
      tabVisible = !document.hidden;
      sync();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      syncRef.current = () => {};
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    flags.current = { playing, reduced };
    syncRef.current();
  }, [playing, reduced]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.input(speaker, phase);
    if (reduced) {
      engine.pose(speaker, phase);
      engine.draw();
    }
  }, [speaker, phase, reduced]);

  useEffect(() => {
    engineRef.current?.interrupt();
  }, [run, speaker]);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden />;
}
