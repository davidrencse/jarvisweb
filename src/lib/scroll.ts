import { animate } from "motion";

/*
 * Chrome cancels native smooth scrolling when a fixed element animates its
 * height or a WebGL canvas mounts mid-scroll, which left in-page links
 * stranded part-way. This drives the scroll itself and re-reads the target
 * every frame, so late layout changes are absorbed.
 */

let active: { stop: () => void } | null = null;

const INTERRUPTS = ["wheel", "touchstart", "keydown", "pointerdown"] as const;

function targetTop(el: HTMLElement) {
  const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return Math.max(0, Math.min(el.getBoundingClientRect().top + window.scrollY - pad, max));
}

export function scrollToId(id: string, { instant = false }: { instant?: boolean } = {}) {
  const el = document.getElementById(id);
  if (!el) return false;

  active?.stop();
  if (location.hash !== `#${id}`) history.pushState(null, "", `#${id}`);

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finish = () => {
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
  };

  if (instant || reduce) {
    window.scrollTo({ top: targetTop(el), behavior: "instant" });
    finish();
    return true;
  }

  const from = window.scrollY;
  const duration = Math.min(1.3, 0.45 + Math.abs(targetTop(el) - from) / 5000);

  const cleanup = () => {
    for (const type of INTERRUPTS) window.removeEventListener(type, stop);
    if (active === handle) active = null;
  };
  const stop = () => {
    controls.stop();
    cleanup();
  };

  const controls = animate(0, 1, {
    duration,
    ease: [0.65, 0, 0.35, 1],
    onUpdate: (p) => window.scrollTo({ top: from + (targetTop(el) - from) * p, behavior: "instant" }),
    onComplete: () => {
      window.scrollTo({ top: targetTop(el), behavior: "instant" });
      cleanup();
      finish();
    },
  });

  const handle = { stop };
  active = handle;
  for (const type of INTERRUPTS) window.addEventListener(type, stop, { passive: true, once: true });
  return true;
}

/** Routes same-page `#id` links through scrollToId. Returns an unsubscribe function. */
export function interceptHashLinks() {
  const onClick = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const link = (e.target as Element | null)?.closest?.("a[href^='#']");
    const id = link?.getAttribute("href")?.slice(1);
    if (!id || !document.getElementById(id)) return;
    e.preventDefault();
    // Let the pointerdown that started this click finish before listening for interruptions.
    requestAnimationFrame(() => scrollToId(id));
  };
  document.addEventListener("click", onClick);
  return () => document.removeEventListener("click", onClick);
}
