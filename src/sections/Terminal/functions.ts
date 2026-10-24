import { ROUTES, type RouteId } from "../Cost/data";
import { SIM_LABEL, STRATEGY } from "../Markets/data";
import { COINS, TICKERS, type Ticker } from "./coins";
import { NOTES, NUMBER_WORDS, SOURCES } from "./data";
import type { Command } from "./parser";
import { buildChart, dipWhen, money, ordinal, percent, spanPhrase } from "./series";
import type { AddedTask, Bar, FKey, Group, Monitor, MonitorRow, NoteHit, Outcome, Output, Result } from "./types";

export type Context = { added: AddedTask[] };

export const FKEYS: { key: FKey; label: string; command: string }[] = [
  { key: "F1", label: "HELP", command: "HELP" },
  { key: "F2", label: "BRIEF", command: "BRIEF" },
  { key: "F3", label: "MARKETS", command: "TOP" },
  { key: "F4", label: "NOTES", command: "NOTE os midterm" },
  { key: "F5", label: "MACHINES", command: "DEV" },
];

export const PLACEHOLDER = "BRIEF · DUE · NOTE os midterm · BTC GP 30D · CRED · HELP";

/* Suggestions */

type Suggestion = { text: string; hint: string; keywords: string[] };

const SUGGESTIONS: Suggestion[] = [
  { text: "BRIEF", hint: "Your morning brief", keywords: ["morning", "today", "agenda", "summary"] },
  { text: "DUE", hint: "What’s due", keywords: ["deadline", "deadlines", "overdue", "week", "homework"] },
  { text: "TASK ADD buy printer paper --due friday", hint: "Add a task", keywords: ["task", "todo", "add", "reminder"] },
  { text: "NOTE os midterm", hint: "Search your notes", keywords: ["notes", "search", "vault", "find"] },
  { text: "KB how often does the review routine run?", hint: "Ask your wiki", keywords: ["wiki", "knowledge", "question", "sources"] },
  { text: "BTC GP 30D", hint: "Bitcoin, 30 days", keywords: ["bitcoin", "chart", "price", "crypto", "markets"] },
  { text: "ETH GP 7D", hint: "Ethereum, 7 days", keywords: ["ethereum", "chart", "price", "crypto", "markets"] },
  { text: "DES SOL", hint: "About Solana", keywords: ["solana", "describe", "what is", "crypto"] },
  { text: "TOP", hint: "Today’s biggest movers", keywords: ["movers", "markets", "gainers"] },
  { text: "BT", hint: "Test a rule on past prices", keywords: ["backtest", "strategy", "rule"] },
  { text: "CRED", hint: "AI you have left", keywords: ["credits", "usage", "claude", "codex", "elevenlabs", "limits"] },
  { text: "DEV", hint: "Your machines", keywords: ["devices", "machines", "laptop", "laptops"] },
  { text: "ASK explain Belady’s anomaly", hint: "Ask the assistant", keywords: ["ask", "question", "explain"] },
  { text: "HELP", hint: "List every shortcut", keywords: ["commands", "shortcuts", "list"] },
];

export const STARTERS = ["BRIEF", "DUE", "NOTE os midterm", "BTC GP 30D", "CRED", "DEV"];

export type { Suggestion };

export function suggest(value: string): Suggestion[] {
  const q = value.trim().replace(/\s+/g, " ").toLowerCase();
  if (!q) return [];
  return SUGGESTIONS.map((s) => {
    const t = s.text.toLowerCase();
    let rank = 9;
    if (t.startsWith(q)) rank = 0;
    else if (s.keywords.some((k) => k.startsWith(q))) rank = 1;
    else if (t.split(" ").some((w) => w.startsWith(q))) rank = 2;
    return { s, rank };
  })
    .filter((x) => x.rank < 9)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 6)
    .map((x) => x.s);
}

/* Monitors */

const AGENDA: [string, string][] = [
  ["17:00", "OS assignment due"],
  ["Fri am", "Drone build, blocked"],
  ["Fri", "Pick a flight controller"],
  ["Sat", "Study group"],
  ["Sun", "Order the frame"],
];

const WEEKDAY = /^(mon|tues|wednes|thurs|fri|satur|sun)day$/i;

const shortDue = (due: string | null) => {
  if (!due) return "—";
  const first = due.split(" ")[0];
  return WEEKDAY.test(first) ? first.slice(0, 3) : first.slice(0, 8);
};

