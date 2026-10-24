import { useReducedMotion } from "motion/react";
import { RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import CopyConfirm from "@/components/copy-confirm";
import styles from "./TerminalScene.module.css";

type Line = { kind: "cmd" | "out" | "note"; text: string; key?: string };

const SCRIPT: Line[] = [
  { kind: "cmd", text: 'jarvis ask "open spotify"' },
  { kind: "out", text: "Spotify’s open." },
  { kind: "cmd", text: "jarvis vault brief" },
  { kind: "out", key: "due", text: "OS assignment, Thursday 5 pm" },
  { kind: "out", key: "plan", text: "Friday morning, drone build" },
  { kind: "out", key: "next", text: "Pick a flight controller" },
  { kind: "note", text: "from your notes, no model, about 20 ms" },
  { kind: "cmd", text: 'jarvis task add "Buy printer paper" --due friday' },
  { kind: "out", key: "added", text: "Buy printer paper, due Friday" },
  { kind: "cmd", text: 'jarvis kb ask "how often does the review routine run?"' },
  { kind: "out", text: "The sources disagree. Waiting for your ruling." },
  { kind: "out", key: "source-001", text: "daily at 02:00" },
  { kind: "out", key: "source-014", text: "weekly on Sundays" },
];

const COMMANDS = SCRIPT.filter((l) => l.kind === "cmd").map((l) => l.text).join("\n");

const TRANSCRIPT = SCRIPT.map((l) => (l.kind === "cmd" ? `$ ${l.text}` : l.key ? `${l.key} ${l.text}` : l.text)).join("\n");

type Cursor = { line: number; chars: number };

const START: Cursor = { line: 0, chars: 0 };
const DONE: Cursor = { line: SCRIPT.length, chars: 0 };
const CHAR_MS = 13;

function buildSteps() {
  const steps: { at: number; cursor: Cursor }[] = [];
  let t = 350;
  SCRIPT.forEach((line, i) => {
    if (line.kind === "cmd") {
      if (i > 0) {
        t += 160;
        steps.push({ at: t, cursor: { line: i, chars: 0 } });
        t += 160;
      }
      for (let c = 1; c <= line.text.length; c++) {
        t += CHAR_MS;
        steps.push({ at: t, cursor: { line: i, chars: c } });
      }
      t += 170;
    } else {
      steps.push({ at: t, cursor: { line: i, chars: line.text.length } });
      t += 70;
    }
  });
  steps.push({ at: t, cursor: DONE });
  return steps;
}

const STEPS = buildSteps();

export function TerminalScene() {
  const reduced = useReducedMotion();
  const [cursor, setCursor] = useState<Cursor>(reduced ? DONE : START);
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (reduced) {
      setCursor(DONE);
      return;
    }
    const origin = performance.now();
    let n = 0;
    let timer = 0;
    const next = () => {
      const step = STEPS[n];
      timer = window.setTimeout(
        () => {
          setCursor(step.cursor);
          n += 1;
          if (n < STEPS.length) next();
        },
        Math.max(0, step.at - (performance.now() - origin)),
      );
    };
    next();
    return () => window.clearTimeout(timer);
  }, [reduced, run]);

  const done = cursor.line >= SCRIPT.length;
  const visible = SCRIPT.slice(0, cursor.line + 1);

  const replay = () => {
    setCursor(START);
    setRun((r) => r + 1);
  };

  return (
    <div className={styles.root}>
      <div className={styles.bar}>
        <span className={styles.title}>Terminal</span>
        <div className={styles.tools}>
          <CopyConfirm valueToCopy={COMMANDS} copyText="Copy commands" label="Copy the commands" />
          <button type="button" className={styles.replay} onClick={replay} disabled={!done} aria-label="Replay the session">
            <RotateCcw size={15} strokeWidth={1.75} aria-hidden />
          </button>
        </div>
      </div>

      <pre className="sr-only">{TRANSCRIPT}</pre>

      <div className={styles.body} aria-hidden>
        {visible.map((line, i) => {
          const active = i === cursor.line;
          if (line.kind === "cmd") {
            const text = active ? line.text.slice(0, cursor.chars) : line.text;
            return (
              <div key={i} className={styles.cmd}>
                <span className={styles.prompt}>$ </span>
                {text}
                {active ? <span className={styles.caret} /> : null}
              </div>
            );
          }
          if (line.kind === "note") {
            return (
              <div key={i} className={styles.note}>
                {line.text}
              </div>
            );
          }
          return (
            <div key={i} className={line.key ? styles.row : styles.out}>
              {line.key ? <span className={styles.key}>{line.key}</span> : null}
              <span>{line.text}</span>
            </div>
          );
        })}
        {done ? (
          <div className={styles.cmd}>
            <span className={styles.prompt}>$ </span>
            <span className={`${styles.caret} ${styles.idle}`} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
