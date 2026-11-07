import { AnimatePresence, motion } from "motion/react";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { STATIONS, TOTAL_LINES, TOTAL_MODULES, stationLines } from "./modules";
import styles from "./ModuleMap.module.css";

const MAX = Math.max(...STATIONS.map(stationLines));
const fmt = (n: number) => n.toLocaleString("en-US");

export function ModuleMap() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string>("decide");
  const [hover, setHover] = useState<{ station: string; name: string; lines: number } | null>(null);

  const q = query.trim().toLowerCase().replace(/\.py$/, "");
  const matches = useMemo(() => {
    if (!q) return null;
    const set = new Set<string>();
    STATIONS.forEach((s) => s.modules.forEach(([m]) => m.includes(q) && set.add(`${s.id}/${m}`)));
    return set;
  }, [q]);

  const openStation = STATIONS.find((s) => s.id === open);

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <p className={styles.total}>
          <span className={styles.fig}>{fmt(TOTAL_LINES)}</span> lines across <span className={styles.fig}>{TOTAL_MODULES}</span>{" "}
          modules in 9 stations.
        </p>
        <label className={styles.search}>
          <Search size={15} strokeWidth={1.75} aria-hidden />
          <span className="sr-only">Find a module</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a module, e.g. gates"
            spellCheck={false}
            autoComplete="off"
          />
          {matches ? <span className={styles.count}>{matches.size} found</span> : null}
        </label>
      </div>

      <ul className={styles.rows}>
        {STATIONS.map((s) => {
          const total = stationLines(s);
          const isOpen = open === s.id;
          const hit = matches ? s.modules.some(([m]) => matches.has(`${s.id}/${m}`)) : true;
          return (
            <li key={s.id} className={styles.row} data-open={isOpen} data-dim={!hit}>
              <button
                type="button"
                className={styles.rowBtn}
                aria-expanded={isOpen}
                aria-controls={`mod-${s.id}`}
                onClick={() => setOpen(isOpen ? "" : s.id)}
              >
                <span className={styles.name}>{s.name}</span>
                <span className={styles.bar} style={{ width: `${(total / MAX) * 100}%` }}>
                  {s.modules.map(([m, lines]) => {
                    const key = `${s.id}/${m}`;
                    const lit = matches ? matches.has(key) : true;
                    return (
                      <span
                        key={m}
                        className={styles.seg}
                        data-lit={lit}
                        data-hover={hover?.station === s.id && hover.name === m}
                        style={{ flexGrow: lines }}
                        onPointerEnter={() => setHover({ station: s.id, name: m, lines })}
                        onPointerLeave={() => setHover(null)}
                      />
                    );
                  })}
                </span>
                <span className={styles.lines}>
                  {hover?.station === s.id ? (
                    <>
                      <span className={styles.hoverName}>{hover.name}.py</span> {fmt(hover.lines)}
                    </>
                  ) : (
                    <>
                      {fmt(total)} <span className={styles.unit}>lines · {s.modules.length}</span>
                    </>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <AnimatePresence mode="wait" initial={false}>
        {openStation ? (
          <motion.div
            key={openStation.id}
            id={`mod-${openStation.id}`}
            className={styles.detail}
            initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.detailHead}>
              <h3 className={styles.detailTitle}>{openStation.name}</h3>
              <p className={styles.job}>{openStation.job}</p>
            </div>
            <ul className={styles.chips}>
              {openStation.modules.map(([m, lines]) => (
                <li
                  key={m}
                  className={styles.chip}
                  data-lit={matches ? matches.has(`${openStation.id}/${m}`) : true}
                >
                  <code>{m}.py</code>
                  <span>{fmt(lines)}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <p className={styles.source}>
        Line counts from the console’s System → Under the hood view, 7 November 2026. A test fails if a module isn’t
        filed under a station.
      </p>
    </div>
  );
}
