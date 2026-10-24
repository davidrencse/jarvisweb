import { motion } from "motion/react";
import { useCallback, useState } from "react";
import { FadeIn } from "../../components/FadeIn";
import { SectionHead } from "../../components/SectionHead";
import { ease } from "../../lib/motion";
import { CoinPanel } from "./CoinPanel";
import { MarketMap } from "./MarketMap";
import { MoodGauge } from "./MoodGauge";
import { PipelineRow } from "./PipelineRow";
import { StrategyCard } from "./StrategyCard";
import type { MapSelection } from "./mapTypes";
import styles from "./Markets.module.css";

export default function Markets() {
  const [selected, setSelected] = useState(0);
  const [hovered, setHovered] = useState(-1);

  const onHover = useCallback((index: number, on: boolean) => {
    setHovered((current) => (on ? index : current === index ? -1 : current));
  }, []);

  const shared: MapSelection = { selected, hovered, onSelect: setSelected, onHover };

  return (
    <section id="markets" aria-labelledby="markets-title" className={styles.section}>
      <div className="container">
        <SectionHead
          id="markets-title"
          layout="split"
          title={"Markets, in\nplain English."}
          lede="A pulse that reads like a sentence, a map of what moved today, and ideas tested on history. It only ever watches: there is no code in JARVIS that can place a trade."
        />

        <div className={styles.grid}>
          <motion.div
            className={styles.map}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.9, ease: ease.out }}
          >
            <MarketMap {...shared} />
          </motion.div>
          <FadeIn className={styles.side} amount={0.15} delay={0.12}>
            <CoinPanel {...shared} />
          </FadeIn>
          <FadeIn className={styles.mood} amount={0.2}>
            <MoodGauge />
          </FadeIn>
          <FadeIn className={styles.strategy} amount={0.2} delay={0.12}>
            <StrategyCard />
          </FadeIn>
        </div>

        <PipelineRow />
      </div>
    </section>
  );
}
