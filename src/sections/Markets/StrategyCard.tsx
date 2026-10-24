import { motion, useInView } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import { Spotlight } from "../../components/Spotlight";
import { ease } from "../../lib/motion";
import { CountUp } from "./CountUp";
import { SIM_LABEL, STRATEGY } from "./data";
import styles from "./StrategyCard.module.css";

const { start, end, hold } = STRATEGY;
const BIGGEST_GAIN = end - start;

const BARS = [
  { label: "Strategy", gain: end - start, delay: 0.1, held: false },
  { label: "Holding", gain: hold - start, delay: 0.22, held: true },
];

export function StrategyCard() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  return (
    <Spotlight className={styles.card}>
      <div ref={ref}>
        <header className={styles.head}>
          <h3 className={styles.rule}>
            <code>{STRATEGY.rule}</code>
            <span className={styles.on}>on {STRATEGY.coin}</span>
          </h3>
          <p className={styles.sim}>{SIM_LABEL}</p>
        </header>

        <div className={styles.body}>
          <div className={styles.story}>
            <p className={styles.result}>
              <span className="sr-only">
                A $1,000 start became $1,184. Holding would have given $1,090.
              </span>
              <span className={styles.line} aria-hidden>
                <span className={styles.from}>$1,000</span>
                <ArrowRight size={22} strokeWidth={1.75} />
                <span>
                  <CountUp to={end} from={start} play={inView} prefix="$" duration={1.3} />
                </span>
              </span>
              <span className={styles.vs} aria-hidden>
                vs holding $<CountUp to={hold} from={start} play={inView} duration={1.3} />
              </span>
            </p>

            <div className={styles.bars} aria-hidden>
              {BARS.map((bar) => (
                <div key={bar.label} className={styles.bar}>
                  <span className={styles.barLabel}>{bar.label}</span>
                  <span className={styles.track}>
                    <motion.span
                      className={styles.fill}
                      data-held={bar.held}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: inView ? bar.gain / BIGGEST_GAIN : 0 }}
                      transition={{ duration: 1, ease: ease.out, delay: bar.delay }}
                    />
                  </span>
                  <span className={styles.barValue}>
                    <CountUp to={bar.gain} play={inView} prefix="+$" duration={1.1} delay={bar.delay} />
                  </span>
                </div>
              ))}
            </div>

            <p className={styles.plain}>
              It buys when the 20-period average of the price rises above the 50-period average. A strategy is a line of
              data, not a program. Long only, and each signal sees only prices from before it.
            </p>
          </div>

          <dl className={styles.stats}>
            <div className={styles.row}>
              <dt>
                Sharpe ratio
                <small>return for the risk taken</small>
              </dt>
              <dd>
                <CountUp to={STRATEGY.sharpe} play={inView} decimals={2} duration={1.1} />
              </dd>
            </div>
            <div className={styles.row}>
              <dt>
                Max drawdown
                <small>worst fall from a peak</small>
              </dt>
              <dd>
                <CountUp to={STRATEGY.drawdown} play={inView} decimals={1} prefix="−" suffix="%" duration={1.1} />
              </dd>
            </div>
            <div className={styles.row}>
              <dt>
                Trades
                <small>completed buy and sell rounds</small>
              </dt>
              <dd>
                <CountUp to={STRATEGY.trades} play={inView} duration={1.1} />
              </dd>
            </div>
            <div className={styles.row}>
              <dt>
                Win rate
                <small>trades that made money</small>
              </dt>
              <dd>
                <CountUp to={STRATEGY.winRate} play={inView} suffix="%" duration={1.1} />
              </dd>
            </div>
            <div className={styles.row}>
              <dt>
                Live signal
                <small>what it says right now</small>
              </dt>
              <dd>
                <span className={styles.signal}>
                  <i aria-hidden />
                  {STRATEGY.signal}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </Spotlight>
  );
}