function agendaMonitor(added: AddedTask[], fresh?: AddedTask): Monitor {
  const mine: MonitorRow[] = [...added].reverse().map((t, i) => ({
    id: `added-${added.length - i}`,
    cells: [shortDue(t.due), t.text],
    active: t === fresh,
  }));
  const base: MonitorRow[] = AGENDA.map(([when, what]) => ({ id: `${when} ${what}`, cells: [when, what] }));
  return { id: "agenda", sub: "agenda, next days", cols: "4.4rem minmax(0, 1fr)", rows: [...mine, ...base] };
}

function marketMonitor(active: Ticker | null, run: (t: Ticker) => string): Monitor {
  return {
    id: "markets",
    sub: "top by market value",
    cols: "3rem minmax(0, 1fr) 4.4rem",
    numeric: true,
    rows: TICKERS.map((t) => ({
      id: t,
      cells: [t, money(COINS[t].price), percent(COINS[t].moves["1D"])],
      active: t === active,
      run: run(t),
    })),
  };
}

function notesMonitor(hits: NoteHit[]): Monitor {
  const top = hits[0]?.path;
  return {
    id: "vault",
    sub: "your vault, by match",
    cols: "3rem minmax(0, 1fr)",
    rows: NOTES.map((n) => {
      const hit = hits.find((h) => h.path === n.path);
      return { id: n.path, cells: [hit ? hit.score.toFixed(2) : "—", n.title], active: n.path === top, muted: !hit };
    }),
  };
}

function sourcesMonitor(cited: string[]): Monitor {
  return {
    id: "sources",
    sub: "wiki sources",
    cols: "3rem minmax(0, 1fr)",
    rows: SOURCES.map((s) => ({
      id: s.id,
      cells: [s.id.slice(-3), s.label],
      muted: !cited.includes(s.id),
    })),
  };
}

function machinesMonitor(): Monitor {
  return {
    id: "machines",
    sub: "this and the other laptop",
    cols: "3.4rem minmax(0, 1fr)",
    rows: [
      { id: "this", cells: ["Win", "This laptop"], run: "DEV" },
      { id: "other", cells: ["Arch", "Other laptop"], run: "DEV" },
    ],
  };
}

function routesMonitor(active: RouteId): Monitor {
  const what: Record<RouteId, string> = {
    local: "your notes, no model",
    simple: "lightest model",
    medium: "browser agent",
    complex: "planner, specialists",
  };
  return {
    id: "routes",
    sub: "where a request goes",
    cols: "4.4rem minmax(0, 1fr)",
    rows: ROUTES.map((r) => ({ id: r.id, cells: [r.name, what[r.id]], active: r.id === active })),
  };
}

function accountsMonitor(): Monitor {
  return {
    id: "accounts",
    sub: "what JARVIS thinks on",
    cols: "5.6rem minmax(0, 1fr)",
    rows: [
      { id: "claude", cells: ["Claude", "your plan"] },
      { id: "codex", cells: ["Codex", "your ChatGPT login"] },
      { id: "eleven", cells: ["ElevenLabs", "optional cloud voice"] },
    ],
  };
}

const make = (
  title: string,
  fkey: FKey | null,
  output: Output,
  plain: string,
  monitor?: Monitor,
  chip: Outcome["chip"] = null,
): Outcome => ({ title, fkey, chip, output, plain, monitor });

const word = (n: number) => NUMBER_WORDS[n] ?? String(n);

/* Functions */

const FROM_NOTES = "from your notes, no model, about 20 ms";

function help(): Outcome {
  const rows: [string, string, string][] = [
    ["BRIEF", "Your morning in one screen", "BRIEF"],
    ["DUE", "What’s overdue, today and this week", "DUE"],
    ["TASK ADD", "Add a task to your notes", "TASK ADD buy paper --due fri"],
    ["NOTE", "Search your notes", "NOTE os midterm"],
    ["KB", "Ask your wiki, with sources", "KB review routine"],
    ["TICKER GP", "A price chart, 1D to 1Y", "BTC GP 30D"],
    ["DES", "What a coin is, in a sentence", "DES SOL"],
    ["TOP", "Today’s biggest movers", "TOP"],
    ["BT", "Test a rule on past prices", "BT"],
    ["CRED", "How much AI you have left", "CRED"],
    ["DEV", "Your machines at a glance", "DEV"],
    ["ASK", "Hand anything to the assistant", "ASK explain paging"],
    ["HELP", "This list", "HELP"],
  ];
  return make(
    "HELP",
    "F1",
    {
      kind: "table",
      columns: ["Code", "What it does", "Try"],
      cols: "6.6rem minmax(0, 1fr) minmax(0, 15.5rem)",
      quiet: [1],
      mono: [0],
      rows: rows.map(([code, what, tryIt]) => [code, what, { text: tryIt, run: tryIt }]),
      foot: "Markets are recon only: nothing here can place a trade.",
    },
    "Thirteen shortcuts, and you never have to memorise them. Tap any example to run it, start typing to see suggestions, or just say “Jarvis.”",
  );
}

