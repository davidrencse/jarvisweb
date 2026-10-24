import styles from "./Wordmark.module.css";

const BARS = [5, 11, 17, 9, 13];

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={[styles.wordmark, className].filter(Boolean).join(" ")}>
      <svg className={styles.mark} viewBox="0 0 20 20" aria-hidden>
        {BARS.map((h, i) => (
          <rect key={i} x={1.5 + i * 3.75} y={10 - h / 2} width={2} height={h} rx={1} fill="currentColor" />
        ))}
      </svg>
      <span className={styles.name}>JARVIS</span>
    </span>
  );
}
