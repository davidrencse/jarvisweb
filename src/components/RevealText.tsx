import { motion, type Variants } from "motion/react";
import { ease, inViewOnce } from "../lib/motion";
import styles from "./RevealText.module.css";

type Tag = "h1" | "h2" | "h3" | "p" | "span";

type RevealTextProps = {
  /** Text to reveal. A "\n" forces a line break. */
  text: string;
  as?: Tag;
  className?: string;
  id?: string;
  /** "rise" slides each word up out of a mask; "blur" focuses each word in. */
  variant?: "rise" | "blur";
  /** "mount" plays immediately; "inView" waits until scrolled into view. */
  trigger?: "mount" | "inView";
  delay?: number;
  /** Seconds between words. */
  step?: number;
};

const rise: Variants = {
  hidden: { y: "108%" },
  show: { y: "0%", transition: { duration: 0.95, ease: ease.out } },
};

const blur: Variants = {
  hidden: { opacity: 0, y: "0.35em", filter: "blur(10px)" },
  show: {
    opacity: 1,
    y: "0em",
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: ease.out },
  },
};

export function RevealText({
  text,
  as = "h2",
  className,
  id,
  variant = "rise",
  trigger = "inView",
  delay = 0,
  step = 0.055,
}: RevealTextProps) {
  const MotionTag = motion[as];
  const lines = text.split("\n");
  const word = variant === "rise" ? rise : blur;

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: step, delayChildren: delay } },
  };

  const playProps =
    trigger === "mount"
      ? { initial: "hidden", animate: "show" }
      : { initial: "hidden", whileInView: "show", viewport: inViewOnce };

  return (
    <MotionTag id={id} className={className} variants={container} {...playProps}>
      {lines.map((line, li) => (
        <span key={li} className={styles.line}>
          {line.split(" ").map((w, wi, arr) => (
            <span key={wi}>
              <span className={variant === "rise" ? styles.mask : styles.plain}>
                <motion.span className={styles.word} variants={word}>
                  {w}
                </motion.span>
              </span>
              {wi < arr.length - 1 ? " " : null}
            </span>
          ))}
        </span>
      ))}
    </MotionTag>
  );
}
