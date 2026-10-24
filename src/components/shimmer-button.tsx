import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface ShimmerButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  /** dark: ink fill on white pages · light: white fill on the ink island or black band */
  tone?: "dark" | "light";
  size?: "sm" | "md";
  className?: string;
}

export function ShimmerButton({
  children,
  href,
  onClick,
  type = "button",
  tone = "dark",
  size = "md",
  className,
}: ShimmerButtonProps) {
  const classes = cn(
    "group relative isolate inline-flex items-center justify-center overflow-hidden rounded-full font-medium whitespace-nowrap no-underline transition-colors duration-300",
    size === "sm" ? "h-9 px-4 text-[length:var(--text-sm)]" : "h-11 px-5 text-[15px]",
    tone === "dark" ? "bg-ink text-paper hover:bg-[var(--ink-hover)]" : "bg-paper text-ink",
    className,
  );

  const content = (
    <>
      <span className="relative z-10">{children}</span>
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 -translate-x-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-full",
          "bg-linear-to-r from-transparent to-transparent",
          tone === "dark" ? "via-white/25" : "via-black/10",
        )}
      />
    </>
  );

  if (href) {
    return (
      <motion.a href={href} onClick={onClick} className={classes} whileTap={{ scale: 0.97 }}>
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button type={type} onClick={onClick} className={classes} whileTap={{ scale: 0.97 }}>
      {content}
    </motion.button>
  );
}
