import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { ease, inViewOnce } from "../../lib/motion";
import styles from "./SignalLine.module.css";

const WIDTH = 1440;
const HEIGHT = 200;
const STEP = 12;
const POINTS = WIDTH / STEP;
const AMPLITUDE = 22;

function trace(t: number, energy: number) {
  let d = "";
  for (let i = 0; i <= POINTS; i++) {
    const u = i / POINTS;
    const taper = Math.sin(Math.PI * u) ** 1.6;
    const swell = 0.55 + 0.45 * Math.sin(t * 0.55 + u * 5.2);
    const wave = Math.sin(u * 23 + t * 1.15) * 0.55 + Math.sin(u * 9 - t * 0.7) * 0.35 + Math.sin(u * 41 + t * 1.9) * 0.1;
    const y = HEIGHT / 2 + taper * swell * wave * AMPLITUDE * energy;
    d += `${i ? "L" : "M"}${i * STEP} ${y.toFixed(2)}`;
  }
  return d;
}

const STILL = trace(2.4, 1);

type SignalLineProps = {
  /** Raises the swell while the visitor is typing. */
  listening: boolean;
};

export function SignalLine({ listening }: SignalLineProps) {
  const reduced = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const listeningRef = useRef(listening);
  const shown = useInView(wrapRef, inViewOnce);

  useEffect(() => {
    listeningRef.current = listening;
  }, [listening]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const path = pathRef.current;
    if (!wrap || !path) return;

    if (reduced) {
      path.setAttribute("d", STILL);
      return;
    }

    let raf = 0;
    let visible = false;
    let last = 0;
    let t = 2.4;
    let energy = 1;

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;
      energy += ((listeningRef.current ? 2.1 : 1) - energy) * Math.min(1, dt * 3.5);
      path.setAttribute("d", trace(t, energy));
      raf = requestAnimationFrame(frame);
    };

    const sync = () => {
      const run = visible && !document.hidden;
      if (run && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      } else if (!run && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sync();
      },
      { threshold: 0 },
    );
    observer.observe(wrap);
    document.addEventListener("visibilitychange", sync);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <div ref={wrapRef} className={styles.trace} aria-hidden>
      <motion.div
        className={styles.reveal}
        initial={reduced ? false : { clipPath: "inset(0 100% 0 0)" }}
        animate={shown ? { clipPath: "inset(0 0% 0 0)" } : undefined}
        transition={{ duration: 1.6, ease: ease.out }}
      >
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none">
          <path ref={pathRef} d={STILL} />
        </svg>
      </motion.div>
    </div>
  );
}
