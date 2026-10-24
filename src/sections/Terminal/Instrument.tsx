import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useId, useRef, useState, type KeyboardEvent } from "react";
import { Spotlight } from "../../components/Spotlight";
import { spring } from "../../lib/motion";
import { CommandBar } from "./CommandBar";
import { FKEYS, run, seed } from "./functions";
import { KeyBar } from "./KeyBar";
import { MonitorBody } from "./MonitorBody";
import { Swap } from "./motion";
import { OutputBody } from "./OutputBody";
import { Pane, type PaneId } from "./Pane";
import { parse } from "./parser";
import { SPANS, type AddedTask, type Result } from "./types";
import { useDemo } from "./useDemo";
import styles from "./Terminal.module.css";

type Chip = NonNullable<Result["chip"]>;

function SpanChips({ chip, onRun }: { chip: Chip; onRun: (command: string) => void }) {
  const uid = useId();
  return (
    <motion.div
      className={styles.chips}
      role="group"
      aria-label="Chart window"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.1 } }}
    >
      {SPANS.map((s) => {
        const on = s === chip.active;
        return (
          <button
            key={s}
            type="button"
            className={styles.chipBtn}
            aria-pressed={on}
            onClick={() => onRun(`${chip.ticker} GP ${s}`)}
          >
            {on ? <motion.span layoutId={`${uid}-span`} className={styles.chipPill} transition={spring.snappy} /> : null}
            <span className={styles.chipLabel}>{s}</span>
          </button>
        );
      })}
    </motion.div>
  );
}

export function Instrument() {
  const uid = useId();
  const reduced = useReducedMotion();
  const frameRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const added = useRef<AddedTask[]>([]);
  const counter = useRef(0);

  const [value, setValue] = useState("");
  const [pane, setPane] = useState<PaneId>(2);
  const [announce, setAnnounce] = useState(false);
  const [result, setResult] = useState<Result>(() => seed(Boolean(reduced)));

  const execute = useCallback((raw: string, by: "visitor" | "demo") => {
    const cmd = parse(raw);
    if (!cmd) return;
    if (cmd.fn === "TASK") added.current = [...added.current, { text: cmd.text, due: cmd.due }];
    const outcome = run(cmd, { added: added.current });
    counter.current += 1;
    const id = String(counter.current);
    setResult((prev) => ({ ...outcome, id, monitor: outcome.monitor ?? prev.monitor }));
    setValue("");
    setPane(2);
    if (by === "visitor") setAnnounce(true);
  }, []);

  const runVisitor = useCallback((raw: string) => execute(raw, "visitor"), [execute]);
  const runDemo = useCallback((raw: string) => execute(raw, "demo"), [execute]);

  const { typing, stop } = useDemo({ frameRef, enabled: !reduced, run: runDemo, setValue });

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
    if (e.key === "/" && !(e.target instanceof HTMLInputElement)) {
      e.preventDefault();
      frameRef.current?.querySelector("input")?.focus();
      return;
    }
    const hit = FKEYS.find((f) => f.key === e.key);
    if (!hit) return;
    e.preventDefault();
    runVisitor(hit.command);
  };

  const ringId = `${uid}-ring`;

  return (
    <Spotlight className={styles.frame}>
      <div
        ref={frameRef}
        role="group"
        aria-label="JARVIS terminal. A simulated demo."
        className={styles.inner}
        onKeyDown={onKeyDown}
        onKeyDownCapture={stop}
        onPointerDownCapture={stop}
        onFocusCapture={stop}
      >
        <CommandBar value={value} onValue={setValue} onRun={runVisitor} inputRef={inputRef} typing={typing} />

        <div className={styles.body}>
          <Pane
            n={1}
            title="Monitor"
            sub={result.monitor.sub}
            titleId={`${uid}-t1`}
            active={pane === 1}
            ringId={ringId}
            onActivate={setPane}
            className={styles.paneMonitor}
          >
            <MonitorBody monitor={result.monitor} bandId={`${uid}-band`} onRun={runVisitor} />
          </Pane>

          <Pane
            n={2}
            title="Output"
            sub={result.title}
            titleId={`${uid}-t2`}
            active={pane === 2}
            ringId={ringId}
            onActivate={setPane}
            className={styles.paneOut}
            bodyClassName={styles.out}
            extra={
              <AnimatePresence initial={false}>
                {result.chip ? <SpanChips key="chips" chip={result.chip} onRun={runVisitor} /> : null}
              </AnimatePresence>
            }
          >
            <Swap id={result.id}>
              <OutputBody output={result.output} onRun={runVisitor} />
            </Swap>
          </Pane>

          <Pane
            n={3}
            title="Plain English"
            titleId={`${uid}-t3`}
            active={pane === 3}
            ringId={ringId}
            onActivate={setPane}
            className={styles.panePlain}
          >
            <div className={styles.plain} aria-live={announce ? "polite" : "off"} aria-atomic="true">
              <Swap id={result.id}>
                <p className={styles.plainText}>{result.plain}</p>
              </Swap>
            </div>
          </Pane>
        </div>

        <KeyBar current={result.fkey} onKey={runVisitor} onSlash={() => inputRef.current?.focus()} />
      </div>
    </Spotlight>
  );
}
