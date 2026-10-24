import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { coins, isUp } from "./data";
import type { Orbit, Overlay } from "./mapTypes";
import type { Layout } from "./treemap";

const GAP = 0.2;
const H_MIN = 0.12;
const H_PER_PCT = 0.3;
const LIFT_HOVER = 0.4;
const LIFT_SELECTED = 0.22;
const BREATH = 0.035;
const AZIMUTH = THREE.MathUtils.degToRad(24);
const ELEVATION = THREE.MathUtils.degToRad(54);
const FILL = 0.9;
const STIFFNESS = 240;
const DAMPING = 21;
const INTRO_STEP = 0.035;
const INTRO_LENGTH = 0.7;
const RING_CLEAR = 0.03;
const RING_THICK = 0.055;

type Tile = { cx: number; cz: number; w: number; d: number; base: number; up: boolean; phase: number };

type SceneProps = {
  layout: Layout;
  hovered: number;
  selected: number;
  active: boolean;
  overlay: RefObject<Overlay>;
  orbit: RefObject<Orbit>;
  onHover: (index: number, on: boolean) => void;
  onSelect: (index: number) => void;
  onReady: () => void;
  onLost: () => void;
};

const token = (name: string, fallback: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

function buildTiles(layout: Layout): Tile[] {
  return layout.rects.map((r, i) => ({
    cx: r.x + r.w / 2 - layout.width / 2,
    cz: r.y + r.h / 2 - layout.height / 2,
    w: r.w - GAP,
    d: r.h - GAP,
    base: H_MIN + Math.abs(coins[i].change24h) * H_PER_PCT,
    up: isUp(coins[i]),
    phase: i * 0.9,
  }));
}

function slab(top: THREE.Color, front: THREE.Color, side: THREE.Color) {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  geometry.translate(0, 0.5, 0);
  const faces = [side, side, top, side, front, front];
  const colors = new Float32Array(24 * 3);
  faces.forEach((c, f) => {
    for (let v = 0; v < 4; v++) {
      const o = (f * 4 + v) * 3;
      colors[o] = c.r;
      colors[o + 1] = c.g;
      colors[o + 2] = c.b;
    }
  });
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geometry;
}

/** Blends two colors the way the eye reads them, in sRGB, so ink stays ink and the shaded faces stay quiet. */
function mix(a: THREE.Color, b: THREE.Color, t: number) {
  const x = a.getRGB({ r: 0, g: 0, b: 0 }, THREE.SRGBColorSpace);
  const y = b.getRGB({ r: 0, g: 0, b: 0 }, THREE.SRGBColorSpace);
  return new THREE.Color().setRGB(
    x.r + (y.r - x.r) * t,
    x.g + (y.g - x.g) * t,
    x.b + (y.b - x.b) * t,
    THREE.SRGBColorSpace,
  );
}

function createAssets() {
  const ink = new THREE.Color(token("--ink", "#0a0a0a"));
  const inkSoft = new THREE.Color(token("--ink-3", "#6f6f6c"));
  const paper = new THREE.Color(token("--paper", "#ffffff"));
  const pale = new THREE.Color(token("--paper-3", "#ececea"));

  const inkBox = slab(ink, mix(ink, paper, 0.17), mix(ink, paper, 0.1));
  const paleBox = slab(pale, mix(pale, ink, 0.1), mix(pale, ink, 0.2));
  const edges = new THREE.EdgesGeometry(inkBox);
  const bar = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);

  const solid = new THREE.MeshBasicMaterial({
    vertexColors: true,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  });
  const lineInk = new THREE.LineBasicMaterial({ color: ink });
  const lineOnInk = new THREE.LineBasicMaterial({ color: inkSoft });
  const ringMaterial = new THREE.MeshBasicMaterial({ color: ink });

  const parts = [inkBox, paleBox, edges, bar, solid, lineInk, lineOnInk, ringMaterial];
  return {
    inkBox,
    paleBox,
    edges,
    bar,
    solid,
    lineInk,
    lineOnInk,
    ringMaterial,
    dispose: () => parts.forEach((p) => p.dispose()),
  };
}

type FitProps = { layout: Layout; tiles: Tile[]; overlay: RefObject<Overlay>; show: Uint8Array };

