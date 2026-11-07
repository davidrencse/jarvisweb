/*
 * The request path from the JARVIS architecture guide (§2) and README, as a graph.
 * Positions are in the SVG's 1200 × 680 viewBox.
 */

export type NodeKind = "input" | "fast" | "model" | "wait" | "target" | "store";

export type GraphNode = {
  id: string;
  label: string;
  sub: string;
  x: number;
  y: number;
  w: number;
  kind: NodeKind;
  /** Step number on the free path. */
  n?: number;
};

export const NODE_H = 50;

const IN = { x: 24, w: 168 };
const FAST = { x: 262, w: 224 };
const MODEL = { x: 566, w: 236 };
const OUT = { x: 900, w: 276 };

export const NODES: GraphNode[] = [
  { id: "voice", label: "Voice", sub: "listen.py · daemon.py", y: 72, ...IN, kind: "input" },
  { id: "console", label: "Web console", sub: ":7777 · ui.py", y: 152, ...IN, kind: "input" },
  { id: "cli", label: "CLI", sub: "python -m jarvis ask", y: 232, ...IN, kind: "input" },
  { id: "overlay", label: "Overlay", sub: "overlay.py · Alt+1", y: 312, ...IN, kind: "input" },
  { id: "relay", label: "Node PC", sub: "relays to the main", y: 392, ...IN, kind: "input" },

  { id: "instant", n: 1, label: "Instant phrases", sub: "instant.py", y: 24, ...FAST, kind: "fast" },
  { id: "parse", n: 2, label: "Strict parser", sub: "parse.py · rules, no AI", y: 92, ...FAST, kind: "fast" },
  { id: "registry", n: 3, label: "Intent registry", sub: "registry.py", y: 160, ...FAST, kind: "fast" },
  { id: "gates", n: 4, label: "Gates", sub: "gates.py · deny, always ask", y: 228, ...FAST, kind: "fast" },
  { id: "history", n: 5, label: "History checks", sub: "history.py · repeats, undo", y: 296, ...FAST, kind: "fast" },
  { id: "confirm", n: 6, label: "Confirm queue", sub: "confirm.py · waits for you", y: 364, ...FAST, kind: "wait" },
  { id: "exec", n: 7, label: "Direct executor", sub: "remote.call", y: 432, ...FAST, kind: "fast" },
  { id: "observe", n: 8, label: "On-screen check", sub: "observe.py · did it happen?", y: 500, ...FAST, kind: "fast" },
  { id: "record", n: 9, label: "Record", sub: "history.sqlite3 · events", y: 568, ...FAST, kind: "fast" },

  { id: "interpret", label: "Interpreter", sub: "interpret.py · about 1.1k tokens", y: 92, ...MODEL, kind: "model" },
  { id: "brain", label: "Brain", sub: "chatgpt.py → Claude CLI failover", y: 228, ...MODEL, kind: "model" },
  { id: "planner", label: "Planner + specialists", sub: "brain.py L1–L3 · orchestrator.py", y: 330, ...MODEL, kind: "model" },
  { id: "grok", label: "Grok Bot", sub: "grokbot.py · after preflight", y: 432, ...MODEL, kind: "model" },

  { id: "memory", label: "Memory", sub: "memory.sqlite3 · BM25 + vectors", y: 24, ...OUT, kind: "store" },
  { id: "main", label: "This PC · Zenbook", sub: "Arch Linux, Hyprland", y: 364, ...OUT, kind: "target" },
  { id: "hub", label: "Hub", sub: "127.0.0.1:7780 over SSH", y: 432, ...OUT, kind: "target" },
  { id: "node", label: "Node · Dell G15", sub: "Windows 11 · runs the job", y: 500, ...OUT, kind: "target" },
  { id: "reply", label: "Reply", sub: "local voice · console", y: 600, ...OUT, kind: "target" },
];

export const BY_ID = Object.fromEntries(NODES.map((n) => [n.id, n])) as Record<string, GraphNode>;

/** The structure, drawn faintly underneath every trace. */
export const EDGES: [string, string][] = [
  ["voice", "instant"],
  ["console", "instant"],
  ["cli", "instant"],
  ["overlay", "instant"],
  ["relay", "instant"],
  ["instant", "parse"],
  ["instant", "record"],
  ["parse", "registry"],
  ["registry", "gates"],
  ["gates", "history"],
  ["history", "confirm"],
  ["confirm", "exec"],
  ["exec", "observe"],
  ["observe", "record"],
  ["parse", "interpret"],
  ["parse", "brain"],
  ["interpret", "registry"],
  ["interpret", "planner"],
  ["planner", "brain"],
  ["brain", "grok"],
  ["brain", "record"],
  ["memory", "brain"],
  ["exec", "main"],
  ["exec", "hub"],
  ["hub", "node"],
  ["record", "memory"],
  ["record", "reply"],
];

