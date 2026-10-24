import type { Phase, Speaker } from "./demo";

const TAU = Math.PI * 2;
const STEP = 2;

const HIST_N = 256;
const HIST_MASK = HIST_N - 1;
const HIST_RATE = 120;
const HIST_DT = 1 / HIST_RATE;

/** Seconds for the voice to travel from the centre to the left and right edges. */
const REACH_LEFT = 0.6;
const REACH_RIGHT = 0.78;

type Burst = readonly [start: number, length: number, peak: number];

const BURSTS: Record<Speaker, readonly Burst[]> = {
  you: [
    [0, 0.28, 0.9],
    [0.28, 0.24, 0.62],
    [0.66, 0.22, 0.72],
    [0.9, 0.26, 1],
    [1.18, 0.16, 0.5],
    [1.36, 0.34, 0.85],
  ],
  stranger: [
    [0, 0.32, 0.7],
    [0.42, 0.18, 0.95],
    [0.7, 0.28, 0.55],
    [1.06, 0.14, 0.85],
    [1.22, 0.28, 0.65],
  ],
};

const SKEW: Record<Speaker, number> = { you: 0.65, stranger: 0.42 };

const REPLY_BURSTS: readonly Burst[] = [
  [0.05, 0.62, 0.8],
  [0.85, 1.3, 1],
];
const REPLY_SKEW = 0.8;
const REPLY_GAIN = 0.3;

function burstEnv(t: number, bursts: readonly Burst[], skew: number) {
  let e = 0;
  for (let i = 0; i < bursts.length; i++) {
    const b = bursts[i];
    const x = (t - b[0]) / b[1];
    if (x <= 0 || x >= 1) continue;
    const s = Math.sin(Math.PI * Math.pow(x, skew));
    const v = b[2] * s * s;
    if (v > e) e = v;
  }
  return e;
}

export type WaveformEngine = {
  resize: (width: number, height: number, dpr: number) => void;
  input: (speaker: Speaker, phase: Phase) => void;
  /** Fade the voice out quickly; used when the visitor restarts the cycle. */
  interrupt: () => void;
  /** Called when the loop restarts after a pause. */
  resume: () => void;
  step: (dt: number) => void;
  draw: () => void;
  /** Set up one static, deterministic frame for a state (reduced motion). */
  pose: (speaker: Speaker, phase: Phase) => void;
};

const NOOP_ENGINE: WaveformEngine = {
  resize: () => {},
  input: () => {},
  interrupt: () => {},
  resume: () => {},
  step: () => {},
  draw: () => {},
  pose: () => {},
};

