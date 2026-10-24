import { coins as market } from "../Markets/data";
import { hash, mulberry32 } from "./rng";
import type { Span } from "./types";

export type Coin = {
  name: string;
  price: number;
  /** Market value, from the Markets section's synthetic data. */
  cap: string;
  /** Daily volatility, in percent, for the synthetic chart. */
  vol: number;
  moves: Record<Span, number>;
  blurb: string;
};

type Extra = { price: number; vol: number; blurb: string; long?: [m30: number, m90: number, m1y: number] };

/** Prices, volatility and blurbs are this terminal's own synthetic data. Names, market value and the 24-hour and 7-day moves come from the Markets section. */
const EXTRA: Record<string, Extra> = {
  BTC: { price: 67420, vol: 1.5, long: [11.6, 18.3, 52.1], blurb: "The first cryptocurrency: a digital currency that no company or government issues." },
  ETH: { price: 3310, vol: 2, blurb: "A network for running small programs and apps, with its own currency, ether." },
  BNB: { price: 586, vol: 1.4, blurb: "The currency of the BNB Chain network, first created by the Binance exchange." },
  SOL: { price: 172.4, vol: 3.2, blurb: "A fast network for apps and payments, with its own currency, SOL." },
  XRP: { price: 0.524, vol: 2.2, blurb: "A currency built for fast, cheap payments between banks and businesses." },
  DOGE: { price: 0.152, vol: 3.4, blurb: "A currency that began as an internet joke and kept a loyal community." },
  ADA: { price: 0.441, vol: 2.5, blurb: "The currency of Cardano, a network designed around peer-reviewed research." },
  TON: { price: 5.62, vol: 2.8, blurb: "The currency of The Open Network, first designed around a messaging app." },
  AVAX: { price: 34.1, vol: 3, blurb: "The currency of Avalanche, a network for apps and custom blockchains." },
  TRX: { price: 0.128, vol: 1.8, blurb: "The currency of TRON, a network mostly used to move digital dollars cheaply." },
  LINK: { price: 14.8, vol: 2.6, blurb: "A network that feeds real-world data, like prices, to other blockchains." },
  DOT: { price: 6.84, vol: 2.9, blurb: "The currency of Polkadot, a network that links many smaller blockchains." },
  BCH: { price: 468, vol: 2.4, blurb: "A currency that split from Bitcoin in 2017 to allow bigger blocks and cheaper payments." },
  LTC: { price: 82.6, vol: 2.1, blurb: "One of the older currencies, made as a lighter, faster take on Bitcoin." },
  NEAR: { price: 5.12, vol: 3.3, blurb: "The currency of NEAR, a network for apps with simple, readable account names." },
  UNI: { price: 8.35, vol: 3, blurb: "The token of Uniswap, a service for swapping coins without a middleman." },
  XLM: { price: 0.112, vol: 2.5, blurb: "The currency of Stellar, a network for low-cost payments across borders." },
  ATOM: { price: 7.4, vol: 2.8, blurb: "The currency of Cosmos, a network of blockchains designed to talk to each other." },
  ETC: { price: 26.2, vol: 2.6, blurb: "The original Ethereum chain, which kept running after the network split in 2016." },
  INJ: { price: 24.6, vol: 4, blurb: "The currency of Injective, a network built for trading apps." },
  APT: { price: 8.9, vol: 3.6, blurb: "The currency of Aptos, a network for fast, safe apps." },
  FIL: { price: 5.4, vol: 3.3, blurb: "The currency of Filecoin, a network where people rent out spare disk space." },
  OP: { price: 2.18, vol: 3.8, blurb: "The token of Optimism, a network that makes Ethereum cheaper and faster to use." },
  ARB: { price: 0.96, vol: 3.6, blurb: "The token of Arbitrum, another network that makes Ethereum cheaper and faster to use." },
};

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Longer windows follow from the 7-day move, with a fixed seed so they never change between visits. */
function longMoves(ticker: string, week: number): [number, number, number] {
  const rand = mulberry32(hash(`long:${ticker}`));
  const m30 = round1(week * (1.4 + rand() * 0.8) + (rand() - 0.5) * 8);
  const m90 = round1(m30 * (1.2 + rand() * 0.9) + (rand() - 0.5) * 10);
  const m1y = round1(m90 * (1.5 + rand() * 1.5) + (rand() - 0.5) * 30);
  return [m30, m90, m1y];
}

export type Ticker = string;

/** In the Markets section's order: by market value. */
export const COINS: Record<Ticker, Coin> = Object.fromEntries(
  market.map((m) => {
    const extra = EXTRA[m.ticker];
    const [m30, m90, m1y] = extra.long ?? longMoves(m.ticker, m.week);
    const coin: Coin = {
      name: m.name,
      price: extra.price,
      cap: `#${m.index + 1} of ${market.length}`,
      vol: extra.vol,
      moves: { "1D": m.change24h, "7D": m.week, "30D": m30, "90D": m90, "1Y": m1y },
      blurb: extra.blurb,
    };
    return [m.ticker, coin];
  }),
);

export const TICKERS: Ticker[] = market.map((m) => m.ticker);

export const isTicker = (s: string): s is Ticker => Object.hasOwn(COINS, s);
