/**
 * Station marks are scroll-progress values (0..1 over the panels block, measured at viewport centre).
 * marks[i] is where station i takes over: the midpoint between panel i-1 and panel i centres.
 */

export function evenMarks(count: number) {
  return Array.from({ length: count }, (_, i) => i / count);
}

export function stationAt(progress: number, marks: number[]) {
  for (let i = marks.length - 1; i > 0; i--) {
    if (progress >= marks[i]) return i;
  }
  return 0;
}

/** 0 at the first node, 1 at the last, reaching node i exactly where station i becomes active. */
export function stationFill(progress: number, marks: number[]) {
  const last = marks.length - 1;
  if (progress <= marks[0]) return 0;
  if (progress >= marks[last]) return 1;
  let i = 1;
  while (progress > marks[i]) i++;
  const span = marks[i] - marks[i - 1];
  const within = span > 0 ? (progress - marks[i - 1]) / span : 0;
  return (i - 1 + within) / last;
}
