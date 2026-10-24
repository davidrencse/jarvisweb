import { useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { SectionHead } from "../../components/SectionHead";
import { Rail, StationBar } from "./Rail";
import { StationPanel } from "./StationPanel";
import { evenMarks, stationAt, stationFill } from "./scrub";
import { stations } from "./stations";
import styles from "./Pipeline.module.css";

export default function Pipeline() {
  const panelsRef = useRef<HTMLDivElement>(null);
  const panelEls = useRef<(HTMLElement | null)[]>([]);
  const marks = useRef(evenMarks(stations.length));
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({ target: panelsRef, offset: ["start center", "end center"] });
  const fill = useTransform(() => stationFill(scrollYProgress.get(), marks.current));

  useMotionValueEvent(scrollYProgress, "change", (p) => setActive(stationAt(p, marks.current)));

  useLayoutEffect(() => {
    const root = panelsRef.current;
    if (!root) return;

    const measure = () => {
      const els = panelEls.current;
      const rootBox = root.getBoundingClientRect();
      if (rootBox.height === 0) return;
      let prev = 0;
      for (let i = 0; i < stations.length; i++) {
        const el = els[i];
        if (!el) return;
        const box = el.getBoundingClientRect();
        const centre = (box.top - rootBox.top + box.height / 2) / rootBox.height;
        marks.current[i] = i === 0 ? 0 : (prev + centre) / 2;
        prev = centre;
      }
      setActive(stationAt(scrollYProgress.get(), marks.current));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, [scrollYProgress]);

  const select = useCallback(
    (index: number) => {
      panelEls.current[index]?.scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" });
    },
    [reduceMotion],
  );

  return (
    <section id="how" className={styles.section} aria-labelledby="how-title">
      <div className="container">
        <SectionHead
          id="how-title"
          layout="stack"
          title={"What happens when\nyou say “Jarvis”"}
          lede="One request passes through seven stations. Everything except the thinking can run on your laptop."
          className={styles.head}
        />
        <div className={styles.body}>
          <Rail stations={stations} active={active} fill={fill} onSelect={select} />
          <StationBar stations={stations} active={active} fill={fill} />
          <div ref={panelsRef} className={styles.panels}>
            {stations.map((station, i) => (
              <StationPanel
                key={station.id}
                station={station}
                active={i === active}
                panelRef={(el) => {
                  panelEls.current[i] = el;
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
