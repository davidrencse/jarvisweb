import { motion } from "motion/react";
import { useId, useState } from "react";
import { spring } from "../lib/motion";
import styles from "./Topology.module.css";

type Lane = { id: string; label: string; dir: 1 | -1; note: string };

const LANES: Lane[] = [
  { id: "jobs", label: "Jobs", dir: 1, note: "Signed jobs from the hub, delivered at most once. The node long-polls with 25 s holds and refuses a job if its code differs from the main’s." },
  { id: "frames", label: "Screen frames", dir: -1, note: "JPEG frames for the Remote view: 960, 1280 or 1920 px at 6, 10 or 15 fps." },
  { id: "input", label: "Mouse and keys", dir: 1, note: "Your input while you drive the node. A dead-man release fires after 6 s of silence, and a session is capped at 4 h." },
  { id: "releases", label: "Releases", dir: 1, note: "Code reaches a node only after the full test suite passes on the main. The node pulls it within about 30 s." },
];

const MAIN = ["Brain, memory, vault, voice", "Hub on 127.0.0.1:7780", "Release gate: the full test suite", "Remote view sessions"];
const NODE = ["Node agent long-polls the hub", "Pulls signed, tested releases", "Runs jobs: apps, files, desktop", "Streams its screen, takes your input", "Silent: only the main speaks"];

/* Wide layout: 1000 × 310. Lanes run between the two machines. */
const W = { x1: 270, x2: 730, ys: [112, 142, 172, 202] };
/* Tall layout for phones: 340 × 600. */
const T = { y1: 132, y2: 468, xs: [105, 135, 165, 195] };