function brief(ctx: Context): Outcome {
  return make(
    "BRIEF",
    "F2",
    {
      kind: "groups",
      groups: [
        {
          heading: "Today",
          lines: [
            { key: "09:30", text: "Operating systems lecture" },
            { key: "13:00", text: "Drone build session" },
            { key: "17:00", text: "OS assignment due" },
          ],
        },
        {
          heading: "Due soon",
          lines: [
            { key: "Fri", text: "Pick a flight controller" },
            { key: "Fri", text: "Buy printer paper" },
            { key: "Sun", text: "Order the frame" },
          ],
        },
        {
          heading: "Priorities",
          lines: [
            { key: "1", text: "Finish the OS assignment" },
            { key: "2", text: "Pick a flight controller" },
          ],
        },
      ],
      foot: FROM_NOTES,
    },
    "Two things today: your OS assignment is due at 5 pm, and the afternoon is blocked for the drone build. Everything else can wait until Friday.",
    agendaMonitor(ctx.added),
  );
}

function due(ctx: Context): Outcome {
  const groups: Group[] = [
    { heading: "Overdue", lines: [{ key: "Tue", text: "Reply to the study group", meta: "people/study-group.md" }] },
    { heading: "Today", lines: [{ key: "17:00", text: "OS assignment", meta: "courses/operating-systems.md" }] },
    {
      heading: "This week",
      lines: [
        { key: "Fri", text: "Pick a flight controller", meta: "projects/drone-blueprint.md" },
        { key: "Fri", text: "Buy printer paper", meta: "inbox.md" },
        { key: "Sun", text: "Order the frame", meta: "projects/drone-blueprint.md" },
      ],
    },
  ];
  if (ctx.added.length) {
    groups.push({
      heading: "Added just now",
      lines: ctx.added.map((t) => ({ key: shortDue(t.due), text: t.text, meta: "inbox.md" })),
    });
  }
  return make(
    "DUE",
    null,
    { kind: "groups", groups, foot: FROM_NOTES },
    `One thing is overdue and one is due at 5 pm today. ${word(3 + ctx.added.length)} more land later this week, so start with the study group reply.`,
    agendaMonitor(ctx.added),
  );
}

function task(cmd: Extract<Command, { fn: "TASK" }>, ctx: Context): Outcome {
  const fresh = ctx.added[ctx.added.length - 1];
  return make(
    cmd.echo,
    null,
    {
      kind: "groups",
      groups: [
        {
          heading: "Added to inbox.md",
          lines: [{ key: "added", text: `- [ ] ${cmd.text}`, meta: cmd.due ? `due ${cmd.due}` : "no due date", mono: true }],
        },
        { heading: "Audit", lines: [{ key: "+1", text: ".jarvis/vault-writes.jsonl  task_add", mono: true, muted: true }] },
      ],
      foot: "Writes only add. Nothing already in your notes was touched.",
    },
    `Added “${cmd.text}”${cmd.due ? `, due ${cmd.due}` : ""}, to your task list. Nothing else in your notes changed.`,
    agendaMonitor(ctx.added, fresh),
  );
}

