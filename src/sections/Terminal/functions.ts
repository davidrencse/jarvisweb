import { ROUTES, type RouteId } from "../Cost/data";
import { DEVICES, MEMORY, NUMBER_WORDS, SOURCES, type DeviceId } from "./data";
import type { Command } from "./parser";
import type { ActionRun, AddedTask, Bar, FKey, Group, Line, Monitor, MonitorRow, NoteHit, Outcome, Result } from "./types";

export type Context = { added: AddedTask[]; actions: ActionRun[] };

export const FKEYS: { key: FKey; label: string; command: string }[] = [
  { key: "F1", label: "HELP", command: "HELP" },
  { key: "F2", label: "BRIEF", command: "BRIEF" },
  { key: "F3", label: "ACT", command: "DO open spotify on the dell" },
  { key: "F4", label: "MEMORY", command: "MEM lan mouse" },
  { key: "F5", label: "MACHINES", command: "DEV" },
];

export const PLACEHOLDER = "DO open spotify on the dell · HIST · MEM lan mouse · DEV · CRED · HELP";

/* Suggestions */

type Suggestion = { text: string; hint: string; keywords: string[] };

const SUGGESTIONS: Suggestion[] = [
  { text: "DO open spotify on the dell", hint: "Act on another machine", keywords: ["open", "app", "launch", "dell", "action", "run"] },
  { text: "DO volume 30", hint: "Set the volume here", keywords: ["volume", "sound", "audio", "louder", "quieter"] },
  { text: "DO close chrome on the dell", hint: "An action that asks first", keywords: ["close", "quit", "confirm", "approve"] },
  { text: "HIST", hint: "What it did, and what it saw", keywords: ["history", "actions", "log", "did", "outcomes"] },
  { text: "MEM lan mouse", hint: "Search what it remembers", keywords: ["memory", "remember", "recall", "search", "find"] },
  { text: "BRIEF", hint: "Your morning brief", keywords: ["morning", "today", "agenda", "summary"] },
  { text: "DUE", hint: "What’s due", keywords: ["deadline", "deadlines", "overdue", "week", "homework"] },
  { text: "TASK ADD buy printer paper --due friday", hint: "Add a task", keywords: ["task", "todo", "add", "reminder"] },
  { text: "KB how often does the review routine run?", hint: "Ask your wiki", keywords: ["wiki", "knowledge", "question", "sources"] },
  { text: "DEV", hint: "Your machines", keywords: ["devices", "machines", "laptop", "laptops", "cluster", "nodes"] },
  { text: "CRED", hint: "AI you have left", keywords: ["credits", "usage", "claude", "chatgpt", "codex", "limits"] },
  { text: "ASK what did I decide about the clipboard?", hint: "Where a request would go", keywords: ["ask", "route", "question", "cost"] },
  { text: "HELP", hint: "List every shortcut", keywords: ["commands", "shortcuts", "list"] },
];

export const STARTERS = ["DO open spotify on the dell", "BRIEF", "HIST", "MEM lan mouse", "DEV", "CRED"];

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

