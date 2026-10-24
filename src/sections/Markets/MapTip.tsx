import type { CSSProperties, Ref } from "react";
import { moveSentence, type Coin } from "./data";
import styles from "./MapTip.module.css";

type MapTipProps = {
  coin: Coin;
  ref?: Ref<HTMLDivElement>;
  style?: CSSProperties;
  /** The flat map positions the tip with CSS, so it is placed from the first paint. */
  placed?: boolean;
};

export function MapTip({ coin, ref, style, placed = false }: MapTipProps) {
  return (
    <div ref={ref} className={styles.tip} style={style} data-placed={placed || undefined} aria-hidden>
      <span className={styles.ticker}>{coin.ticker}</span>
      <span>{moveSentence(coin)}</span>
    </div>
  );
}