/** Frames the whole field in the canvas and decides which tiles are big enough for a label. */
function Fit({ layout, tiles, overlay, show }: FitProps) {
  const camera = useThree((s) => s.camera) as THREE.OrthographicCamera;
  const size = useThree((s) => s.size);
  const invalidate = useThree((s) => s.invalidate);
  const corner = useMemo(() => new THREE.Vector3(), []);

  useLayoutEffect(() => {
    const halfW = layout.width / 2 + 0.3;
    const halfD = layout.height / 2 + 0.3;
    const top = Math.max(...tiles.map((t) => t.base)) * (1 + BREATH) + LIFT_HOVER;
    const distance = 60;

    camera.zoom = 1;
    camera.position.set(
      Math.sin(AZIMUTH) * Math.cos(ELEVATION) * distance,
      Math.sin(ELEVATION) * distance,
      Math.cos(AZIMUTH) * Math.cos(ELEVATION) * distance,
    );
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld(true);

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const x of [-halfW, halfW]) {
      for (const y of [0, top]) {
        for (const z of [-halfD, halfD]) {
          corner.set(x, y, z).applyMatrix4(camera.matrixWorldInverse);
          minX = Math.min(minX, corner.x);
          maxX = Math.max(maxX, corner.x);
          minY = Math.min(minY, corner.y);
          maxY = Math.max(maxY, corner.y);
        }
      }
    }

    const zoom = Math.min(size.width / (maxX - minX), size.height / (maxY - minY)) * FILL;
    camera.zoom = zoom;
    camera.updateProjectionMatrix();
    camera.translateX((minX + maxX) / 2);
    camera.translateY((minY + maxY) / 2);
    camera.updateMatrixWorld(true);

    tiles.forEach((t, i) => {
      const px = Math.min(t.w, t.d) * zoom;
      const mode = px >= 64 ? "full" : px >= 30 ? "short" : "none";
      show[i] = mode === "none" ? 0 : 1;
      overlay.current.labels[i]?.setAttribute("data-size", mode);
    });

    invalidate();
  }, [camera, corner, invalidate, layout, overlay, show, size.height, size.width, tiles]);

  return null;
}

const clamp01 = (n: number) => Math.min(Math.max(n, 0), 1);

