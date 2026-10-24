import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useEffect, useMemo } from "react";
import { ease } from "../../lib/motion";

type CountUpProps = {
  to: number;
  from?: number;
  /** Starts counting when it turns true. */
  play: boolean;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  delay?: number;
};

export function CountUp({ to, from = 0, play, decimals = 0, prefix = "", suffix = "", duration = 1.1, delay = 0 }: CountUpProps) {
  const reduced = useReducedMotion();
  const format = useMemo(
    () => new Intl.NumberFormat("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }),
    [decimals],
  );
  const value = useMotionValue(reduced ? to : from);
  const text = useTransform(() => `${prefix}${format.format(value.get())}${suffix}`);

  useEffect(() => {
    if (!play) return;
    if (reduced) {
      value.set(to);
      return;
    }
    const controls = animate(value, to, { duration, delay, ease: ease.out });
    return () => controls.stop();
  }, [play, reduced, to, duration, delay, value]);

  return (
    <>
      <span className="sr-only">{`${prefix}${format.format(to)}${suffix}`}</span>
      <motion.span aria-hidden>{text}</motion.span>
    </>
  );
}
