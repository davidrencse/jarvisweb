/*
 * Every Python module in the jarvis package, grouped by station, with line counts.
 * Transcribed from the console's System → Under the hood view, captured 2026-11-07.
 */

export type Station = {
  id: string;
  name: string;
  job: string;
  modules: [string, number][];
};

export const STATIONS: Station[] = [
  {
    id: "hear",
    name: "Hear",
    job: "Mic capture, voice activity, the voiceprint check, transcription, the background listener and the Windows overlay.",
    modules: [
      ["listen", 1132],
      ["daemon", 776],
      ["voice_eval", 468],
      ["onboard", 441],
      ["overlay", 380],
      ["fragments", 120],
    ],
  },
  {
    id: "decide",
    name: "Decide",
    job: "Turns words into checked actions or a conversation: instant phrases, the parser, registry, gates, confirm queue and interpreter.",
    modules: [
      ["assistant", 937],
      ["gates", 917],
      ["parse", 811],
      ["decide", 542],
      ["pipeline", 537],
      ["scorecard", 467],
      ["confirm", 275],
      ["briefing", 259],
      ["interpret", 256],
      ["registry", 221],
      ["router", 110],
      ["selfmodel", 80],
      ["instant", 47],
    ],
  },
  {
    id: "remember",
    name: "Remember",
    job: "The memory heap, semantic recall, the vault, tasks, nightly consolidation and action history.",
    modules: [
      ["knowledge", 1634],
      ["vault", 1473],
      ["memory", 911],
      ["tasks", 584],
      ["consolidate", 285],
      ["history", 215],
      ["embed", 138],
      ["situation", 137],
      ["vault_mcp", 83],
      ["stemming", 20],
    ],
  },
  {
    id: "think",
    name: "Think",
    job: "Model lanes and failover: the warm ChatGPT lane, the planner, agent runs, Grok Bot’s preflight.",
    modules: [
      ["chatgpt", 1039],
      ["orchestrator", 397],
      ["fastlane", 319],
      ["inference", 312],
      ["brain", 274],
      ["usage", 215],
      ["prompts", 206],
      ["runner", 174],
      ["grok_preflight", 144],
      ["claude_auth", 97],
      ["tools_mcp", 75],
      ["adapters", 50],
    ],
  },
  {
    id: "act",
    name: "Act",
    job: "Executors per OS and their on-screen checks, remote view, shared input, clipboard, files, the browser gate and Grok Bot.",
    modules: [
      ["actions", 1620],
      ["remote_view", 1296],
      ["sharedinput", 1152],
      ["clipsync", 1016],
      ["grokbot", 902],
      ["observe", 831],
      ["sysintents", 748],
      ["control", 692],
      ["terminal", 646],
      ["browser_gate", 593],
      ["transfer", 445],
      ["app_ui", 382],
      ["agent_browser", 352],
      ["remote", 327],
      ["storage", 284],
      ["browser_proxy", 216],
      ["peripherals", 105],
      ["screen", 104],
      ["connections", 93],
      ["showcase", 59],
      ["thumbnails", 31],
    ],
  },
  {
    id: "speak",
    name: "Speak",
    job: "Kokoro text-to-speech on the laptop, the speech queue, and the optional ElevenLabs live agent.",
    modules: [
      ["speech", 409],
      ["agent", 243],
      ["voice", 50],
    ],
  },
  {
    id: "log",
    name: "Log",
    job: "The task ledger, event feed, file locks and the cluster’s job store.",
    modules: [
      ["cluster_store", 339],
      ["events", 305],
      ["store", 203],
      ["locking", 55],
      ["fsio", 37],
    ],
  },
  {
    id: "surfaces",
    name: "Surfaces",
    job: "The CLI, the web console, cluster setup and tunnels, releases and deploys, OS detection and login startup.",
    modules: [
      ["ui", 1721],
      ["__main__", 890],
      ["cluster_setup", 756],
      ["deploy", 535],
      ["sysview", 437],
      ["release", 349],
      ["cluster_cli", 298],
      ["cluster_tunnel", 292],
      ["settings", 247],
      ["platforms", 226],
      ["cluster_proxy", 210],
      ["autostart", 136],
      ["node", 17],
    ],
  },
  {
    id: "machines",
    name: "Machines",
    job: "The hub and node client, credits, self-tests, hardware probes and the device inventory.",
    modules: [
      ["cluster", 1252],
      ["credits", 777],
      ["selftest", 417],
      ["probe", 259],
      ["inventory", 121],
      ["desktop", 113],
      ["topology", 60],
      ["devices", 55],
    ],
  },
];

export const stationLines = (s: Station) => s.modules.reduce((n, [, l]) => n + l, 0);
export const TOTAL_LINES = STATIONS.reduce((n, s) => n + stationLines(s), 0);
export const TOTAL_MODULES = STATIONS.reduce((n, s) => n + s.modules.length, 0);
