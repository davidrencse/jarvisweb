import { motion, useReducedMotion } from "motion/react";
import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { spring } from "../lib/motion";
import { PROOFS } from "./proof";
import styles from "./ProofPanel.module.css";

function useTyped(text: string, key: string, off: boolean) {
  const [n, setN] = useState(off ? text.length : 0);
  useEffect(() => {
    if (off) {
      setN(text.length);
      return;
    }
    setN(0);
    let i = 0;
    const id = window.setInterval(() => {
      i = Math.min(text.length, i + Math.max(3, Math.round(text.length / 45)));
      setN(i);
      if (i >= text.length) window.clearInterval(id);
    }, 16);
    return () => window.clearInterval(id);
  }, [text, key, off]);
  return text.slice(0, n);
}

export function ProofPanel() {
  const reduced = !!useReducedMotion();
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const p = PROOFS[active];
  const typed = useTyped(p.output, p.id, reduced);
  const runnable = p.command.startsWith(".venv");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(p.command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard refused: nothing to do */
    }
  };

  return (
    <div className={styles.wrap}>
      <ul className={styles.claims} role="tablist" aria-label="Claims and their evidence" aria-orientation="vertical">
        {PROOFS.map((x, i) => (
          <li key={x.id}>
            <button
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-controls="proof-output"
              className={styles.claim}
              onClick={() => setActive(i)}
            >
              {i === active ? <motion.span layoutId="proof-pill" className={styles.claimPill} transition={spring.snappy} /> : null}
              <span className={styles.claimLabel}>{x.label}</span>
              <span className={styles.claimText}>{x.claim}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className={`inverse ${styles.term}`} id="proof-output" role="tabpanel">
        <div className={styles.termBar}>
          <code className={styles.cmd}>
            <span aria-hidden>{runnable ? "$ " : "# "}</span>
            {p.command}
          </code>
          {runnable ? (
            <button type="button" className={styles.copy} onClick={copy} aria-label={copied ? "Copied" : "Copy command"}>
              {copied ? <Check size={14} strokeWidth={1.75} /> : <Copy size={14} strokeWidth={1.75} />}
            </button>
          ) : null}
        </div>
        <pre className={styles.out} aria-label={p.output}>
          <span aria-hidden>{typed}</span>
          {typed.length < p.output.length ? <span className={styles.caret} aria-hidden /> : null}
        </pre>
        <p className={styles.meta}>Real output from the JARVIS repo, 7 November 2026. Trimmed for width.</p>
      </div>
    </div>
  );
}
