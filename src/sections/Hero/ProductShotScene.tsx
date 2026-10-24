import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { animate, motionValue } from "motion/react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { ease } from "../../lib/motion";
import { CAM_DISTANCE, CAM_FOV, DEG, LIFT_PER_DEG, shotUrl, type SceneProps, type ShotTheme } from "./shot";
import { fragmentShader, vertexShader } from "./shotShader";

const LENS_RADIUS_PX = 90;
const CAMERA = { fov: CAM_FOV, near: 0.1, far: 10, position: [0, 0, CAM_DISTANCE] as [number, number, number] };
const GL = { antialias: true, alpha: true };
const DPR: [number, number] = [1, 2];

type Tween = ReturnType<typeof animate>;

function Plane({ theme, tilt, scale, show, skipIntro, lens: lensEnabled, onReady, onFail }: SceneProps) {
  const gl = useThree((s) => s.gl);
  const size = useThree((s) => s.size);
  const invalidate = useThree((s) => s.invalidate);

  const meshRef = useRef<THREE.Mesh>(null);
  const visibleRef = useRef(true);
  const readyPending = useRef(true);
  const showRef = useRef(show);
  const onReadyRef = useRef(onReady);
  const onFailRef = useRef(onFail);
  const mouse = useRef({ x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, on: false });
  const textures = useRef<THREE.Texture[]>([]);
  const darkLoad = useRef<Promise<THREE.Texture | null> | null>(null);
  const loadDark = useRef<() => Promise<THREE.Texture | null>>(() => Promise.resolve(null));
  const lensTween = useRef<Tween | undefined>(undefined);

  const reveal = useMemo(() => motionValue(0), []);
  const mix = useMemo(() => motionValue(0), []);
  const lens = useMemo(() => motionValue(0), []);

  const { geometry, material, uniforms } = useMemo(() => {
    const uniforms = {
      uLight: { value: null as THREE.Texture | null },
      uDark: { value: null as THREE.Texture | null },
      uTexSize: { value: new THREE.Vector2(2880, 1800) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uOn: { value: 0 },
      uAspect: { value: 1.6 },
      uMix: { value: 0 },
      uReveal: { value: 0 },
      uLens: { value: 0 },
      uLensR: { value: 0.1 },
      uCells: { value: 150 },
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

  const request = useCallback(() => {
    if (visibleRef.current) invalidate();
  }, [invalidate]);

  useEffect(() => {
    showRef.current = show;
    onReadyRef.current = onReady;
    onFailRef.current = onFail;
  });

  useEffect(() => {
    const io = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
      if (entry.isIntersecting) invalidate();
    });
    io.observe(gl.domElement);
    return () => io.disconnect();
  }, [gl, invalidate]);

  useEffect(() => {
    const offs = [
      reveal.on("change", (v) => {
        uniforms.uReveal.value = v;
        request();
      }),
      mix.on("change", (v) => {
        uniforms.uMix.value = v;
        request();
      }),
      lens.on("change", (v) => {
        uniforms.uLens.value = v;
        request();
      }),
    ];
    return () => offs.forEach((off) => off());
  }, [reveal, mix, lens, uniforms, request]);

  useEffect(() => {
    const mesh = meshRef.current;
    const { width, height } = size;
    if (!mesh || !width || !height) return;
    const aspect = width / height;
    uniforms.uAspect.value = aspect;
    uniforms.uLensR.value = LENS_RADIUS_PX / height;
    uniforms.uCells.value = Math.min(170, Math.max(88, Math.round(width / 8)));

    const apply = () => {
      const s = scale.get();
      const t = tilt.get();
      mesh.rotation.x = -t * DEG;
      mesh.position.y = t * LIFT_PER_DEG;
      mesh.scale.set(aspect * s, s, 1);
      request();
    };
    apply();
    const offs = [tilt.on("change", apply), scale.on("change", apply)];
    return () => offs.forEach((off) => off());
  }, [size, tilt, scale, uniforms, request]);

  useEffect(() => {
    let alive = true;
    const hi = window.innerWidth > 700;
    const loader = new THREE.TextureLoader();
    const aniso = Math.min(gl.capabilities.getMaxAnisotropy(), 8);

    const load = async (t: ShotTheme) => {
      const tex = await loader.loadAsync(shotUrl(t, hi));
      if (!alive) {
        tex.dispose();
        return null;
      }
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.anisotropy = aniso;
      tex.needsUpdate = true;
      gl.initTexture(tex);
      textures.current.push(tex);
      return tex;
    };

    uniforms.uTexSize.value.set(hi ? 2880 : 1440, hi ? 1800 : 900);

    loadDark.current = () => {
      darkLoad.current ??= load("dark")
        .then((tex) => {
          if (tex) uniforms.uDark.value = tex;
          return tex;
        })
        .catch(() => null);
      return darkLoad.current;
    };

    load("light")
      .then((tex) => {
        if (!tex) return;
        uniforms.uLight.value = tex;
        uniforms.uDark.value ??= tex;
        uniforms.uOn.value = 1;
        invalidate();
      })
      .catch(() => {
        if (alive) onFailRef.current();
      });

    const idle = window.setTimeout(() => void loadDark.current(), 1600);

    return () => {
      alive = false;
      window.clearTimeout(idle);
      textures.current.forEach((tex) => tex.dispose());
      textures.current = [];
      darkLoad.current = null;
      uniforms.uLight.value = null;
      uniforms.uDark.value = null;
      uniforms.uOn.value = 0;
    };
  }, [gl, uniforms, invalidate]);

  useEffect(() => {
    const target = theme === "dark" ? 1 : 0;
    if (mix.get() === target) return;
    let alive = true;
    let tween: Tween | undefined;
    void (async () => {
      if (target === 1 && !(await loadDark.current())) return;
      if (!alive) return;
      if (showRef.current) tween = animate(mix, target, { duration: 1, ease: ease.out });
      else mix.set(target);
    })();
    return () => {
      alive = false;
      tween?.stop();
    };
  }, [theme, mix]);

  useEffect(() => {
    if (skipIntro) reveal.set(1);
  }, [skipIntro, reveal]);

  useEffect(() => {
    if (!show || skipIntro) return;
    const tween = animate(reveal, 1, { duration: 1.6, delay: 0.3, ease: ease.inOut });
    return () => tween.stop();
  }, [show, skipIntro, reveal]);

  useEffect(
    () => () => {
      lensTween.current?.stop();
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame((state, delta) => {
    const m = mouse.current;
    if (uniforms.uLens.value > 0.001) {
      const dt = Math.min(delta, 0.05);
      m.x = THREE.MathUtils.damp(m.x, m.tx, 24, dt);
      m.y = THREE.MathUtils.damp(m.y, m.ty, 24, dt);
      uniforms.uMouse.value.set(m.x, m.y);
      if (Math.abs(m.x - m.tx) + Math.abs(m.y - m.ty) > 0.0005) state.invalidate();
    }
    if (readyPending.current && uniforms.uOn.value > 0.5) {
      readyPending.current = false;
      requestAnimationFrame(() => onReadyRef.current());
    }
  });

  const setLens = useCallback(
    (on: boolean) => {
      lensTween.current?.stop();
      lensTween.current = animate(lens, on ? 1 : 0, { type: "spring", bounce: 0, visualDuration: on ? 0.45 : 0.3 });
    },
    [lens],
  );

  const onMove = (e: ThreeEvent<PointerEvent>) => {
    if (!lensEnabled || e.nativeEvent.pointerType !== "mouse" || !e.uv) return;
    const m = mouse.current;
    m.tx = e.uv.x;
    m.ty = e.uv.y;
    if (!m.on) {
      m.on = true;
      m.x = m.tx;
      m.y = m.ty;
      uniforms.uMouse.value.set(m.x, m.y);
      setLens(true);
    }
    request();
  };

  const onOut = () => {
    if (!mouse.current.on) return;
    mouse.current.on = false;
    setLens(false);
  };

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      frustumCulled={false}
      onPointerMove={onMove}
      onPointerOut={onOut}
    />
  );
}

export default function ProductShotScene(props: SceneProps) {
  const { onFail } = props;
  return (
    <Canvas
      frameloop="demand"
      dpr={DPR}
      flat
      gl={GL}
      camera={CAMERA}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          onFail();
        });
      }}
    >
      <Plane {...props} />
    </Canvas>
  );
}
