export const SPANS = ["1D", "7D", "30D", "90D", "1Y"] as const;
export type Span = (typeof SPANS)[number];

export type FKey = "F1" | "F2" | "F3" | "F4" | "F5";

/** A table cell; an object makes it a button that runs `run`. */
export type Cell = string | { text: string; run: string };

export type Line = { key?: string; text: string; meta?: string; mono?: boolean; muted?: boolean };
export type Group = { heading: string; lines: Line[] };
export type NoteHit = { path: string; score: number; excerpt: [string, string] };
export type Bar = { label: string; sub: string; left: number; readout: string; detail?: string };
export type Fact = [label: string, value: string];

export type Point = { t: number; v: number };
export type ChartData = {
  ticker: string;
  name: string;
  span: Span;
  points: Point[];
  dip: number;
  pct: number;
  ticks: { i: number; label: string }[];
};

export type Output =
  | { kind: "idle"; starters: string[] }
  | { kind: "groups"; groups: Group[]; foot?: string }
  | {
      kind: "table";
      columns: string[];
      /** CSS grid-template-columns for the wide layout. */
      cols: string;
      /** Columns that drop their label when the table stacks on narrow screens. */
      quiet?: number[];
      /** Columns set in mono: commands and codes. */
      mono?: number[];
      rows: Cell[][];
      foot?: string;
    }
  | { kind: "chart"; chart: ChartData; foot?: string }
  | { kind: "notes"; items: NoteHit[]; foot: string }
  | { kind: "bars"; items: Bar[]; foot?: string }
  | {
      kind: "facts";
      title: string;
      code?: string;
      big?: { main: string; vs: string };
      text?: string;
      facts: Fact[];
      foot?: string;
    }
  | { kind: "error"; message: string; tries: string[] };

export type MonitorRow = {
  id: string;
  cells: [string, string] | [string, string, string];
  active?: boolean;
  muted?: boolean;
  run?: string;
};

export type Monitor = {
  id: string;
  sub: string;
  /** CSS grid-template-columns for the row cells. */
  cols: string;
  /** Cells after the first are numbers: set in mono, right-aligned. */
  numeric?: boolean;
  rows: MonitorRow[];
};

export type Result = {
  id: string;
  title: string;
  fkey: FKey | null;
  /** Set when the output is a chart: drives the window chips. */
  chip: { ticker: string; active: Span } | null;
  monitor: Monitor;
  output: Output;
  plain: string;
};

export type Outcome = Omit<Result, "id" | "monitor"> & { monitor?: Monitor };

export type AddedTask = { text: string; due: string | null };