function memoryMonitor(hits: NoteHit[]): Monitor {
  const top = hits[0]?.path;
  return {
    id: "memory",
    sub: "memory, by match",
    cols: "3rem minmax(0, 1fr)",
    rows: MEMORY.map((m) => {
      const hit = hits.find((h) => h.path === m.id);
      return { id: m.id, cells: [hit ? hit.score.toFixed(2) : "—", m.title], active: m.id === top, muted: !hit };
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

function machinesMonitor(active: DeviceId | null = null): Monitor {
  return {
    id: "machines",
    sub: "main and nodes",
    cols: "3.4rem minmax(0, 1fr)",
    rows: (Object.keys(DEVICES) as DeviceId[]).map((id) => ({
      id,
      cells: [DEVICES[id].role, DEVICES[id].name],
      active: id === active,
      run: "DEV",
    })),
  };
}

const OUTCOMES = ["observed", "unconfirmed", "user_confirmed", "agent_claimed", "waiting"] as const;

function outcomesMonitor(runs: ActionRun[]): Monitor {
  const count = (o: string) => runs.filter((r) => r.outcome === o).length;
  return {
    id: "outcomes",
    sub: "outcomes, this morning",
    cols: "minmax(0, 1fr) 2.4rem",
    numeric: true,
    rows: OUTCOMES.map((o) => ({ id: o, cells: [o, String(count(o))], muted: count(o) === 0 })),
  };
}

function routesMonitor(active: RouteId): Monitor {
  const what: Record<RouteId, string> = {
    free: "rules, 0 tokens",
    interpret: "ChatGPT, ~1 s",
    agent: "browser agent",
    build: "planner, specialists",
  };
  return {
    id: "routes",
    sub: "where a request goes",
    cols: "5.6rem minmax(0, 1fr)",
    rows: ROUTES.map((r) => ({ id: r.id, cells: [r.name, what[r.id]], active: r.id === active })),
  };
}

function accountsMonitor(): Monitor {
  return {
    id: "accounts",
    sub: "what JARVIS thinks on",
    cols: "5.6rem minmax(0, 1fr)",
    rows: [
      { id: "chatgpt", cells: ["ChatGPT", "your plan, first"] },
      { id: "claude", cells: ["Claude", "your plan, stand-in"] },
      { id: "local", cells: ["Local", "voice, memory, rules"] },
    ],
  };
}

const make = (title: string, fkey: FKey | null, output: Outcome["output"], plain: string, monitor?: Monitor): Outcome => ({
  title,
  fkey,
  output,
  plain,
  monitor,
});

const word = (n: number) => NUMBER_WORDS[n] ?? String(n);

/* Functions */

const FROM_NOTES = "from your notes, no model, about 20 ms";

function help(): Outcome {
  const rows: [string, string, string][] = [
    ["DO", "Run an action on any machine", "DO open spotify on the dell"],
    ["HIST", "What it did, and what it saw", "HIST"],
    ["MEM", "Search what it remembers", "MEM lan mouse"],
    ["BRIEF", "Your morning in one screen", "BRIEF"],
    ["DUE", "What’s overdue, today and this week", "DUE"],
    ["TASK ADD", "Add a task to your notes", "TASK ADD buy paper --due fri"],
    ["KB", "Ask your wiki, with sources", "KB review routine"],
    ["DEV", "Your machines at a glance", "DEV"],
    ["CRED", "How much AI you have left", "CRED"],
    ["ASK", "Where a request would go, and its cost", "ASK explain paging"],
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
      foot: "Everything here is simulated. Nothing runs on a real machine.",
    },
    "Eleven shortcuts, and you never have to memorise them. Tap any example to run it, start typing to see suggestions, or just say “Jarvis.”",
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
          heading: "Machines",
          lines: [
            { key: "main", text: "Zenbook, listening" },
            { key: "node", text: "Dell, online · Lan Mouse on" },
          ],
        },
      ],
      foot: FROM_NOTES,
    },
    "Two things today: your OS assignment is due at 5 pm, and the afternoon is blocked for the drone build. Both laptops are up and sharing one mouse.",
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

/* DO: one request through the cascade */

const APPS = ["spotify", "chrome", "obsidian", "firefox", "discord", "steam", "vscode", "code", "slack", "terminal", "files", "notion", "zoom"];
const APP_NAMES: Record<string, string> = { vscode: "VS Code", code: "VS Code" };
const appName = (s: string) => APP_NAMES[s] ?? s.charAt(0).toUpperCase() + s.slice(1);

const SETTLE: Record<string, number> = { open_app: 8, open_url: 6, focus_window: 2, close_app: 5, media: 3, volume: 1 };
const SEEN_AFTER: Record<string, number> = { open_app: 2.4, open_url: 1.9, focus_window: 0.3, media: 0.6, volume: 0.2 };

type Resolved = {
  device: DeviceId;
  why: string;
  core: string;
};

function resolveDevice(request: string): Resolved {
  const r = request.toLowerCase().replace(/[.!?]+$/, "").trim();
  const dell = /\s+(?:on|in)\s+(?:the\s+|my\s+)?(dell|windows|other one|other pc|other laptop|node)\b/;
  const main = /\s+(?:on|in)\s+(?:the\s+|my\s+)?(zenbook|arch|asus|main|main pc|this pc|this one)\b|\s+here$/;
  const d = r.match(dell);
  if (d) {
    const why = d[1] === "dell" ? "named: the Dell" : `“${d[1]}” = the Dell`;
    return { device: "dell", why, core: r.replace(dell, "").trim() };
  }
  const m = r.match(main);
  if (m) {
    const said = m[1] ?? "here";
    return { device: "zenbook", why: said === "zenbook" ? "named: the Zenbook" : `“${said}” = the main`, core: r.replace(main, "").trim() };
  }
  return { device: "zenbook", why: "no machine named: the main is the default", core: r };
}

const step = (key: string, text: string, extra: Partial<Line> = {}): Line => ({ key, text, ...extra });

function act(cmd: Extract<Command, { fn: "DO" }>): Outcome & { run: ActionRun | null } {
  const { device, why, core } = resolveDevice(cmd.request);
  const dev = DEVICES[device];
  const here = device === "zenbook";
  const dispatch = here ? "runs here, on the main" : `signed job → ${dev.name}, over the SSH tunnel`;
  const where = here ? "here" : `on the ${dev.name}`;

  const direct = (intent: string, arg: string, observer: string, plain: string, risk: "allow" | "confirm" = "allow") => {
    const path: Line[] = [
      step("instant", "no fixed phrase", { muted: true }),
      step("parser", `${intent} · ${arg} · ${device}`, { mono: true }),
      step("device", why),
      step("registry", `direct · risk ${risk}`),
      step("gates", here ? "target exists · not a repeat" : `${dev.name} online · target exists · not a repeat`),
    ];
    if (risk === "confirm") {
      return {
        groups: [
          { heading: "Path", lines: path },
          {
            heading: "Waiting for you",
            lines: [
              step("confirm", `${intent} ${arg} ${where}?`, { mono: true }),
              { text: "Say “Jarvis, yes”, or approve it in the console.", muted: true },
            ],
          },
        ],
        outcome: "waiting",
        plain,
      };
    }
    const seen = SEEN_AFTER[intent] ?? 1;
    return {
      groups: [
        { heading: "Path", lines: [...path, step("dispatch", dispatch), step("observe", observer, { meta: `${seen.toFixed(1)} s of ${SETTLE[intent]} s` })] },
        { heading: "Outcome", lines: [step("observed", "seen on screen, recorded in history", { mono: false })] },
      ],
      outcome: "observed",
      plain,
    };
  };

  let groups: Group[];
  let outcome: string;
  let plain: string;
  let tokens = "0 tokens";
  let logged = "";

  let m: RegExpMatchArray | null;
  if ((m = core.match(/^(?:open|go to)\s+((?:https?:\/\/)?[a-z0-9-]+(?:\.[a-z0-9-]+)+\S*)$/))) {
    const site = m[1].replace(/^https?:\/\//, "");
    logged = `open_url ${site}`;
    ({ groups, outcome, plain } = direct(
      "open_url",
      site,
      `a browser title names ${site.split("/")[0]}`,
      `Opened ${site} ${where} and saw a browser window with its name, so it’s marked observed. No model was involved.`,
    ));
  } else if ((m = core.match(/^(?:open|launch|start)\s+([a-z ]+)$/))) {
    const app = m[1].trim().replace(/\s+/g, "");
    if (APPS.includes(app)) {
      logged = `open_app ${appName(app)}`;
      ({ groups, outcome, plain } = direct(
        "open_app",
        appName(app),
        `a ${appName(app)} window appeared`,
        `Opened ${appName(app)} ${where} and saw its window appear, so it’s marked observed. No model was involved: the parser read the request exactly one way.`,
      ));
    } else {
      logged = `open_app ${m[1].trim()}`;
      groups = [
        {
          heading: "Path",
          lines: [
            step("instant", "no fixed phrase", { muted: true }),
            step("parser", `“${m[1].trim()}” isn’t in the ${dev.name}’s app list`, { muted: true }),
            step("registry", "open_app · direct"),
          ],
        },
        { heading: "Outcome", lines: [step("refused", "pre_effect_failure: nothing was launched")] },
      ];
      outcome = "pre_effect_failure";
      plain = `There’s no app called “${m[1].trim()}” on the ${dev.name}, so nothing was launched. JARVIS says so instead of guessing at a close match.`;
    }
  } else if ((m = core.match(/^close\s+([a-z ]+)$/))) {
    const app = appName(m[1].trim().replace(/\s+/g, ""));
    logged = `close_app ${app}`;
    ({ groups, outcome, plain } = direct(
      "close_app",
      app,
      "",
      `Closing ${app} could lose unsaved work, so it waits in the confirm queue. Nothing happens until you say “Jarvis, yes” or approve it in the console.`,
      "confirm",
    ));
  } else if ((m = core.match(/^(?:set\s+)?(?:the\s+)?volume\s+(?:to\s+)?(\d{1,3})%?$/))) {
    const level = Math.min(100, Number(m[1]));
    logged = `volume ${level}`;
    ({ groups, outcome, plain } = direct(
      "volume",
      `${level}%`,
      `the output reads back ${level}%`,
      `Volume is at ${level}% ${where}. JARVIS read the level back from the system to make sure it took.`,
    ));
  } else if ((m = core.match(/^(pause|play|resume|next|skip)(?:\s+(?:the\s+)?(?:music|song|track))?$/))) {
    const verb = m[1] === "skip" ? "next" : m[1] === "resume" ? "play" : m[1];
    logged = `media ${verb}`;
    ({ groups, outcome, plain } = direct(
      "media",
      verb,
      `the player reports ${verb === "pause" ? "paused" : "playing"}`,
      `Done ${where}: the media player itself reports it’s ${verb === "pause" ? "paused" : "playing"}, so this one is confirmed, not assumed.`,
    ));
  } else if ((m = core.match(/^(?:focus|switch to)\s+([a-z ]+)$/))) {
    const app = appName(m[1].trim().replace(/\s+/g, ""));
    logged = `focus_window ${app}`;
    ({ groups, outcome, plain } = direct(
      "focus_window",
      app,
      `the focused window is ${app}`,
      `${app} is in front ${where}. JARVIS checked which window has focus before calling it done.`,
    ));
  } else if (/^(buy|order|pay|send|reply|post|message)\b/.test(core)) {
    logged = `agent_task “${core}”`;
    tokens = "the agent’s own plan";
    groups = [
      {
        heading: "Path",
        lines: [
          step("parser", "starts with an agent verb", { muted: true }),
          step("registry", "agent_task · browser agent · risk ratchet"),
          step("preflight", "draft + ten checks"),
          step("gates", "has consequences: confirm"),
        ],
      },
      {
        heading: "Waiting for you",
        lines: [
          step("confirm", `“${core}” ${where}?`, { mono: true }),
          { text: "The agent won’t start until you say yes.", muted: true },
        ],
      },
    ];
    outcome = "waiting";
    plain =
      "This needs judgement inside a logged-in account, so it goes to a browser agent. Because it sends, buys or posts something, it waits for your yes first, and the agent’s “done” is reported as a claim.";
  } else if (/\b(rm|delete|format|shutdown|reboot|kill|uninstall)\b/.test(core)) {
    logged = `terminal “${core}”`;
    groups = [
      {
        heading: "Path",
        lines: [
          step("parser", "not a typed intent", { muted: true }),
          step("interpreter", "terminal command · risk confirm"),
          step("read-only?", "no: it changes something"),
        ],
      },
      {
        heading: "Waiting for you",
        lines: [
          step("confirm", core, { mono: true }),
          { text: "Looking commands run at once. Anything that changes something waits.", muted: true },
        ],
      },
    ];
    outcome = "waiting";
    tokens = "≈ 1.1k tokens on your plan";
    plain =
      "That command changes things, so it’s parked for your OK instead of run. Commands that only look, like ls or df, would have run straight away.";
  } else {
    logged = "";
    tokens = "≈ 1.1k tokens on your plan";
    groups = [
      {
        heading: "Path",
        lines: [
          step("instant", "no fixed phrase", { muted: true }),
          step("parser", "more than one reading: passed on untouched", { muted: true }),
          step("interpreter", "ChatGPT reads it · about 1 s"),
          step("mode", "clarify"),
        ],
      },
      { heading: "Question", lines: [{ text: "Which app or page did you mean?" }] },
    ];
    outcome = "clarify";
    plain =
      "The parser couldn’t read that exactly one way, so it passed it on. The interpreter wasn’t sure either, so JARVIS asks one short question instead of guessing.";
  }

  const run = logged ? { command: logged, device: dev.name, outcome } : null;
  return { ...make(cmd.echo, "F3", { kind: "groups", groups, foot: `${tokens}. Simulated: nothing ran.` }, plain, machinesMonitor(device)), run };
}

/* HIST */

const MORNING: ActionRun[] = [
  { command: "open_app Spotify", device: "Zenbook", outcome: "observed" },
  { command: "volume 30", device: "Zenbook", outcome: "observed" },
  { command: "focus_window Obsidian", device: "Zenbook", outcome: "observed" },
  { command: "open_url github.com", device: "Dell", outcome: "unconfirmed" },
  { command: "close_app Chrome", device: "Dell", outcome: "user_confirmed" },
  { command: "agent_task “check my grades”", device: "Zenbook", outcome: "agent_claimed" },
];

function hist(ctx: Context): Outcome {
  const runs = [...ctx.actions].reverse().concat(MORNING);
  const mine = ctx.actions.length;
  return make(
    "HIST",
    null,
    {
      kind: "table",
      columns: ["Action", "Machine", "Outcome"],
      cols: "minmax(0, 1.6fr) minmax(0, 0.7fr) minmax(0, 1fr)",
      mono: [0, 2],
      rows: runs.map((r) => [r.command, r.device, r.outcome]),
      foot: "Only observed and confirmed outcomes teach it shortcuts. Uncertain ones are never retried.",
    },
    `${mine ? `${word(mine)} from you just now, plus six` : "Six"} from this morning. The GitHub tab didn’t show up in time, so it’s reported as unconfirmed rather than claimed done, and JARVIS won’t retry it by itself.`,
    outcomesMonitor(runs),
  );
}

/* MEM */

function mem(cmd: Extract<Command, { fn: "MEM" }>): Outcome {
  const tokens = [...new Set(cmd.query.toLowerCase().match(/[a-z0-9]+/g) ?? [])];
  const scored = MEMORY.map((n) => {
    let score = 0;
    for (const tok of tokens) {
      let best = 0;
      for (const [term, w] of Object.entries(n.terms)) {
        if (term === tok || (tok.length >= 3 && term.startsWith(tok))) best = Math.max(best, w);
      }
      score += best;
    }
    return { item: n, score: Math.min(0.97, score) };
  }).sort((a, b) => b.score - a.score);

  const top = scored[0]?.score ?? 0;
  const hits: NoteHit[] = scored
    .filter((s) => s.score >= 0.2 && s.score >= top * 0.45)
    .slice(0, 3)
    .map((s) => ({ path: s.item.id, score: s.score, excerpt: s.item.excerpt }));

  const foot = "keywords and meaning, ranked together · retired items skipped";
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
              { text: `Nothing JARVIS remembers is close to “${cmd.query}”.` },
              { text: "It stays quiet instead of guessing.", muted: true },
            ],
          },
        ],
        foot,
      },
      "Nothing in memory matches that well, so JARVIS says so instead of guessing.",
      memoryMonitor([]),
    );
  }

  const title = (id: string) => MEMORY.find((n) => n.id === id)?.title ?? id;
  const others = hits.length - 1;
  const plain = others
    ? `Best match: ${title(hits[0].path)}. ${others === 1 ? "One more item is" : `${word(others)} more items are`} close enough to show. Facts, preferences and lessons are distilled from your conversations each night.`
    : `Only ${title(hits[0].path)} is a close match, so that’s all it shows. Facts, preferences and lessons are distilled from your conversations each night.`;

  return make(cmd.echo, "F4", { kind: "notes", items: hits, foot }, plain, memoryMonitor(hits));
}

