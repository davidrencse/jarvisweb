/** DOM nodes the WebGL scene positions every frame, so React never re-renders for camera motion. */
export type Overlay = {
  labels: (HTMLElement | null)[];
  tip: HTMLElement | null;
  /** Coin the tooltip belongs to, -1 for none. */
  tipIndex: number;
  tipWidth: number;
  tipHeight: number;
};

/** Pointer-drag orbit in radians, written by the DOM and read by the scene. */
export type Orbit = { yaw: number; pitch: number };

export const MAX_YAW = 0.14;
export const MAX_PITCH = 0.07;

export type MapSelection = {
  selected: number;
  hovered: number;
  onSelect: (index: number) => void;
  /** `on` is false when the pointer leaves, so a late "out" never clears the next tile's hover. */
  onHover: (index: number, on: boolean) => void;
};
