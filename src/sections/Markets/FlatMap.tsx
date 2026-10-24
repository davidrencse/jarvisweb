import { coins, fmtPct, isUp } from "./data";
import styles from "./FlatMap.module.css";
import { MapTip } from "./MapTip";
import type { MapSelection } from "./mapTypes";
import type { Layout } from "./treemap";

type FlatMapProps = Pick<MapSelection, "selected" | "onSelect" | "onHover"> & {
  layout: Layout;
  hovered: number;
  /** Coin whose tooltip is open, -1 for none. */
  tipIndex?: number;
  /** A non-interactive picture of the map, shown while the WebGL scene loads. */
  poster?: boolean;
};

const pct = (n: number) => `${(n * 100).toFixed(4)}%`;

export function FlatMap({ layout, selected, hovered, tipIndex = -1, onSelect, onHover, poster = false }: FlatMapProps) {
  const tipRect = tipIndex >= 0 ? layout.rects[tipIndex] : null;
  const nearTop = tipRect ? tipRect.y / layout.height < 0.22 : false;

  return (
    <div className={styles.field} data-poster={poster || undefined} aria-hidden>
      {layout.rects.map((r, i) => {
        const coin = coins[i];
        return (
          <div
            key={coin.ticker}
            className={styles.tile}
            data-up={isUp(coin)}
            data-hover={!poster && hovered === i}
            data-selected={!poster && selected === i}
            style={{
              left: pct(r.x / layout.width),
              top: pct(r.y / layout.height),
              width: pct(r.w / layout.width),
              height: pct(r.h / layout.height),
            }}
            onPointerEnter={poster ? undefined : (e) => e.pointerType === "mouse" && onHover(i, true)}
            onPointerLeave={poster ? undefined : () => onHover(i, false)}
            onClick={poster ? undefined : () => onSelect(i)}
          >
            <span className={styles.face}>
              <span className={styles.label}>
                <span>{coin.ticker}</span>
                <span className={styles.change}>{fmtPct(coin.change24h)}</span>
              </span>
            </span>
          </div>
        );
      })}

      {tipRect ? (
        <MapTip
          key={tipIndex}
          coin={coins[tipIndex]}
          placed
          style={{
            left: `clamp(122px, ${pct((tipRect.x + tipRect.w / 2) / layout.width)}, calc(100% - 122px))`,
            top: pct((nearTop ? tipRect.y + tipRect.h / 2 : tipRect.y) / layout.height),
            transform: nearTop ? "translate(-50%, -50%)" : "translate(-50%, calc(-100% - 6px))",
          }}
        />
      ) : null}
    </div>
  );
}
