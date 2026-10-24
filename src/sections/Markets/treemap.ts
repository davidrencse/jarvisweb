import { coins } from "./data";

export type Rect = { x: number; y: number; w: number; h: number };
export type Layout = { width: number; height: number; rects: Rect[] };

function worst(sum: number, max: number, min: number, side: number) {
  const s2 = sum * sum;
  const l2 = side * side;
  return Math.max((l2 * max) / s2, s2 / (l2 * min));
}

/** Squarified treemap. `values` must be sorted descending; rects come back in the same order. */
export function squarify(values: readonly number[], width: number, height: number): Layout {
  const total = values.reduce((a, b) => a + b, 0);
  const areas = values.map((v) => (v / total) * width * height);
  const rects: Rect[] = [];
  let x = 0;
  let y = 0;
  let w = width;
  let h = height;
  let i = 0;

  while (i < areas.length) {
    const side = Math.min(w, h);
    let end = i + 1;
    let sum = areas[i];
    let max = areas[i];
    let min = areas[i];
    let score = worst(sum, max, min, side);

    while (end < areas.length) {
      const a = areas[end];
      const next = worst(sum + a, Math.max(max, a), Math.min(min, a), side);
      if (next > score) break;
      sum += a;
      max = Math.max(max, a);
      min = Math.min(min, a);
      score = next;
      end++;
    }

    const thickness = sum / side;
    const column = w >= h;
    let offset = 0;
    for (let k = i; k < end; k++) {
      const length = areas[k] / thickness;
      rects.push(column ? { x, y: y + offset, w: thickness, h: length } : { x: x + offset, y, w: length, h: thickness });
      offset += length;
    }
    if (column) {
      x += thickness;
      w -= thickness;
    } else {
      y += thickness;
      h -= thickness;
    }
    i = end;
  }

  return { width, height, rects };
}

const values = coins.map((c) => c.value);

export const LAYOUTS = {
  wide: squarify(values, 16, 10),
  tall: squarify(values, 10, 12),
};
