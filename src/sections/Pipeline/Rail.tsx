import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef, useState } from "react";
import { ease, spring } from "../../lib/motion";
import type { Station } from "./stations";
import styles from "./Rail.module.css";

type RailProps = {
  stations: Station[];
  active: number;
  /** 0 at the first node, 1 at the last. */
  fill: MotionValue<number>;
  onSelect: (index: number) => void;
};

export function Rail({ stations, active, fill, onSelect }: RailProps) {
  const total = stations.length;

  return (
    <nav className={styles.rail} aria-label="The seven stations">
      <div className={styles.stage}>
        <div className={styles.track} aria-hidden>
          <motion.div className={styles.fill} style={{ scaleY: fill }} />
        </div>
        <ol className={styles.list}>
          {stations.map((station, i) => {
            const current = i === active;
            return (
              <li key={station.id} className={styles.item}>
                <button
                  type="button"
                  className={styles.station}
                  aria-current={current ? "step" : undefined}
                  data-passed={i < active}
                  onClick={() => onSelect(i)}
                >
                  <span className={styles.node} aria-hidden>
                    <motion.span
                      className={styles.dot}
                      initial={false}
                      animate={{ scale: current ? 1 : 0.3, opacity: current ? 1 : 0 }}
                      transition={spring.snappy}
                    />
                  </span>
                  <span className={styles.label}>
                    <span className={styles.name}>{station.name}</span>
                    <span className={styles.tag}>{station.tag}</span>
                  </span>
                  <span className={styles.count}>
                    {i + 1}/{total}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}

type StationBarProps = {
  stations: Station[];
  active: number;
  fill: MotionValue<number>;
};

export function StationBar({ stations, active, fill }: StationBarProps) {
  const total = stations.length;
  const progress = useTransform(fill, [0, 1], [1 / total, 1]);
  const { scrollY } = useScroll();
  const [navHidden, setNavHidden] = useState(false);
  const last = useRef(0);

  useMotionValueEvent(scrollY, "change", (y) => {
    const delta = y - last.current;
    if (Math.abs(delta) > 6) setNavHidden(delta > 0 && y > 480);
    last.current = y;
  });

  return (
    <div className={styles.bar} data-nav-hidden={navHidden} aria-hidden>
      <div className={styles.barRow}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={active}
            className={styles.barName}
            initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.4, ease: ease.out } }}
            exit={{ opacity: 0, filter: "blur(4px)", transition: { duration: 0.15 } }}
          >
            {stations[active].name}
          </motion.span>
        </AnimatePresence>
        <span className={styles.barCount}>
          {active + 1}/{total}
        </span>
      </div>
      <div className={styles.barTrack}>
        <motion.div className={styles.barFill} style={{ scaleX: progress }} />
      </div>
    </div>
  );
}