/* KB */

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
      "Your sources disagree on this one, so JARVIS won’t pick a side. One says daily, a newer one says weekly, and it’s waiting for you to decide which stands.",
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

/* CRED, DEV */

function cred(): Outcome {
  const items: Bar[] = [
    { label: "ChatGPT", sub: "5 h window", left: 0.66, readout: "66% left", detail: "does the talking and reading" },
    { label: "ChatGPT", sub: "this week", left: 0.72, readout: "72% left" },
    { label: "Claude", sub: "this window", left: 0.59, readout: "59% left", detail: "stands in if ChatGPT hits its limit" },
    { label: "ElevenLabs", sub: "characters this month", left: 0.22, readout: "6,600 of 30,000 left" },
  ];
  return make(
    "CRED",
    null,
    { kind: "bars", items, foot: "Simulated numbers. Windows on plans you already pay for." },
    "Plenty left on ChatGPT, which does the talking. If it runs out, Claude answers until the window resets. ElevenLabs is lowest, and the local voice is free.",
    accountsMonitor(),
  );
}

function dev(): Outcome {
  return make(
    "DEV",
    "F5",
    {
      kind: "table",
      columns: ["Machine", "Role", "System", "Link", "Input"],
      cols: "minmax(0, 1fr) 4rem minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 1fr)",
      rows: [
        ["Zenbook", "main", "Arch · Hyprland", "hub, this one", "together"],
        ["Dell", "node", "Windows 11", "up · seen 2 s ago", "Lan Mouse on"],
      ],
      foot: "Jobs are signed and travel over SSH. The hub only listens on loopback.",
    },
    "The Zenbook is the main: it runs the brain, memory and the hub. The Dell is a node that checked in two seconds ago, and the two laptops are sharing one mouse and clipboard.",
    machinesMonitor(),
  );
}

