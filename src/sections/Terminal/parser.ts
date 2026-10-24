import { isTicker, type Ticker } from "./coins";
import { SPANS, type Span } from "./types";

const PLAIN = ["HELP", "BRIEF", "DUE", "TOP", "BT", "CRED", "DEV"] as const;
type Plain = (typeof PLAIN)[number];

export type Command =
  | { fn: Plain; echo: string }
  | { fn: "TASK"; echo: string; text: string; due: string | null }
  | { fn: "NOTE"; echo: string; query: string }
  | { fn: "KB"; echo: string; question: string }
  | { fn: "ASK"; echo: string; text: string }
  | { fn: "GP"; echo: string; ticker: Ticker; span: Span }
  | { fn: "DES"; echo: string; ticker: Ticker }
  | { fn: "ERROR"; echo: string; message: string; plain: string; tries: string[] };

const SPAN_ALIASES: Record<string, Span> = {
  "1D": "1D",
  "24H": "1D",
  "7D": "7D",
  "1W": "7D",
  "30D": "30D",
  "1M": "30D",
  "90D": "90D",
  "3M": "90D",
  "1Y": "1Y",
  "12M": "1Y",
  "365D": "1Y",
};

const isPlain = (s: string): s is Plain => (PLAIN as readonly string[]).includes(s);

const error = (echo: string, message: string, plain: string, tries: string[] = ["HELP"]): Command => ({
  fn: "ERROR",
  echo,
  message,
  plain,
  tries,
});

const titleCase = (s: string) => s.replace(/\b\p{L}/gu, (c) => c.toUpperCase());

const unquote = (s: string) => s.replace(/^(["“'])(.*)(["”'])$/, "$2").trim();

/** Turns what was typed into a command. Case-insensitive, tolerant of extra spaces, never throws. */
export function parse(input: string): Command | null {
  const text = input.trim().replace(/^\/\s*/, "").replace(/\s+/g, " ");
  if (!text) return null;

  const [head, ...rest] = text.split(" ");
  const code = head.toUpperCase();
  const args = rest.join(" ");

  if (isPlain(code)) {
    if (args) {
      return error(
        code,
        `${code} doesn’t take anything after it. Type ${code} on its own.`,
        `${code} works by itself, so nothing ran. Type just ${code} and press Enter.`,
        [code],
      );
    }
    return { fn: code, echo: code };
  }

  if (code === "TASK") {
    const m = args.match(/^add(?:\s+(.*))?$/i);
    let body = m?.[1] ?? "";
    let due: string | null = null;
    const d = body.match(/(?:^|\s)--due\s+(.+)$/i);
    if (d) {
      due = titleCase(d[1].trim());
      body = body.slice(0, d.index).trim();
    }
    body = unquote(body);
    if (!m || !body) {
      return error(
        `TASK ${args}`.trim(),
        "TASK ADD needs the task, then optionally --due and a day. Try TASK ADD buy printer paper --due friday.",
        "To add a task, type TASK ADD and then what you need to do. Add --due and a day if it has a deadline.",
        ["TASK ADD buy printer paper --due friday"],
      );
    }
    return { fn: "TASK", echo: `TASK ADD ${body}${due ? ` --due ${due.toLowerCase()}` : ""}`, text: body, due };
  }

  if (code === "NOTE") {
    if (!args) {
      return error(
        "NOTE",
        "NOTE needs a few words to look for. Try NOTE os midterm.",
        "NOTE searches your notes, so give it a few words to look for.",
        ["NOTE os midterm"],
      );
    }
    return { fn: "NOTE", echo: `NOTE ${args}`, query: args };
  }

  if (code === "KB") {
    if (!args) {
      return error(
        "KB",
        "KB needs a question. Try KB how often does the review routine run?",
        "KB asks your wiki a question, so type the question after it.",
        ["KB how often does the review routine run?"],
      );
    }
    return { fn: "KB", echo: `KB ${args}`, question: args };
  }

  if (code === "ASK") {
    if (!args) {
      return error(
        "ASK",
        "ASK needs something to ask. Try ASK explain Belady’s anomaly.",
        "ASK hands any question to the assistant, so type it after the word ASK.",
        ["ASK explain Belady’s anomaly"],
      );
    }
    return { fn: "ASK", echo: `ASK ${args}`, text: args };
  }

  if (code === "DES") {
    const t = rest[0]?.toUpperCase();
    if (!t) {
      return error("DES", "DES needs a ticker. Try DES SOL.", "DES describes a coin, so add its ticker, like DES SOL.", ["DES SOL"]);
    }
    if (!isTicker(t)) return unknownTicker(`DES ${t}`, t);
    return { fn: "DES", echo: `DES ${t}`, ticker: t };
  }

  if (code === "GP") {
    const t = rest[0]?.toUpperCase();
    if (!t) return error("GP", "GP needs a ticker first. Try BTC GP 30D.", "GP draws a price chart. Put the ticker first, like BTC GP 30D.", ["BTC GP 30D"]);
    return chart(t, rest[1], rest.length > 2);
  }

  if (isTicker(code)) {
    if (rest.length === 0) return chart(code, undefined, false);
    if (rest[0].toUpperCase() === "GP") return chart(code, rest[1], rest.length > 2);
    return error(
      `${code} ${args}`,
      `${code} on its own shows a chart. Try ${code} GP 30D.`,
      `After a ticker, type GP and a window, like ${code} GP 30D.`,
      [`${code} GP 30D`],
    );
  }

  if (rest[0]?.toUpperCase() === "GP") return unknownTicker(text, code);

  return error(
    head,
    `No function called ${head.toUpperCase()}. Type HELP to see them all.`,
    "That isn’t one of the shortcuts, so nothing ran. HELP lists them all. To ask in your own words, start with ASK, or just say “Jarvis.”",
  );
}

function chart(ticker: string, win: string | undefined, extra: boolean): Command {
  if (!isTicker(ticker)) return unknownTicker(ticker, ticker);
  const span = win ? SPAN_ALIASES[win.toUpperCase()] : "30D";
  if (!span || extra) {
    return error(
      `${ticker} GP ${win ?? ""}`.trim(),
      `${win ? win.toUpperCase() : "That"} isn’t a window here. Use ${SPANS.join(", ")}.`,
      `Charts come in five windows: ${SPANS.join(", ")}. Try ${ticker} GP 30D.`,
      [`${ticker} GP 30D`],
    );
  }
  return { fn: "GP", echo: `${ticker} GP ${span}`, ticker, span };
}

function unknownTicker(echo: string, t: string): Command {
  return error(
    echo,
    `No ticker called ${t}. Try BTC, ETH or SOL.`,
    "JARVIS doesn’t track that ticker in this demo, so nothing ran. BTC, ETH and SOL are good places to start.",
    ["BTC GP 30D", "ETH GP 7D"],
  );
}
