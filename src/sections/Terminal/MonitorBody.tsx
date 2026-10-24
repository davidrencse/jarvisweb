import { motion } from "motion/react";
import { memo, type CSSProperties } from "react";
import { spring } from "../../lib/motion";
import { Swap, useStagger } from "./motion";
import type { Monitor } from "./types";
import styles from "./Monitor.module.css";

type Props = { monitor: Monitor; bandId: string; onRun: (command: string) => void };

function Rows({ monitor, bandId, onRun }: Props) {
  const { list, item } = useStagger(monitor.rows.length > 12 ? 0.016 : 0.035);
  return (
    <motion.ul
      className={styles.list}
      variants={list}
      initial="hidden"
      animate="show"
      data-numeric={monitor.numeric ? "" : undefined}
      style={{ "--cols": monitor.cols } as CSSProperties}
    >
      {monitor.rows.map((row) => {
        const [a, b, c] = row.cells;
        const cells = (
          <>
            <span className={styles.a}>{a}</span>
            <span className={styles.b}>{b}</span>
            {c ? <span className={styles.c}>{c}</span> : null}
          </>
        );
        return (
          <motion.li
            key={row.id}
            variants={item}
            className={styles.row}
            data-active={row.active ? "" : undefined}
            data-muted={row.muted ? "" : undefined}
          >
            {row.active ? (
              <motion.span
                layoutId={bandId}
                className={styles.band}
                style={{ borderRadius: 8 }}
                transition={spring.layout}
                aria-hidden
              />
            ) : null}
            {row.run ? (
              <button
                type="button"
                className={styles.cells}
                aria-current={row.active ? "true" : undefined}
                onClick={() => onRun(row.run as string)}
              >
                {cells}
              </button>
            ) : (
              <div className={styles.cells} aria-current={row.active ? "true" : undefined}>
                {cells}
              </div>
            )}
          </motion.li>
        );
      })}
    </motion.ul>
  );
}

export const MonitorBody = memo(function MonitorBody(props: Props) {
  return (
    <Swap id={props.monitor.id}>
      <Rows {...props} />
    </Swap>
  );
});
