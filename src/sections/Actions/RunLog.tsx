import { AnimatePresence, motion, useIsPresent, useReducedMotion } from "motion/react";
import { Check, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../../components/Button";
import { ease, spring } from "../../lib/motion";
import type { RunRequest, Step } from "./data";
import styles from "./Actions.module.css";

const LEAD_MS = 420;
const GAP_MS = 760;
const WORK_MS = 620;

type Decision = "approved" | "cancelled";
type RowState = "running" | "done" | "waiting" | Decision;

const STATE_LABEL: Record<RowState, string> = {
  running: "Running. ",
  done: "Done. ",
  waiting: "Waiting for you. ",
  approved: "Approved. ",
  cancelled: "Cancelled. ",
};

function Spinner() {
  return (
    <svg className={styles.spinner} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <circle className={styles.spinnerTrack} cx="7" cy="7" r="5.5" strokeWidth="1.5" />
      <path className={styles.spinnerArc} d="M7 1.5A5.5 5.5 0 0 1 12.5 7" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function Ring() {
  const reduced = useReducedMotion();
  return (
    <span className={styles.ring} aria-hidden>
      {reduced ? null : (
        <motion.span
          className={styles.ringHalo}
          animate={{ scale: [1, 2.1], opacity: [0.4, 0] }}
          transition={{ duration: 2.4, ease: ease.out, repeat: Infinity }}
        />
      )}
      <span className={styles.ringCore} />
    </span>
  );
}

function Mark({ state }: { state: RowState }) {
  return (
    <span className={styles.mark}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={state}
          className={styles.markIcon}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.1 } }}
          transition={spring.snappy}
        >
          {state === "running" ? <Spinner /> : null}
          {state === "waiting" ? <Ring /> : null}
          {state === "done" || state === "approved" ? <Check size={14} strokeWidth={1.75} aria-hidden /> : null}
          {state === "cancelled" ? <X size={14} strokeWidth={1.75} aria-hidden /> : null}
        </motion.span>
      </AnimatePresence>
      <span className="sr-only">{STATE_LABEL[state]}</span>
    </span>
  );
}

function Result({ decision }: { decision: Decision }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, []);

  return (
    <motion.p
      ref={ref}
      tabIndex={-1}
      className={styles.result}
      initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.3, ease: ease.out }}
    >
      {decision === "approved" ? "Sent" : "Cancelled. Nothing was sent."}
    </motion.p>
  );
}

type RowProps = {
  step: Step;
  state: RowState;
  onDecide: (decision: Decision) => void;
};

function Row({ step, state, onDecide }: RowProps) {
  const resolved = state === "approved" || state === "cancelled" ? state : null;

  return (
    <motion.li
      className={styles.row}
      data-state={state}
      initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={spring.snappy}
    >
      <Mark state={state} />
      {step.spoken ? <span className={styles.toolSpoken}>{step.tool}</span> : <code className={styles.tool}>{step.tool}</code>}
      <div className={styles.body}>
        {step.gate ? (
          <AnimatePresence mode="wait" initial={false}>
            {resolved ? (
              <Result key="result" decision={resolved} />
            ) : (
              <motion.div key="ask" exit={{ opacity: 0, filter: "blur(4px)", transition: { duration: 0.14 } }}>
                <p className={styles.gateTitle}>Waiting for you</p>
                <p>{step.text}</p>
                <div className={styles.gateActions}>
                  <Button size="sm" onClick={() => onDecide("approved")}>
                    Approve
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => onDecide("cancelled")}>
                    Not now
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        ) : step.spoken ? (
          <p className={styles.spoken}>“{step.text}”</p>
        ) : (
          <p>{step.text}</p>
        )}
      </div>
    </motion.li>
  );
}

type RunLogProps = {
  request: RunRequest;
  play: boolean;
  onStatus: (message: string) => void;
};

export function RunLog({ request, play, onStatus }: RunLogProps) {
  const isPresent = useIsPresent();
  const [shown, setShown] = useState(0);
  const [done, setDone] = useState(0);
  const [decision, setDecision] = useState<Decision | null>(null);
  const live = play && isPresent;

  useEffect(() => {
    if (!live) return;
    const timers: number[] = [];
    request.steps.forEach((step, i) => {
      const at = LEAD_MS + i * GAP_MS;
      timers.push(window.setTimeout(() => setShown(i + 1), at));
      if (!step.gate) timers.push(window.setTimeout(() => setDone(i + 1), at + WORK_MS));
    });
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [live, request]);

  const total = request.steps.length;
  const last = request.steps[total - 1];
  let status = "";
  if (decision === "approved") status = "Sent.";
  else if (decision === "cancelled") status = "Cancelled. Nothing was sent.";
  else if (last.gate && shown === total) status = `Waiting for you. ${last.text}`;
  else if (!last.gate && done === total) status = last.text;

  useEffect(() => {
    if (live && status) onStatus(status);
  }, [live, status, onStatus]);

  return (
    <ol className={styles.log}>
      {request.steps.slice(0, shown).map((step, i) => (
        <Row
          key={i}
          step={step}
          state={step.gate ? (decision ?? "waiting") : i < done ? "done" : "running"}
          onDecide={setDecision}
        />
      ))}
    </ol>
  );
}
