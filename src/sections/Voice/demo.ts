import { useEffect, useReducer, useState } from "react";
import { ease } from "../../lib/motion";

export type Speaker = "you" | "stranger";
export type Phase = "idle" | "speaking" | "checking" | "transcript" | "answering" | "ignored" | "hold";

export const THRESHOLD = 0.45;

export const SCORE: Record<Speaker, number> = { you: 0.74, stranger: 0.09 };

export const TRANSCRIPT = "Jarvis, what’s due this week?";

export const REPLY = [
  "Two things.",
  "Your OS assignment is due Thursday at 5 pm, and Friday morning is blocked for the drone build.",
];

export const IGNORED = ["Speech detected.", "Not transcribed, not answered."];

export const TIMINGS = ["verified 0.5 s", "heard 0.3 s", "answered 1.1 s"];

export const CAPTION =
  "A simulated demo of the voice check: JARVIS scores a voice against a 0.45 threshold, answers its owner, and ignores a stranger without transcribing a word.";

export const VERDICT_TEXT: Record<Speaker, string> = {
  you: "Voice verified. Score 0.74 against a threshold of 0.45, so it’s you and JARVIS answered.",
  stranger:
    "Voice not verified. Score 0.09 against a threshold of 0.45, so it’s not you and the speech was not transcribed or answered.",
};

export const ORDER: Record<Phase, number> = {
  idle: 0,
  speaking: 1,
  checking: 2,
  transcript: 3,
  ignored: 3,
  answering: 4,
  hold: 5,
};

const SEQUENCE: Record<Speaker, readonly Phase[]> = {
  you: ["idle", "speaking", "checking", "transcript", "answering", "hold"],
  stranger: ["idle", "speaking", "checking", "ignored", "hold"],
};

const PHASE_MS: Record<Phase, number> = {
  idle: 700,
  speaking: 1800,
  checking: 900,
  transcript: 1200,
  answering: 2300,
  ignored: 700,
  hold: 2500,
};

const SLOW = 1.6;

export function phaseMs(phase: Phase, speaker: Speaker, reduced: boolean) {
  const base = phase === "speaking" && speaker === "stranger" ? 1600 : PHASE_MS[phase];
  return reduced ? base * SLOW : base;
}

type DemoState = {
  speaker: Speaker;
  phase: Phase;
  /** Bumps every time a cycle starts, so repeats of the same speaker still reset. */
  run: number;
  /** True until the visitor picks a speaker. */
  auto: boolean;
  paused: boolean;
};

type DemoAction = { type: "advance" } | { type: "choose"; speaker: Speaker } | { type: "toggle" };

const INITIAL: DemoState = { speaker: "you", phase: "idle", run: 0, auto: true, paused: false };

function reduce(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case "advance": {
      const sequence = SEQUENCE[state.speaker];
      const next = sequence[sequence.indexOf(state.phase) + 1];
      if (next) return { ...state, phase: next };
      return {
        ...state,
        phase: "idle",
        run: state.run + 1,
        speaker: state.auto ? (state.speaker === "you" ? "stranger" : "you") : state.speaker,
      };
    }
    case "choose":
      return { speaker: action.speaker, phase: "idle", run: state.run + 1, auto: false, paused: false };
    case "toggle":
      return { ...state, paused: !state.paused };
  }
}

/** One pending timeout at a time, cleared on pause, speaker change, scroll-away and unmount. */
export function useVoiceCheck(running: boolean, reduced: boolean) {
  const [state, dispatch] = useReducer(reduce, INITIAL);
  const { phase, speaker, run, paused } = state;

  useEffect(() => {
    if (!running || paused) return;
    const id = window.setTimeout(() => dispatch({ type: "advance" }), phaseMs(phase, speaker, reduced));
    return () => window.clearTimeout(id);
  }, [running, paused, phase, speaker, run, reduced]);

  return [state, dispatch] as const;
}

export function usePageVisible() {
  const [visible, setVisible] = useState(() => !document.hidden);
  useEffect(() => {
    const onChange = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, []);
  return visible;
}

/** Shared blur-in for streamed text: opacity + 8px blur + a small rise. */
export function blurIn(reduced: boolean, delay = 0) {
  return {
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 10, filter: "blur(8px)" },
    animate: reduced ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: reduced ? 0.3 : 0.8, ease: ease.out, delay },
  };
}
