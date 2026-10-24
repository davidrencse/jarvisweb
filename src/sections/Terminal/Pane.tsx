import { motion } from "motion/react";
import type { ReactNode } from "react";
import { spring } from "../../lib/motion";
import styles from "./Terminal.module.css";

export type PaneId = 1 | 2 | 3;

type Props = {
  n: PaneId;
  title: string;
  sub?: string;
  titleId: string;
  active: boolean;
  ringId: string;
  onActivate: (n: PaneId) => void;
  extra?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
};

/** One numbered pane. The active pane carries the moving ink outline. */
export function Pane({ n, title, sub, titleId, active, ringId, onActivate, extra, className, bodyClassName, children }: Props) {
  return (
    <div
      role="group"
      aria-labelledby={titleId}
      className={[styles.pane, className].filter(Boolean).join(" ")}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") onActivate(n);
      }}
      onPointerDown={() => onActivate(n)}
      onFocus={() => onActivate(n)}
    >
      {active ? (
        <motion.span layoutId={ringId} className={styles.ring} style={{ borderRadius: 2 }} transition={spring.layout} aria-hidden />
      ) : null}
      <div className={styles.paneHead}>
        <span className={styles.num} aria-hidden>
          {n}
        </span>
        <h3 id={titleId} className={styles.paneTitle}>
          {title}
        </h3>
        {sub ? (
          <span className={styles.paneSub} title={sub}>
            {sub}
          </span>
        ) : null}
        {extra}
      </div>
      <div className={[styles.paneBody, bodyClassName].filter(Boolean).join(" ")}>{children}</div>
    </div>
  );
}