/* ASK */

function routeOf(text: string): RouteId {
  const t = text.toLowerCase();
  if (/\b(build|create|make|design|refactor|ship|set up|automate)\b/.test(t)) return "build";
  if (/\b(buy|reply|send|post|message|order|pay|sent me|log ?in|account|inbox|instagram)\b/.test(t)) return "agent";
  if (/^(what time|what's the time|hello|hi|thanks|open|close|pause|play|next|volume|focus)\b/.test(t)) return "free";
  return "interpret";
}

const ROUTE_TIME: Partial<Record<RouteId, string>> = { free: "microseconds", interpret: "about 1 s" };

const ROUTE_PLAIN: Record<RouteId, string> = {
  free: "That one never reaches a model. Fixed rules read it exactly one way and it runs straight away, even offline.",
  interpret:
    "The parser isn’t sure, so one warm call on the ChatGPT plan you already pay for reads it. If that plan is at its limit, Claude answers instead.",
  agent:
    "It needs judgement inside a logged-in account, so a browser agent takes it after a preflight. Anything that sends, buys or posts waits for your yes.",
  build:
    "Software work with several parts gets a planner that splits it into steps for specialists, each on the lowest tier that can do it. Nothing runs until you say so.",
};

function ask(cmd: Extract<Command, { fn: "ASK" }>): Outcome {
  const id = routeOf(cmd.text);
  const route = ROUTES.find((r) => r.id === id) ?? ROUTES[1];
  const shown = cmd.text.length > 120 ? `${cmd.text.slice(0, 117)}…` : cmd.text;
  const lines = [
    { key: "route", text: route.name },
    { key: "runs", text: route.runs },
    { key: "cost", text: route.cost },
    ...(ROUTE_TIME[id] ? [{ key: "reply", text: ROUTE_TIME[id] as string }] : []),
  ];
  return make(
    cmd.echo,
    null,
    {
      kind: "groups",
      groups: [
        { heading: id === "free" ? "Read by rules, no model" : "Sent on", lines: [{ text: `“${shown}”` }] },
        { heading: "Routed", lines },
      ],
      foot: "Simulated: nothing was sent.",
    },
    ROUTE_PLAIN[id],
    routesMonitor(id),
  );
}

/** Runs a command. A DO that reaches a machine also returns the run, so HIST can list it. */
export function run(cmd: Command, ctx: Context): Outcome & { run?: ActionRun | null } {
  switch (cmd.fn) {
    case "HELP":
      return help();
    case "BRIEF":
      return brief(ctx);
    case "DUE":
      return due(ctx);
    case "TASK":
      return task(cmd, ctx);
    case "DO":
      return act(cmd);
    case "HIST":
      return hist(ctx);
    case "MEM":
      return mem(cmd);
    case "KB":
      return kb(cmd);
    case "CRED":
      return cred();
    case "DEV":
      return dev();
    case "ASK":
      return ask(cmd);
    case "ERROR":
      return make(cmd.echo || "?", null, { kind: "error", message: cmd.message, tries: cmd.tries }, cmd.plain);
  }
}

/** The first thing on screen: an invitation, or BRIEF's result when motion is reduced. */
export function seed(showBrief: boolean): Result {
  const out: Outcome = showBrief
    ? brief({ added: [], actions: [] })
    : make(
        "ready",
        null,
        { kind: "idle", starters: STARTERS },
        "Type a shortcut, press a key below, or tap one of these. Every answer comes with a sentence like this one, so you never have to learn the codes.",
        machinesMonitor(),
      );
  return { ...out, id: "0", monitor: out.monitor ?? machinesMonitor() };
}
