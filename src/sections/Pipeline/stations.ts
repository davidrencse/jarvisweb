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

/** One frame bar per 30 ms: syllable-shaped swells with a little grain, as a percentage of the bar row. */
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
      "It listens in 30 ms frames. Before a single word is transcribed, a voiceprint check asks whether it's you.",
    readout: {
      kind: "hear",
      title: "30 ms frames",
      frames,
      score: 0.74,
      threshold: 0.45,
      action: "transcribe",
    },
  },
  {
    id: "decide",
    name: "Decide",
    tag: "on device",
    sentence: "A router picks the lightest path with plain rules instead of a model call, so deciding costs nothing.",
    readout: {
      kind: "decide",
      title: "router",
      request: "what's due this week?",
      routes: ["local", "simple", "medium", "complex"],
      picked: "local",
      note: "no model call",
    },
  },
  {
    id: "remember",
    name: "Remember",
    tag: "on device",
    sentence: "It pulls up to four relevant notes from your vault, and says nothing when nothing matches well.",
    readout: {
      kind: "remember",
      title: "vault recall",
      notes: [
        { path: "courses/operating-systems.md", score: 0.91 },
        { path: "calendar.md", score: 0.77 },
        { path: "projects/drone-blueprint.md", score: 0.52 },
      ],
      footnote: "abstains under 45% of the best match",
    },
  },
  {
    id: "think",
    name: "Think",
    tag: "your subscription",
    sentence:
      "The answer comes from the ChatGPT or Claude plan you already have, through its own app, so no API meter is running.",
    readout: {
      kind: "think",
      title: "your plan",
      parts: ["brain", "warm process", "low effort"],
      seconds: 1.1,
    },
  },
  {
    id: "act",
    name: "Act",
    tag: "your apps",
    sentence:
      "Asked to do something, it opens apps or drives a real browser, and asks you before any step that changes things.",
    readout: {
      kind: "act",
      title: "tool calls",
      done: { tool: "open_app", arg: "spotify" },
      pending: { tool: "browser_click", arg: '"Send"', state: "waiting for you" },
    },
  },
  {
    id: "speak",
    name: "Speak",
    tag: "on device",
    sentence:
      "A voice model on your laptop speaks the reply sentence by sentence, so it starts talking before it has finished thinking.",
    readout: {
      kind: "speak",
      title: "speech queue",
      sentences: [
        "Two things.",
        "Your OS assignment is due Thursday at 5 pm.",
        "Friday morning is blocked for the drone build.",
      ],
      note: "local voice · ~0.7 s per sentence",
    },
  },
  {
    id: "log",
    name: "Log",
    tag: "on device",
    sentence: "Every turn lands in a searchable memory on your disk, so next time it already knows.",
    readout: {
      kind: "log",
      title: "memory",
      id: "reply:20261024:858794",
      searchFrom: 3,
      searchTo: 25,
    },
  },
];
