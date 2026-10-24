import { useInView, useReducedMotion } from "motion/react";
import {
  Component,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { Spotlight } from "../../components/Spotlight";
import { SIM_LABEL, coins, fmtPct, isUp } from "./data";
import { FlatMap } from "./FlatMap";
import { hasWebGL, useMediaQuery, usePageHidden } from "./hooks";
import { MAX_PITCH, MAX_YAW, type MapSelection, type Orbit, type Overlay } from "./mapTypes";
import { MapTip } from "./MapTip";
import { LAYOUTS } from "./treemap";
import styles from "./MarketMap.module.css";

const MarketMapScene = lazy(() => import("./MarketMapScene"));

const clamp = (n: number, limit: number) => Math.min(Math.max(n, -limit), limit);

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

export function MarketMap({ selected, hovered, onSelect, onHover }: MapSelection) {
  const reduced = useReducedMotion();
  const tall = useMediaQuery("(max-width: 700px)");
  const touch = useMediaQuery("(hover: none)");
  const hidden = usePageHidden();
  const boxRef = useRef<HTMLDivElement>(null);
  const near = useInView(boxRef, { once: true, margin: "600px 0px" });
  const visible = useInView(boxRef, { amount: 0.15 });
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const webgl = useMemo(hasWebGL, []);
  const use3d = webgl && !reduced && !failed;

  const layout = tall ? LAYOUTS.tall : LAYOUTS.wide;
  const tipIndex = hovered >= 0 ? hovered : touch ? selected : -1;

  const overlay = useRef<Overlay>({ labels: [], tip: null, tipIndex: -1, tipWidth: 0, tipHeight: 0 });
  const orbit = useRef<Orbit>({ yaw: 0, pitch: 0 });
  const stopDrag = useRef<(() => void) | null>(null);

  const labelRefs = useMemo(
    () =>
      coins.map((_, i) => (el: HTMLElement | null) => {
        overlay.current.labels[i] = el;
      }),
    [],
  );
  const tipRef = useCallback((el: HTMLElement | null) => {
    overlay.current.tip = el;
  }, []);
  const fail = useCallback(() => setFailed(true), []);
  const markReady = useCallback(() => setReady(true), []);

  useLayoutEffect(() => {
    const o = overlay.current;
    o.tipIndex = use3d ? tipIndex : -1;
    if (o.tip) {
      o.tipWidth = o.tip.offsetWidth;
      o.tipHeight = o.tip.offsetHeight;
    }
  }, [tipIndex, use3d]);

  useEffect(() => () => stopDrag.current?.(), []);

  const startDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const box = boxRef.current;
    if (!use3d || !box || (e.pointerType === "mouse" && e.button !== 0)) return;
    const x0 = e.clientX;
    const y0 = e.clientY;
    const yaw0 = orbit.current.yaw;
    const pitch0 = orbit.current.pitch;
    const tiltable = e.pointerType === "mouse";

    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - x0;
      const dy = ev.clientY - y0;
      if (Math.abs(dx) + Math.abs(dy) > 4) box.dataset.dragging = "true";
      orbit.current.yaw = clamp(yaw0 + dx * 0.004, MAX_YAW);
      if (tiltable) orbit.current.pitch = clamp(pitch0 + dy * 0.0022, MAX_PITCH);
    };
    const end = () => {
      delete box.dataset.dragging;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      stopDrag.current = null;
    };

    stopDrag.current?.();
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    stopDrag.current = end;
  };

  return (
    <Spotlight className={styles.frame}>
      <header className={styles.bar}>
        <p className={styles.title}>
          Market map <span className={styles.key}>· size = value · shade = move today</span>
        </p>
        <p className={styles.sim}>{SIM_LABEL}</p>
      </header>

      <p className="sr-only">
        A map of {coins.length} coins. Tile area shows market value and shade shows today’s move. Use the coin list
        beside the map to explore it with a keyboard.
      </p>

      <div className={styles.stage}>
        <div
          ref={boxRef}
          className={styles.box}
          data-mode={use3d ? "3d" : "flat"}
          data-hover={hovered >= 0}
          onPointerDown={startDrag}
        >
          {use3d ? (
            <>
              <div className={styles.canvas} aria-hidden>
                {near ? (
                  <SceneBoundary onError={fail}>
                    <Suspense fallback={null}>
                      <MarketMapScene
                        layout={layout}
                        hovered={hovered}
                        selected={selected}
                        active={visible && !hidden}
                        overlay={overlay}
                        orbit={orbit}
                        onHover={onHover}
                        onSelect={onSelect}
                        onReady={markReady}
                        onLost={fail}
                      />
                    </Suspense>
                  </SceneBoundary>
                ) : null}
              </div>

              <div className={styles.poster} data-hidden={ready || undefined}>
                <FlatMap poster layout={layout} selected={selected} hovered={-1} onSelect={onSelect} onHover={onHover} />
              </div>

              {coins.map((coin, i) => (
                <span key={coin.ticker} ref={labelRefs[i]} className={styles.label} data-up={isUp(coin)} aria-hidden>
                  <span>{coin.ticker}</span>
                  <span className={styles.change}>{fmtPct(coin.change24h)}</span>
                </span>
              ))}

              {tipIndex >= 0 ? <MapTip key={tipIndex} ref={tipRef} coin={coins[tipIndex]} /> : null}
            </>
          ) : (
            <FlatMap
              layout={layout}
              selected={selected}
              hovered={hovered}
              tipIndex={tipIndex}
              onSelect={onSelect}
              onHover={onHover}
            />
          )}
        </div>
      </div>

      <footer className={styles.legend}>
        <span className={styles.item}>
          <i className={styles.swatch} data-up="true" aria-hidden />
          Up today
        </span>
        <span className={styles.item}>
          <i className={styles.swatch} aria-hidden />
          Down today
        </span>
        <span className={styles.item}>{use3d ? "Taller tile = bigger move" : "Number = move today"}</span>
        {use3d ? <span className={styles.hint}>Drag to tilt</span> : null}
      </footer>
    </Spotlight>
  );
}
