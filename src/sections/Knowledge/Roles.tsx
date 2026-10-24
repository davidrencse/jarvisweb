import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { FadeIn } from "../../components/FadeIn";
import { ease, inViewOnce, spring } from "../../lib/motion";
import styles from "./Roles.module.css";

const ROLES = [
  { name: "Reader", text: "Keeps every source exactly as it arrived, hashed and read-only." },
  { name: "Librarian", text: "Files each claim into the page it belongs to, with its source and date." },
  { name: "Checker", text: "Re-reads everything nightly and flags claims that disagree." },
  { name: "You", text: "Decide which claim stands." },
];

const draw = { duration: 1.4, ease: ease.out };

export function Roles() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <div ref={ref} className={styles.track}>
      <motion.span
        aria-hidden
        className={styles.lineH}
        style={{ originX: 0 }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: inView ? 1 : 0 }}
        transition={draw}
      />
      <motion.span
        aria-hidden
        className={styles.lineV}
        style={{ originY: 0 }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: inView ? 1 : 0 }}
        transition={draw}
      />
      <ol className={styles.roles} role="list">
        {ROLES.map((role, i) => (
          <li key={role.name} className={styles.role}>
            <motion.span
              aria-hidden
              className={styles.node}
              data-final={i === ROLES.length - 1}
              initial={{ opacity: 0, scale: 0.6 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={inViewOnce}
              transition={{ ...spring.snappy, delay: 0.1 + i * 0.14 }}
            />
            <FadeIn y={14} delay={0.12 + i * 0.12}>
              <h3 className={styles.name}>{role.name}</h3>
              <p className={styles.text}>{role.text}</p>
            </FadeIn>
          </li>
        ))}
      </ol>
    </div>
  );
}
