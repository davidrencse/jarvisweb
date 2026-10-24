import { AnimatePresence, motion } from "motion/react";
import { IGNORED, ORDER, REPLY, TIMINGS, TRANSCRIPT, blurIn, type Phase, type Speaker } from "./demo";
import styles from "./Exchange.module.css";

type ExchangeProps = {
  speaker: Speaker;
  phase: Phase;
  run: number;
  reduced: boolean;
};

const WORDS = TRANSCRIPT.split(" ");

export function Exchange({ speaker, phase, run, reduced }: ExchangeProps) {
  const shown = ORDER[phase] >= ORDER.transcript;
  const you = speaker === "you";
  const reached = (p: Phase) => ORDER[phase] >= ORDER[p];

  return (
    <div className={styles.exchange} aria-hidden>
      <div className={styles.ghost}>
        <p className={styles.said}>{TRANSCRIPT}</p>
        <p className={styles.reply}>
          {REPLY.map((sentence) => (
            <span key={sentence} className={styles.sentence}>
              {sentence}
            </span>
          ))}
        </p>
        <p className={styles.timings}>{TIMINGS.join(" · ")}</p>
      </div>

      <AnimatePresence mode="wait">
        {shown ? (
          <motion.div
            key={`${speaker}-${run}`}
            className={styles.live}
            exit={reduced ? { opacity: 0 } : { opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.22 }}
          >
            <p className={styles.said}>
              {you
                ? WORDS.map((word, i) => (
                    <motion.span key={i} className={styles.word} {...blurIn(reduced, i * 0.13)}>
                      {i === 0 ? `“${word}` : i === WORDS.length - 1 ? `${word}”` : word}
                    </motion.span>
                  ))
                : null}
            </p>

            <p className={styles.reply} data-tone={you ? "ink" : "muted"}>
              {you
                ? reached("answering")
                  ? REPLY.map((sentence, i) => (
                      <motion.span key={sentence} className={styles.sentence} {...blurIn(reduced, i * 0.9)}>
                        {sentence}
                      </motion.span>
                    ))
                  : null
                : IGNORED.map((sentence, i) => (
                    <motion.span key={sentence} className={styles.sentence} {...blurIn(reduced, i * 0.5)}>
                      {sentence}
                    </motion.span>
                  ))}
            </p>

            <p className={styles.timings}>
              {you && reached("hold")
                ? TIMINGS.map((timing, i) => (
                    <motion.span key={timing} className={styles.timing} {...blurIn(reduced, i * 0.1)}>
                      {timing}
                      {i < TIMINGS.length - 1 ? " ·" : ""}
                    </motion.span>
                  ))
                : null}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
