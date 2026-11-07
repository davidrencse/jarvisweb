import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { Env, glass, labelTexture } from "./shared";

const STATIONS: [string, string, string][] = [
  ["01", "Instant phrases", "instant.py"],
  ["02", "Strict parser", "parse.py"],
  ["03", "Intent registry", "registry.py"],
  ["04", "Gates", "gates.py"],
  ["05", "History checks", "history.py"],
  ["06", "Confirm queue", "confirm.py"],
  ["07", "Direct executor", "remote.call"],
  ["08", "On-screen check", "observe.py"],
  ["09", "Record", "history.sqlite3"],
];

const GAP = 1.42;
const X0 = -((STATIONS.length - 1) * GAP) / 2;
const px = (i: number) => X0 + i * GAP;
const START = X0 - 3.2;
const END = px(8) + 2.6;
const PARSE = 1;
const REGISTRY = 2;
const CONFIRM = 5;

type Packet = { x: number; y: number; z: number; kind: 0 | 1 | 2; wait: number; speed: number };

function spawn(p: Packet, initial: boolean) {
  const r = Math.random();
  p.kind = r < 0.22 ? 1 : r < 0.32 ? 2 : 0;
  p.x = initial ? START + Math.random() * (END - START) : START - Math.random() * 2.5;
  p.y = (Math.random() - 0.5) * 0.9;
  p.z = (Math.random() - 0.5) * 0.8;
  p.wait = p.kind === 2 ? 1.8 : 0;
  p.speed = 1.5 + Math.random() * 0.5;
}

type Props = { pointer: MutableRefObject<{ x: number; y: number }>; compact: boolean; still: boolean };

