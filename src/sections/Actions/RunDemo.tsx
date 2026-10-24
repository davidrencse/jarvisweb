import { AnimatePresence, motion, useInView } from "motion/react";
import { RotateCcw } from "lucide-react";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { FadeIn } from "../../components/FadeIn";
import { ease, spring } from "../../lib/motion";
import { REQUESTS } from "./data";
import { RunLog } from "./RunLog";
import { Spotlight } from "../../components/Spotlight";
import styles from "./Actions.module.css";

export function RunDemo() {
  const uid = useId();
  const [active, setActive] = useState(0);
  const [runKey, setRunKey] = useState(0);
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState("");
  const frameRef = useRef<HTMLElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const inView = useInView(frameRef, { once: true, amount: 0.35 });

  const request = REQUESTS[active];
  const panelId = `${uid}-panel`;
  const tabId = (i: number) => `${uid}-tab-${i}`;

  const select = (i: number) => {
    setTouched(true);
    if (i === active) return;
    setActive(i);
    setStatus("");
  };

  const replay = () => {
    setTouched(true);
    setRunKey((k) => k + 1);
    setStatus("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const last = REQUESTS.length - 1;
    let next: number;
    if (e.key === "ArrowRight") next = active === last ? 0 : active + 1;
    else if (e.key === "ArrowLeft") next = active === 0 ? last : active - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    else return;
    e.preventDefault();
    select(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <FadeIn>
      <Spotlight>
      <figure ref={frameRef} className={styles.frame}>
        <figcaption className="sr-only">
          A simulated run of three example requests, showing each tool JARVIS calls and where it stops to ask.
        </figcaption>

        <div className={styles.strip}>
          <div role="tablist" aria-label="Example requests" className={styles.tabs} onKeyDown={onKeyDown}>
            {REQUESTS.map((r, i) => {
              const selected = i === active;
              return (
                <button
                  key={r.id}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={tabId(i)}
                  aria-selected={selected}
                  aria-controls={panelId}
                  tabIndex={selected ? 0 : -1}
                  className={styles.tab}
                  onClick={() => select(i)}
                >
                  {selected ? <motion.span layoutId={`${uid}-pill`} className={styles.pill} transition={spring.snappy} /> : null}
                  <span className={styles.tabLabel}>{r.label}</span>
                </button>
              );
            })}
          </div>

          <div className={styles.meta}>
            <span>Simulated</span>
            <button type="button" className={styles.replay} onClick={replay} aria-label="Replay this request">
              <RotateCcw size={15} strokeWidth={1.75} aria-hidden />
            </button>
          </div>
        </div>

        <div id={panelId} role="tabpanel" aria-labelledby={tabId(active)} className={styles.panel}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${request.id}:${runKey}`}
              initial={{ opacity: 0, filter: "blur(6px)" }}
              animate={{ opacity: 1, filter: "blur(0px)", transition: { duration: 0.3, ease: ease.out } }}
              exit={{ opacity: 0, filter: "blur(4px)", transition: { duration: 0.14 } }}
            >
              <p className={styles.say}>“{request.say}”</p>
              <RunLog request={request} play={inView || touched} onStatus={setStatus} />
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="sr-only" aria-live="polite">
          {status}
        </p>
      </figure>
      </Spotlight>
    </FadeIn>
  );
}
