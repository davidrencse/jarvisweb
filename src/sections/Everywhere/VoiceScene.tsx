import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { TranscribeVoiceMessage } from "@/components/voice-transcribe";
import { ease } from "../../lib/motion";
import styles from "./VoiceScene.module.css";

const BRIEF = [
  "Your OS assignment is due Thursday at 5 pm.",
  "Friday morning is blocked for the drone build.",
  "Next step on the drone: pick a flight controller.",
];

const SYLLABLES: [centre: number, spread: number, height: number][] = [
  [70, 22, 9],
  [150, 28, 17],
  [250, 20, 12],
  [330, 34, 22],
  [450, 26, 14],
  [540, 30, 26],
  [640, 22, 12],
  [720, 32, 20],
  [830, 26, 13],
  [910, 20, 8],
];

function buildWave() {
  const count = 250;
  let d = "";
  for (let i = 0; i <= count; i++) {
    const x = (i / count) * 1000;
    let envelope = 0.4;
    for (const [centre, spread, height] of SYLLABLES) {
      envelope += height * Math.exp(-((x - centre) ** 2) / (2 * spread * spread));
    }
    const texture = Math.sin(i * 1.9) * 0.6 + Math.sin(i * 0.77 + 1) * 0.4;
    d += `${i ? "L" : "M"}${x.toFixed(1)} ${(32 + envelope * texture).toFixed(2)}`;
  }
  return d;
}

const WAVE = buildWave();

export function VoiceScene() {
  const reduced = useReducedMotion();
  const [heard, setHeard] = useState(false);

  return (
    <div className={styles.root}>
      <div className={styles.copy}>
        <TranscribeVoiceMessage
          duration={2}
          transcription="Jarvis, brief me."
          autoPlayDelay={500}
          onEnded={() => setHeard(true)}
          bubbleClassName={styles.bubble}
        />
        <ul className={styles.brief} aria-live="polite">
          {BRIEF.map((line, i) => (
            <motion.li
              key={line}
              className={styles.line}
              initial={{ opacity: 0, y: 12, filter: "blur(5px)" }}
              animate={heard ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
              transition={{ duration: 0.8, ease: ease.out, delay: 0.15 + i * 0.14 }}
            >
              {line}
            </motion.li>
          ))}
        </ul>
      </div>

      <motion.div
        className={styles.wave}
        initial={reduced ? false : { clipPath: "inset(0 100% 0 0)" }}
        animate={heard ? { clipPath: "inset(0 0% 0 0)" } : undefined}
        transition={{ duration: 1.3, ease: ease.out, delay: 0.2 }}
        aria-hidden
      >
        <svg viewBox="0 0 1000 64" preserveAspectRatio="none">
          <path d={WAVE} />
        </svg>
      </motion.div>
    </div>
  );
}
