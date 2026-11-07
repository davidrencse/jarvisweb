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

const LANE_Y = [150, 196, 242, 288];

export function Topology() {
  const uid = useId();
  const [lane, setLane] = useState<string>("jobs");
  const [apart, setApart] = useState(false);
  const active = LANES.find((l) => l.id === lane)!;

  return (
    <div className={styles.wrap}>
      <div className={styles.bar}>
        <div role="radiogroup" aria-label="Laptops" className={styles.seg}>
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
            ? "Apart: the guard has stopped Lan Mouse. The SSH tunnel still carries jobs."
            : "Together: Lan Mouse and the clipboard link the two laptops on the same network."}
        </p>
      </div>

      <div className={styles.scroller}>
        <svg viewBox="0 0 1200 470" className={styles.svg} role="img" aria-label="One main and one node, joined by an SSH forward tunnel that carries jobs, frames, input and releases, with Lan Mouse as a separate same-network link.">
          {/* Main */}
          <g transform="translate(24 40)">
            <rect width="420" height="330" rx="14" className={styles.machine} />
            <text x="24" y="40" className={styles.mName}>
              Main · Zenbook
            </text>
            <text x="24" y="62" className={styles.mSub}>
              Arch Linux, Hyprland · cluster.main_device
            </text>
            {MAIN.map((t, i) => (
              <g key={t} transform={`translate(24 ${96 + i * 52})`}>
                <rect width="262" height="38" rx="7" className={styles.part} data-hub={i === 1} />
                <text x="14" y="24" className={styles.partText}>
                  {t}
                </text>
              </g>
            ))}
          </g>

          {/* Node */}
          <g transform="translate(756 40)">
            <rect width="420" height="330" rx="14" className={styles.machine} />
            <text x="24" y="40" className={styles.mName}>
              Node · Dell G15
            </text>
            <text x="24" y="62" className={styles.mSub}>
              Windows 11 · jarvis cluster node
            </text>
            {NODE.map((t, i) => (
              <g key={t} transform={`translate(134 ${96 + i * 46})`}>
                <rect width="262" height="34" rx="7" className={styles.part} />
                <text x="14" y="22" className={styles.partText}>
                  {t}
                </text>
              </g>
            ))}
          </g>

          {/* Tunnel */}
          <g>
            <rect x="346" y="122" width="508" height="196" rx="10" className={styles.tunnel} />
            <text x="600" y="110" textAnchor="middle" className={styles.tunnelLabel}>
              SSH forward tunnel · ssh -L · pinned host keys
            </text>
            {LANES.map((l, i) => {
              const y = LANE_Y[i];
              const on = l.id === lane;
              return (
                <g
                  key={l.id}
                  className={styles.lane}
                  data-on={on}
                  onPointerEnter={() => setLane(l.id)}
                  onClick={() => setLane(l.id)}
                >
                  <rect x="338" y={y - 20} width="524" height="40" fill="transparent" />
                  <line x1="362" x2="838" y1={y} y2={y} className={styles.track} />
                  <line x1="362" x2="838" y1={y} y2={y} className={styles.flow} data-dir={l.dir} />
                  <text x="600" y={y - 8} textAnchor="middle" className={styles.laneText}>
                    {l.label} {l.dir === 1 ? "→" : "←"}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Lan Mouse */}
          <g className={styles.lan} data-apart={apart}>
            <path d="M 234 370 L 234 420 L 560 420" className={styles.lanLine} />
            <path d="M 640 420 L 966 420 L 966 370" className={styles.lanLine} />
            <path d="M 560 420 L 640 420" className={styles.lanBridge} />
            <text x="600" y="452" textAnchor="middle" className={styles.lanText}>
              {apart ? "Lan Mouse stopped after 2 readings apart" : "Lan Mouse · UDP 4242 · same network only, never Tailscale"}
            </text>
          </g>
        </svg>
      </div>

      <div className={styles.lanes} role="tablist" aria-label="What the tunnel carries">
        {LANES.map((l) => (
          <button
            key={l.id}
            type="button"
            role="tab"
            aria-selected={l.id === lane}
            className={styles.laneBtn}
            onClick={() => setLane(l.id)}
          >
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
    </div>
  );
}