function note(cmd: Extract<Command, { fn: "NOTE" }>): Outcome {
  const tokens = [...new Set(cmd.query.toLowerCase().match(/[a-z0-9]+/g) ?? [])];
  const scored = NOTES.map((n) => {
    let score = 0;
    for (const tok of tokens) {
      let best = 0;
      for (const [term, w] of Object.entries(n.terms)) {
        if (term === tok || (tok.length >= 3 && term.startsWith(tok))) best = Math.max(best, w);
      }
      score += best;
    }
    return { note: n, score: Math.min(0.97, score) };
  }).sort((a, b) => b.score - a.score);

  const top = scored[0]?.score ?? 0;
  const hits: NoteHit[] = scored
    .filter((s) => s.score >= 0.2 && s.score >= top * 0.45)
    .slice(0, 3)
    .map((s) => ({ path: s.note.path, score: s.score, excerpt: s.note.excerpt }));

  const foot = "abstains under 45% of the best match";
  if (!hits.length) {
    return make(
      cmd.echo,
      "F4",
      {
        kind: "groups",
        groups: [
          {
            heading: "No close match",
            lines: [
              { text: `Nothing in your vault is close to “${cmd.query}”.` },
              { text: "JARVIS stays quiet instead of guessing.", muted: true },
            ],
          },
        ],
        foot,
      },
      "Nothing in your notes matches that well, so JARVIS says so instead of guessing.",
      notesMonitor([]),
    );
  }

  const title = (path: string) => NOTES.find((n) => n.path === path)?.title ?? path;
  const others = hits.length - 1;
  const plain = others
    ? `Your best match is ${title(hits[0].path)}. ${others === 1 ? "One more note is" : `${word(others)} more notes are`} close enough to show; weaker guesses are left out on purpose.`
    : `Only ${title(hits[0].path)} is a close match, so that is all it shows. Weaker guesses are left out on purpose.`;

  return make(cmd.echo, "F4", { kind: "notes", items: hits, foot }, plain, notesMonitor(hits));
}

function kb(cmd: Extract<Command, { fn: "KB" }>): Outcome {
  const q = cmd.question.toLowerCase();

  if (/review|routine|daily|weekly|often|nightly|sunday/.test(q)) {
    return make(
      cmd.echo,
      null,
      {
        kind: "groups",
        groups: [
          {
            heading: "The sources disagree",
            lines: [
              { key: "daily", text: "The review routine runs daily at 02:00. [[source-001]]", meta: "confirmed 2026-09-01" },
              { key: "weekly", text: "The review routine runs weekly on Sundays. [[source-014]]", meta: "confirmed 2026-10-19" },
            ],
          },
          {
            heading: "Status",
            lines: [
              { text: "review-routine.md · conflict: how often (daily ≠ weekly)", mono: true },
              { text: "Waiting for your ruling.", muted: true },
            ],
          },
        ],
        foot: "The checker flags claims that disagree. It never overwrites one.",
      },
      "Your notes disagree on this one, so JARVIS won’t pick a side. One source says daily, a newer one says weekly, and it’s waiting for you to decide which stands.",
      sourcesMonitor(["source-001", "source-014"]),
    );
  }

  if (/belady|fifo|page|anomal|frame|replacement/.test(q)) {
    return make(
      cmd.echo,
      null,
      {
        kind: "groups",
        groups: [
          {
            heading: "Answer",
            lines: [
              {
                text: "Belady’s anomaly is when giving a program more page frames makes it fault more, which can happen under FIFO replacement. [[source-003]]",
              },
              { text: "Stack algorithms such as LRU cannot show it. [[source-003]]" },
            ],
          },
          { heading: "Source", lines: [{ key: "source-003", text: "OS lecture notes, kept as received", muted: true }] },
        ],
        foot: "Every claim carries the source it came from.",
      },
      "Your wiki has a clear answer, and every claim points back to the source it came from, so you can check it yourself.",
      sourcesMonitor(["source-003"]),
    );
  }

  return make(
    cmd.echo,
    null,
    {
      kind: "groups",
      groups: [
        {
          heading: "Nothing yet",
          lines: [
            { text: `Your wiki has no claim that answers “${cmd.question}”.` },
            { text: "Hand it a PDF, a link or a voice memo and the Librarian files the claims.", muted: true },
          ],
        },
      ],
      foot: "Try KB how often does the review routine run?",
    },
    "Nothing in your wiki answers that yet, and it won’t guess. This demo only knows a couple of topics, so try the review routine question.",
    sourcesMonitor([]),
  );
}

function gp(cmd: Extract<Command, { fn: "GP" }>, now: number): Outcome {
  const chart = buildChart(cmd.ticker, cmd.span, now);
  const dir = chart.pct >= 0 ? "up" : "down";
  const when = dipWhen(chart.points[chart.dip].t, cmd.span);
  return make(
    cmd.echo,
    "F3",
    { kind: "chart", chart, foot: `${SIM_LABEL}. Move across the line to read a point.` },
    `${chart.name} is ${dir} ${Math.abs(chart.pct).toFixed(1)}% over ${spanPhrase[cmd.span]}, with one sharp dip ${when}.`,
    marketMonitor(cmd.ticker, (t) => `${t} GP ${cmd.span}`),
    { ticker: cmd.ticker, active: cmd.span },
  );
}

