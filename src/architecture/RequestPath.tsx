import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { BY_ID, EDGES, NODES, NODE_H, PRESETS, classify, edgeKey, route, type Step, type Trace } from "./graph";
import styles from "./RequestPath.module.css";

const STEP_MS = 520;

function Packet({ d, ms }: { d: string; ms: number }) {
  const path = useRef<SVGPathElement>(null);
  const dot = useRef<SVGCircleElement>(null);
  useEffect(() => {
    const p = path.current;
    const c = dot.current;
    if (!p || !c) return;
    const len = p.getTotalLength();
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / ms);
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const pt = p.getPointAtLength(len * e);
      c.setAttribute("cx", String(pt.x));
      c.setAttribute("cy", String(pt.y));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [d, ms]);
  return (
    <g aria-hidden>
      <path ref={path} d={d} fill="none" stroke="none" />
      <circle ref={dot} r={5} className={styles.packet} />
    </g>
  );
}

export function RequestPath() {
  const reduced = !!useReducedMotion();
  const [trace, setTrace] = useState<Trace>(PRESETS[2]);
  const [step, setStep] = useState(0);
  const [run, setRun] = useState(0);
  const [text, setText] = useState("");
  const listRef = useRef<HTMLOListElement>(null);

  const total = trace.steps.length;
  const shown = reduced ? total : step;

  useEffect(() => {
    if (reduced) return;
    setStep(1);
    let i = 1;
    const id = window.setInterval(() => {
      i += 1;
      setStep(Math.min(i, total));
      if (i >= total) window.clearInterval(id);
    }, STEP_MS);
    return () => window.clearInterval(id);
  }, [trace, run, reduced, total]);

  useEffect(() => {
    const list = listRef.current;
    if (list) list.scrollTo({ top: list.scrollHeight, behavior: reduced ? "auto" : "smooth" });
  }, [shown, reduced]);

  const visited = useMemo(() => {
    const m = new Map<string, Step>();
    trace.steps.slice(0, shown).forEach((s) => m.set(s.node, s));
    return m;
  }, [trace, shown]);

  const litEdges = useMemo(() => {
    const out: { key: string; d: string }[] = [];
    for (let i = 1; i < shown; i++) {
      const a = trace.steps[i - 1].node;
      const b = trace.steps[i].node;
      out.push({ key: `${i}-${edgeKey(a, b)}`, d: route(a, b) });
    }
    return out;
  }, [trace, shown]);

  const current = shown > 0 ? trace.steps[shown - 1] : null;
  const done = shown >= total;
  const lastEdge = litEdges[litEdges.length - 1];

  const pick = (t: Trace) => {
    setTrace(t);
    setRun((r) => r + 1);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    pick(classify(text));
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.controls}>
        <form className={styles.form} onSubmit={onSubmit}>
          <label htmlFor="trace-input" className="sr-only">
            Type a request to trace
          </label>
          <input
            id="trace-input"
            className={styles.input}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a request, e.g. mute the dell"
            autoComplete="off"
            spellCheck={false}
          />
          <button type="submit" className={styles.go}>
            Trace <ArrowRight size={15} strokeWidth={1.75} aria-hidden />
          </button>
        </form>
        <div className={styles.presets} role="group" aria-label="Example requests">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={styles.preset}
              aria-pressed={trace.id === p.id}
              onClick={() => pick(p)}
            >
              {p.request}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.board}>
          <div className={styles.scroller}>
            <svg viewBox="0 0 1200 680" className={styles.svg} role="img" aria-labelledby="rp-desc">
              <desc id="rp-desc">
                The JARVIS request path: five inputs feed nine free stations (instant phrases, strict parser, intent
                registry, gates, history checks, confirm queue, direct executor, on-screen check, record). Requests the
                parser can’t resolve go to the model path: interpreter, brain, planner, Grok Bot. Actions run on this PC
                or on a node through the hub.
              </desc>

              <g className={styles.columns} aria-hidden>
                <text x={24} y={14}>Input</text>
                <text x={262} y={14}>Free path</text>
                <text x={566} y={78}>Model path · subscriptions only</text>
                <text x={900} y={350}>Where it runs</text>
              </g>

              <g aria-hidden>
                {EDGES.map(([a, b]) => (
                  <path key={edgeKey(a, b)} d={route(a, b)} className={styles.edge} data-model={BY_ID[b].kind === "model" || BY_ID[a].kind === "model"} />
                ))}
              </g>

              <g aria-hidden>
                {litEdges.map((e) => (
                  <motion.path
                    key={`${run}-${e.key}`}
                    d={e.d}
                    className={styles.lit}
                    initial={reduced ? false : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: STEP_MS / 1000 - 0.08, ease: [0.65, 0, 0.35, 1] }}
                  />
                ))}
                {!reduced && lastEdge && !done ? (
                  <Packet key={`${run}-${lastEdge.key}`} d={lastEdge.d} ms={STEP_MS - 80} />
                ) : null}
              </g>

              <g>
                {NODES.map((n) => {
                  const s = visited.get(n.id);
                  const isCurrent = current?.node === n.id;
                  return (
                    <g
                      key={n.id}
                      transform={`translate(${n.x} ${n.y})`}
                      className={styles.node}
                      data-kind={n.kind}
                      data-state={s?.state ?? "idle"}
                      data-current={isCurrent}
                      aria-hidden
                    >
                      {n.kind === "wait" ? <rect x={-4} y={-4} width={n.w + 8} height={NODE_H + 8} rx={11} className={styles.outer} /> : null}
                      <rect width={n.w} height={NODE_H} rx={8} className={styles.box} />
                      {n.n ? (
                        <text x={14} y={30} className={styles.num}>
                          {n.n}
                        </text>
                      ) : null}
                      <text x={n.n ? 34 : 14} y={22} className={styles.label}>
                        {n.label}
                      </text>
                      <text x={n.n ? 34 : 14} y={39} className={styles.sub}>
                        {n.sub}
                      </text>
                      {s?.state === "miss" ? (
                        <text x={n.w - 12} y={22} textAnchor="end" className={styles.flag}>
                          miss
                        </text>
                      ) : null}
                      {s?.state === "wait" ? (
                        <text x={n.w - 12} y={22} textAnchor="end" className={styles.flag}>
                          waits
                        </text>
                      ) : null}
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>

          <ul className={styles.legend} aria-label="Legend">
            <li>
              <span className={styles.keySolid} aria-hidden /> Free, on your PC
            </li>
            <li>
              <span className={styles.keyDashed} aria-hidden /> Spends subscription quota
            </li>
            <li>
              <span className={styles.keyDouble} aria-hidden /> Waits for your yes
            </li>
            <li className={styles.sim}>Simulated trace. Routes follow the real pipeline.</li>
          </ul>
        </div>

        <aside className={styles.readout} aria-live="polite">
          <p className={styles.req}>
            <span className={styles.reqQuote}>“{trace.request}”</span>
          </p>
          <ol className={styles.steps} ref={listRef}>
            <AnimatePresence initial={false}>
              {trace.steps.slice(0, shown).map((s, i) => {
                const n = BY_ID[s.node];
                return (
                  <motion.li
                    key={`${run}-${i}`}
                    className={styles.stepRow}
                    data-state={s.state}
                    initial={reduced ? false : { opacity: 0, y: 8, filter: "blur(3px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <span className={styles.stepName}>
                      {n.label}
                      {s.state !== "pass" ? <span className={styles.badge}>{s.state}</span> : null}
                    </span>
                    <span className={styles.stepNote}>{s.note}</span>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ol>
          <div className={styles.summary} data-done={done}>
            <div>
              <span className={styles.sumKey}>Outcome</span>
              <span className={styles.sumVal}>{done ? trace.outcome : "Tracing…"}</span>
            </div>
            <div>
              <span className={styles.sumKey}>Cost</span>
              <span className={styles.sumVal}>{trace.cost}</span>
            </div>
            <button type="button" className={styles.replay} onClick={() => setRun((r) => r + 1)} aria-label="Replay the trace">
              <RotateCcw size={15} strokeWidth={1.75} aria-hidden />
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