function Pipeline({ pointer, compact, still }: Props) {
  const camera = useThree((s) => s.camera as THREE.PerspectiveCamera);
  const size = useThree((s) => s.size);
  const gl = useThree((s) => s.gl);
  const inst = useRef<THREE.InstancedMesh>(null);
  const count = compact ? 34 : 72;

  const { panelGeo, edgeGeo, labelGeo, mats, labels, edgeMat, packetGeo, packetMat, laneMat, laneGeo } = useMemo(() => {
    const panelGeo = new RoundedBoxGeometry(0.08, 2.1, 1.55, 4, 0.035);
    const edgeGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(0.08, 2.1, 1.55));
    const labelGeo = new THREE.PlaneGeometry(1.4, 0.7);
    const mats = STATIONS.map(() => glass({ emissive: new THREE.Color("#ffffff"), emissiveIntensity: 0 }));
    const labels = STATIONS.map(([n, name, file]) =>
      labelTexture(
        [
          { text: n, size: 54, weight: 600 },
          { text: name, size: 40, weight: 560 },
          { text: file, size: 26, mono: true, alpha: 0.6 },
        ],
        512,
        256,
      ),
    );
    const edgeMat = new THREE.LineBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.32 });
    const packetGeo = new THREE.SphereGeometry(0.026, 12, 8);
    const packetMat = new THREE.MeshBasicMaterial({ color: "#ffffff", toneMapped: false });
    // The model-path lane: a faint dashed arc from the parser back to the registry.
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(px(PARSE), 0.2, 0),
      new THREE.Vector3((px(PARSE) + px(REGISTRY)) / 2, 4.7, 0),
      new THREE.Vector3(px(REGISTRY), 0.2, 0),
    );
    const laneGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(48));
    const laneMat = new THREE.LineDashedMaterial({ color: "#ffffff", dashSize: 0.08, gapSize: 0.08, transparent: true, opacity: 0.35 });
    return { panelGeo, edgeGeo, labelGeo, mats, labels, edgeMat, packetGeo, packetMat, laneMat, laneGeo };
  }, []);

  const lane = useMemo(() => {
    const l = new THREE.Line(laneGeo, laneMat);
    l.computeLineDistances();
    return l;
  }, [laneGeo, laneMat]);

  const packets = useMemo(() => {
    const arr: Packet[] = Array.from({ length: count }, () => ({ x: 0, y: 0, z: 0, kind: 0 as const, wait: 0, speed: 1 }));
    arr.forEach((p) => spawn(p, true));
    return arr;
  }, [count]);

  const pulse = useRef(new Float32Array(STATIONS.length));
  const tmp = useMemo(() => new THREE.Object3D(), []);
  const cam = useRef({ x: 0, y: 0 });
  const home = useRef(new THREE.Vector3(7.2, 2.6, 8.4));
  const look = useRef(new THREE.Vector3(0.4, 0.1, 0));

  useEffect(() => {
    const r = gl as THREE.WebGLRenderer & { transmissionResolutionScale?: number };
    if ("transmissionResolutionScale" in r) r.transmissionResolutionScale = compact ? 0.5 : 0.75;
  }, [gl, compact]);

  useEffect(() => {
    const aspect = size.width / size.height;
    if (aspect < 1) {
      // Phones: look down the row of slides, like a corridor.
      home.current.set(10.4, 1.6, 4.4);
      look.current.set(-1.6, 0.05, 0.3);
    } else {
      const far = aspect < 1.5 ? 1.45 : 1.18;
      home.current.set(7.4 * far, 2.8 * far, 9.6 * far);
      look.current.set(0.6, -0.1, 0);
    }
    camera.position.copy(home.current);
    camera.lookAt(look.current);
    camera.updateProjectionMatrix();
  }, [camera, size]);

  useEffect(
    () => () => {
      panelGeo.dispose();
      edgeGeo.dispose();
      labelGeo.dispose();
      mats.forEach((m) => m.dispose());
      labels.forEach((t) => t.dispose());
      edgeMat.dispose();
      packetGeo.dispose();
      packetMat.dispose();
      laneGeo.dispose();
      laneMat.dispose();
    },
    [panelGeo, edgeGeo, labelGeo, mats, labels, edgeMat, packetGeo, packetMat, laneGeo, laneMat],
  );

  useFrame((state, delta) => {
    const dt = still ? 0 : Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;

    // Camera drifts with the pointer.
    const c = cam.current;
    c.x = THREE.MathUtils.damp(c.x, pointer.current.x, 3, delta);
    c.y = THREE.MathUtils.damp(c.y, pointer.current.y, 3, delta);
    camera.position.set(home.current.x + c.x * 0.9, home.current.y - c.y * 0.5, home.current.z - c.x * 0.4);
    camera.lookAt(look.current);

    const mesh = inst.current;
    if (!mesh) return;
    for (let i = 0; i < packets.length; i++) {
      const p = packets[i];
      const prev = p.x;
      let y = p.y;
      let s = 1;
      let stretch = 2;

      if (p.kind === 2 && p.wait > 0 && p.x >= px(CONFIRM) - 0.02) {
        // Held at the confirm queue, breathing, until "yes".
        p.x = px(CONFIRM) - 0.02;
        p.wait -= dt;
        s = 1.25 + Math.sin(t * 7) * 0.25;
        stretch = 1;
      } else if (p.kind === 1 && p.x > px(PARSE) && p.x < px(REGISTRY)) {
        // Detour through the model path and back as intents.
        const k = (p.x - px(PARSE)) / (px(REGISTRY) - px(PARSE));
        y = p.y * (1 - Math.sin(Math.PI * k)) + Math.sin(Math.PI * k) * 2.45;
        p.x += dt * p.speed * 0.38;
        stretch = 1.3;
      } else {
        p.x += dt * p.speed;
      }

      for (let j = 0; j < STATIONS.length; j++) {
        const x = px(j);
        if (prev < x && p.x >= x) pulse.current[j] = Math.min(1, pulse.current[j] + 0.5);
      }
      if (p.x > END) spawn(p, false);

      const fadeIn = THREE.MathUtils.smoothstep(p.x, START, START + 1.2);
      const fadeOut = 1 - THREE.MathUtils.smoothstep(p.x, END - 1.2, END);
      tmp.position.set(p.x, y, p.z);
      tmp.scale.set(s * stretch * fadeIn * fadeOut, s * fadeIn * fadeOut, s * fadeIn * fadeOut);
      tmp.updateMatrix();
      mesh.setMatrixAt(i, tmp.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;

    for (let j = 0; j < STATIONS.length; j++) {
      pulse.current[j] = Math.max(0, pulse.current[j] - delta * 1.6);
      mats[j].emissiveIntensity = pulse.current[j] * 0.22 + (j === CONFIRM ? 0.03 + Math.sin(t * 2) * 0.02 : 0);
    }
  });

  return (
    <group>
      {STATIONS.map((_, i) => (
        <group key={i} position={[px(i), 0, 0]}>
          <mesh geometry={panelGeo} material={mats[i]} />
          <lineSegments geometry={edgeGeo} material={edgeMat} />
          <mesh geometry={labelGeo} position={[0.06, 0.6, 0.02]} rotation={[0, Math.PI / 2, 0]}>
            <meshBasicMaterial map={labels[i]} transparent toneMapped={false} depthWrite={false} />
          </mesh>
        </group>
      ))}
      <primitive object={lane} />
      <instancedMesh ref={inst} args={[packetGeo, packetMat, count]} frustumCulled={false} />
      <ambientLight intensity={0.25} />
      <directionalLight position={[4, 6, 5]} intensity={1.4} />
      <directionalLight position={[-6, 2, -4]} intensity={0.6} />
    </group>
  );
}

export default function PipelineScene(props: Props & { live: boolean }) {
  const { live, ...rest } = props;
  return (
    <Canvas
      frameloop={live && !rest.still ? "always" : "demand"}
      dpr={rest.compact ? [1, 1.5] : [1, 1.75]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      camera={{ fov: 30, near: 0.1, far: 80, position: [7.2, 2.6, 8.4] }}
    >
      <color attach="background" args={["#0a0a0a"]} />
      <Env intensity={0.9} />
      <Pipeline {...rest} />
    </Canvas>
  );
}