function Field({ layout, hovered, selected, active, overlay, orbit, onHover, onSelect, onReady }: SceneProps) {
  const invalidate = useThree((s) => s.invalidate);
  const tiles = useMemo(() => buildTiles(layout), [layout]);
  const assets = useMemo(createAssets, []);
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Group>(null);
  const tileRefs = useRef<(THREE.Group | null)[]>([]);
  const barRefs = useRef<(THREE.Mesh | null)[]>([]);
  const point = useMemo(() => new THREE.Vector3(), []);
  const show = useMemo(() => new Uint8Array(coins.length), []);
  const sim = useRef({
    lift: new Float32Array(coins.length),
    vel: new Float32Array(coins.length),
    placed: new Uint8Array(coins.length),
    lastX: new Float32Array(coins.length),
    lastY: new Float32Array(coins.length),
    time: 0,
    intro: -1,
    ring: 1,
    tipX: 0,
    tipY: 0,
    tipEl: null as HTMLElement | null,
    hovered,
    selected,
    active,
  });

  useEffect(() => () => assets.dispose(), [assets]);

  useEffect(() => {
    const s = sim.current;
    s.hovered = hovered;
    s.selected = selected;
    s.active = active;
    invalidate();
  }, [hovered, selected, active, invalidate]);

  useLayoutEffect(() => {
    tiles.forEach((t, i) => {
      const g = tileRefs.current[i];
      if (!g) return;
      g.position.set(t.cx, 0, t.cz);
      g.scale.set(t.w, 0.0001, t.d);
    });
    invalidate();
  }, [tiles, invalidate]);

  useLayoutEffect(() => {
    const ring = ringRef.current;
    const t = tiles[selected];
    if (!ring) return;
    ring.visible = Boolean(t);
    if (!t) return;
    const reach = RING_CLEAR + RING_THICK / 2;
    const [top, bottom, left, right] = barRefs.current;
    ring.position.set(t.cx, 0.004, t.cz);
    top?.position.set(0, 0, -(t.d / 2 + reach));
    bottom?.position.set(0, 0, t.d / 2 + reach);
    left?.position.set(-(t.w / 2 + reach), 0, 0);
    right?.position.set(t.w / 2 + reach, 0, 0);
    const across = t.w + 2 * (RING_CLEAR + RING_THICK);
    top?.scale.set(across, 1, RING_THICK);
    bottom?.scale.set(across, 1, RING_THICK);
    left?.scale.set(RING_THICK, 1, t.d);
    right?.scale.set(RING_THICK, 1, t.d);
    sim.current.ring = 0.9;
    invalidate();
  }, [selected, tiles, invalidate]);

  useFrame((state, delta) => {
    const s = sim.current;
    const group = groupRef.current;
    if (!group) return;

    const dt = Math.min(delta, 1 / 30);
    s.time += dt;
    const follow = 1 - Math.exp(-6 * dt);
    const o = orbit.current;
    group.rotation.y += (o.yaw + Math.sin(s.time * 0.21) * 0.012 - group.rotation.y) * follow;
    group.rotation.x += (o.pitch + Math.sin(s.time * 0.17) * 0.006 - group.rotation.x) * follow;

    if (s.active && s.intro < 0) {
      s.intro = s.time;
      onReady();
    }
    const since = s.intro < 0 ? 0 : s.time - s.intro;
    let busy = s.intro >= 0 && since < INTRO_LENGTH + tiles.length * INTRO_STEP;

    for (let i = 0; i < tiles.length; i++) {
      const g = tileRefs.current[i];
      if (!g) continue;
      const target = i === s.hovered ? LIFT_HOVER : i === s.selected ? LIFT_SELECTED : 0;
      s.vel[i] += (STIFFNESS * (target - s.lift[i]) - DAMPING * s.vel[i]) * dt;
      s.lift[i] += s.vel[i] * dt;
      if (Math.abs(target - s.lift[i]) > 0.0008 || Math.abs(s.vel[i]) > 0.0008) busy = true;

      const p = s.intro < 0 ? 0 : clamp01((since - i * INTRO_STEP) / INTRO_LENGTH);
      const grow = 1 - (1 - p) ** 3;
      const breath = 1 + Math.sin(s.time * 0.9 + tiles[i].phase) * BREATH;
      g.scale.y = Math.max((tiles[i].base * breath + s.lift[i]) * grow, 0.0001);
    }

    const ring = ringRef.current;
    if (ring) {
      s.ring += (1 - s.ring) * Math.min(follow * 1.6, 1);
      ring.scale.set(s.ring, 1, s.ring);
      if (Math.abs(1 - s.ring) > 0.002) busy = true;
    }

    const ov = overlay.current;
    const { width, height } = state.size;
    group.updateMatrix();
    if (ov.tip !== s.tipEl) {
      s.tipEl = ov.tip;
      s.tipX = -1;
    }

    for (let i = 0; i < tiles.length; i++) {
      const label = show[i] ? ov.labels[i] : null;
      const tip = i === ov.tipIndex ? ov.tip : null;
      const g = tileRefs.current[i];
      if ((!label && !tip) || !g) continue;

      point.set(tiles[i].cx, g.scale.y, tiles[i].cz).applyMatrix4(group.matrix).project(state.camera);
      const px = (point.x * 0.5 + 0.5) * width;
      const py = (0.5 - point.y * 0.5) * height;

      if (label && (Math.abs(px - s.lastX[i]) > 0.15 || Math.abs(py - s.lastY[i]) > 0.15)) {
        s.lastX[i] = px;
        s.lastY[i] = py;
        label.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0)`;
        if (!s.placed[i]) {
          s.placed[i] = 1;
          label.dataset.placed = "true";
        }
      }

      if (tip) {
        const x = Math.min(Math.max(px - ov.tipWidth / 2, 6), Math.max(width - ov.tipWidth - 6, 6));
        const y = Math.max(py - ov.tipHeight - 14, 6);
        if (Math.abs(x - s.tipX) > 0.15 || Math.abs(y - s.tipY) > 0.15) {
          s.tipX = x;
          s.tipY = y;
          tip.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
          tip.dataset.placed = "true";
        }
      }
    }

    if (s.active || busy) state.invalidate();
  });

  return (
    <group ref={groupRef}>
      <Fit layout={layout} tiles={tiles} overlay={overlay} show={show} />
      {tiles.map((t, i) => (
        <group
          key={coins[i].ticker}
          ref={(g) => {
            tileRefs.current[i] = g;
          }}
        >
          <mesh
            geometry={t.up ? assets.inkBox : assets.paleBox}
            material={assets.solid}
            onPointerOver={(e: ThreeEvent<PointerEvent>) => {
              if (e.pointerType !== "mouse") return;
              e.stopPropagation();
              onHover(i, true);
            }}
            onPointerOut={() => onHover(i, false)}
            onClick={(e: ThreeEvent<MouseEvent>) => {
              if (e.delta > 6) return;
              e.stopPropagation();
              onSelect(i);
            }}
          />
          <lineSegments geometry={assets.edges} material={t.up ? assets.lineOnInk : assets.lineInk} />
        </group>
      ))}
      <group ref={ringRef} visible={false}>
        {[0, 1, 2, 3].map((n) => (
          <mesh
            key={n}
            ref={(m) => {
              barRefs.current[n] = m;
            }}
            geometry={assets.bar}
            material={assets.ringMaterial}
          />
        ))}
      </group>
    </group>
  );
}

export default function MarketMapScene(props: SceneProps) {
  const { onLost } = props;
  return (
    <Canvas
      orthographic
      flat
      frameloop="demand"
      dpr={[1, 2]}
      camera={{ near: 0.1, far: 400, zoom: 40 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          onLost();
        });
      }}
    >
      <Field {...props} />
    </Canvas>
  );
}
