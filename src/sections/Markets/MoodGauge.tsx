import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useEffect, useRef } from "react";
import { Spotlight } from "../../components/Spotlight";
import { MOOD, MOOD_LABEL, PULSE, SIM_LABEL } from "./data";
import styles from "./MoodGauge.module.css";

const CX = 120;
const CY = 116;
const R = 92;
const NEEDLE = 78;

const angle = (v: number) => Math.PI * (1 - v / 100);
const ARC = `M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`;

const TICKS = Array.from({ length: 21 }, (_, i) => {
  const v = i * 5;
  const major = v % 25 === 0;
  const a = angle(v);
  const reach = R + (major ? 19 : 13);
  return {
    v,
    major,
    x1: CX + (R + 8) * Math.cos(a),
    y1: CY - (R + 8) * Math.sin(a),
    x2: CX + reach * Math.cos(a),
    y2: CY - reach * Math.sin(a),
  };
});

export function MoodGauge() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduced = useReducedMotion();
  const value = useMotionValue(reduced ? MOOD : 0);

  const tipX = useTransform(() => CX + NEEDLE * Math.cos(angle(value.get())));
  const tipY = useTransform(() => CY - NEEDLE * Math.sin(angle(value.get())));
  const filled = useTransform(value, [0, 100], [0, 1]);
  const reading = useTransform(() => Math.round(Math.min(Math.max(value.get(), 0), 100)).toString());

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      value.set(MOOD);
      return;
    }
    const controls = animate(value, MOOD, { type: "spring", bounce: 0.22, visualDuration: 1.25, delay: 0.15 });
    return () => controls.stop();
  }, [inView, reduced, value]);

  return (
    <Spotlight className={styles.card}>
      <div ref={ref} className={styles.inner}>
        <header className={styles.head}>
          <h3 className={styles.title}>Market mood</h3>
          <p className={styles.sim}>{SIM_LABEL}</p>
        </header>

        <p className={styles.pulse}>{PULSE}</p>

        <figure className={styles.dial}>
          <svg
            className={styles.svg}
            viewBox="0 0 240 132"
            role="img"
            aria-label={`Market mood ${MOOD} out of 100, ${MOOD_LABEL}. Simulated.`}
          >
            {TICKS.map((t) => (
              <line key={t.v} className={t.major ? styles.tickMajor : styles.tick} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} />
            ))}
            <path className={styles.track} d={ARC} />
            <motion.path className={styles.fill} d={ARC} style={{ pathLength: filled }} />
            <motion.line className={styles.needle} x1={CX} y1={CY} x2={tipX} y2={tipY} />
            <circle className={styles.hub} cx={CX} cy={CY} r={6} />
            <circle className={styles.hubDot} cx={CX} cy={CY} r={2} />
          </svg>

          <figcaption className={styles.scale} aria-hidden>
            <span className={styles.end}>fearful</span>
            <span className={styles.read}>
              <motion.span className={styles.number}>{reading}</motion.span>
              <span className={styles.word}>/ 100 · {MOOD_LABEL}</span>
            </span>
            <span className={`${styles.end} ${styles.endRight}`}>greedy</span>
          </figcaption>
        </figure>
      </div>
    </Spotlight>
  );
}