function des(cmd: Extract<Command, { fn: "DES" }>): Outcome {
  const coin = COINS[cmd.ticker];
  const rank = TICKERS.indexOf(cmd.ticker) + 1;
  const today = coin.moves["1D"];
  return make(
    cmd.echo,
    "F3",
    {
      kind: "facts",
      title: `${coin.name} · ${cmd.ticker}`,
      text: coin.blurb,
      facts: [
        ["Last", money(coin.price)],
        ["24 hours", percent(today)],
        ["7 days", percent(coin.moves["7D"])],
        ["Size rank", coin.cap],
        ["Size here", `${rank} of ${TICKERS.length} tracked`],
      ],
      foot: `${SIM_LABEL}.`,
    },
    `${coin.name} is ${rank === 1 ? "the biggest" : `the ${ordinal(rank)} biggest`} of the ${TICKERS.length} coins JARVIS tracks here, and it is ${today >= 0 ? "up" : "down"} ${Math.abs(today).toFixed(1)}% today.`,
    marketMonitor(cmd.ticker, (t) => `DES ${t}`),
  );
}

function top(): Outcome {
  const movers = [...TICKERS].sort((a, b) => Math.abs(COINS[b].moves["1D"]) - Math.abs(COINS[a].moves["1D"])).slice(0, 6);
  const lead = movers[0];
  const ups = movers.filter((t) => COINS[t].moves["1D"] > 0).length;
  const slipping = movers.filter((t) => COINS[t].moves["1D"] < 0).map((t) => COINS[t].name);
  const slip = slipping.length
    ? `, and ${slipping.join(" and ")} ${slipping.length > 1 ? "are" : "is"} slipping`
    : "";
  const move = COINS[lead].moves["1D"];
  return make(
    "TOP",
    "F3",
    {
      kind: "table",
      columns: ["Coin", "Last", "24 hours"],
      cols: "minmax(0, 1fr) 6.2rem 5rem",
      rows: movers.map((t) => [
        { text: `${t} ${COINS[t].name}`, run: `${t} GP 30D` },
        money(COINS[t].price),
        percent(COINS[t].moves["1D"]),
      ]),
      foot: `Biggest moves in the last 24 hours. ${SIM_LABEL}.`,
    },
    `${COINS[lead].name} moved the most today, ${move >= 0 ? "up" : "down"} ${Math.abs(move).toFixed(1)}%. ${word(ups)} of the ${word(movers.length).toLowerCase()} biggest moves are up${slip}.`,
    marketMonitor(null, (t) => `${t} GP 30D`),
  );
}

function bt(): Outcome {
  const st = STRATEGY;
  const usd = (n: number) => `$${n.toLocaleString("en-US")}`;
  return make(
    "BT",
    "F3",
    {
      kind: "facts",
      title: st.coin,
      code: st.rule,
      big: { main: `${usd(st.start)} → ${usd(st.end)}`, vs: `holding instead: ${usd(st.hold)}` },
      facts: [
        ["Sharpe", st.sharpe.toFixed(2)],
        ["Max drawdown", `−${st.drawdown}%`],
        ["Trades", String(st.trades)],
        ["Win rate", `${st.winRate}%`],
        ["Signal now", st.signal],
      ],
      foot: `Long only, no look-ahead. Simulated history. JARVIS has no code that can place a trade.`,
    },
    `Following this rule on Bitcoin would have turned ${usd(st.start)} into ${usd(st.end)}, against ${usd(st.hold)} for just holding. It only looks backwards: it predicts nothing, and JARVIS can’t place a trade.`,
    marketMonitor(st.coin, (t) => `${t} GP 30D`),
  );
}

function cred(): Outcome {
  const items: Bar[] = [
    { label: "Claude", sub: "this window", left: 0.59, readout: "59% left", detail: "resets in 2 h 10 min" },
    { label: "Codex", sub: "5 h window", left: 0.66, readout: "34% used" },
    { label: "Codex", sub: "this week", left: 0.72, readout: "72% left" },
    { label: "ElevenLabs", sub: "characters this month", left: 0.22, readout: "2,200 of 10,000 left" },
  ];
  return make(
    "CRED",
    null,
    { kind: "bars", items, foot: "Simulated numbers. Windows on plans you already pay for." },
    "Plenty left on Claude and Codex. ElevenLabs is running lowest, and the local voice is free if you’d rather save it.",
    accountsMonitor(),
  );
}

