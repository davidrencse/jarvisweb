import {
  motion,
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
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { FadeIn } from "../../components/FadeIn";
import { LIFT_PER_DEG, SCALE_PER_DEG, SHOT_H, SHOT_W, TILT_COMPACT, TILT_DESKTOP, shotUrl, type ShotTheme } from "./shot";
import styles from "./ProductShot.module.css";

const ProductShotScene = lazy(() => import("./ProductShotScene"));

const ARM_MS = 500;
const SLOW_MS = 1500;
const MIN_FLAT_AT = 240;
const LABEL =
  "The JARVIS console: machines and links, the live request engine, the trace of a request answered free in 0 seconds, and the assistant thread.";


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

export function ProductShot() {
  const reduced = !!useReducedMotion();
  const compact = useMedia("(max-width: 700px)");
  const [glOk] = useState(hasWebGL2);
  const [failed, setFailed] = useState(false);
  const theme: ShotTheme = "light";
  const [ready, setReady] = useState(false);
  const [armed, setArmed] = useState(false);
  const [slow, setSlow] = useState(false);
  const readyRef = useRef(false);
  const frameRef = useRef<HTMLDivElement>(null);

  const wantGL = glOk && !reduced && !failed;
  const show = ready && armed;
  const posterShown = !wantGL || (slow && !ready);

  const { scrollY } = useScroll();
  const flatAt = useMotionValue(MIN_FLAT_AT * 2);
  const tiltMax = useMotionValue(reduced ? 0 : compact ? TILT_COMPACT : TILT_DESKTOP);
  const progress = useTransform(() => Math.min(1, Math.max(0, scrollY.get() / flatAt.get())));
  const flat = useSpring(progress, { stiffness: 150, damping: 28, mass: 0.8, restDelta: 0.0006 });
  const tilt = useTransform(() => Math.max(0, 1 - flat.get()) * tiltMax.get());
  const scale = useTransform(() => 1 - SCALE_PER_DEG * tilt.get());
  const lift = useTransform(() => `${-LIFT_PER_DEG * tilt.get() * 100}%`);

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

  const handleReady = useCallback(() => {
    readyRef.current = true;
    setReady(true);
  }, []);
  const handleFail = useCallback(() => setFailed(true), []);

  const light1440 = shotUrl("light", false);

  return (
    <div className={styles.shot}>
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
                width={SHOT_W}
                height={SHOT_H}
                alt=""
                fetchPriority="high"
                decoding="async"
                draggable={false}
              />
            </motion.div>
          </div>
        </div>

        <figcaption>
          <FadeIn delay={1.2} className={styles.caption}>
            The real JARVIS console, captured 7 November 2026. Move over it for a closer look.
          </FadeIn>
        </figcaption>
      </FadeIn>
    </div>
  );
}
