import { useReducedMotion } from "motion/react";
import { Suspense, lazy, useRef, useState } from "react";
import { hasWebGL2, isCompact, useLive, usePointer } from "./shared";

const PipelineScene = lazy(() => import("./PipelineScene"));

export function HeroPipeline({ className }: { className?: string }) {
  const reduced = !!useReducedMotion();
  const [gl] = useState(hasWebGL2);
  const [compact] = useState(isCompact);
  const ref = useRef<HTMLDivElement>(null);
  const live = useLive(ref);
  const pointer = usePointer(ref);
  if (!gl) return null;
  return (
    <div ref={ref} className={className} aria-hidden>
      <Suspense fallback={null}>
        <PipelineScene pointer={pointer} compact={compact} still={reduced} live={live} />
      </Suspense>
    </div>
  );
}
