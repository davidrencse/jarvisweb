import { useRef, type CSSProperties, type ReactNode } from "react";
import styles from "./Spotlight.module.css";

type SpotlightProps = {
  children: ReactNode;
  /** The frame's own class; it keeps its border, radius and background. */
  className?: string;
  /** Radius of the light in px. */
  radius?: number;
  inverse?: boolean;
  as?: "div" | "figure" | "article" | "li";
};

/** A hairline light that follows the cursor around a frame's border. */
export function Spotlight({ children, className, radius = 360, inverse = false, as: Tag = "div" }: SpotlightProps) {
  const ref = useRef<HTMLElement>(null);

  const move = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--sx", `${e.clientX - r.left}px`);
    el.style.setProperty("--sy", `${e.clientY - r.top}px`);
  };

  return (
    <Tag
      ref={ref as never}
      className={[styles.spotlight, inverse && styles.inverse, className].filter(Boolean).join(" ")}
      style={{ "--spot-r": `${radius}px` } as CSSProperties}
      onPointerMove={move}
    >
      {children}
    </Tag>
  );
}
