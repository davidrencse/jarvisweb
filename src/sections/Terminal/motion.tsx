import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { useMemo, type ReactNode } from "react";
import { ease, spring } from "../../lib/motion";

/** Parent and child variants for rows that stagger in with the snappy spring. */
export function useStagger(step = 0.035) {
  const reduced = useReducedMotion();
  return useMemo(() => {
    const list: Variants = {
      hidden: {},
      show: { transition: { staggerChildren: reduced ? 0 : step, delayChildren: reduced ? 0 : 0.08 } },
    };
    const item: Variants = {
      hidden: { opacity: 0, y: reduced ? 0 : 8 },
      show: { opacity: 1, y: 0, transition: reduced ? { duration: 0.01 } : spring.snappy },
    };
    return { list, item };
  }, [reduced, step]);
}

type SwapProps = { id: string; children: ReactNode; className?: string };

/** Content swap in one place: a short blur-crossfade, faster out than in. */
export function Swap({ id, children, className }: SwapProps) {
  const reduced = useReducedMotion();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={id}
        className={className}
        initial={{ opacity: 0, filter: reduced ? "blur(0px)" : "blur(6px)" }}
        animate={{ opacity: 1, filter: "blur(0px)", transition: { duration: 0.3, ease: ease.out } }}
        exit={{ opacity: 0, filter: reduced ? "blur(0px)" : "blur(4px)", transition: { duration: 0.14 } }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
