export type Dir = "out" | "back" | "both";

export type Step = {
  /** Who does this step. */
  who: "Main" | "Hub" | "Node" | "Both";
  text: string;
  /** Mono detail: a value, a limit, a state. */
  detail: string;
  /** Packets on the link during this step: out = main → node, back = node → main. */
  dir?: Dir;
  /** Status line shown on each machine once this step is reached. */
  main?: string;
  node?: string;
};

export type Scenario = {
  id: "job" | "remote" | "input";
  label: string;
  say: string;
  steps: Step[];
};

export const MACHINES = {
  main: { name: "Zenbook", role: "main", os: "Arch Linux · Hyprland", idle: "brain, memory, hub" },
  node: { name: "Dell", role: "node", os: "Windows 11", idle: "waiting on the hub" },
} as const;

export const SCENARIOS: Scenario[] = [
  {
    id: "job",
    label: "Run an action",
    say: "“Jarvis, open Spotify on the Dell.”",
    steps: [
      {
        who: "Main",
        text: "The parser reads it one way: open an app, on the node.",
        detail: "open_app · Spotify · dell · 0 tokens",
        main: "parsed, no model",
      },
      {
        who: "Main",
        text: "Gates check the Dell checked in recently and has Spotify.",
        detail: "seen 2 s ago · app found",
        main: "gates passed",
      },
      {
        who: "Hub",
        text: "The job is signed and handed to the Dell’s open long-poll.",
        detail: "signed · over the SSH tunnel",
        dir: "out",
        main: "job sent",
        node: "job received",
      },
      {
        who: "Node",
        text: "The Dell checks the signature, launches Spotify and watches for its window.",
        detail: "settle up to 8 s",
        node: "Spotify window open",
      },
      {
        who: "Node",
        text: "The result goes back once and waits in the Dell’s outbox until the main accepts it.",
        detail: "observed · never re-run",
        dir: "back",
        main: "observed, logged",
        node: "result delivered",
      },
    ],
  },
  {
    id: "remote",
    label: "Drive its screen",
    say: "Open the Remote view in the console.",
    steps: [
      {
        who: "Main",
        text: "The console opens a session. Both laptops pause Lan Mouse so your hands stay put.",
        detail: "first frame within 30 s",
        dir: "out",
        main: "session starting",
        node: "Lan Mouse paused",
      },
      {
        who: "Node",
        text: "The Dell streams its screen. The hub keeps only the newest frame.",
        detail: "1280 px · 10 fps · JPEG",
        dir: "back",
        main: "live",
        node: "streaming",
      },
      {
        who: "Main",
        text: "Your keys and clicks travel back down the same tunnel.",
        detail: "no new port",
        dir: "both",
        node: "typing, clicking",
      },
      {
        who: "Node",
        text: "If replies stop for six seconds, the Dell lets go of every key and button.",
        detail: "dead-man timer · 6 s",
        node: "all keys released",
      },
      {
        who: "Both",
        text: "However it ends, keys are released and Lan Mouse restarts once.",
        detail: "closed tab · lost link · 4 h cap",
        main: "session ended",
        node: "Lan Mouse back on",
      },
    ],
  },
  {
    id: "input",
    label: "Share one mouse",
    say: "Push the cursor off the Zenbook’s edge.",
    steps: [
      {
        who: "Both",
        text: "On the same network, one mouse and keyboard cross between the laptops.",
        detail: "Lan Mouse · UDP 4242",
        dir: "both",
        main: "together",
        node: "together",
      },
      {
        who: "Both",
        text: "Copy on one, paste on the other. Copies a password manager marks secret stay put.",
        detail: "text and images · both ways",
        dir: "out",
        main: "copied",
        node: "pasted",
      },
      {
        who: "Main",
        text: "Two readings in a row show the Dell somewhere else, so Lan Mouse stops.",
        detail: "guard · 2 readings",
        main: "apart, stopped",
        node: "apart, stopped",
      },
      {
        who: "Both",
        text: "It never reaches across the internet: remote addresses are refused outright.",
        detail: "same network only",
        main: "refuses Tailscale",
        node: "refuses Tailscale",
      },
      {
        who: "Both",
        text: "Back together, it starts again by itself, unless you stopped it by hand.",
        detail: "manual stop holds until reboot",
        dir: "both",
        main: "together",
        node: "together",
      },
    ],
  },
];

export const FACTS = [
  { figure: "2", text: "commands to add a computer: invite on the main, join on the new one." },
  { figure: "1×", text: "A job runs at most once. A dropped link never replays an action." },
  { figure: "6 s", text: "of silence and the other machine lets go of every key it holds." },
  { figure: "0", text: "network ports for the hub. It listens on loopback, behind SSH." },
];
