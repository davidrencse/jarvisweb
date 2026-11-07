import { useThree } from "@react-three/fiber";
import { useEffect, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export function hasWebGL2() {
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/** Studio reflections for the glass, from three's RoomEnvironment. */
export function Env({ intensity = 1 }: { intensity?: number }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const env = pm.fromScene(room, 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = intensity;
    return () => {
      scene.environment = null;
      env.dispose();
      pm.dispose();
    };
  }, [gl, scene, intensity]);
  return null;
}

export function glass(opts: Partial<THREE.MeshPhysicalMaterialParameters> = {}) {
  return new THREE.MeshPhysicalMaterial({
    color: "#ffffff",
    transmission: 1,
    thickness: 0.6,
    roughness: 0.06,
    ior: 1.45,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    specularIntensity: 1,
    envMapIntensity: 1.15,
    ...opts,
  });
}

type Line = { text: string; size: number; weight?: number; mono?: boolean; alpha?: number; gap?: number };

/** White text on a transparent canvas, for etched labels on glass. */
export function labelTexture(lines: Line[], w = 512, h = 256, pad = 28) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  let y = pad;
  for (const l of lines) {
    const family = l.mono ? '"Fragment Mono", ui-monospace, monospace' : '"Funnel Display Variable", "Funnel Sans Variable", system-ui, sans-serif';
    ctx.font = `${l.weight ?? 560} ${l.size}px ${family}`;
    ctx.fillStyle = `rgba(250,250,250,${l.alpha ?? 1})`;
    ctx.textBaseline = "top";
    ctx.fillText(l.text, pad, y);
    y += l.size * 1.18 + (l.gap ?? 6);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** True while the element is on screen and the tab is visible. */
export function useLive(ref: RefObject<HTMLElement | null>) {
  const [on, setOn] = useState(false);
  const seen = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let inView = false;
    const update = () => setOn(inView && document.visibilityState === "visible");
    const io = new IntersectionObserver(
      ([e]) => {
        inView = e.isIntersecting;
        if (inView) seen.current = true;
        update();
      },
      { rootMargin: "120px" },
    );
    io.observe(el);
    document.addEventListener("visibilitychange", update);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [ref]);
  return on;
}

/** Pointer position over an element, -1..1, smoothed by the consumer. */
export function usePointer(ref: RefObject<HTMLElement | null>) {
  const p = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      p.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      p.current.y = ((e.clientY - r.top) / r.height) * 2 - 1;
    };
    const leave = () => {
      p.current.x = 0;
      p.current.y = 0;
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [ref]);
  return p;
}

export const isCompact = () => typeof window !== "undefined" && window.matchMedia("(max-width: 760px)").matches;
