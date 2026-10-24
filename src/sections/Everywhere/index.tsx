import { AnimatePresence, motion } from "motion/react";
import { AppWindow, Mic, PanelTop, SquareTerminal } from "lucide-react";
import { useId, useRef, useState, type KeyboardEvent } from "react";
import { FadeIn } from "../../components/FadeIn";
import { SectionHead } from "../../components/SectionHead";
import { ease, spring } from "../../lib/motion";
import { ConsoleScene } from "./ConsoleScene";
import { OverlayScene } from "./OverlayScene";
import { TerminalScene } from "./TerminalScene";
import { VoiceScene } from "./VoiceScene";
import { Spotlight } from "../../components/Spotlight";
import styles from "./Everywhere.module.css";

const TABS = [
  { id: "voice", label: "Voice", Icon: Mic, Scene: VoiceScene },
  { id: "terminal", label: "Terminal", Icon: SquareTerminal, Scene: TerminalScene },
  { id: "console", label: "Console", Icon: PanelTop, Scene: ConsoleScene },
  { id: "overlay", label: "Overlay", Icon: AppWindow, Scene: OverlayScene },
] as const;

type TabId = (typeof TABS)[number]["id"];

const FACTS = [
  "Clipboard and one mouse shared across both laptops.",
  "Starts with your computer and listens from login.",
];

export default function Everywhere() {
  const uid = useId();
  const [active, setActive] = useState<TabId>("voice");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const panelId = `${uid}-panel`;
  const tabId = (id: TabId) => `${uid}-tab-${id}`;
  const Scene = TABS.find((t) => t.id === active)!.Scene;

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const count = TABS.length;
    const current = TABS.findIndex((t) => t.id === active);
    let next = -1;
    if (e.key === "ArrowRight") next = (current + 1) % count;
    else if (e.key === "ArrowLeft") next = (current - 1 + count) % count;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = count - 1;
    if (next < 0) return;
    e.preventDefault();
    setActive(TABS[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <section id="everywhere" aria-labelledby="everywhere-title" className={styles.section}>
      <div className="container">
        <SectionHead
          id="everywhere-title"
          layout="split"
          title={"On every machine\nyou use."}
          lede="Windows and Arch Linux, from the same install. Talk to it, type to it in a terminal, or call it over any app with Alt+1."
        />

        <FadeIn>
          <div className={styles.bar}>
            <div role="tablist" aria-label="Ways to use JARVIS" className={styles.tabs} onKeyDown={onKeyDown}>
              {TABS.map(({ id, label, Icon }, i) => {
                const selected = id === active;
                return (
                  <button
                    key={id}
                    ref={(el) => {
                      tabRefs.current[i] = el;
                    }}
                    type="button"
                    role="tab"
                    id={tabId(id)}
                    aria-selected={selected}
                    aria-controls={panelId}
                    tabIndex={selected ? 0 : -1}
                    className={styles.tab}
                    onClick={() => setActive(id)}
                  >
                    {selected ? (
                      <motion.span layoutId={`${uid}-pill`} className={styles.pill} transition={spring.snappy} />
                    ) : null}
                    <span className={styles.tabContent}>
                      <Icon className={styles.tabIcon} size={16} strokeWidth={1.75} aria-hidden />
                      <span>{label}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <p className={styles.note}>Simulated</p>
          </div>

          <Spotlight>
      <div role="tabpanel" id={panelId} aria-labelledby={tabId(active)} tabIndex={0} className={styles.stage}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                className={styles.scene}
                initial={{ opacity: 0, filter: "blur(8px)" }}
                animate={{ opacity: 1, filter: "blur(0px)", transition: { duration: 0.42, ease: ease.out } }}
                exit={{ opacity: 0, filter: "blur(6px)", transition: { duration: 0.18, ease: ease.out } }}
              >
                <Scene />
              </motion.div>
            </AnimatePresence>
          </div>
          </Spotlight>
        </FadeIn>

        <ul className={styles.facts}>
          {FACTS.map((fact, i) => (
            <li key={fact} className={styles.fact}>
              <FadeIn delay={i * 0.08}>{fact}</FadeIn>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
