import { motion, type Variants } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Spotlight } from "../../components/Spotlight";
import { ease } from "../../lib/motion";
import { PIPELINE } from "./data";
import styles from "./PipelineRow.module.css";

const list: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};

const step: Variants = {
  hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: ease.out } },
};

export function PipelineRow() {
  return (
    <div className={styles.wrap}>
      <p className={styles.label}>Signal pipeline</p>
      <Spotlight className={styles.frame}>
        <motion.ol
          className={styles.steps}
          variants={list}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          aria-label="Signal pipeline, five steps"
        >
          {PIPELINE.map((s, i) => (
            <motion.li key={s.name} className={styles.step} variants={step} data-off={s.state ? true : undefined}>
              {i > 0 ? (
                <span className={styles.join} aria-hidden>
                  <ArrowRight size={14} strokeWidth={1.75} />
                </span>
              ) : null}
              <span className={styles.num}>{String(i + 1).padStart(2, "0")}</span>
              <span className={styles.name}>{s.name}</span>
              <span className={styles.note}>{s.note}</span>
              {s.state ? (
                <span className={styles.state}>
                  <i aria-hidden />
                  {s.state}
                </span>
              ) : null}
            </motion.li>
          ))}
        </motion.ol>
      </Spotlight>
    </div>
  );
}
