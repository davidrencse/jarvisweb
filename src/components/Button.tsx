import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { spring } from "../lib/motion";
import styles from "./Button.module.css";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  /** primary: ink fill · secondary: hairline outline · quiet: text with arrow */
  variant?: "primary" | "secondary" | "quiet";
  size?: "sm" | "md" | "lg";
  /** Use on the black inverse band. */
  inverse?: boolean;
  arrow?: boolean;
  disabled?: boolean;
  className?: string;
};

export function Button({
  children,
  href,
  type = "button",
  onClick,
  variant = "primary",
  size = "md",
  inverse = false,
  arrow = false,
  disabled = false,
  className,
}: ButtonProps) {
  const cls = [styles.button, styles[variant], styles[size], inverse && styles.inverse, className]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <span className={styles.label}>{children}</span>
      {arrow ? <ArrowRight className={styles.arrow} size={16} strokeWidth={1.75} aria-hidden /> : null}
    </>
  );

  const tap = disabled ? undefined : { scale: 0.97 };

  if (href) {
    return (
      <motion.a href={href} className={cls} whileTap={tap} transition={spring.press} onClick={onClick}>
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      type={type}
      className={cls}
      whileTap={tap}
      transition={spring.press}
      onClick={onClick}
      disabled={disabled}
    >
      {content}
    </motion.button>
  );
}