export function edgeKey(a: string, b: string) {
  return `${a}>${b}`;
}

/** An SVG path between two nodes: vertical within a column, an S-curve across columns. */
export function route(aId: string, bId: string) {
  const a = BY_ID[aId];
  const b = BY_ID[bId];
  const ay = a.y + NODE_H / 2;
  const by = b.y + NODE_H / 2;
  if (Math.abs(a.x - b.x) < 4) {
    const down = b.y > a.y;
    const x = a.x + a.w / 2;
    const offset = Math.abs(b.y - a.y) > 80 ? -a.w / 2 : 0;
    if (offset) {
      // Skip down the left edge, around the stations in between.
      const sx = a.x;
      const y1 = ay;
      const y2 = by;
      return `M ${sx} ${y1} C ${sx - 34} ${y1}, ${sx - 34} ${y2}, ${sx} ${y2}`;
    }
    return down ? `M ${x} ${a.y + NODE_H} L ${x} ${b.y}` : `M ${x} ${a.y} L ${x} ${b.y + NODE_H}`;
  }
  if (b.x > a.x) {
    const x1 = a.x + a.w;
    const x2 = b.x;
    const mid = (x1 + x2) / 2;
    return `M ${x1} ${ay} C ${mid} ${ay}, ${mid} ${by}, ${x2} ${by}`;
  }
  const x1 = a.x;
  const x2 = b.x + b.w;
  const mid = (x1 + x2) / 2;
  return `M ${x1} ${ay} C ${mid} ${ay}, ${mid} ${by}, ${x2} ${by}`;
}

export type StepState = "pass" | "hit" | "miss" | "wait";

export type Step = { node: string; state: StepState; note: string };

export type Trace = {
  id: string;
  request: string;
  steps: Step[];
  cost: string;
  outcome: string;
};

const MISS_INSTANT: Step = { node: "instant", state: "miss", note: "Not a fixed phrase." };

export const PRESETS: Trace[] = [
  {
    id: "time",
    request: "what time is it",
    cost: "0 tokens",
    outcome: "Answered in 0 s",
    steps: [
      { node: "voice", state: "pass", note: "Wake word, then the voiceprint check: it’s David. Parakeet transcribes." },
      { node: "instant", state: "hit", note: "A fixed phrase: the clock. No model, no parser." },
      { node: "record", state: "pass", note: "Kept in memory and the event log." },
      { node: "reply", state: "pass", note: "“It’s 4:04 PM.”" },
    ],
  },
  {
    id: "bluetooth",
    request: "turn bluetooth off",
    cost: "0 tokens",
    outcome: "Done and checked",
    steps: [
      { node: "console", state: "pass", note: "Typed into the ask bar." },
      MISS_INSTANT,
      { node: "parse", state: "hit", note: "Exactly one reading: bluetooth · zenbook · off." },
      { node: "registry", state: "pass", note: "Intent has an executor, an argument schema and a risk level." },
      { node: "gates", state: "pass", note: "The device exists. Nothing here needs a yes." },
      { node: "history", state: "pass", note: "Not a repeat, and it doesn’t undo something just done." },
      { node: "confirm", state: "pass", note: "Low risk: nothing waits." },
      { node: "exec", state: "pass", note: "remote.call runs it on this PC." },
      { node: "main", state: "pass", note: "Bluetooth goes off on the Zenbook." },
      { node: "observe", state: "pass", note: "Reads the state back to prove it happened." },
      { node: "record", state: "pass", note: "Outcome: observed." },
      { node: "reply", state: "pass", note: "“Bluetooth is off.”" },
    ],
  },
  {
    id: "spotify",
    request: "open spotify on the dell",
    cost: "0 tokens",
    outcome: "Done on the other laptop",
    steps: [
      { node: "voice", state: "pass", note: "Heard on the main, voiceprint checked." },
      MISS_INSTANT,
      { node: "parse", state: "hit", note: "One reading: open_app · dell · Spotify." },
      { node: "registry", state: "pass", note: "open_app is a direct intent." },
      { node: "gates", state: "pass", note: "The Dell is a known node and online." },
      { node: "history", state: "pass", note: "No conflict with a recent action." },
      { node: "confirm", state: "pass", note: "Opening an app doesn’t need a yes." },
      { node: "exec", state: "pass", note: "remote.call sees a node target and makes a signed job." },
      { node: "hub", state: "pass", note: "The Dell is holding a long poll open; it takes the job at most once." },
      { node: "node", state: "pass", note: "Runs only if its code matches the main’s tested release." },
      { node: "observe", state: "pass", note: "The node reads back that Spotify’s window is up." },
      { node: "record", state: "pass", note: "Outcome: observed, on the Dell." },
      { node: "reply", state: "pass", note: "Only the main speaks: the Dell stays silent." },
    ],
  },
  {
    id: "send",
    request: "send my draft to the study group",
    cost: "about 1.1k tokens",
    outcome: "Waiting for your yes",
    steps: [
      { node: "console", state: "pass", note: "Typed into the ask bar." },
      MISS_INSTANT,
      { node: "parse", state: "miss", note: "More than one reading, so the parser refuses to guess." },
      { node: "interpret", state: "hit", note: "One warm ChatGPT call picks a mode: act." },
      { node: "registry", state: "pass", note: "The model’s answer becomes registry intents like any other." },
      { node: "gates", state: "pass", note: "Messaging as David is always-ask." },
      { node: "history", state: "pass", note: "Not a duplicate send." },
      { node: "confirm", state: "wait", note: "Parked. Runs only after “Jarvis, yes” or the console gate." },
    ],
  },
  {
    id: "poem",
    request: "write me a poem about rain",
    cost: "subscription quota",
    outcome: "Answered by the brain",
    steps: [
      { node: "cli", state: "pass", note: "jarvis ask from a terminal." },
      MISS_INSTANT,
      { node: "parse", state: "miss", note: "No action verb: this is for the brain." },
      { node: "brain", state: "hit", note: "ChatGPT through Codex, with the last 20 minutes and a memory pack. Claude CLI if ChatGPT is at its limit." },
      { node: "record", state: "pass", note: "The reply and what it cost are kept." },
      { node: "reply", state: "pass", note: "Read aloud on the main." },
    ],
  },
  {
    id: "build",
    request: "build a dashboard app",
    cost: "subscription quota",
    outcome: "Planned and handed to agents",
    steps: [
      { node: "console", state: "pass", note: "Typed in Plan mode." },
      MISS_INSTANT,
      { node: "parse", state: "miss", note: "Not a single direct action." },
      { node: "interpret", state: "hit", note: "Mode: build." },
      { node: "planner", state: "pass", note: "Planned at L3; each step runs at L1–L3 with specialist agents." },
      { node: "brain", state: "pass", note: "Steps run on the ChatGPT lane, checked at L1." },
      { node: "record", state: "pass", note: "The run lands in the task ledger." },
      { node: "reply", state: "pass", note: "A summary, with what each step cost." },
    ],
  },
];

