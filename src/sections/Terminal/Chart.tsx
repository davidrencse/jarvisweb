import { motion, useReducedMotion } from "motion/react";
import { useState, type PointerEvent } from "react";
import useMeasure from "react-use-measure";
import { ease } from "../../lib/motion";
import { money, percent, spanPhrase, stampLabel } from "./series";
import type { ChartData } from "./types";
import styles from "./Chart.module.css";

const PAD = { t: 18, r: 10, b: 30, l: 10 };
const DRAW = 0.9;

export function Chart({ chart }: { chart: ChartData }) {
  const reduced = useReducedMotion();
  const [ref, { width }] = useMeasure();
  const [hover, setHover] = useState<number | null>(null);

  const { points, ticks } = chart;
  const last = points.length - 1;
  const h = width && width < 460 ? 188 : 232;
  const plotW = width - PAD.l - PAD.r;
  const plotH = h - PAD.t - PAD.b;

  const values = points.map((p) => p.v);
  const hi = Math.max(...values);
  const lo = Math.min(...values);
  const room = (hi - lo) * 0.12 || 1;
  const x = (i: number) => PAD.l + (i / last) * plotW;
  const y = (v: number) => PAD.t + (1 - (v - (lo - room)) / (hi - lo + room * 2)) * plotH;

  const line = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(p.v).toFixed(1)}`).join(" ");
  const area = `${line} L${x(last).toFixed(1)} ${PAD.t + plotH} L${x(0).toFixed(1)} ${PAD.t + plotH} Z`;

  const at = hover ?? last;
  const point = points[at];
  const change = (point.v / points[0].v - 1) * 100;
  const dip = points[chart.dip];
  const dipY = Math.min(y(dip.v) + 20, PAD.t + plotH - 4);

  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const i = Math.round(((e.clientX - r.left - PAD.l) / plotW) * last);
    setHover(Math.max(0, Math.min(last, i)));
  };

  const delay = reduced ? 0 : DRAW - 0.1;
  const label = `${chart.name} over ${spanPhrase[chart.span]}, ${percent(chart.pct)}. Simulated prices.`;

  return (
    <div className={styles.root}>
      <div className={styles.readout}>
        <span className={styles.price}>{money(point.v)}</span>
        <span className={styles.change}>{percent(change)}</span>
        <span className={styles.stamp}>{hover === null ? `now · ${chart.span}` : stampLabel(point.t, chart.span)}</span>
      </div>

      <div ref={ref} className={styles.plot}>
        {width > 0 ? (
          <svg
            className={styles.svg}
            width={width}
            height={h}
            viewBox={`0 0 ${width} ${h}`}
            role="img"
            aria-label={label}
            onPointerMove={onMove}
            onPointerDown={onMove}
            onPointerLeave={(e) => {
              if (e.pointerType === "mouse") setHover(null);
            }}
          >
            {[hi, (hi + lo) / 2, lo].map((v, k) => (
              <g key={k}>
                <line className={styles.grid} x1={PAD.l} x2={PAD.l + plotW} y1={y(v)} y2={y(v)} />
                <text className={styles.axis} x={PAD.l + plotW} y={y(v) - 6} textAnchor="end">
                  {money(v)}
                </text>
              </g>
            ))}

            <motion.path
              className={styles.area}
              d={area}
              initial={{ opacity: reduced ? 1 : 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: reduced ? 0 : 0.4, duration: 0.6, ease: ease.out }}
            />
            <motion.path
              className={styles.stroke}
              d={line}
              initial={{ pathLength: reduced ? 1 : 0, opacity: reduced ? 1 : 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                pathLength: { duration: DRAW, ease: ease.out, delay: reduced ? 0 : 0.05 },
                opacity: { duration: 0.1 },
              }}
            />

            {hover !== null ? <line className={styles.cross} x1={x(at)} x2={x(at)} y1={PAD.t} y2={PAD.t + plotH} /> : null}

            <motion.g
              initial={{ opacity: reduced ? 1 : 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay, duration: 0.3 }}
            >
              <circle className={styles.dipRing} cx={x(chart.dip)} cy={y(dip.v)} r={5} />
              <text className={styles.axis} x={x(chart.dip)} y={dipY} textAnchor="middle">
                dip
              </text>
              <circle className={hover === null ? styles.dot : styles.dotHover} cx={x(at)} cy={y(point.v)} r={hover === null ? 3.5 : 4.5} />
            </motion.g>

            {ticks.map((t, k) => (
              <text
                key={k}
                className={styles.axis}
                x={x(t.i)}
                y={h - 8}
                textAnchor={k === 0 ? "start" : k === ticks.length - 1 ? "end" : "middle"}
              >
                {t.label}
              </text>
            ))}
          </svg>
        ) : null}
      </div>
    </div>
  );
}
