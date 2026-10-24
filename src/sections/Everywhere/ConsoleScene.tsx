import { motion } from "motion/react";
import { ArrowUp, ChevronsUpDown, Mic } from "lucide-react";
import { ease } from "../../lib/motion";
import styles from "./ConsoleScene.module.css";

const SESSIONS = ["Today", "Drone blueprint", "OS assignment", "Study group"];

const THREAD = [
  { from: "you", text: "What’s due this week?" },
  {
    from: "jarvis",
    text: "Two things. Your OS assignment is due Thursday at 5 pm, and Friday morning is blocked for the drone build.",
    meta: "local · from your notes · about 20 ms",
  },
  { from: "you", text: "I finished picking the motors." },
  {
    from: "jarvis",
    text: "Ticked “Pick motors” in drone-blueprint.md and logged the write.",
    meta: "task_update done · vault-writes +1",
  },
] as const;

export function ConsoleScene() {
  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 10, filter: "blur(4px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: 0.7, ease: ease.out, delay },
  });

  return (
    <div className={styles.app}>
      <aside className={styles.rail} aria-hidden>
        <p className={styles.railHead}>Sessions</p>
        <ul className={styles.sessions}>
          {SESSIONS.map((s, i) => (
            <li key={s} className={styles.session} data-current={i === 0 || undefined}>
              {s}
            </li>
          ))}
        </ul>
        <p className={styles.loopback}>
          <span className={styles.dot} />
          Loopback only
        </p>
      </aside>

      <div className={styles.main}>
        <header className={styles.top}>
          <span className={styles.heading}>Today</span>
          <span className={styles.live}>
            <span className={`${styles.dot} ${styles.breathe}`} />
            LIVE
          </span>
        </header>

        <div className={styles.thread}>
          {THREAD.map((turn, i) =>
            turn.from === "you" ? (
              <motion.p key={i} className={styles.you} {...rise(0.2 + i * 0.12)}>
                {turn.text}
              </motion.p>
            ) : (
              <motion.div key={i} className={styles.reply} {...rise(0.2 + i * 0.12)}>
                <p>{turn.text}</p>
                <p className={styles.meta}>{turn.meta}</p>
              </motion.div>
            ),
          )}
        </div>

        <div className={styles.dock}>
          <div className={styles.prompt} aria-hidden>
            <span className={styles.tier}>
              Auto
              <ChevronsUpDown size={14} strokeWidth={1.75} />
            </span>
            <span className={styles.placeholder}>Ask or tell JARVIS</span>
            <span className={styles.round}>
              <Mic size={16} strokeWidth={1.75} />
            </span>
            <span className={`${styles.round} ${styles.send}`}>
              <ArrowUp size={16} strokeWidth={1.75} />
            </span>
          </div>
          <p className={styles.hint}>
            Hold <kbd>Space</kbd> to talk
          </p>
        </div>
      </div>
    </div>
  );
}
