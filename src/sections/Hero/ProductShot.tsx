import {
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import {
  Component,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { FadeIn } from "../../components/FadeIn";
import { ease, spring } from "../../lib/motion";
import { LIFT_PER_DEG, SCALE_PER_DEG, TILT_COMPACT, TILT_DESKTOP, shotUrl, type ShotTheme } from "./shot";
import styles from "./ProductShot.module.css";

const ProductShotScene = lazy(() => import("./ProductShotScene"));

const ARM_MS = 500;
const SLOW_MS = 1500;
const MIN_FLAT_AT = 240;
const WIPE_PCT = 18;
const SIZES = "(min-width: 1400px) 1320px, 92vw";
const LABEL = "The JARVIS console: agent status, Claude and Codex usage, recent runs and memory.";

const OPTIONS: { value: ShotTheme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

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

function useMedia(query: string) {
  const subscribe = useCallback(
    (cb: () => void) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

class SceneBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
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

function ThemeToggle({ theme, onChange }: { theme: ShotTheme; onChange: (t: ShotTheme) => void }) {
  const uid = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = OPTIONS.findIndex((o) => o.value === theme);
    const last = OPTIONS.length - 1;
    let next: number;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = i === last ? 0 : i + 1;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = i === 0 ? last : i - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    else return;
    e.preventDefault();
    onChange(OPTIONS[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div role="radiogroup" aria-label="Console theme" className={styles.toggle} onKeyDown={onKeyDown}>
      {OPTIONS.map((o, i) => {
        const checked = o.value === theme;
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            className={styles.option}
            onClick={() => onChange(o.value)}
          >
            {checked ? <motion.span layoutId={`${uid}-pill`} className={styles.pill} transition={spring.snappy} /> : null}
            <span className={styles.optionLabel}>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function ProductShot() {
  const reduced = !!useReducedMotion();
  const compact = useMedia("(max-width: 700px)");
  const [glOk] = useState(hasWebGL2);
  const [failed, setFailed] = useState(false);
  const [theme, setTheme] = useState<ShotTheme>("light");
  const [ready, setReady] = useState(false);
  const [armed, setArmed] = useState(false);
  const [slow, setSlow] = useState(false);
  const readyRef = useRef(false);
  const frameRef = useRef<HTMLDivElement>(null);

  const wantGL = glOk && !reduced && !failed;
  const show = ready && armed;
  const posterShown = !wantGL || (slow && !ready);
  const darkPoster = !wantGL || slow;

  const { scrollY } = useScroll();
  const flatAt = useMotionValue(MIN_FLAT_AT * 2);
  const tiltMax = useMotionValue(reduced ? 0 : compact ? TILT_COMPACT : TILT_DESKTOP);
  const progress = useTransform(() => Math.min(1, Math.max(0, scrollY.get() / flatAt.get())));
  const flat = useSpring(progress, { stiffness: 150, damping: 28, mass: 0.8, restDelta: 0.0006 });
  const tilt = useTransform(() => Math.max(0, 1 - flat.get()) * tiltMax.get());
  const scale = useTransform(() => 1 - SCALE_PER_DEG * tilt.get());
  const lift = useTransform(() => `${-LIFT_PER_DEG * tilt.get() * 100}%`);

  const posterMix = useMotionValue(0);
  const front = useTransform(posterMix, [0, 1], [0, 100 + WIPE_PCT]);
  const mask = useMotionTemplate`linear-gradient(135deg, #000 calc(${front}% - ${WIPE_PCT}%), transparent ${front}%)`;

  useEffect(() => {
    tiltMax.set(reduced ? 0 : compact ? TILT_COMPACT : TILT_DESKTOP);
  }, [reduced, compact, tiltMax]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const section = frame.closest("section") ?? frame;
    const measure = () => {
      const r = frame.getBoundingClientRect();
      const centre = r.top + window.scrollY + r.height / 2;
      flatAt.set(Math.max(MIN_FLAT_AT, centre - window.innerHeight / 2));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(section);
    window.addEventListener("resize", measure);
    void document.fonts?.ready.then(measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [flatAt]);

  useEffect(() => {
    if (!wantGL) return;
    const arm = window.setTimeout(() => setArmed(true), ARM_MS);
    const late = window.setTimeout(() => {
      if (!readyRef.current) setSlow(true);
    }, SLOW_MS);
    return () => {
      window.clearTimeout(arm);
      window.clearTimeout(late);
    };
  }, [wantGL]);

  useEffect(() => {
    const target = theme === "dark" ? 1 : 0;
    if (reduced) {
      posterMix.set(target);
      return;
    }
    const tween = animate(posterMix, target, { duration: 1, ease: ease.out });
    return () => tween.stop();
  }, [theme, reduced, posterMix]);

  const handleReady = useCallback(() => {
    readyRef.current = true;
    setReady(true);
  }, []);
  const handleFail = useCallback(() => setFailed(true), []);

  const light1440 = shotUrl("light", false);
  const light2880 = shotUrl("light", true);
  const dark1440 = shotUrl("dark", false);
  const dark2880 = shotUrl("dark", true);

  return (
    <div className={styles.shot}>
      <FadeIn delay={1} className={styles.bar}>
        <ThemeToggle theme={theme} onChange={setTheme} />
      </FadeIn>

      <FadeIn as="figure" delay={0.3} y={16} blur={8} amount={0.1} className={styles.figure}>
        <div ref={frameRef} className={styles.frame} role="img" aria-label={LABEL}>
          <div className={styles.stage}>
            <motion.div className={styles.shadow} style={{ y: lift, rotateX: tilt, scale }} aria-hidden />

            {wantGL ? (
              <div className={styles.canvas} data-show={show} data-instant={slow} aria-hidden>
                <SceneBoundary onError={handleFail}>
                  <Suspense fallback={null}>
                    <ProductShotScene
                      theme={theme}
                      tilt={tilt}
                      scale={scale}
                      show={show}
                      skipIntro={slow}
                      lens={!compact}
                      onReady={handleReady}
                      onFail={handleFail}
                    />
                  </Suspense>
                </SceneBoundary>
              </div>
            ) : null}

            <motion.div className={styles.poster} data-hidden={!posterShown} style={{ y: lift, rotateX: tilt, scale }}>
              <img
                className={styles.img}
                src={light1440}
                srcSet={`${light1440} 1440w, ${light2880} 2880w`}
                sizes={SIZES}
                width={2880}
                height={1800}
                alt=""
                fetchPriority="high"
                decoding="async"
                draggable={false}
              />
              {darkPoster ? (
                <motion.img
                  className={styles.img}
                  src={dark1440}
                  srcSet={`${dark1440} 1440w, ${dark2880} 2880w`}
                  sizes={SIZES}
                  width={2880}
                  height={1800}
                  alt=""
                  fetchPriority="low"
                  decoding="async"
                  draggable={false}
                  style={{ maskImage: mask, WebkitMaskImage: mask }}
                />
              ) : null}
            </motion.div>
          </div>
        </div>

        <figcaption>
          <FadeIn delay={1.2} className={styles.caption}>
            The real JARVIS console on a laptop. Not a mock-up.
          </FadeIn>
        </figcaption>
      </FadeIn>
    </div>
  );
}
