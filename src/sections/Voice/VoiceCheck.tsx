import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { Pause, Play } from "lucide-react";
import { useId, useRef, useState } from "react";
import { ease, spring } from "../../lib/motion";
import {
  CAPTION,
  ORDER,
  SCORE,
  VERDICT_TEXT,
  usePageVisible,
  useVoiceCheck,
  type Phase,
  type Speaker,
} from "./demo";
import { Exchange } from "./Exchange";
import { VoiceprintScale, type Verdict } from "./VoiceprintScale";
import { Waveform } from "./Waveform";
import { Spotlight } from "../../components/Spotlight";
import styles from "./VoiceCheck.module.css";

type Tone = "live" | "check" | "solid" | "hollow";

const OPTIONS: readonly { value: Speaker; label: string }[] = [
  { value: "you", label: "Your voice" },
  { value: "stranger", label: "A stranger" },
];

function describe(speaker: Speaker, phase: Phase): { label: string; tone: Tone } {
  switch (phase) {
    case "idle":
    case "speaking":
      return { label: "Listening", tone: "live" };
    case "checking":
      return { label: "Checking voice", tone: "check" };
    case "transcript":
    case "answering":
      return { label: "Answering", tone: "solid" };
    case "ignored":
      return { label: "Ignored", tone: "hollow" };
    case "hold":
      return speaker === "you" ? { label: "Answered", tone: "solid" } : { label: "Ignored", tone: "hollow" };
  }
}

type SegmentedProps = {
  value: Speaker;
  onChange: (speaker: Speaker) => void;
};

function Segmented({ value, onChange }: SegmentedProps) {
  const pillId = useId();
  return (
    <div className={styles.segmented} role="group" aria-label="Voice to try">
      {OPTIONS.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            className={styles.segment}
            aria-pressed={active}
            onClick={() => onChange(option.value)}
          >
            {active ? <motion.span layoutId={pillId} className={styles.pill} transition={spring.layout} /> : null}
            <span className={styles.segmentLabel}>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function VoiceCheck() {
  const reduced = !!useReducedMotion();
  const frame = useRef<HTMLDivElement>(null);
  const inView = useInView(frame, { amount: 0.2 });
  const seen = useInView(frame, { once: true, amount: 0.25 });
  const pageVisible = usePageVisible();
  const [started, setStarted] = useState(false);
  const running = started && inView && pageVisible;
  const [state, dispatch] = useVoiceCheck(running, reduced);
  const { speaker, phase, run, paused } = state;

  const { label, tone } = describe(speaker, phase);
  const target = ORDER[phase] >= ORDER.checking ? SCORE[speaker] : 0;
  const verdict: Verdict = ORDER[phase] >= ORDER.transcript ? (speaker === "you" ? "pass" : "fail") : null;
  const announcement = phase === "hold" ? VERDICT_TEXT[speaker] : "";

  return (
    <div ref={frame}>
    <Spotlight>
    <motion.figure
      className={styles.instrument}
      initial={reduced ? { opacity: 0 } : { clipPath: "inset(0 100% 0 0 round 14px)" }}
      animate={seen ? (reduced ? { opacity: 1 } : { clipPath: "inset(0 0% 0 0 round 14px)" }) : undefined}
      transition={{ duration: reduced ? 0.4 : 1.1, ease: ease.out, delay: reduced ? 0 : 0.15 }}
      onAnimationComplete={() => setStarted(true)}
    >
      <figcaption className="sr-only">{CAPTION}</figcaption>

      <div className={styles.strip}>
        <div className={styles.status} aria-hidden>
          <span className={styles.dot} data-tone={tone} data-paused={paused || !running} />
          <span className={styles.statusText}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={label}
                className={styles.statusLabel}
                initial={reduced ? { opacity: 0 } : { opacity: 0, filter: "blur(3px)" }}
                animate={reduced ? { opacity: 1 } : { opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, transition: { duration: 0.14 } }}
                transition={{ duration: 0.3, ease: ease.out }}
              >
                {label}
              </motion.span>
            </AnimatePresence>
          </span>
        </div>

        <Segmented value={speaker} onChange={(next) => dispatch({ type: "choose", speaker: next })} />

        <div className={styles.meta}>
          <span className={styles.simulated}>Simulated demo</span>
          <motion.button
            type="button"
            className={styles.pause}
            aria-label={paused ? "Play demo" : "Pause demo"}
            onClick={() => dispatch({ type: "toggle" })}
            whileTap={{ scale: 0.92 }}
            transition={spring.press}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={paused ? "play" : "pause"}
                className={styles.pauseIcon}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7, transition: { duration: 0.1 } }}
                transition={{ duration: 0.18, ease: ease.out }}
              >
                {paused ? (
                  <Play size={16} strokeWidth={1.75} aria-hidden />
                ) : (
                  <Pause size={16} strokeWidth={1.75} aria-hidden />
                )}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      <div className={styles.stage} aria-hidden>
        <Waveform speaker={speaker} phase={phase} run={run} playing={started && !paused} reduced={reduced} />
      </div>

      <div className={styles.readout}>
        <VoiceprintScale target={target} verdict={verdict} reduced={reduced} />
        <Exchange speaker={speaker} phase={phase} run={run} reduced={reduced} />
      </div>

      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
    </motion.figure>
    </Spotlight>
    </div>
  );
}