const ACTION = /\b(open|close|launch|quit|focus|volume|mute|unmute|bluetooth|brightness|lock|play|pause|skip|next|wifi|screenshot|minimi[sz]e|maximi[sz]e)\b/i;
const INSTANT = /^\s*(what time is it|what'?s the time|what day is it|what'?s the date|hi|hello|hey|good (morning|evening|night)|thanks?( you)?)\s*[?.!]*\s*$/i;
const RISKY = /\b(buy|pay|order|send|post|tweet|email|message|text|delete|remove|submit|purchase|transfer)\b/i;
const BUILD = /\b(build|make|create|code|write a (script|program|app))\b.*\b(app|site|website|dashboard|tool|script|program|bot|game)\b/i;
const NODE = /\b(dell|other one|other laptop|node|windows (pc|laptop))\b/i;

/** A rough sketch of the routing rules, for the demo only. The real parser is far stricter. */
export function classify(text: string): Trace {
  const request = text.trim().slice(0, 80) || "…";
  const base = (id: string) => {
    const t = PRESETS.find((p) => p.id === id)!;
    return { ...t, id: `custom-${id}`, request, steps: t.steps.map((s) => ({ ...s })) };
  };
  if (INSTANT.test(request)) {
    const t = base("time");
    t.steps[1].note = "A fixed phrase. No model, no parser.";
    t.steps[3].note = "Answered at once.";
    return t;
  }
  if (RISKY.test(request)) return base("send");
  if (BUILD.test(request)) return base("build");
  const verb = request.match(ACTION)?.[1]?.toLowerCase();
  if (verb) {
    const onNode = NODE.test(request);
    const t = base(onNode ? "spotify" : "bluetooth");
    const device = onNode ? "dell" : "zenbook";
    t.steps[2].note = `One reading: ${verb} · ${device}.`;
    if (!onNode) t.steps[8].note = "Runs on the Zenbook.";
    else t.steps[9].note = "The Dell runs it, on the same tested code as the main.";
    t.steps[t.steps.length - 1].note = "Confirmed out loud once it’s seen on screen.";
    return t;
  }
  return base("poem");
}