function dev(): Outcome {
  return make(
    "DEV",
    "F5",
    {
      kind: "table",
      columns: ["Machine", "Link", "Free memory", "Load", "Clipboard"],
      cols: "minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 1fr) 3.2rem minmax(0, 1fr)",
      rows: [
        ["This laptop", "this one", "9.4 GB", "0.31", "synced"],
        ["Other laptop", "up · 4 ms", "11.2 GB", "0.42", "synced"],
      ],
      foot: "Windows and Arch Linux, one clipboard.",
    },
    "Both laptops are online and sharing a clipboard. The other one answers in 4 ms and has plenty of memory free.",
    machinesMonitor(),
  );
}

function routeOf(text: string): RouteId {
  const t = text.toLowerCase();
  if (/\b(build|create|make|design|plan|write|refactor|automate|set up)\b/.test(t) || /\bthen\b/.test(t)) return "complex";
  if (/\b(site|website|page|browser|portal|grades?|go to|log ?in)\b|https?:|\.com\b/.test(t)) return "medium";
  if (/\b(due|brief|agenda|today|tomorrow|this week|schedule|deadline|overdue)\b/.test(t)) return "local";
  return "simple";
}

const ROUTE_TIME: Partial<Record<RouteId, string>> = { local: "about 20 ms", simple: "about 1 s" };

const ROUTE_PLAIN: Record<RouteId, string> = {
  local: "That one never leaves your laptop. It’s answered from your notes in about 20 ms, with no model and no cost.",
  simple:
    "A plain question goes to the lightest model on the ChatGPT or Claude plan you already pay for. No API key, no extra bill.",
  medium:
    "Because it names a site, a browser agent takes it, working inside your plan. It asks before anything that changes something.",
  complex:
    "A job with several parts gets a planner that splits it into steps, each handed to a specialist on the lowest power that can do it.",
};

function ask(cmd: Extract<Command, { fn: "ASK" }>): Outcome {
  const id = routeOf(cmd.text);
  const route = ROUTES.find((r) => r.id === id) ?? ROUTES[1];
  const shown = cmd.text.length > 120 ? `${cmd.text.slice(0, 117)}…` : cmd.text;
  const lines = [
    { key: "tier", text: route.name },
    { key: "runs", text: route.runs },
    { key: "cost", text: route.cost === "free" ? "free" : "your plan, no API meter" },
    ...(ROUTE_TIME[id] ? [{ key: "reply", text: ROUTE_TIME[id] as string }] : []),
  ];
  return make(
    cmd.echo,
    null,
    {
      kind: "groups",
      groups: [
        { heading: id === "local" ? "Answered from your notes, no model" : "Sent to your plan’s brain", lines: [{ text: `“${shown}”` }] },
        { heading: "Routed", lines },
      ],
      foot: "Simulated: nothing was sent.",
    },
    ROUTE_PLAIN[id],
    routesMonitor(id),
  );
}

export function run(cmd: Command, ctx: Context, now: number = Date.now()): Outcome {
  switch (cmd.fn) {
    case "HELP":
      return help();
    case "BRIEF":
      return brief(ctx);
    case "DUE":
      return due(ctx);
    case "TASK":
      return task(cmd, ctx);
    case "NOTE":
      return note(cmd);
    case "KB":
      return kb(cmd);
    case "GP":
      return gp(cmd, now);
    case "DES":
      return des(cmd);
    case "TOP":
      return top();
    case "BT":
      return bt();
    case "CRED":
      return cred();
    case "DEV":
      return dev();
    case "ASK":
      return ask(cmd);
    case "ERROR":
      return make(
        cmd.echo || "?",
        null,
        { kind: "error", message: cmd.message, tries: cmd.tries },
        cmd.plain,
      );
  }
}

/** The first thing on screen: an invitation, or BRIEF's result when motion is reduced. */
export function seed(showBrief: boolean): Result {
  const out: Outcome = showBrief
    ? brief({ added: [] })
    : make(
        "ready",
        null,
        { kind: "idle", starters: STARTERS },
        "Type a shortcut, press a key below, or tap one of these. Every answer comes with a sentence like this one, so you never have to learn the codes.",
        agendaMonitor([]),
      );
  return { ...out, id: "0", monitor: out.monitor ?? agendaMonitor([]) };
}
