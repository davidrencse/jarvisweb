import type { MutableRefObject } from "react";

/** A labelled region of a screenshot, in the source image's pixels. */
export type Region = {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  note: string;
};

export type Shot = {
  id: string;
  /** Short tab name. */
  title: string;
  /** Heading shown beside the frame. */
  heading: string;
  caption: string;
  alt: string;
  src: string;
  width: number;
  height: number;
  regions: Region[];
};

/** Pointer position in canvas space: 0..1, y up. */
export type Pointer = { x: number; y: number; inside: boolean };

/** Rect in canvas space (y up): x0, y0, x1, y1. */
export type Rect = [number, number, number, number];

export type SceneProps = {
  srcs: string[];
  aspects: number[];
  active: number;
  vision: boolean;
  focus: Rect | null;
  pointer: MutableRefObject<Pointer>;
  /** The viewer calls this after pointer moves so a demand-driven frame is drawn. */
  poke: MutableRefObject<() => void>;
  lens: boolean;
  reduced: boolean;
  onReady: () => void;
  onFail: () => void;
};

/** Where an image of aspect `img` sits when contained in a frame of aspect `frame` (fractions of the frame). */
export function fit(frame: number, img: number) {
  const w = img > frame ? 1 : img / frame;
  const h = img > frame ? frame / img : 1;
  return { w, h, left: (1 - w) / 2, top: (1 - h) / 2 };
}

/** A region in frame fractions, top-left origin. */
export function regionBox(r: Region, shot: Shot, frame: number) {
  const f = fit(frame, shot.width / shot.height);
  return {
    left: f.left + (r.x / shot.width) * f.w,
    top: f.top + (r.y / shot.height) * f.h,
    width: (r.w / shot.width) * f.w,
    height: (r.h / shot.height) * f.h,
  };
}

export function asset(path: string) {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
}
