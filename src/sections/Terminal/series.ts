import { COINS, type Ticker } from "./coins";
import { gauss, hash, mulberry32 } from "./rng";
import { SPANS, type ChartData, type Point, type Span } from "./types";

const DAY = 864e5;
const POINTS: Record<Span, number> = { "1D": 25, "7D": 43, "30D": 31, "90D": 91, "1Y": 53 };
const LENGTH: Record<Span, number> = { "1D": DAY, "7D": 7 * DAY, "30D": 30 * DAY, "90D": 90 * DAY, "1Y": 365 * DAY };
const STEP_VOL: Record<Span, number> = { "1D": 0.22, "7D": 0.4, "30D": 1, "90D": 1, "1Y": 2.4 };

const en = "en-US";

export const money = (v: number) => {
  if (v >= 1000) return `$${Math.round(v).toLocaleString(en)}`;
  if (v >= 1) return `$${v.toFixed(2)}`;
  return `$${v.toFixed(4)}`;
};

export const percent = (v: number) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(1)}%`;

export const ordinal = (n: number) => {
  const r = n % 100;
  if (r >= 11 && r <= 13) return `${n}th`;
  return `${n}${["th", "st", "nd", "rd"][n % 10 > 3 ? 0 : n % 10]}`;
};

export const tickLabel = (t: number, span: Span) => {
  const d = new Date(t);
  if (span === "1D") return d.toLocaleTimeString(en, { hour: "numeric" }).toLowerCase();
  if (span === "7D") return d.toLocaleDateString(en, { weekday: "short" });
  if (span === "1Y") return d.toLocaleDateString(en, { month: "short" });
  return d.toLocaleDateString(en, { month: "short", day: "numeric" });
};

export const stampLabel = (t: number, span: Span) => {
  const d = new Date(t);
  if (span === "1D") return d.toLocaleTimeString(en, { hour: "numeric", minute: "2-digit" }).toLowerCase();
  if (span === "7D") return `${d.toLocaleDateString(en, { weekday: "short" })} ${d.toLocaleTimeString(en, { hour: "numeric" }).toLowerCase()}`;
  return d.toLocaleDateString(en, { month: "short", day: "numeric" });
};

export const dipWhen = (t: number, span: Span) => {
  const d = new Date(t);
  if (span === "1D") return `around ${d.toLocaleTimeString(en, { hour: "numeric" }).toLowerCase()}`;
  if (span === "7D") return `on ${d.toLocaleDateString(en, { weekday: "long" })}`;
  if (span === "30D") return `on the ${ordinal(d.getDate())}`;
  if (span === "90D") return `on ${d.toLocaleDateString(en, { month: "short", day: "numeric" })}`;
  return `in ${d.toLocaleDateString(en, { month: "long" })}`;
};

export const spanPhrase: Record<Span, string> = {
  "1D": "the last day",
  "7D": "7 days",
  "30D": "30 days",
  "90D": "90 days",
  "1Y": "the past year",
};

const DAYS: Record<Span, number> = { "1D": 1, "7D": 7, "30D": 30, "90D": 90, "1Y": 365 };

/**
 * A deterministic synthetic series: the same ticker and window always draw the same line.
 * The line is bridged through every known move (a day ago, a week ago and so on), so it never disagrees with the numbers beside it.
 */
export function buildChart(ticker: Ticker, span: Span, now: number): ChartData {
  const coin = COINS[ticker];
  const n = POINTS[span];
  const rng = mulberry32(hash(`${ticker}:${span}`));
  const sigma = (coin.vol / 100) * STEP_VOL[span];
  const dipAt = span === "30D" ? n - 11 : Math.round((n - 1) * 0.64);
  const pct = coin.moves[span];

  const x = [0];
  for (let i = 1; i < n; i++) {
    let step = gauss(rng) * sigma;
    if (i === dipAt) step = -3.4 * sigma;
    else if (i === dipAt + 1) step = 1.8 * sigma;
    x.push(x[i - 1] + step);
  }

  const levels = new Map<number, number>([[n - 1, 0]]);
  for (const a of SPANS) {
    if (DAYS[a] > DAYS[span]) continue;
    const i = Math.round(n - 1 - (DAYS[a] * (n - 1)) / DAYS[span]);
    if (i >= 0 && i < n - 1 && !levels.has(i)) levels.set(i, -Math.log(1 + coin.moves[a] / 100));
  }
  const knots = [...levels.keys()].sort((p, q) => p - q);
  const y: number[] = new Array(n).fill(0);
  for (let k = 0; k < knots.length - 1; k++) {
    const a = knots[k];
    const b = knots[k + 1];
    const fa = (levels.get(a) as number) - x[a];
    const fb = (levels.get(b) as number) - x[b];
    for (let i = a; i <= b; i++) y[i] = x[i] + fa + ((fb - fa) * (i - a)) / (b - a);
  }

  const stepMs = LENGTH[span] / (n - 1);
  const points: Point[] = y.map((yi, i) => ({ t: now - (n - 1 - i) * stepMs, v: coin.price * Math.exp(yi) }));

  let dip = 1;
  let worst = Infinity;
  for (let i = 1; i < n; i++) {
    const r = points[i].v / points[i - 1].v;
    if (r < worst) {
      worst = r;
      dip = i;
    }
  }

  const ticks = [0, 1, 2, 3, 4].map((k) => {
    const i = Math.round((k * (n - 1)) / 4);
    return { i, label: tickLabel(points[i].t, span) };
  });

  return { ticker, name: coin.name, span, points, dip, pct, ticks };
}
