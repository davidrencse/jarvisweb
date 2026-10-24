import { motion, type Variants } from "motion/react";
import { ArrowRight, Check } from "lucide-react";
import type { ReactNode } from "react";
import { ease, spring } from "../../lib/motion";
import { CountUp, Typed } from "./Counters";
import type {
  ActReadout,
  DecideReadout,
  HearReadout,
  LogReadout,
  ReadoutDef,
  RememberReadout,
  SpeakReadout,
  ThinkReadout,
} from "./stations";
import styles from "./Readout.module.css";

const pass: Variants = { hidden: {}, show: {} };

/** `custom` is the delay in seconds from the moment the readout plays. */
const rise: Variants = {
  hidden: { opacity: 0, y: 8, filter: "blur(4px)" },
  show: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: ease.out, delay },
  }),
};

const bar: Variants = {
  hidden: { scaleY: 0.06, opacity: 0 },
  show: (i: number) => ({
    scaleY: 1,
    opacity: 1,
    transition: { duration: 0.5, ease: ease.out, delay: 0.1 + i * 0.01 },
  }),
};

type MeterCustom = { to: number; delay: number; seconds?: number };

const meter: Variants = {
  hidden: { scaleX: 0 },
  show: ({ to, delay, seconds }: MeterCustom) => ({
    scaleX: to,
    transition: seconds
      ? { duration: seconds, ease: "linear", delay }
      : { duration: 0.9, ease: ease.out, delay },
  }),
};

const pop: Variants = {
  hidden: { opacity: 0, scale: 0.6 },
  show: { opacity: 1, scale: 1, transition: { ...spring.snappy, delay: 0.3 } },
};

const band: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  show: { opacity: 1, scale: 1, transition: { ...spring.snappy, delay: 0.85 } },
};

const late: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4, ease: ease.out, delay: 0.95 } },
};

type RowProps = { delay?: number; className?: string; children: ReactNode };

function Row({ delay = 0, className, children }: RowProps) {
  return (
    <motion.div className={[styles.row, className].filter(Boolean).join(" ")} variants={rise} custom={delay}>
      {children}
    </motion.div>
  );
}

type BodyProps<T> = { def: T; play: boolean; live: boolean };

function HearBody({ def, play }: BodyProps<HearReadout>) {
  return (
    <>
      <motion.div className={styles.bars} variants={pass} aria-hidden>
        {def.frames.map((h, i) => (
          <motion.span
            key={i}
            className={h < 34 ? styles.barQuiet : styles.bar}
            style={{ height: `${h}%` }}
            variants={bar}
            custom={i}
          />
        ))}
      </motion.div>
      <Row delay={0.8} className={styles.line}>
        <span className={styles.key}>voiceprint</span>
        <span className={styles.strong}>
          <CountUp to={def.score} decimals={2} play={play} delay={1} duration={0.8} />
        </span>
        <span>≥ {def.threshold.toFixed(2)}</span>
        <ArrowRight className={styles.arrow} size={14} strokeWidth={1.75} aria-hidden />
        <span className={styles.strong}>{def.action}</span>
      </Row>
    </>
  );
}

function DecideBody({ def }: BodyProps<DecideReadout>) {
  return (
    <>
      <Row delay={0.1} className={styles.line}>
        <span className={styles.key}>request</span>
        <span className={styles.strong}>&quot;{def.request}&quot;</span>
      </Row>
      <ul className={styles.routes}>
        {def.routes.map((route, i) => {
          const picked = route === def.picked;
          return (
            <motion.li
              key={route}
              className={picked ? styles.routePicked : styles.route}
              variants={rise}
              custom={0.2 + i * 0.08}
            >
              <span>{route}</span>
              {picked ? (
                <>
                  <motion.span className={styles.band} variants={band} aria-hidden />
                  <motion.span className={styles.routeNote} variants={late}>
                    {def.note}
                  </motion.span>
                </>
              ) : null}
            </motion.li>
          );
        })}
      </ul>
    </>
  );
}

function RememberBody({ def, play }: BodyProps<RememberReadout>) {
  return (
    <>
      <ul className={styles.notes}>
        {def.notes.map((note, i) => {
          const delay = 0.1 + i * 0.12;
          return (
            <motion.li key={note.path} className={styles.note} variants={rise} custom={delay}>
              <span className={styles.noteTop}>
                <span className={styles.path}>{note.path}</span>
                <span className={styles.strong}>
                  <CountUp to={note.score} decimals={2} play={play} delay={delay + 0.15} duration={0.9} />
                </span>
              </span>
              <span className={styles.track} aria-hidden>
                <motion.span
                  className={styles.meter}
                  variants={meter}
                  custom={{ to: note.score, delay: delay + 0.15 } satisfies MeterCustom}
                />
              </span>
            </motion.li>
          );
        })}
      </ul>
      <Row delay={0.6} className={styles.foot}>
        {def.footnote}
      </Row>
    </>
  );
}

