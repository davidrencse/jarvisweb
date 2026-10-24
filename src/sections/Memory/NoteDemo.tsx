import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { FileText, Mic } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Button } from "../../components/Button";
import { FadeIn } from "../../components/FadeIn";
import { ease, spring } from "../../lib/motion";
import { Spotlight } from "../../components/Spotlight";
import styles from "./NoteDemo.module.css";

type Task = { text: string; meta: string };
type TaskState = { checked: boolean; struck: boolean; token: boolean };

const TASKS: Task[] = [
  { text: "Pick motors", meta: "due Oct 28 · high" },
  { text: "Pick a flight controller", meta: "due Oct 30 · medium" },
  { text: "Order the frame", meta: "due Nov 3 · medium" },
];

const IDLE: TaskState = { checked: false, struck: false, token: false };

/** [ms from start, stage]. Each stage turns one more thing on. */
const STEPS = [
  [0, 1],
  [520, 2],
  [980, 3],
  [1330, 4],
  [1580, 5],
  [1980, 6],
  [2330, 7],
] as const;

const LAST = 7;
const AUTO_DELAY = 500;
const UPDATED_BEFORE = "2026-10-21";
const UPDATED_AFTER = "2026-10-24";

const enter = { opacity: 0, y: 8, filter: "blur(4px)" };
const shown = { opacity: 1, y: 0, filter: "blur(0px)" };
const leave = { opacity: 0, transition: { duration: 0.12 } };

