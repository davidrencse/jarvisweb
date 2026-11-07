import { asset, type Shot } from "../components/vision/types";

/** The console's System page, captured 2026-11-07. */
export const SYSTEM_SHOTS: Shot[] = [
  {
    id: "board",
    title: "Request board",
    heading: "The request path as a circuit board",
    caption: "JARVIS drawn as one board, live, beside the stations a request passes. Type a request in the console and the board lights the route it would take.",
    alt: "The System page's request board: a 3D motherboard with parts labelled vault, router, gates, voice, cluster, input, browser and log, beside the list of stations.",
    src: asset("screens/console/design-flow.webp"),
    width: 1328,
    height: 1013,
    regions: [
      { x: 0, y: 121, w: 1328, h: 42, label: "Trace bar", note: "Try “what’s on tomorrow?”, “open spotify”, “check my reddit” or “build a dashboard app”." },
      { x: 0, y: 206, w: 1014, h: 799, label: "The board", note: "Each part is a group of modules. Point at one to see what it does; click to open the code." },
      { x: 864, y: 216, w: 140, h: 28, label: "Run diagnostics", note: "Checks every part and marks it ok, to improve or broken." },
      { x: 1028, y: 206, w: 300, h: 795, label: "Stations", note: "Hear, Decide, Remember, Think… with module and line counts for each." },
    ],
  },
  {
    id: "health",
    title: "Health checks",
    heading: "Is everything working?",
    caption: "Every check is read live from the laptop. Anything amber or red comes with the command that fixes it.",
    alt: "The System page's health checks: two amber items with fixes and seventeen green checks.",
    src: asset("screens/console/design-health.webp"),
    width: 1328,
    height: 783,
    regions: [
      { x: 0, y: 101, w: 660, h: 99, label: "Amber, with the fix", note: "The wiki is empty: copy jarvis kb sync to build it." },
      { x: 668, y: 101, w: 660, h: 99, label: "Brain warm-up", note: "Starts on the first request, a few seconds slower once." },
      { x: 0, y: 208, w: 1328, h: 496, label: "Green checks", note: "Voice packages, voiceprint, listener, PipeWire mic, vault with 244 notes, nightly check at 02:00, Codex and Claude CLIs, browser, Kokoro." },
    ],
  },
  {
    id: "code",
    title: "Under the hood",
    heading: "Live components and every module",
    caption: "The running parts first, with their live numbers, then every Python module filed under its station. Hover one in the console to draw what it imports.",
    alt: "The System page's under-the-hood view: ten component cards and the module grid by station.",
    src: asset("screens/console/design-code.webp"),
    width: 1328,
    height: 1573,
    regions: [
      { x: 0, y: 120, w: 1328, h: 186, label: "Brain, scorecard, gates", note: "L1–L3 model tiers, judge 141/141, parser 197/199, and what runs unasked." },
      { x: 0, y: 318, w: 1328, h: 181, label: "Sandbox, memory, cluster", note: "bubblewrap: 143 paths hidden, 61 read-only. Vault writes off. Nodes on the same code." },
      { x: 0, y: 552, w: 1328, h: 965, label: "Modules by station", note: "From listen.py in Hear to devices.py in Machines." },
    ],
  },
];
