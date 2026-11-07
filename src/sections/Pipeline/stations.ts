type Base = { title: string };

export type HearReadout = Base & {
  kind: "hear";
  frames: number[];
  score: number;
  threshold: number;
  action: string;
};

export type DecideReadout = Base & {
  kind: "decide";
  request: string;
  routes: string[];
  picked: string;
  note: string;
};

export type RememberReadout = Base & {
  kind: "remember";
  notes: { path: string; score: number }[];
  footnote: string;
};

export type ThinkReadout = Base & {
  kind: "think";
  parts: string[];
  seconds: number;
};

export type ActReadout = Base & {
  kind: "act";
  done: { tool: string; arg: string };
  pending: { tool: string; arg: string; state: string };
};

export type SpeakReadout = Base & {
  kind: "speak";
  sentences: string[];
  note: string;
};

export type LogReadout = Base & {
  kind: "log";
  id: string;
  searchFrom: number;
  searchTo: number;
};

export type ReadoutDef =
  | HearReadout
  | DecideReadout
  | RememberReadout
  | ThinkReadout
  | ActReadout
  | SpeakReadout
  | LogReadout;

export type Station = {
  id: string;
  name: string;
  tag: string;
  sentence: string;
  readout: ReadoutDef;
};

/** One frame bar per 30 ms: syllable-shaped swells with a little grain, as a percentage of the bar row. */
const frames = Array.from({ length: 64 }, (_, i) => {
  const syllable = Math.abs(Math.sin(i * 0.32 + 0.4));
  const swell = 0.55 + 0.45 * Math.sin(i * 0.1 + 1.2) ** 2;
  const grain = 0.82 + 0.18 * Math.sin(i * 12.9898);
  return Math.round(14 + 86 * syllable * swell * grain);
});

export const stations: Station[] = [
  {
    id: "hear",
    name: "Hear",
    tag: "on device",
    sentence:
      "It listens in 30 ms frames and checks the voice against yours while it transcribes. A stranger’s words are dropped unread.",
    readout: {
      kind: "hear",
      title: "30 ms frames",
      frames,
      score: 0.42,
      threshold: 0.36,
      action: "transcribe",
    },
  },
  {
    id: "decide",
    name: "Decide",
    tag: "0 tokens",
    sentence:
      "Fixed phrases first, then a strict parser that only accepts a request it can read exactly one way. A model is called only when the rules can’t decide.",
    readout: {
      kind: "decide",
      title: "cascade",
      request: "open spotify on the other one",
      routes: ["instant", "parser", "interpreter", "agent"],
      picked: "parser",
      note: "no model call",
    },
  },
  {
    id: "remember",
    name: "Remember",
    tag: "on device",
    sentence:
      "It recalls what matters from memory: the last 20 minutes of talk, open loops, and lessons from times you corrected it.",
    readout: {
      kind: "remember",
      title: "recall",
      notes: [
        { path: "lesson:20261105:c19f07", score: 0.88 },
        { path: "preference:20261102:77ad30", score: 0.71 },
        { path: "fact:20261103:4be21a", score: 0.34 },
      ],
      footnote: "“the other one” = the Dell",
    },
  },
  {
    id: "think",
    name: "Think",
    tag: "only if needed",
    sentence:
      "When the rules can’t decide, one warm call on your ChatGPT plan reads the request in about a second. If ChatGPT hits its limit, Claude takes over.",
    readout: {
      kind: "think",
      title: "your plan",
      parts: ["ChatGPT", "warm lane", "Claude stand-in"],
      seconds: 1.1,
    },
  },
  {
    id: "act",
    name: "Act",
    tag: "any machine",
    sentence:
      "The command goes to the machine you meant as a signed job and is checked on screen afterwards. Anything with consequences waits for your yes.",
    readout: {
      kind: "act",
      title: "commands",
      done: { tool: "open_app", arg: "Spotify · dell · observed" },
      pending: { tool: "close_app", arg: "Chrome · dell", state: "waiting for you" },
    },
  },
  {
    id: "speak",
    name: "Speak",
    tag: "on device",
    sentence:
      "A voice on your laptop speaks the reply sentence by sentence. Tables and links stay on screen; only the short lead is read aloud.",
    readout: {
      kind: "speak",
      title: "speech queue",
      sentences: ["On it.", "Spotify’s open on the Dell."],
      note: "local voice · spoken lead only",
    },
  },
  {
    id: "log",
    name: "Log",
    tag: "on device",
    sentence:
      "What it did, what it saw and what it said land in history and memory on your disk. Each night the day is distilled into facts and lessons.",
    readout: {
      kind: "log",
      title: "memory",
      id: "reply:20261107:858794",
      searchFrom: 3,
      searchTo: 25,
    },
  },
];