function TaskRow({ task, state, labelId }: { task: Task; state: TaskState; labelId: string }) {
  const { checked, struck, token } = state;

  return (
    <motion.li layout="position" transition={spring.layout} className={styles.task} data-done={checked}>
      <span
        role="checkbox"
        aria-checked={checked}
        aria-readonly="true"
        aria-labelledby={labelId}
        className={styles.box}
      >
        <motion.span
          aria-hidden
          className={styles.fill}
          initial={false}
          animate={{ clipPath: checked ? "circle(75% at 50% 50%)" : "circle(0% at 50% 50%)" }}
          transition={{ duration: checked ? 0.32 : 0.14, ease: ease.out }}
        />
        <svg className={styles.tick} viewBox="0 0 18 18" aria-hidden>
          <motion.path
            d="M5.2 9.6 8 12.4 13 6.4"
            className={styles.tickPath}
            initial={false}
            animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
            transition={
              checked
                ? {
                    pathLength: { duration: 0.36, delay: 0.12, ease: ease.out },
                    opacity: { duration: 0.01, delay: 0.12 },
                  }
                : { duration: 0.12 }
            }
          />
        </svg>
      </span>

      <span id={labelId} className={styles.taskText}>
        {task.text}
        <motion.span
          aria-hidden
          className={styles.strike}
          style={{ originX: 0 }}
          initial={false}
          animate={{ scaleX: struck ? 1 : 0 }}
          transition={{ duration: struck ? 0.5 : 0.14, ease: ease.out }}
        />
      </span>

      <div className={styles.meta}>
        <motion.span layout="position" transition={spring.layout} className={styles.due}>
          {task.meta}
        </motion.span>
        <AnimatePresence initial={false}>
          {token ? (
            <motion.span
              key="done"
              layout
              className={styles.doneToken}
              initial={{ opacity: 0, x: 14, filter: "blur(4px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(4px)", transition: { duration: 0.12 } }}
              transition={{
                x: spring.snappy,
                opacity: { duration: 0.25, ease: ease.out },
                filter: { duration: 0.3, ease: ease.out },
                layout: spring.layout,
              }}
            >
              done {UPDATED_AFTER}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.li>
  );
}

export function NoteDemo() {
  const uid = useId();
  const reduced = useReducedMotion();
  const docRef = useRef<HTMLElement>(null);
  const inView = useInView(docRef, { once: true, amount: 0.6 });
  const [stage, setStage] = useState(0);
  const timers = useRef<number[]>([]);
  const started = useRef(false);

  const clear = useCallback(() => {
    for (const t of timers.current) window.clearTimeout(t);
    timers.current = [];
  }, []);

  const play = useCallback(() => {
    clear();
    started.current = true;
    if (reduced) {
      setStage(LAST);
      return;
    }
    for (const [at, next] of STEPS) {
      timers.current.push(window.setTimeout(() => setStage(next), at));
    }
  }, [clear, reduced]);

  const reset = useCallback(() => {
    clear();
    started.current = true;
    setStage(0);
  }, [clear]);

  useEffect(() => {
    if (!inView || started.current) return;
    const t = window.setTimeout(() => {
      if (!started.current) play();
    }, AUTO_DELAY);
    return () => window.clearTimeout(t);
  }, [inView, play]);

  useEffect(() => clear, [clear]);

  const first: TaskState = { checked: stage >= 2, struck: stage >= 3, token: stage >= 4 };
  const updated = stage >= 5 ? UPDATED_AFTER : UPDATED_BEFORE;
  const audited = stage >= 6;
  const logged = stage >= 7;
  const speaking = stage === 1 || stage === 2;

  return (
    <div className={styles.demo}>
      <h3 className="sr-only">Example: a task note in the vault</h3>

      <div className={styles.say}>
        <p className={styles.quote} data-active={speaking}>
          <Mic size={16} strokeWidth={1.75} aria-hidden />
          <span>“Jarvis, I finished picking the motors.”</span>
        </p>
        <div className={styles.actions}>
          <Button variant="quiet" size="sm" onClick={play} disabled={stage > 0} className={styles.action}>
            Say it
          </Button>
          <Button variant="quiet" size="sm" onClick={reset} disabled={stage === 0} className={styles.action}>
            Reset
          </Button>
        </div>
        <span className={styles.simulated}>Simulated</span>
      </div>

      <FadeIn>
        <Spotlight>
      <figure ref={docRef} className={styles.doc}>
          <figcaption className={styles.docBar}>
            <FileText size={14} strokeWidth={1.75} aria-hidden />
            <span>projects/drone-blueprint.md</span>
          </figcaption>

          <div className={styles.docBody}>
            <div className={styles.front}>
              <p>
                <span className={styles.fmKey}>type:</span> project
              </p>
              <p>
                <span className={styles.fmKey}>status:</span> active
              </p>
              <p>
                <span className={styles.fmKey}>updated:</span>{" "}
                <span className={styles.fmVal}>
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={updated}
                      initial={{ opacity: 0, filter: "blur(4px)" }}
                      animate={{ opacity: 1, filter: "blur(0px)", transition: { duration: 0.32, ease: ease.out } }}
                      exit={{ opacity: 0, filter: "blur(4px)", transition: { duration: 0.16 } }}
                    >
                      {updated}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </p>
            </div>

            <h4 className={styles.docHeading}>Next step</h4>
            <ul className={styles.tasks} role="list" aria-label="Tasks">
              {TASKS.map((task, i) => (
                <TaskRow
                  key={task.text}
                  task={task}
                  state={i === 0 ? first : IDLE}
                  labelId={`${uid}-task-${i}`}
                />
              ))}
            </ul>
          </div>
        </figure>
      </Spotlight>
      </FadeIn>

      <div className={styles.trail} role="group" aria-label="What JARVIS wrote">
        <AnimatePresence initial={false} mode="popLayout">
          {!audited ? (
            <motion.p
              key="empty"
              className={styles.trailEmpty}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.3, delay: 0.1 } }}
              exit={leave}
            >
              Nothing has been written yet.
            </motion.p>
          ) : null}
          {audited ? (
            <motion.div
              key="audit"
              layout="position"
              className={styles.trailRow}
              initial={enter}
              animate={shown}
              exit={leave}
              transition={{ duration: 0.5, ease: ease.out }}
            >
              <span className={styles.trailKey}>Audit</span>
              <span className={styles.trailLine}>
                <span>.jarvis/vault-writes.jsonl</span>
                <span className={styles.strong}>+1</span>
                <span>task_update done</span>
              </span>
            </motion.div>
          ) : null}
          {logged ? (
            <motion.div
              key="daily"
              layout="position"
              className={styles.trailRow}
              initial={enter}
              animate={shown}
              exit={leave}
              transition={{ duration: 0.5, ease: ease.out }}
            >
              <span className={styles.trailKey}>Today</span>
              <span className={styles.trailLine}>
                <span>14:02 Finished picking the motors</span>
              </span>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {stage === LAST
          ? "Pick motors is done. One write was logged and one line was added to today’s note."
          : ""}
      </p>
    </div>
  );
}
