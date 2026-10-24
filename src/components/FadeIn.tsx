import { motion } from "motion/react";
import type { ReactNode } from "react";
import { ease } from "../lib/motion";

type FadeInProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Rise distance in px. */
  y?: number;
  /** Starting blur in px; 0 for none. */
  blur?: number;
  /** Fraction of the element that must be visible before it plays. */
  amount?: number;
  as?: "div" | "li" | "section" | "figure" | "p";
};

export function FadeIn({
  children,
  className,
  delay = 0,
  y = 20,
  blur = 6,
  amount = 0.3,
  as = "div",
}: FadeInProps) {
  const MotionTag = motion[as];
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y, filter: blur ? `blur(${blur}px)` : "none" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.9, ease: ease.out, delay }}
    >
      {children}
    </MotionTag>
  );
}
