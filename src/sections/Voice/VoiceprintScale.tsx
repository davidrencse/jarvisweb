import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect } from "react";
import { ease, spring } from "../../lib/motion";
import { THRESHOLD } from "./demo";
import styles from "./VoiceprintScale.module.css";

export type Verdict = "pass" | "fail" | null;

type VoiceprintScaleProps = {
  /** Score the marker should sit at; 0 while waiting for a voice. */
  target: number;
  verdict: Verdict;
  reduced: boolean;
};

const tickLeft = `${THRESHOLD * 100}%`;

export function VoiceprintScale({ target, verdict, reduced }: VoiceprintScaleProps) {
  const score = useMotionValue(0);
  const count = useMotionValue(0);
  const left = useTransform(score, [0, 1], ["0%", "100%"]);
  const text = useTransform(() => count.get().toFixed(2));

  useEffect(() => {
    if (reduced) {
      score.set(target);
      count.set(target);
      return;
    }
    const move = animate(score, target, spring.snappy);
    const tally = animate(count, target, { duration: target === 0 ? 0.3 : 0.8, ease: ease.out });
    return () => {
      move.stop();
      tally.stop();
    };
  }, [target, reduced, score, count]);

  return (
    <div className={styles.scale} data-verdict={verdict ?? "pending"} aria-hidden>
      <span className={styles.name}>voiceprint</span>

      <div className={styles.rail}>
        <span className={styles.end}>0.00</span>
        <div className={styles.track}>
          <span className={styles.base} />
          <motion.span className={styles.fill} style={{ scaleX: score, originX: 0 }} />
          <span className={styles.tick} style={{ left: tickLeft }} />
          <span className={styles.tickLabel} style={{ left: tickLeft }}>
            threshold {THRESHOLD.toFixed(2)}
          </span>
          <motion.span className={styles.marker} style={{ left }} />
        </div>
        <span className={styles.end}>1.00</span>
      </div>

      <p className={styles.readout}>
        <motion.span className={styles.number}>{text}</motion.span>
        <AnimatePresence mode="wait" initial={false}>
          {verdict ? (
            <motion.span
              key={verdict}
              className={styles.verdict}
              initial={reduced ? { opacity: 0 } : { opacity: 0, filter: "blur(4px)" }}
              animate={reduced ? { opacity: 1 } : { opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{ duration: 0.4, ease: ease.out }}
            >
              {verdict === "pass" ? "· it’s you" : "· not you"}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </p>
    </div>
  );
}
