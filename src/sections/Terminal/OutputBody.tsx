import { motion } from "motion/react";
import { memo, type CSSProperties, type ReactNode } from "react";
import { ease } from "../../lib/motion";
import { Chart } from "./Chart";
import { useStagger } from "./motion";
import type { Bar, Cell, Fact, Group, NoteHit, Output } from "./types";
import styles from "./Output.module.css";

type Props = { output: Output; onRun: (command: string) => void };

const withCites = (text: string): ReactNode[] =>
  text.split(/(\[\[[^\]]+\]\])/g).map((part, i) =>
    part.startsWith("[[") ? (
      <code key={i} className={styles.cite}>
        {part}
      </code>
    ) : (
      part
    ),
  );

function Foot({ text, variants }: { text?: string; variants: ReturnType<typeof useStagger>["item"] }) {
  if (!text) return null;
  return (
    <motion.p variants={variants} className={styles.foot}>
      {text}
    </motion.p>
  );
}

function Groups({ groups, foot }: { groups: Group[]; foot?: string }) {
  const { list, item } = useStagger();
  return (
    <motion.div className={styles.stack} variants={list} initial="hidden" animate="show">
      {groups.map((g) => {
        const keyLen = Math.max(0, ...g.lines.map((l) => l.key?.length ?? 0));
        return (
          <div key={g.heading} className={styles.group}>
            <motion.h4 variants={item} className={styles.heading}>
              {g.heading}
            </motion.h4>
            <ul className={styles.lines} style={{ "--key-w": `${keyLen + 1}ch` } as CSSProperties}>
              {g.lines.map((l, i) => (
                <motion.li
                  key={i}
                  variants={item}
                  className={styles.line}
                  data-bare={l.key ? undefined : ""}
                  data-muted={l.muted ? "" : undefined}
                >
                  {l.key ? <span className={styles.key}>{l.key}</span> : null}
                  <span className={l.mono ? styles.mono : styles.text}>{withCites(l.text)}</span>
                  {l.meta ? <span className={styles.meta}>{l.meta}</span> : null}
                </motion.li>
              ))}
            </ul>
          </div>
        );
      })}
      <Foot text={foot} variants={item} />
    </motion.div>
  );
}

function CellView({ cell, onRun }: { cell: Cell; onRun: Props["onRun"] }) {
  if (typeof cell === "string") return <>{cell}</>;
  return (
    <button type="button" className={styles.cellRun} onClick={() => onRun(cell.run)}>
      {cell.text}
    </button>
  );
}

function Table({ output, onRun }: { output: Extract<Output, { kind: "table" }>; onRun: Props["onRun"] }) {
  const { list, item } = useStagger();
  const quiet = output.quiet ?? [];
  const mono = output.mono ?? [];
  return (
    <motion.div
      className={styles.stack}
      variants={list}
      initial="hidden"
      animate="show"
      style={{ "--cols": output.cols } as CSSProperties}
    >
      <div role="table" aria-label="Results" className={styles.table}>
        <div role="row" className={styles.thead}>
          {output.columns.map((c) => (
            <div key={c} role="columnheader" className={styles.th}>
              {c}
            </div>
          ))}
        </div>
        {output.rows.map((row, r) => (
          <motion.div key={r} role="row" variants={item} className={styles.trow}>
            {row.map((cell, c) => (
              <div
                key={c}
                role={c === 0 ? "rowheader" : "cell"}
                className={styles.td}
                data-label={output.columns[c]}
                data-quiet={quiet.includes(c) ? "" : undefined}
                data-mono={mono.includes(c) ? "" : undefined}
              >
                <CellView cell={cell} onRun={onRun} />
              </div>
            ))}
          </motion.div>
        ))}
      </div>
      <Foot text={output.foot} variants={item} />
    </motion.div>
  );
}

function Notes({ items, foot }: { items: NoteHit[]; foot: string }) {
  const { list, item } = useStagger();
  return (
    <motion.div className={styles.stack} variants={list} initial="hidden" animate="show">
      <ul className={styles.notes}>
        {items.map((hit, i) => (
          <motion.li key={hit.path} variants={item} className={styles.note}>
            <div className={styles.noteHead}>
              <code className={styles.path}>{hit.path}</code>
              <span className={styles.score}>
                <span className="sr-only">score </span>
                {hit.score.toFixed(2)}
              </span>
            </div>
            <div className={styles.track} aria-hidden>
              <motion.span
                className={styles.fill}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: hit.score }}
                transition={{ duration: 0.8, ease: ease.out, delay: 0.2 + i * 0.1 }}
              />
            </div>
            <p className={styles.excerpt}>
              <span>{hit.excerpt[0]}</span>
              <span>{hit.excerpt[1]}</span>
            </p>
          </motion.li>
        ))}
      </ul>
      <Foot text={foot} variants={item} />
    </motion.div>
  );
}