function ThinkBody({ def, play }: BodyProps<ThinkReadout>) {
  return (
    <>
      <Row delay={0.1} className={styles.line}>
        {def.parts.map((part, i) => (
          <span key={part} className={styles.part}>
            {i > 0 ? <span className={styles.sep}>·</span> : null}
            <span className={styles.strong}>{part}</span>
          </span>
        ))}
      </Row>
      <Row delay={0.3} className={styles.clock}>
        <span className={styles.clockTop}>
          <span className={styles.key}>reply</span>
          <span className={styles.strong}>
            <CountUp to={def.seconds} decimals={1} play={play} delay={0.45} duration={def.seconds} linear /> s
          </span>
        </span>
        <span className={styles.track} aria-hidden>
          <motion.span
            className={styles.meter}
            variants={meter}
            custom={{ to: 1, delay: 0.45, seconds: def.seconds } satisfies MeterCustom}
          />
        </span>
      </Row>
    </>
  );
}

function ActBody({ def, live }: BodyProps<ActReadout>) {
  return (
    <>
      <Row delay={0.1} className={styles.line}>
        <motion.span className={styles.status} variants={pop} aria-hidden>
          <Check size={16} strokeWidth={1.75} />
        </motion.span>
        <span className={styles.strong}>{def.done.tool}</span>
        <span>{def.done.arg}</span>
      </Row>
      <Row delay={0.7} className={styles.line}>
        <span className={styles.status} aria-hidden>
          <span className={styles.ring} data-live={live} />
        </span>
        <span className={styles.strong}>{def.pending.tool}</span>
        <span>{def.pending.arg}</span>
        <ArrowRight className={styles.arrow} size={14} strokeWidth={1.75} aria-hidden />
        <span className={styles.strong}>{def.pending.state}</span>
      </Row>
    </>
  );
}

function SpeakBody({ def }: BodyProps<SpeakReadout>) {
  return (
    <>
      <ul className={styles.chips}>
        {def.sentences.map((sentence, i) => (
          <motion.li key={sentence} className={styles.chip} variants={rise} custom={0.1 + i * 0.6}>
            {sentence}
          </motion.li>
        ))}
      </ul>
      <Row delay={0.1 + def.sentences.length * 0.6} className={styles.foot}>
        {def.note}
      </Row>
    </>
  );
}

function LogBody({ def, play }: BodyProps<LogReadout>) {
  return (
    <>
      <Row delay={0.1} className={styles.line}>
        <span className={styles.key}>saved</span>
        <span className={styles.strong}>
          <Typed text={def.id} play={play} delay={0.25} duration={0.7} />
        </span>
      </Row>
      <Row delay={0.9} className={styles.line}>
        <span className={styles.key}>search</span>
        <span className={styles.strong}>
          <CountUp to={def.searchFrom} play={play} delay={1.05} duration={0.5} />–
          <CountUp to={def.searchTo} play={play} delay={1.05} duration={0.7} /> ms
        </span>
      </Row>
    </>
  );
}

function Body({ def, play, live }: BodyProps<ReadoutDef>) {
  switch (def.kind) {
    case "hear":
      return <HearBody def={def} play={play} live={live} />;
    case "decide":
      return <DecideBody def={def} play={play} live={live} />;
    case "remember":
      return <RememberBody def={def} play={play} live={live} />;
    case "think":
      return <ThinkBody def={def} play={play} live={live} />;
    case "act":
      return <ActBody def={def} play={play} live={live} />;
    case "speak":
      return <SpeakBody def={def} play={play} live={live} />;
    case "log":
      return <LogBody def={def} play={play} live={live} />;
  }
}

type ReadoutProps = {
  def: ReadoutDef;
  /** Turns true once, the first time the station is read. */
  play: boolean;
  /** True while this station is the active one. */
  live: boolean;
};

export function Readout({ def, play, live }: ReadoutProps) {
  return (
    <motion.div
      className={styles.frame}
      variants={pass}
      initial="hidden"
      animate={play ? "show" : "hidden"}
      data-live={live}
    >
      <div className={styles.head}>
        <span>{def.title}</span>
        <span>Simulated</span>
      </div>
      <div className={styles.body}>
        <Body def={def} play={play} live={live} />
      </div>
    </motion.div>
  );
}
