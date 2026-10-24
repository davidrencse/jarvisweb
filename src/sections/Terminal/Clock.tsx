import { useEffect, useState } from "react";
import styles from "./CommandBar.module.css";

const pad = (n: number) => String(n).padStart(2, "0");

export function Clock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => {
      if (!document.hidden) setNow(new Date());
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <time className={styles.clock} dateTime={now.toISOString()} aria-hidden>
      {pad(now.getHours())}:{pad(now.getMinutes())}:{pad(now.getSeconds())}
    </time>
  );
}