function Bars({ items, foot }: { items: Bar[]; foot?: string }) {
  const { list, item } = useStagger();
  return (
    <motion.div className={styles.stack} variants={list} initial="hidden" animate="show">
      <ul className={styles.bars}>
        {items.map((b, i) => (
          <motion.li key={`${b.label}-${b.sub}`} variants={item} className={styles.bar}>
            <div className={styles.barHead}>
              <span className={styles.barLabel}>{b.label}</span>
              <span className={styles.barSub}>{b.sub}</span>
              <span className={styles.barRead}>{b.readout}</span>
            </div>
            <div className={styles.track} aria-hidden>
              <motion.span
                className={styles.fill}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: b.left }}
                transition={{ duration: 0.8, ease: ease.out, delay: 0.2 + i * 0.08 }}
              />
            </div>
            {b.detail ? <span className={styles.barDetail}>{b.detail}</span> : null}
          </motion.li>
        ))}
      </ul>
      <Foot text={foot} variants={item} />
    </motion.div>
  );
}

type FactsProps = Extract<Output, { kind: "facts" }>;

function Facts({ title, code, big, text, facts, foot }: FactsProps) {
  const { list, item } = useStagger();
  return (
    <motion.div className={styles.stack} variants={list} initial="hidden" animate="show">
      <motion.h4 variants={item} className={styles.factTitle}>
        {title}
      </motion.h4>
      {code ? (
        <motion.code variants={item} className={styles.rule}>
          {code}
        </motion.code>
      ) : null}
      {big ? (
        <motion.div variants={item} className={styles.bigWrap}>
          <p className={styles.big}>{big.main}</p>
          <p className={styles.vs}>{big.vs}</p>
        </motion.div>
      ) : null}
      {text ? (
        <motion.p variants={item} className={styles.blurb}>
          {text}
        </motion.p>
      ) : null}
      <dl className={styles.facts}>
        {facts.map(([k, v]: Fact) => (
          <motion.div key={k} variants={item} className={styles.fact}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </motion.div>
        ))}
      </dl>
      <Foot text={foot} variants={item} />
    </motion.div>
  );
}

function Tries({ label, commands, onRun }: { label: string; commands: string[]; onRun: Props["onRun"] }) {
  const { item } = useStagger();
  return (
    <motion.div variants={item} className={styles.tries}>
      <span className={styles.triesLabel}>{label}</span>
      {commands.map((c) => (
        <button key={c} type="button" className={styles.tryBtn} onClick={() => onRun(c)}>
          {c}
        </button>
      ))}
    </motion.div>
  );
}

function Message({ output, onRun }: { output: Extract<Output, { kind: "error" | "idle" }>; onRun: Props["onRun"] }) {
  const { list, item } = useStagger();
  return (
    <motion.div className={styles.stack} variants={list} initial="hidden" animate="show">
      {output.kind === "error" ? (
        <>
          <motion.p variants={item} className={styles.error}>
            {output.message}
          </motion.p>
          <Tries label="Try" commands={output.tries} onRun={onRun} />
        </>
      ) : (
        <>
          <motion.p variants={item} className={styles.ready}>
            Ready. Type a shortcut at the top, or start with one of these.
          </motion.p>
          <Tries label="Run" commands={output.starters} onRun={onRun} />
        </>
      )}
    </motion.div>
  );
}

export const OutputBody = memo(function OutputBody({ output, onRun }: Props) {
  switch (output.kind) {
    case "groups":
      return <Groups groups={output.groups} foot={output.foot} />;
    case "table":
      return <Table output={output} onRun={onRun} />;
    case "chart":
      return (
        <div className={styles.stack}>
          <Chart chart={output.chart} />
          {output.foot ? <p className={styles.foot}>{output.foot}</p> : null}
        </div>
      );
    case "notes":
      return <Notes items={output.items} foot={output.foot} />;
    case "bars":
      return <Bars items={output.items} foot={output.foot} />;
    case "facts":
      return <Facts {...output} />;
    case "error":
    case "idle":
      return <Message output={output} onRun={onRun} />;
  }
});
