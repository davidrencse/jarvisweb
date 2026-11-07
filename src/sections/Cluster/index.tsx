import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { Pause, Play } from "lucide-react";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { FadeIn } from "../../components/FadeIn";
import { SectionHead } from "../../components/SectionHead";
import { Spotlight } from "../../components/Spotlight";
import { ease, spring } from "../../lib/motion";
import { usePageVisible } from "../Voice/demo";
import { FACTS, MACHINES, SCENARIOS, type Scenario } from "./data";
import { Link } from "./Link";
import styles from "./Cluster.module.css";

const STEP_MS = 2200;
const HOLD_MS = 3200;

/** The newest status line for a machine, up to and including the active step. */
function statusAt(s: Scenario, active: number, side: "main" | "node") {
  for (let i = active; i >= 0; i--) {
    const v = s.steps[i][side];
    if (v) return v;
  }
  return MACHINES[side].idle;
}

function Machine({ side, status }: { side: "main" | "node"; status: string }) {
  const m = MACHINES[side];
  return (
    <div className={styles.machine} data-side={side}>
      <div className={styles.machineTop}>
        <span className={styles.machineName}>{m.name}</span>
        <span className={styles.role}>{m.role}</span>
      </div>
      <p className={styles.os}>{m.os}</p>
      <div className={styles.screen}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={status}
            className={styles.status}
            initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.32, ease: ease.out } }}
            exit={{ opacity: 0, y: -6, filter: "blur(4px)", transition: { duration: 0.2, ease: ease.out } }}
          >
            {status}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function Cluster() {
  const uid = useId();
  const reduced = Boolean(useReducedMotion());
  const frameRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const inView = useInView(frameRef, { amount: 0.35 });
  const visible = usePageVisible();

  const [index, setIndex] = useState(0);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const scenario = SCENARIOS[index];
  const last = scenario.steps.length - 1;
  const running = inView && visible && !paused && !reduced;
  const step = scenario.steps[active];

  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(() => setActive((a) => (a >= last ? 0 : a + 1)), active >= last ? HOLD_MS : STEP_MS);
    return () => window.clearTimeout(id);
  }, [running, active, last, index]);

  const choose = (i: number) => {
    setIndex(i);
    setActive(0);
  };

  const onTabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const count = SCENARIOS.length;
    let next = -1;
    if (e.key === "ArrowRight") next = (index + 1) % count;
    else if (e.key === "ArrowLeft") next = (index - 1 + count) % count;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = count - 1;
    if (next < 0) return;
    e.preventDefault();
    choose(next);
    tabRefs.current[next]?.focus();
  };

  const panelId = `${uid}-panel`;

  return (
    <section id="cluster" aria-labelledby="cluster-title" className={styles.section}>
      <div className="container">
        <SectionHead
          id="cluster-title"
          layout="split"
          title={"Every computer,\none assistant."}
          lede="One laptop is the main: it runs the brain, the memory and a small hub. Every other computer joins as a node and picks up signed jobs over SSH. Say “on the Dell” and it happens on the Dell."
        />

        <FadeIn amount={0.15}>
          <Spotlight className={styles.frame}>
            <div ref={frameRef}>
              <div className={styles.bar}>
                <div role="tablist" aria-label="What the link carries" className={styles.tabs} onKeyDown={onTabKey}>
                  {SCENARIOS.map((s, i) => {
                    const selected = i === index;
                    return (
                      <button
                        key={s.id}
                        ref={(el) => {
                          tabRefs.current[i] = el;
                        }}
                        type="button"
                        role="tab"
                        id={`${uid}-tab-${s.id}`}
                        aria-selected={selected}
                        aria-controls={panelId}
                        tabIndex={selected ? 0 : -1}
                        className={styles.tab}
                        onClick={() => choose(i)}
                      >
                        {selected ? (
                          <motion.span layoutId={`${uid}-pill`} className={styles.pill} transition={spring.snappy} />
                        ) : null}
                        <span className={styles.tabLabel}>{s.label}</span>
                      </button>
                    );
                  })}
                </div>
                <div className={styles.meta}>
                  <span>Simulated</span>
                  {reduced ? null : (
                    <button
                      type="button"
                      className={styles.pause}
                      onClick={() => setPaused((p) => !p)}
                      aria-label={paused ? "Resume the walkthrough" : "Pause the walkthrough"}
                    >
                      {paused ? <Play size={14} strokeWidth={1.75} aria-hidden /> : <Pause size={14} strokeWidth={1.75} aria-hidden />}
                    </button>
                  )}
                </div>
              </div>

              <div role="tabpanel" id={panelId} aria-labelledby={`${uid}-tab-${scenario.id}`} className={styles.panel}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={scenario.id}
                    className={styles.say}
                    initial={{ opacity: 0, filter: "blur(6px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)", transition: { duration: 0.36, ease: ease.out } }}
                    exit={{ opacity: 0, filter: "blur(4px)", transition: { duration: 0.16, ease: ease.out } }}
                  >
                    {scenario.say}
                  </motion.p>
                </AnimatePresence>

                <div className={styles.stage}>
                  <Machine side="main" status={statusAt(scenario, active, "main")} />
                  <Link dir={step.dir} play={!reduced && inView && visible} key={`${scenario.id}-${active}`} />
                  <Machine side="node" status={statusAt(scenario, active, "node")} />
                </div>

                <AnimatePresence mode="wait" initial={false}>
                  <motion.ol
                    key={scenario.id}
                    className={styles.steps}
                    initial="hidden"
                    animate="show"
                    exit={{ opacity: 0, transition: { duration: 0.14 } }}
                    variants={{ hidden: {}, show: { transition: { staggerChildren: 0.03 } } }}
                  >
                    {scenario.steps.map((s, i) => {
                      const on = i === active;
                      return (
                        <motion.li
                          key={s.text}
                          variants={{
                            hidden: { opacity: 0, y: 6, filter: "blur(4px)" },
                            show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.4, ease: ease.out } },
                          }}
                        >
                          <button
                            type="button"
                            className={styles.step}
                            data-active={on}
                            data-done={i < active}
                            aria-current={on ? "step" : undefined}
                            onClick={() => {
                              setActive(i);
                              setPaused(true);
                            }}
                          >
                            {on ? (
                              <motion.span layoutId={`${uid}-step`} className={styles.stepBand} transition={spring.layout} aria-hidden />
                            ) : null}
                            <span className={styles.stepNo}>{String(i + 1).padStart(2, "0")}</span>
                            <span className={styles.who}>{s.who}</span>
                            <span className={styles.stepText}>{s.text}</span>
                            <span className={styles.detail}>{s.detail}</span>
                          </button>
                        </motion.li>
                      );
                    })}
                  </motion.ol>
                </AnimatePresence>
              </div>
            </div>
          </Spotlight>
        </FadeIn>

        <ul className={styles.facts}>
          {FACTS.map((f, i) => (
            <li key={f.figure} className={styles.fact}>
              <FadeIn delay={i * 0.06} y={12}>
                <span className={styles.figure}>{f.figure}</span>
                <span className={styles.factText}>{f.text}</span>
              </FadeIn>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
