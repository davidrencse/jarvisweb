import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useEffect } from "react";
import { ease } from "../../lib/motion";

type CountUpProps = {
  to: number;
  decimals?: number;
  /** Starts once, when it turns true. */
  play: boolean;
  delay?: number;
  duration?: number;
  linear?: boolean;
};

export function CountUp({ to, decimals = 0, play, delay = 0, duration = 0.9, linear = false }: CountUpProps) {
  const reduce = useReducedMotion();
  const value = useMotionValue(reduce ? to : 0);
  const text = useTransform(() => value.get().toFixed(decimals));

  useEffect(() => {
    if (!play) return;
    if (reduce) {
      value.set(to);
      return;
    }
    const controls = animate(value, to, { duration, delay, ease: linear ? "linear" : ease.out });
    return () => controls.stop();
  }, [play, reduce, to, duration, delay, linear, value]);

  return <motion.span>{text}</motion.span>;
}

type TypedProps = {
  text: string;
  play: boolean;
  delay?: number;
  duration?: number;
};

export function Typed({ text, play, delay = 0, duration = 0.7 }: TypedProps) {
  const reduce = useReducedMotion();
  const count = useMotionValue(reduce ? text.length : 0);
  const shown = useTransform(() => text.slice(0, Math.round(count.get())));

  useEffect(() => {
    if (!play) return;
    if (reduce) {
      count.set(text.length);
      return;
    }
    const controls = animate(count, text.length, { duration, delay, ease: "linear" });
    return () => controls.stop();
  }, [play, reduce, text, duration, delay, count]);

  return <motion.span>{shown}</motion.span>;
}
