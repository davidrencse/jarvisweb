import { motion } from "motion/react";
import { Mic } from "lucide-react";
import { ease, spring } from "../../lib/motion";
import { Wordmark } from "../../components/Wordmark";
import styles from "./OverlayScene.module.css";

const SIDE = [70, 54, 62, 46, 58];
const DOC = [92, 84, 90, 64, 0, 88, 78, 91, 52, 0, 86, 70, 80];

function press(delay: number) {
  return {
    animate: { y: [0, 3, 0], scale: [1, 0.96, 1] },
    transition: { duration: 0.32, ease: ease.out, delay },
  };
}

export function OverlayScene() {
  return (
    <div className={styles.desk}>
      <div className={styles.windowBack} />

      <div className={styles.window}>
        <div className={styles.titlebar}>
          <span className={styles.control} />
          <span className={styles.control} />
          <span className={styles.control} />
          <span className={styles.titleBar} />
        </div>
        <div className={styles.winBody}>
          <div className={styles.side}>
            {SIDE.map((w, i) => (
              <span key={i} className={styles.bar} style={{ width: `${w}%` }} />
            ))}
          </div>
          <div className={styles.doc}>
            <span className={`${styles.bar} ${styles.heading}`} style={{ width: "46%" }} />
            {DOC.map((w, i) =>
              w ? <span key={i} className={styles.bar} style={{ width: `${w}%` }} /> : <span key={i} className={styles.gap} />,
            )}
          </div>
        </div>
      </div>

      <div className={styles.taskbar} aria-hidden>
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className={styles.slot} />
        ))}
      </div>

      <div className={styles.keys}>
        <motion.kbd className={styles.key} {...press(0.3)}>
          Alt
        </motion.kbd>
        <span className={styles.plus} aria-hidden>
          +
        </span>
        <motion.kbd className={styles.key} {...press(0.5)}>
          1
        </motion.kbd>
      </div>

      <motion.div
        className={styles.sheet}
        initial={{ y: "-104%" }}
        animate={{ y: "0%" }}
        transition={{ ...spring.soft, delay: 0.85 }}
      >
        <div className={styles.brand}>
          <Wordmark />
        </div>
        <div className={styles.query}>
          <Mic size={18} strokeWidth={1.75} aria-hidden />
          <p>Remind me to buy printer paper on Friday.</p>
        </div>
        <div className={styles.reply}>
          <p>Added “Buy printer paper”, due Friday.</p>
          <p className={styles.meta}>.jarvis/vault-writes.jsonl +1</p>
        </div>
      </motion.div>
    </div>
  );
}
