import { motion } from "motion/react";
import { ArrowUpDown } from "lucide-react";
import { useId } from "react";
import { spring } from "../../lib/motion";
import { FKEYS } from "./functions";
import type { FKey } from "./types";
import styles from "./KeyBar.module.css";

type Props = {
  /** The key whose function produced what is on screen. */
  current: FKey | null;
  onKey: (command: string) => void;
  onSlash: () => void;
};

export function KeyBar({ current, onKey, onSlash }: Props) {
  const uid = useId();
  return (
    <div role="group" aria-label="Function keys" className={styles.keys}>
      {FKEYS.map((f) => (
        <button key={f.key} type="button" className={styles.key} aria-keyshortcuts={f.key} onClick={() => onKey(f.command)}>
          {current === f.key ? (
            <motion.span layoutId={`${uid}-current`} className={styles.mark} transition={spring.snappy} aria-hidden />
          ) : null}
          <kbd className={styles.cap}>{f.key}</kbd>
          <span>{f.label}</span>
        </button>
      ))}
      <button type="button" className={styles.key} onClick={onSlash}>
        <kbd className={styles.cap}>/</kbd>
        <span>COMMAND</span>
      </button>
      <span className={styles.hint}>
        <kbd className={styles.cap}>
          <ArrowUpDown size={13} strokeWidth={1.75} aria-hidden />
        </kbd>
        <span>HISTORY</span>
      </span>
    </div>
  );
}
