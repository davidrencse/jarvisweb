import type { Transition, UseInViewOptions } from "motion/react";

export const ease = {
  out: [0.16, 1, 0.3, 1],
  inOut: [0.65, 0, 0.35, 1],
  outQuart: [0.25, 1, 0.5, 1],
} as const;

export const spring = {
  /** Large surfaces arriving: no overshoot, unhurried. */
  soft: { type: "spring", bounce: 0, visualDuration: 0.6 },
  /** Small elements and state changes. */
  snappy: { type: "spring", bounce: 0.12, visualDuration: 0.32 },
  /** Press feedback on controls. */
  press: { type: "spring", stiffness: 700, damping: 38, mass: 0.6 },
  /** Layout moves (reordering, resizing). */
  layout: { type: "spring", bounce: 0.08, visualDuration: 0.45 },
} satisfies Record<string, Transition>;

export const reveal: Transition = { duration: 0.9, ease: ease.out };

/** Default viewport trigger for scroll entrances: once, when a third is visible. */
export const inViewOnce: UseInViewOptions = { once: true, amount: 0.3 };

export const stagger = (step = 0.06, delay = 0) => ({ staggerChildren: step, delayChildren: delay });
