import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect } from "react";
import { ease } from "../../lib/motion";
import type { Dir } from "./data";
import styles from "./Cluster.module.css";

type Pt = { x: number; y: number };
type Curve = { a: Pt; c: Pt; b: Pt };

/** A shallow arc between the two machines: across on wide screens, down on narrow ones. */
const WIDE: Curve = { a: { x: 6, y: 52 }, c: { x: 120, y: 4 }, b: { x: 234, y: 52 } };
const TALL: Curve = { a: { x: 40, y: 6 }, c: { x: 72, y: 60 }, b: { x: 40, y: 114 } };

const bez = (p0: number, p1: number, p2: number, u: number) => (1 - u) * (1 - u) * p0 + 2 * (1 - u) * u * p1 + u * u * p2;

function Packet({ curve, back, delay }: { curve: Curve; back: boolean; delay: number }) {
  const t = useMotionValue(0);

  useEffect(() => {
    const controls = animate(t, [0, 1], {
      duration: 1.1,
      delay,
      ease: ease.inOut,
      repeat: Infinity,
      repeatDelay: 0.5,
    });
    return () => controls.stop();
  }, [t, delay]);

  const u = useTransform(t, (v) => (back ? 1 - v : v));
  const cx = useTransform(u, (v) => bez(curve.a.x, curve.c.x, curve.b.x, v));
  const cy = useTransform(u, (v) => bez(curve.a.y, curve.c.y, curve.b.y, v));
  const opacity = useTransform(t, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);

  return <motion.circle r={3.5} cx={cx} cy={cy} style={{ opacity }} className={styles.packet} />;
}

function Arc({ curve, viewBox, dir, play, className }: { curve: Curve; viewBox: string; dir?: Dir; play: boolean; className: string }) {
  const d = `M ${curve.a.x} ${curve.a.y} Q ${curve.c.x} ${curve.c.y} ${curve.b.x} ${curve.b.y}`;
  const out = dir === "out" || dir === "both";
  const back = dir === "back" || dir === "both";
  return (
    <svg viewBox={viewBox} className={className} aria-hidden>
      <path d={d} className={styles.wire} />
      <circle cx={curve.a.x} cy={curve.a.y} r={3} className={styles.port} />
      <circle cx={curve.b.x} cy={curve.b.y} r={3} className={styles.port} />
      {play && out ? <Packet curve={curve} back={false} delay={0} /> : null}
      {play && out ? <Packet curve={curve} back={false} delay={0.55} /> : null}
      {play && back ? <Packet curve={curve} back delay={dir === "both" ? 0.8 : 0} /> : null}
      {play && back ? <Packet curve={curve} back delay={dir === "both" ? 1.35 : 0.55} /> : null}
    </svg>
  );
}

/** The SSH tunnel between the machines, with jobs and frames riding it. */
export function Link({ dir, play }: { dir?: Dir; play: boolean }) {
  return (
    <div className={styles.link}>
      <Arc curve={WIDE} viewBox="0 0 240 60" dir={dir} play={play} className={styles.arcWide} />
      <Arc curve={TALL} viewBox="0 0 80 120" dir={dir} play={play} className={styles.arcTall} />
      <span className={styles.linkLabel}>SSH tunnel</span>
    </div>
  );
}
