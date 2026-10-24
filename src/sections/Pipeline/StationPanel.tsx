import { useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { FadeIn } from "../../components/FadeIn";
import { RevealText } from "../../components/RevealText";
import { Readout } from "./Readout";
import type { Station } from "./stations";
import styles from "./StationPanel.module.css";

type StationPanelProps = {
  station: Station;
  active: boolean;
  panelRef: (el: HTMLElement | null) => void;
};

export function StationPanel({ station, active, panelRef }: StationPanelProps) {
  const readoutRef = useRef<HTMLDivElement>(null);
  const seen = useInView(readoutRef, { amount: 0.6 });
  const [played, setPlayed] = useState(false);
  const titleId = `station-${station.id}-title`;
  const ready = active && seen;

  useEffect(() => {
    if (!ready || played) return;
    const dwell = window.setTimeout(() => setPlayed(true), 220);
    return () => window.clearTimeout(dwell);
  }, [ready, played]);

  return (
    <article ref={panelRef} id={`station-${station.id}`} className={styles.panel} aria-labelledby={titleId}>
      <div className={styles.inner}>
        <RevealText as="h3" id={titleId} text={station.name} className={styles.name} />
        <FadeIn className={styles.sentence} delay={0.12}>
          <p>{station.sentence}</p>
        </FadeIn>
        <div ref={readoutRef} className={styles.readout}>
          <FadeIn delay={0.24} amount={0.15}>
            <Readout def={station.readout} play={played} live={active} />
          </FadeIn>
        </div>
      </div>
    </article>
  );
}
