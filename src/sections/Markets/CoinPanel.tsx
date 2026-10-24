import { AnimatePresence, motion } from "motion/react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useId, useRef, type KeyboardEvent } from "react";
import { Spotlight } from "../../components/Spotlight";
import { ease, spring } from "../../lib/motion";
import { SIM_LABEL, coins, fmtPct, isUp, moveSentence, weekSentence, type Coin } from "./data";
import type { MapSelection } from "./mapTypes";
import styles from "./CoinPanel.module.css";

const W = 320;
const H = 116;
const PAD_X = 6;
const PAD_Y = 14;

function plot(series: number[]) {
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = max - min || 1;
  const points = series.map((v, i) => [
    PAD_X + (i / (series.length - 1)) * (W - PAD_X * 2),
    PAD_Y + (1 - (v - min) / span) * (H - PAD_Y * 2),
  ]);
  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  return { line, first: points[0], last: points[points.length - 1] };
}

function WeekLine({ coin }: { coin: Coin }) {
  const { line, first, last } = plot(coin.series);
  return (
    <svg className={styles.svg} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${coin.name}, last 7 days`}>
      <line className={styles.base} x1={PAD_X} x2={W - PAD_X} y1={first[1]} y2={first[1]} />
      <motion.path
        d={line}
        className={styles.path}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, ease: ease.out }}
      />
      <motion.circle
        className={styles.dot}
        cx={last[0]}
        cy={last[1]}
        r={3.5}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.7 }}
      />
    </svg>
  );
}

const blur = { opacity: 0, filter: "blur(4px)" };
const STEPS: Record<string, number | undefined> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

export function CoinPanel({ selected, hovered, onSelect, onHover }: MapSelection) {
  const uid = useId();
  const chips = useRef<(HTMLButtonElement | null)[]>([]);
  const coin = coins[selected];
  const up = isUp(coin);
  const Arrow = up ? ArrowUpRight : ArrowDownRight;

  const onKeyDown = (e: KeyboardEvent) => {
    const step = STEPS[e.key];
    const current = chips.current.findIndex((c) => c === document.activeElement);
    let next = -1;
    if (step !== undefined && current >= 0) next = (current + step + coins.length) % coins.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = coins.length - 1;
    if (next < 0) return;
    e.preventDefault();
    chips.current[next]?.focus();
  };

  return (
    <Spotlight className={styles.panel}>
      <h3 className="sr-only">Selected coin</h3>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={coin.ticker}
          className={styles.detail}
          initial={blur}
          animate={{ opacity: 1, filter: "blur(0px)", transition: { duration: 0.4, ease: ease.out } }}
          exit={{ ...blur, transition: { duration: 0.14 } }}
        >
          <div className={styles.head}>
            <div>
              <p className={styles.ticker}>{coin.ticker}</p>
              <p className={styles.name}>{coin.name}</p>
            </div>
            <p className={styles.change} data-up={up}>
              <Arrow size={14} strokeWidth={1.75} aria-hidden />
              {fmtPct(coin.change24h)}
              <span className="sr-only"> today</span>
            </p>
          </div>

          <WeekLine coin={coin} />
          <p className={styles.axis} aria-hidden>
            <span>7 days ago</span>
            <span>now</span>
          </p>
        </motion.div>
      </AnimatePresence>

      <div className={styles.say} aria-live="polite" aria-atomic="true">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={coin.ticker}
            className={styles.sentence}
            initial={blur}
            animate={{ opacity: 1, filter: "blur(0px)", transition: { duration: 0.4, ease: ease.out, delay: 0.06 } }}
            exit={{ ...blur, transition: { duration: 0.14 } }}
          >
            {moveSentence(coin)} <span className={styles.week}>{weekSentence(coin)}</span>
          </motion.p>
        </AnimatePresence>
      </div>

      <div className={styles.list}>
        <p id={`${uid}-label`} className={styles.listLabel}>
          All {coins.length} coins
        </p>
        <div className={styles.chips} role="group" aria-labelledby={`${uid}-label`} onKeyDown={onKeyDown}>
          {coins.map((c, i) => (
            <button
              key={c.ticker}
              ref={(el) => {
                chips.current[i] = el;
              }}
              type="button"
              className={styles.chip}
              aria-pressed={i === selected}
              aria-label={`${c.name}, ${isUp(c) ? "up" : "down"} ${fmtPct(c.change24h, false)} today`}
              tabIndex={i === selected ? 0 : -1}
              data-up={isUp(c)}
              data-hover={hovered === i}
              onClick={() => onSelect(i)}
              onPointerEnter={(e) => e.pointerType === "mouse" && onHover(i, true)}
              onPointerLeave={() => onHover(i, false)}
              onFocus={(e) => e.currentTarget.matches(":focus-visible") && onHover(i, true)}
              onBlur={() => onHover(i, false)}
            >
              {i === selected ? (
                <motion.span layoutId={`${uid}-pill`} className={styles.pill} transition={spring.layout} aria-hidden />
              ) : null}
              <span className={styles.mark} aria-hidden />
              <span className={styles.chipText}>{c.ticker}</span>
            </button>
          ))}
        </div>
      </div>

      <p className={styles.sim}>{SIM_LABEL}</p>
    </Spotlight>
  );
}
