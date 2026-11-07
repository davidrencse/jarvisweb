import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { fragmentShader, vertexShader } from "./shader";
import type { Rect, SceneProps } from "./types";

const DPR: [number, number] = [1, 2];
const GL = { antialias: false, alpha: true, powerPreference: "high-performance" as const };
const SCAN_S = 1.15;
const LENS_PX = 104;

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function blank() {
  const t = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1);
  t.needsUpdate = true;
  return t;
}

function Quad({ srcs, aspects, active, vision, focus, pointer, poke, lens, reduced, onReady, onFail }: SceneProps) {
  const gl = useThree((s) => s.gl);
  const size = useThree((s) => s.size);
  const invalidate = useThree((s) => s.invalidate);

  const visible = useRef(true);
  const textures = useRef(new Map<number, THREE.Texture>());
  const pending = useRef(new Map<number, Promise<THREE.Texture | null>>());
  const shown = useRef(-1);
  const prog = useRef(1);
  const anim = useRef({ vision: 0, focusOn: 0, lens: 0, mx: 0.5, my: 0.5, time: 0 });
  const focusRect = useRef<Rect>([0, 0, 1, 1]);
  const live = useRef({ vision, focus, lens, reduced });
  const readySent = useRef(false);
  const cb = useRef({ onReady, onFail });

  useEffect(() => {
    live.current = { vision, focus, lens, reduced };
    cb.current = { onReady, onFail };
    if (visible.current) invalidate();
  });

  const { geometry, material, uniforms } = useMemo(() => {
    const empty = blank();
    const uniforms = {
      uA: { value: empty as THREE.Texture },
      uB: { value: empty as THREE.Texture },
      uAspA: { value: 1.6 },
      uAspB: { value: 1.6 },
      uFrame: { value: 1.6 },
      uTexA: { value: new THREE.Vector2(1 / 1600, 1 / 1000) },
      uTexB: { value: new THREE.Vector2(1 / 1600, 1 / 1000) },
      uProg: { value: 1 },
      uVision: { value: 0 },
      uFocus: { value: new THREE.Vector4(0, 0, 1, 1) },
      uFocusOn: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uLens: { value: 0 },
      uLensR: { value: 0.12 },
      uTime: { value: 0 },
      uOn: { value: 0 },
    };
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    return { geometry: new THREE.PlaneGeometry(1, 1), material, uniforms };
  }, []);

  useEffect(() => {
    poke.current = () => {
      if (visible.current) invalidate();
    };
    return () => {
      poke.current = () => {};
    };
  }, [poke, invalidate]);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      visible.current = e.isIntersecting;
      if (e.isIntersecting) invalidate();
    });
    io.observe(gl.domElement);
    return () => io.disconnect();
  }, [gl, invalidate]);

  useEffect(() => {
    if (!size.width || !size.height) return;
    uniforms.uFrame.value = size.width / size.height;
    uniforms.uLensR.value = LENS_PX / size.height;
    invalidate();
  }, [size, uniforms, invalidate]);

  // Texture loading: the active shot first, the rest when idle.
  const load = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const aniso = Math.min(gl.capabilities.getMaxAnisotropy(), 8);
    return (i: number) => {
      const have = textures.current.get(i);
      if (have) return Promise.resolve(have);
      let p = pending.current.get(i);
      if (!p) {
        p = loader
          .loadAsync(srcs[i])
          .then((tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.generateMipmaps = true;
            tex.minFilter = THREE.LinearMipmapLinearFilter;
            tex.magFilter = THREE.LinearFilter;
            tex.anisotropy = aniso;
            gl.initTexture(tex);
            textures.current.set(i, tex);
            return tex;
          })
          .catch(() => null);
        pending.current.set(i, p);
      }
      return p;
    };
  }, [gl, srcs]);

  useEffect(() => {
    let alive = true;
    void load(active).then((tex) => {
      if (!alive) return;
      if (!tex) {
        if (shown.current < 0) cb.current.onFail();
        return;
      }
      const img = tex.image as { width: number; height: number };
      const texel = new THREE.Vector2(1 / img.width, 1 / img.height);
      if (shown.current < 0) {
        uniforms.uA.value = tex;
        uniforms.uB.value = tex;
        uniforms.uAspA.value = uniforms.uAspB.value = aspects[active];
        uniforms.uTexA.value.copy(texel);
        uniforms.uTexB.value.copy(texel);
        uniforms.uOn.value = 1;
        prog.current = 1;
      } else if (shown.current !== active) {
        uniforms.uA.value = uniforms.uB.value;
        uniforms.uAspA.value = uniforms.uAspB.value;
        uniforms.uTexA.value.copy(uniforms.uTexB.value);
        uniforms.uB.value = tex;
        uniforms.uAspB.value = aspects[active];
        uniforms.uTexB.value.copy(texel);
        prog.current = live.current.reduced ? 1 : 0;
      }
      shown.current = active;
      invalidate();
    });
    return () => {
      alive = false;
    };
  }, [active, aspects, load, uniforms, invalidate]);

  useEffect(() => {
    const idle = window.setTimeout(() => srcs.forEach((_, i) => void load(i)), 1800);
    return () => window.clearTimeout(idle);
  }, [srcs, load]);

  useEffect(
    () => () => {
      textures.current.forEach((t) => t.dispose());
      textures.current.clear();
      pending.current.clear();
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const a = anim.current;
    const l = live.current;
    const p = pointer.current;
    let moving = false;
    const damp = (from: number, to: number, k: number) => {
      const v = l.reduced ? to : THREE.MathUtils.damp(from, to, k, dt);
      if (Math.abs(v - to) > 0.0015) moving = true;
      return Math.abs(v - to) > 0.0015 ? v : to;
    };

    if (prog.current < 1) {
      prog.current = Math.min(1, prog.current + dt / SCAN_S);
      moving = true;
    }
    uniforms.uProg.value = easeInOut(prog.current);

    a.vision = damp(a.vision, l.vision ? 1 : 0, 6);
    if (l.focus) {
      const f = focusRect.current;
      for (let i = 0; i < 4; i++) f[i] = a.focusOn < 0.02 ? l.focus[i] : damp(f[i], l.focus[i], 14);
    }
    a.focusOn = damp(a.focusOn, l.focus ? 1 : 0, 9);
    a.lens = damp(a.lens, l.lens && p.inside ? 1 : 0, 11);
    if (a.lens < 0.01 && p.inside) {
      a.mx = p.x;
      a.my = p.y;
    } else {
      a.mx = damp(a.mx, p.x, 22);
      a.my = damp(a.my, p.y, 22);
    }
    if (a.vision > 0.01 && !l.reduced) {
      a.time += dt;
      moving = true;
    }

    const f = focusRect.current;
    uniforms.uVision.value = a.vision;
    uniforms.uFocusOn.value = a.focusOn;
    uniforms.uFocus.value.set(f[0], f[1], f[2], f[3]);
    uniforms.uLens.value = a.lens;
    uniforms.uMouse.value.set(a.mx, a.my);
    uniforms.uTime.value = a.time;

    if (!readySent.current && uniforms.uOn.value > 0.5) {
      readySent.current = true;
      requestAnimationFrame(() => cb.current.onReady());
    }
    if (moving && visible.current) state.invalidate();
  });

  return <mesh geometry={geometry} material={material} frustumCulled={false} />;
}

export default function VisionScene(props: SceneProps) {
  const { onFail } = props;
  return (
    <Canvas
      frameloop="demand"
      dpr={DPR}
      flat
      gl={GL}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          onFail();
        });
      }}
    >
      <Quad {...props} />
    </Canvas>
  );
}
