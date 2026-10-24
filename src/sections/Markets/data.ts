export type Coin = {
  /** Rank by market value; also the index into the treemap layout. */
  index: number;
  ticker: string;
  name: string;
  /** Synthetic market value in $ billions. */
  value: number;
  change24h: number;
  week: number;
  /** 29 samples across seven days, indexed to 100 at the start. */
  series: number[];
  /** How many of the other coins today's move beats. */
  beaten: number;
};

export const SIM_LABEL = "Simulated · not live prices";

/** ticker, name, value ($bn), change today (%), change over 7 days (%) */
const RAW: [string, string, number, number, number][] = [
  ["BTC", "Bitcoin", 300, 5.4, 8.2],
  ["ETH", "Ethereum", 170, 3.4, 5.1],
  ["BNB", "BNB", 70, 1.9, 2.2],
  ["SOL", "Solana", 64, 4.2, 9.6],
  ["XRP", "XRP", 58, 1.3, -1.4],
  ["DOGE", "Dogecoin", 40, 5.0, 11.3],
  ["ADA", "Cardano", 34, 2.3, 0.8],
  ["TON", "Toncoin", 30, 1.6, -2.7],
  ["AVAX", "Avalanche", 27, 2.9, 4.4],
  ["TRX", "TRON", 24, -0.3, 1.0],
  ["LINK", "Chainlink", 22, 4.8, 6.7],
  ["DOT", "Polkadot", 18, 1.1, -3.2],
  ["BCH", "Bitcoin Cash", 16, -0.9, 0.4],
  ["LTC", "Litecoin", 14, 0.7, -1.1],
  ["NEAR", "NEAR Protocol", 13, 0.9, 3.5],
  ["UNI", "Uniswap", 12, 0.5, -4.8],
  ["XLM", "Stellar", 11, -0.6, -0.9],
  ["ATOM", "Cosmos", 10, 0.2, -2.2],
  ["ETC", "Ethereum Classic", 9, -1.4, -5.6],
  ["INJ", "Injective", 8.5, 4.5, 12.4],
  ["APT", "Aptos", 8, -2.4, -6.3],
  ["FIL", "Filecoin", 7.5, -1.9, -3.7],
  ["OP", "Optimism", 7, -3.8, -8.1],
  ["ARB", "Arbitrum", 6.5, -3.1, -7.4],
];

const SAMPLES = 29;
const LAST_DAY = 24;

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** A seeded path that ends the week at `week` and the last day at `change24h`, so the line and the sentences agree. */
function makeSeries(ticker: string, change24h: number, week: number) {
  const rand = mulberry32(hash(ticker));
  const vol = 0.014 + rand() * 0.014;
  const end = 100 * (1 + week / 100);
  const dayAgo = end / (1 + change24h / 100);

  const walk = [0];
  for (let i = 1; i <= LAST_DAY; i++) walk.push(walk[i - 1] + (rand() + rand() + rand() - 1.5) * 2 * vol);

  const out: number[] = [];
  for (let i = 0; i <= LAST_DAY; i++) {
    const bridge = walk[i] - (i / LAST_DAY) * walk[LAST_DAY];
    out.push(100 * (dayAgo / 100) ** (i / LAST_DAY) * Math.exp(bridge));
  }
  for (let i = LAST_DAY + 1; i < SAMPLES; i++) {
    const t = (i - LAST_DAY) / (SAMPLES - 1 - LAST_DAY);
    const bump = (rand() - 0.5) * vol * 2 * Math.sin(Math.PI * t);
    out.push(dayAgo * (end / dayAgo) ** t * Math.exp(bump));
  }
  out[SAMPLES - 1] = end;
  return out;
}

export const coins: Coin[] = RAW.map(([ticker, name, value, change24h, week], index) => ({
  index,
  ticker,
  name,
  value,
  change24h,
  week,
  series: makeSeries(ticker, change24h, week),
  beaten: RAW.filter(([, , , other]) => (change24h >= 0 ? other < change24h : other > change24h)).length,
}));

export const isUp = (coin: Coin) => coin.change24h >= 0;

export function fmtPct(n: number, signed = true) {
  const body = `${Math.abs(n).toFixed(1)}%`;
  if (!signed) return body;
  return `${n < 0 ? "−" : "+"}${body}`;
}

export function moveSentence(coin: Coin) {
  const up = isUp(coin);
  return `${coin.name} is ${up ? "up" : "down"} ${fmtPct(coin.change24h, false)} today, ${
    up ? "more" : "a bigger fall"
  } than ${coin.beaten} of ${coins.length} coins.`;
}

export function weekSentence(coin: Coin) {
  return `Over the last 7 days it is ${coin.week >= 0 ? "up" : "down"} ${fmtPct(coin.week, false)}.`;
}

export const MOOD = 68;
const moodWord = MOOD >= 60 ? "greedy" : MOOD <= 40 ? "fearful" : "balanced";
export const MOOD_LABEL = MOOD >= 60 ? "leans greedy" : MOOD <= 40 ? "leans fearful" : "balanced";

const upCount = coins.filter(isUp).length;
const leader = coins.reduce((best, c) => (c.change24h > best.change24h ? c : best), coins[0]);

export const PULSE = `${upCount > coins.length / 2 ? "Most coins are up today" : "Most coins are down today"}; ${
  leader.name
} is leading and the mood leans ${moodWord}.`;

export const STRATEGY = {
  rule: "sma(20) crosses_above sma(50)",
  coin: "BTC",
  start: 1000,
  end: 1184,
  hold: 1090,
  sharpe: 1.21,
  drawdown: 8.4,
  trades: 14,
  winRate: 57,
  signal: "HOLD",
};

export const PIPELINE = [
  { name: "Market data", note: "prices, read only" },
  { name: "Strategies", note: "watching your coins" },
  { name: "Signals", note: "buy · sell · hold" },
  { name: "You decide", note: "nothing happens without you" },
  { name: "Real trading", note: "no order or wallet code", state: "Off" },
];
