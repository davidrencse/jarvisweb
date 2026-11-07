import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Scan } from "lucide-react";
import {
  Component,
  Suspense,
  lazy,
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { spring } from "../../lib/motion";
import { fit, regionBox, type Pointer, type Rect, type Shot } from "./types";
import styles from "./VisionViewer.module.css";

const VisionScene = lazy(() => import("./VisionScene"));

function hasWebGL2() {
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

class Boundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

type Props = {
  shots: Shot[];
  /** Frame aspect (width / height). Shots of another shape are letterboxed on black. */
  aspect?: number;
  /** Accessible name for the view picker. */
  label: string;
  className?: string;
};

export function VisionViewer({ shots, aspect = 1.6, label, className }: Props) {
  const uid = useId();
  const reduced = !!useReducedMotion();
  const [glOk] = useState(hasWebGL2);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(0);
  const [vision, setVision] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);

  const pointer = useRef<Pointer>({ x: 0.5, y: 0.5, inside: false });
  const poke = useRef<() => void>(() => {});
  const readout = useRef<HTMLSpanElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const shot = shots[active];
  const gl = glOk && !failed;
  const srcs = useMemo(() => shots.map((s) => s.src), [shots]);
  const aspects = useMemo(() => shots.map((s) => s.width / s.height), [shots]);
  const focusIndex = hover ?? pinned;

  const focus: Rect | null = useMemo(() => {
    if (focusIndex == null) return null;
    const r = shot.regions[focusIndex];
    if (!r) return null;
    const b = regionBox(r, shot, aspect);
    return [b.left, 1 - b.top - b.height, b.left + b.width, 1 - b.top];
  }, [focusIndex, shot, aspect]);

  const select = (i: number) => {
    setActive(i);
    setHover(null);
    setPinned(null);
  };

  const onTabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const last = shots.length - 1;
    let next: number;
    if (e.key === "ArrowRight") next = active === last ? 0 : active + 1;
    else if (e.key === "ArrowLeft") next = active === 0 ? last : active - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    else return;
    e.preventDefault();
    select(next);
    tabs.current[next]?.focus();
  };

  const onMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (e.pointerType !== "mouse" && e.buttons === 0) return;
      const r = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      pointer.current = { x, y: 1 - y, inside: true };
      poke.current();
      const el = readout.current;
      if (el) {
        const f = fit(aspect, shot.width / shot.height);
        const ix = Math.round(((x - f.left) / f.w) * shot.width);
        const iy = Math.round(((y - f.top) / f.h) * shot.height);
        const inImage = ix >= 0 && iy >= 0 && ix <= shot.width && iy <= shot.height;
        el.textContent = inImage ? `x ${ix}  y ${iy}` : "outside";
        el.style.transform = `translate(${e.clientX - r.left + 18}px, ${e.clientY - r.top + 18}px)`;
        el.dataset.on = "true";
      }
    },
    [aspect, shot],
  );

  const onLeave = useCallback(() => {
    pointer.current = { ...pointer.current, inside: false };
    poke.current();
    if (readout.current) readout.current.dataset.on = "false";
  }, []);

  const handleReady = useCallback(() => setReady(true), []);
  const handleFail = useCallback(() => setFailed(true), []);

  const f = fit(aspect, shot.width / shot.height);

  return (
    <div className={[styles.viewer, className].filter(Boolean).join(" ")}>
      <div className={styles.bar}>
        <div role="tablist" aria-label={label} className={styles.tabs} onKeyDown={onTabKey}>
          {shots.map((s, i) => {
            const on = i === active;
            return (
              <button
                key={s.id}
                ref={(el) => {
                  tabs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`${uid}-tab-${i}`}
                aria-selected={on}
                aria-controls={`${uid}-panel`}
                tabIndex={on ? 0 : -1}
                className={styles.tab}
                onClick={() => select(i)}
              >
                {on ? <motion.span layoutId={`${uid}-tab`} className={styles.tabPill} transition={spring.snappy} /> : null}
                <span className={styles.tabLabel}>{s.title}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className={styles.switch}
          aria-pressed={vision}
          onClick={() => setVision((v) => !v)}
        >
          <Scan size={15} strokeWidth={1.75} aria-hidden />
          <span>Edge view</span>
          <span className={styles.knob} aria-hidden>
            <motion.span className={styles.knobDot} animate={{ x: vision ? 12 : 0 }} transition={spring.snappy} />
          </span>
        </button>
      </div>

      <div
        id={`${uid}-panel`}
        role="tabpanel"
        aria-labelledby={`${uid}-tab-${active}`}
        className={styles.body}
      >
        <div
          className={styles.frame}
          style={{ aspectRatio: String(aspect) }}
          onPointerMove={onMove}
          onPointerDown={(e) => {
            if (e.pointerType !== "mouse") onMove(e);
          }}
          onPointerUp={(e) => {
            if (e.pointerType !== "mouse") onLeave();
          }}
          onPointerCancel={onLeave}
          onPointerLeave={onLeave}
          data-vision={vision}
          data-gl={gl && ready}
        >
          <img
            key={shot.src}
            className={styles.poster}
            src={shot.src}
            alt={shot.alt}
            width={shot.width}
            height={shot.height}
            decoding="async"
            draggable={false}
            style={{ left: `${f.left * 100}%`, top: `${f.top * 100}%`, width: `${f.w * 100}%`, height: `${f.h * 100}%` }}
          />

          {gl ? (
            <div className={styles.canvas} data-ready={ready} aria-hidden>
              <Boundary onError={handleFail}>
                <Suspense fallback={null}>
                  <VisionScene
                    srcs={srcs}
                    aspects={aspects}
                    active={active}
                    vision={vision}
                    focus={focus}
                    pointer={pointer}
                    poke={poke}
                    lens={!reduced}
                    reduced={reduced}
                    onReady={handleReady}
                    onFail={handleFail}
                  />
                </Suspense>
              </Boundary>
            </div>
          ) : null}

          <div className={styles.overlay}>
            {shot.regions.map((r, i) => {
              const b = regionBox(r, shot, aspect);
              const on = focusIndex === i;
              return (
                <div
                  key={`${shot.id}-${i}`}
                  className={styles.region}
                  data-on={on}
                  data-dim={focusIndex != null && !on}
                  style={{
                    left: `${b.left * 100}%`,
                    top: `${b.top * 100}%`,
                    width: `${b.width * 100}%`,
                    height: `${b.height * 100}%`,
                  }}
                >
                  <span className={styles.corners} aria-hidden />
                  <button
                    type="button"
                    className={styles.marker}
                    aria-label={`${i + 1}: ${r.label}`}
                    aria-pressed={pinned === i}
                    onPointerEnter={() => setHover(i)}
                    onPointerLeave={() => setHover(null)}
                    onFocus={() => setHover(i)}
                    onBlur={() => setHover(null)}
                    onClick={() => setPinned((p) => (p === i ? null : i))}
                  >
                    {i + 1}
                  </button>
                  <span className={styles.tag} aria-hidden>
                    {r.label}
                  </span>
                </div>
              );
            })}
          </div>

          <span ref={readout} className={styles.readout} data-on="false" aria-hidden />
        </div>

        <aside className={styles.side}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={shot.id}
              initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
              <h3 className={styles.heading}>{shot.heading}</h3>
              <p className={styles.caption}>{shot.caption}</p>
              <ol className={styles.list}>
                {shot.regions.map((r, i) => (
                  <li key={r.label}>
                    <button
                      type="button"
                      className={styles.item}
                      data-on={focusIndex === i}
                      aria-pressed={pinned === i}
                      onPointerEnter={() => setHover(i)}
                      onPointerLeave={() => setHover(null)}
                      onFocus={() => setHover(i)}
                      onBlur={() => setHover(null)}
                      onClick={() => setPinned((p) => (p === i ? null : i))}
                    >
                      <span className={styles.num}>{i + 1}</span>
                      <span>
                        <span className={styles.itemLabel}>{r.label}</span>
                        <span className={styles.itemNote}>{r.note}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </motion.div>
          </AnimatePresence>
        </aside>
      </div>
    </div>
  );
}