export function Topology() {
  const uid = useId();
  const [lane, setLane] = useState(0);
  const [apart, setApart] = useState(false);
  const active = LANES[lane];

  return (
    <div className={styles.wrap}>
      <div className={styles.bar}>
        <div role="radiogroup" aria-label="Where the laptops are" className={styles.seg}>
          {[
            { v: false, label: "Together" },
            { v: true, label: "Apart" },
          ].map((o) => (
            <button
              key={o.label}
              type="button"
              role="radio"
              aria-checked={apart === o.v}
              className={styles.segBtn}
              onClick={() => setApart(o.v)}
            >
              {apart === o.v ? <motion.span layoutId={`${uid}-seg`} className={styles.segPill} transition={spring.snappy} /> : null}
              <span className={styles.segLabel}>{o.label}</span>
            </button>
          ))}
        </div>
        <p className={styles.status} aria-live="polite">
          {apart
            ? "Apart: the guard stopped Lan Mouse. The tunnel still carries jobs."
            : "Together: Lan Mouse links the two laptops on the same network."}
        </p>
      </div>

      <figure className={styles.figure} data-apart={apart}>
        <svg
          viewBox="0 0 1000 310"
          className={styles.wide}
          role="img"
          aria-label="The main and a node, joined by an SSH tunnel carrying jobs, screen frames, mouse and keys, and releases. Lan Mouse is a separate same-network link."
        >
          <Machine x={0} y={72} w={W.x1} name="Main" sub="Zenbook · Arch, Hyprland" tag="hub :7780" />
          <Machine x={W.x2} y={72} w={1000 - W.x2} name="Node" sub="Dell G15 · Windows 11" tag="polls the hub" />

          <text x={500} y={74} textAnchor="middle" className={styles.caption}>
            SSH forward tunnel · loopback hub · pinned host keys
          </text>

          {LANES.map((l, i) => {
            const y = W.ys[i];
            const on = i === lane;
            return (
              <g key={l.id} className={styles.lane} data-on={on} onClick={() => setLane(i)} onPointerEnter={() => setLane(i)}>
                <rect x={W.x1} y={y - 14} width={W.x2 - W.x1} height={28} fill="transparent" />
                <line x1={W.x1} x2={W.x2} y1={y} y2={y} className={styles.line} />
                <text x={500} y={y - 6} textAnchor="middle" className={styles.laneLabel}>
                  {l.label} {l.dir === 1 ? "→" : "←"}
                </text>
                {on ? (
                  <circle
                    cx={l.dir === 1 ? W.x1 : W.x2}
                    cy={y}
                    r={3.5}
                    className={styles.dot}
                    style={{ ["--d" as string]: `${(W.x2 - W.x1) * l.dir}px` }}
                  />
                ) : null}
              </g>
            );
          })}

          <g className={styles.lan}>
            <path d="M 135 232 V 272 H 470" className={styles.lanLine} />
            <path d="M 530 272 H 865 V 232" className={styles.lanLine} />
            <path d="M 470 272 H 530" className={styles.lanBridge} />
            <text x={500} y={298} textAnchor="middle" className={styles.caption}>
              {apart ? "Lan Mouse off: 2 readings apart" : "Lan Mouse · UDP 4242 · same network only"}
            </text>
          </g>
        </svg>

        <svg viewBox="0 0 340 600" className={styles.tall} role="img" aria-label="The main above a node, joined by an SSH tunnel with four lanes, and Lan Mouse on the side.">
          <Machine x={0} y={0} w={300} h={T.y1} name="Main" sub="Zenbook · Arch, Hyprland" tag="hub :7780" />
          <Machine x={0} y={T.y2} w={300} h={600 - T.y2} name="Node" sub="Dell G15 · Windows 11" tag="polls the hub" />
          {LANES.map((l, i) => {
            const x = T.xs[i];
            const on = i === lane;
            return (
              <g key={l.id} className={styles.lane} data-on={on} onClick={() => setLane(i)}>
                <rect x={x - 16} y={T.y1} width={32} height={T.y2 - T.y1} fill="transparent" />
                <line x1={x} x2={x} y1={T.y1} y2={T.y2} className={styles.line} />
                {on ? (
                  <circle
                    cx={x}
                    cy={l.dir === 1 ? T.y1 : T.y2}
                    r={3.5}
                    className={`${styles.dot} ${styles.dotY}`}
                    style={{ ["--d" as string]: `${(T.y2 - T.y1) * l.dir}px` }}
                  />
                ) : null}
              </g>
            );
          })}
          <text x={214} y={292} className={styles.caption}>
            <tspan x={214} dy={0}>SSH</tspan>
            <tspan x={214} dy={16}>tunnel</tspan>
          </text>
          <g className={styles.lan}>
            <path d="M 300 66 H 326 V 280" className={styles.lanLine} />
            <path d={`M 326 320 V ${T.y2 + 66} H 300`} className={styles.lanLine} />
            <path d="M 326 280 V 320" className={styles.lanBridge} />
          </g>
        </svg>
      </figure>

      <div className={styles.lanes} role="tablist" aria-label="What the tunnel carries">
        {LANES.map((l, i) => (
          <button key={l.id} type="button" role="tab" aria-selected={i === lane} className={styles.laneBtn} onClick={() => setLane(i)}>
            {l.label}
          </button>
        ))}
      </div>
      <motion.p
        key={active.id}
        className={styles.note}
        role="tabpanel"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        {active.note}
      </motion.p>

      <div className={styles.parts}>
        <div>
          <p className={styles.partsTitle}>On the main</p>
          <ul>
            {MAIN.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className={styles.partsTitle}>On each node</p>
          <ul>
            {NODE.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Machine({ x, y, w, h = 160, name, sub, tag }: { x: number; y: number; w: number; h?: number; name: string; sub: string; tag: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={0.5} y={0.5} width={w - 1} height={h - 1} rx={12} className={styles.machine} />
      <text x={22} y={42} className={styles.mName}>
        {name}
      </text>
      <text x={22} y={66} className={styles.mSub}>
        {sub}
      </text>
      <g transform={`translate(22 ${h - 44})`}>
        <rect width={tag.length * 7.2 + 24} height={24} rx={12} className={styles.tag} />
        <text x={12} y={16} className={styles.tagText}>
          {tag}
        </text>
      </g>
    </g>
  );
}
