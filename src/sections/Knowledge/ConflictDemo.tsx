import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "../../components/Button";
import { ease, spring } from "../../lib/motion";
import { Spotlight } from "../../components/Spotlight";
import styles from "./ConflictDemo.module.css";

type ClaimId = "a" | "b";
type Choice = ClaimId | "both";
type Ruling = Choice | null;
type Standing = "open" | "kept" | "superseded" | "both";

const CLAIMS = [
  {
    id: "a",
    label: "Claim A",
    lead: "The review routine runs ",
    diff: "daily",
    tail: " at 02:00.",
    source: "source-001 · confirmed 2026-09-01",
  },
  {
    id: "b",
    label: "Claim B",
    lead: "The review routine runs ",
    diff: "weekly",
    tail: " on Sundays.",
    source: "source-014 · confirmed 2026-10-19",
  },
] as const;

const CHOICES: { id: Choice; label: string }[] = [
  { id: "a", label: "Keep A" },
  { id: "b", label: "Keep B" },
  { id: "both", label: "Both true" },
];

const TAGS = { kept: "confirmed", superseded: "superseded", both: "both hold" } as const;

const OPEN_LINE = "You decide which claim stands.";
const RULED_LINE = "The checker remembers your ruling and won’t raise this pair again.";

const ANNOUNCE: Record<Choice, string> = {
  a: `You kept claim A. Claim B is superseded. ${RULED_LINE}`,
  b: `You kept claim B. Claim A is superseded. ${RULED_LINE}`,
  both: `You marked both claims as true. ${RULED_LINE}`,
};
const ANNOUNCE_OPEN = "Ruling cleared. The two claims are open again.";

function standingOf(id: ClaimId, ruling: Ruling): Standing {
  if (ruling === null) return "open";
  if (ruling === "both") return "both";
  return ruling === id ? "kept" : "superseded";
}

const blur = { opacity: 0, filter: "blur(4px)" };
const sharp = { opacity: 1, filter: "blur(0px)", transition: { duration: 0.4, ease: ease.out } };

export function ConflictDemo() {
  const uid = useId();
  const [ruling, setRuling] = useState<Ruling>(null);
  const [note, setNote] = useState("");
  const settled = ruling !== null;

  const choose = (choice: Choice) => {
    const next = ruling === choice ? null : choice;
    setRuling(next);
    setNote(next ? ANNOUNCE[next] : ANNOUNCE_OPEN);
  };

  const reset = () => {
    setRuling(null);
    setNote(ANNOUNCE_OPEN);
  };

  return (
    <div className={styles.wrap}>
      <h3 className="sr-only">Example: two claims disagree</h3>
      <p className={styles.simulated}>Simulated</p>

      <Spotlight>
      <figure className={styles.demo}>
        <figcaption className={styles.head}>
          <span className={styles.title}>review-routine.md · conflict: how often (daily ≠ weekly)</span>
          <motion.span layout className={styles.status} data-settled={settled} style={{ borderRadius: 999 }}>
            <span className={styles.dot} aria-hidden />
            <span className="sr-only">Status: </span>
            <span className={styles.statusText}>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={settled ? "settled" : "review"}
                  initial={blur}
                  animate={{ ...sharp, transition: { duration: 0.3, ease: ease.out } }}
                  exit={{ ...blur, transition: { duration: 0.14 } }}
                >
                  {settled ? "settled" : "review"}
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.span>
        </figcaption>

        <div className={styles.claims}>
          {CLAIMS.map((claim) => {
            const standing = standingOf(claim.id, ruling);
            const tag = standing === "open" ? null : TAGS[standing];
            const first = ruling === "b" ? "b" : "a";

            return (
              <motion.div
                key={claim.id}
                layout="position"
                transition={spring.layout}
                role="group"
                aria-labelledby={`${uid}-${claim.id}`}
                className={styles.claim}
                data-standing={standing}
                style={{ order: claim.id === first ? 0 : 1, zIndex: standing === "kept" ? 1 : 0 }}
              >
                <div className={styles.claimTop}>
                  <span id={`${uid}-${claim.id}`} className={styles.claimLabel}>
                    {claim.label}
                  </span>
                  <span className={styles.tagSlot}>
                    <AnimatePresence mode="popLayout" initial={false}>
                      {tag ? (
                        <motion.span
                          key={tag}
                          className={styles.tag}
                          data-kind={standing}
                          initial={{ opacity: 0, scale: 0.92, filter: "blur(4px)" }}
                          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                          exit={{ opacity: 0, scale: 0.96, filter: "blur(3px)", transition: { duration: 0.14 } }}
                          transition={{ duration: 0.32, ease: ease.out }}
                        >
                          {standing === "kept" ? <Check size={12} strokeWidth={2} aria-hidden /> : null}
                          {tag}
                        </motion.span>
                      ) : null}
                    </AnimatePresence>
                  </span>
                </div>

                <p className={styles.claimText}>
                  <span className={styles.strike}>
                    {claim.lead}
                    <span className={styles.diff}>{claim.diff}</span>
                    {claim.tail}
                  </span>
                </p>

                <p className={styles.source}>{claim.source}</p>
              </motion.div>
            );
          })}
        </div>

        <div className={styles.bar}>
          <div className={styles.choices} role="group" aria-label="Rule on the conflict">
            {CHOICES.map((choice) => {
              const pressed = ruling === choice.id;
              return (
                <motion.button
                  key={choice.id}
                  type="button"
                  className={styles.choice}
                  aria-pressed={pressed}
                  onClick={() => choose(choice.id)}
                  whileTap={{ scale: 0.97 }}
                  transition={spring.press}
                >
                  {pressed ? (
                    <motion.span layoutId={`${uid}-pill`} className={styles.pill} transition={spring.snappy} />
                  ) : null}
                  <span className={styles.choiceLabel}>{choice.label}</span>
                </motion.button>
              );
            })}
          </div>

          <div className={styles.ruling} data-ruled={settled}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={settled ? "ruled" : "open"}
                initial={blur}
                animate={sharp}
                exit={{ ...blur, transition: { duration: 0.15 } }}
              >
                {settled ? RULED_LINE : OPEN_LINE}
              </motion.p>
            </AnimatePresence>
          </div>

          <Button variant="quiet" size="sm" onClick={reset} disabled={!settled} className={styles.reset}>
            Reset
          </Button>
        </div>
      </figure>
      </Spotlight>

      <p className="sr-only" role="status" aria-live="polite">
        {note}
      </p>
    </div>
  );
}