export function createWaveform(canvas: HTMLCanvasElement): WaveformEngine {
  const ctx = canvas.getContext("2d");
  if (!ctx) return NOOP_ENGINE;
  const ink = getComputedStyle(canvas).color;

  const hist = new Float32Array(HIST_N);
  let head = HIST_N * 8;
  let acc = 0;

  let w = 0;
  let h = 0;
  let n = 0;
  let win = new Float32Array(0);
  let lag = new Float32Array(0);

  // Spatial frequencies in cycles across the line, scaled so narrow screens keep a similar density.
  let y1 = 0;
  let y2 = 0;
  let y3 = 0;
  let s1 = 0;
  let s2 = 0;
  let s3 = 0;
  let s4 = 0;
  let s5 = 0;

  let clock = 0;
  let phaseT = 0;
  let env = 0;
  let rough = 0;
  let roughTarget = 0;
  let fade = 1;
  let fadeTarget = 1;
  let fadeHold = 0;
  let speaker: Speaker = "you";
  let phase: Phase = "idle";

  const resize = (width: number, height: number, dpr: number) => {
    w = width;
    h = height;
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineWidth = 1.5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = ink;

    n = Math.max(2, Math.ceil(w / STEP) + 1);
    win = new Float32Array(n);
    lag = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1);
      const edge = Math.min(1, Math.min(u, 1 - u) / 0.16);
      win[i] = edge * edge * (3 - 2 * edge);
      lag[i] = (u < 0.5 ? (0.5 - u) * 2 * REACH_LEFT : (u - 0.5) * 2 * REACH_RIGHT) * HIST_RATE;
    }

    const d = 0.55 + 0.45 * Math.min(1, w / 1320);
    y1 = 14 * d;
    y2 = 27 * d;
    y3 = 45 * d;
    s1 = 5.5 * d;
    s2 = 11 * d;
    s3 = 58 * d;
    s4 = 7 * d;
    s5 = 95 * d;
  };

  const input = (nextSpeaker: Speaker, nextPhase: Phase) => {
    speaker = nextSpeaker;
    roughTarget = nextSpeaker === "stranger" ? 1 : 0;
    if (nextPhase !== phase) {
      phase = nextPhase;
      phaseT = 0;
    }
  };

  const interrupt = () => {
    fadeTarget = 0;
    fadeHold = 0.16;
  };

  const resume = () => {
    phaseT = 0;
  };

  const step = (dt: number) => {
    clock += dt;
    phaseT += dt;

    let target = 0;
    if (phase === "speaking") target = burstEnv(phaseT, BURSTS[speaker], SKEW[speaker]);
    else if (phase === "answering") target = REPLY_GAIN * burstEnv(phaseT, REPLY_BURSTS, REPLY_SKEW);

    env += (target - env) * (1 - Math.exp(-dt * 40));
    rough += (roughTarget - rough) * (1 - Math.exp(-dt * 5));
    fade += (fadeTarget - fade) * (1 - Math.exp(-dt * 18));

    if (fadeHold > 0) {
      fadeHold -= dt;
      if (fadeHold <= 0) {
        hist.fill(0);
        env = 0;
        fadeTarget = 1;
      }
    }

    acc += dt;
    while (acc >= HIST_DT) {
      acc -= HIST_DT;
      head++;
      hist[head & HIST_MASK] = env;
    }
  };

  const draw = () => {
    if (n === 0) return;
    const mid = h / 2;
    const peak = h * (0.4 - 0.04 * rough) * fade;
    const breath = 2.5 + 0.5 * Math.sin(clock * 1.25);
    const t = clock;
    const smooth = 1 - rough;
    const flicker = 0.7 + 0.3 * Math.sin(t * 31);

    ctx.clearRect(0, 0, w, h);
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1);
      const wi = win[i];
      let y =
        mid +
        wi *
          breath *
          (0.6 * Math.sin(TAU * (1.2 * u + 0.07 * t)) + 0.4 * Math.sin(TAU * (2.6 * u - 0.11 * t) + 1.3));

      const pos = head - lag[i];
      const i0 = Math.floor(pos);
      const f = pos - i0;
      const e = hist[i0 & HIST_MASK] * (1 - f) + hist[(i0 + 1) & HIST_MASK] * f;

      if (e > 0.003 && fade > 0.003) {
        let v = 0;
        if (smooth > 0.001) {
          v +=
            smooth *
            (0.5 * Math.sin(TAU * (y1 * u + 0.8 * t)) +
              0.34 * Math.sin(TAU * (y2 * u - 1.15 * t) + 1.9) +
              0.16 * Math.sin(TAU * (y3 * u + 1.6 * t) + 4.1));
        }
        if (rough > 0.001) {
          v +=
            rough *
            (0.38 * Math.sin(TAU * (s1 * u + 0.55 * t)) +
              0.26 * Math.sin(TAU * (s2 * u - 0.95 * t) + 0.7) +
              0.2 * Math.sin(TAU * (s3 * u + 3.1 * t) + 2.2) * (0.65 + 0.35 * Math.sin(TAU * (s4 * u - 1.4 * t))) +
              0.16 * Math.sin(TAU * (s5 * u - 4.3 * t) + 5.1) * flicker);
        }
        y -= wi * peak * e * v;
      }

      const x = i === n - 1 ? w : i * STEP;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  };

  const pose = (nextSpeaker: Speaker, nextPhase: Phase) => {
    speaker = nextSpeaker;
    phase = nextPhase;
    phaseT = 0;
    rough = roughTarget = nextSpeaker === "stranger" ? 1 : 0;
    fade = fadeTarget = 1;
    fadeHold = 0;
    env = 0;
    acc = 0;
    clock = 0.4;
    hist.fill(0);
    if (nextPhase !== "speaking" && nextPhase !== "answering") return;
    const at = nextPhase === "speaking" ? 1.15 : 1.5;
    for (let k = 0; k < HIST_N; k++) {
      const time = at - k * HIST_DT;
      hist[(head - k) & HIST_MASK] =
        nextPhase === "speaking"
          ? burstEnv(time, BURSTS[nextSpeaker], SKEW[nextSpeaker])
          : REPLY_GAIN * burstEnv(time, REPLY_BURSTS, REPLY_SKEW);
    }
  };

  return { resize, input, interrupt, resume, step, draw, pose };
}
