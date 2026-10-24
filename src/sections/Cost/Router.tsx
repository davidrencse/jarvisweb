import { motion, useInView, useReducedMotion } from "motion/react";
import { Check, Pause, Play } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { FadeIn } from "../../components/FadeIn";
import { spring } from "../../lib/motion";
import { EXAMPLES, ROUTES } from "./data";
import { Spotlight } from "../../components/Spotlight";
import styles from "./Cost.module.css";

const CYCLE_MS = 3500;
const CYCLE_REDUCED_MS = 5500;
const BAND_RADIUS = 8;

function usePageHidden() {
  const [hidden, setHidden] = useState(() => document.hidden);

  useEffect(() => {
    const onChange = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, []);

  return hidden;
}

export function Router() {
  const uid = useId();
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [note, setNote] = useState("");
  const frameRef = useRef<HTMLDivElement>(null);
  const inView = useInView(frameRef, { amount: 0.4 });
  const hidden = usePageHidden();
  const cycling = inView && !paused && !hidden;

  const activeRoute = EXAMPLES[index].route;
  const labelId = `${uid}-label`;
  const bandId = `${uid}-band`;

  useEffect(() => {
    if (!cycling) return;
    const t = window.setTimeout(() => setIndex((i) => (i + 1) % EXAMPLES.length), reduced ? CYCLE_REDUCED_MS : CYCLE_MS);
    return () => window.clearTimeout(t);
  }, [cycling, index, reduced]);

  const pick = (i: number) => {
    const route = ROUTES.find((r) => r.id === EXAMPLES[i].route);
    setIndex(i);
    setPaused(true);
    setNote(route ? `Routes to ${route.name}. ${route.runs}` : "");
  };

  return (
    <FadeIn>
      <Spotlight>
      <div ref={frameRef} className={styles.frame}>
        <div className={styles.bar}>
          <span id={labelId} className={styles.barLabel}>
            Pick a request
          </span>
          <div className={styles.meta}>
            <span>Simulated</span>
            <button
              type="button"
              className={styles.pause}
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "Resume cycling through the examples" : "Pause cycling through the examples"}
            >
              {paused ? <Play size={14} strokeWidth={1.75} aria-hidden /> : <Pause size={14} strokeWidth={1.75} aria-hidden />}
            </button>
          </div>
        </div>

        <div role="group" aria-labelledby={labelId} className={styles.chips}>
          {EXAMPLES.map((ex, i) => (
            <button
              key={ex.text}
              type="button"
              className={styles.chip}
              aria-pressed={i === index}
              onClick={() => pick(i)}
            >
              <span className={styles.chipCheck} aria-hidden>
                <span className={styles.chipCheckInner}>
                  <Check size={14} strokeWidth={1.75} />
                </span>
              </span>
              <span>{ex.text}</span>
            </button>
          ))}
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table} role="table">
            <caption className="sr-only">How JARVIS routes a request, and what each route costs</caption>
            <colgroup>
              <col className={styles.colRoute} />
              <col className={styles.colWhen} />
              <col className={styles.colRuns} />
              <col className={styles.colCost} />
            </colgroup>
            <thead role="rowgroup">
              <tr role="row">
                <th role="columnheader" scope="col">
                  Route
                </th>
                <th role="columnheader" scope="col">
                  Sent when
                </th>
                <th role="columnheader" scope="col">
                  What runs
                </th>
                <th role="columnheader" scope="col">
                  Cost
                </th>
              </tr>
            </thead>
            <tbody role="rowgroup">
              {ROUTES.map((r) => {
                const active = r.id === activeRoute;
                return (
                  <tr
                    key={r.id}
                    role="row"
                    className={styles.row}
                    data-active={active}
                    aria-current={active ? "true" : undefined}
                  >
                    <th role="rowheader" scope="row" className={styles.route}>
                      {active ? (
                        <motion.span
                          layoutId={bandId}
                          className={styles.band}
                          style={{ borderRadius: BAND_RADIUS }}
                          transition={spring.layout}
                          aria-hidden
                        />
                      ) : null}
                      <span className={styles.routeName}>{r.name}</span>
                    </th>
                    <td role="cell" className={styles.when} data-label="Sent when">
                      {r.when}
                    </td>
                    <td role="cell" className={styles.runs} data-label="What runs">
                      {r.runs}
                    </td>
                    <td role="cell" className={styles.cost}>
                      {r.cost}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="sr-only" aria-live="polite">
          {note}
        </p>
      </div>
      </Spotlight>
    </FadeIn>
  );
}
