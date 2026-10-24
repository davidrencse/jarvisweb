import { useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from 'motion/react';
import { ChevronUp } from 'lucide-react';
import useMeasure from 'react-use-measure';
import { cn } from '@/lib/utils';
import { scrollToId } from '@/lib/scroll';
import { ShimmerButton } from '@/components/shimmer-button';

export interface Topic {
  id: string;
  title: string;
}

export interface ScrollIslandProps {
  topics: Topic[];
  /** Section id after which the island appears. */
  showAfter: string;
  /** Section id where the island steps aside (its own CTA is on screen). */
  hideAt: string;
  cta: { href: string; label: string };
}

const island = { type: 'spring', bounce: 0.18, visualDuration: 0.5 } as const;

export function ScrollIsland({ topics, showAfter, hideAt, cta }: ScrollIslandProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [activeId, setActiveId] = useState<string>(topics[0]?.id ?? '');
  const [ref, bounds] = useMeasure({ offsetSize: true });
  const toggleRef = useRef<HTMLButtonElement>(null);
  const { scrollY, scrollYProgress } = useScroll();

  const ring = useTransform(
    () => `conic-gradient(var(--paper) ${scrollYProgress.get() * 100}%, var(--inverse-track) 0)`,
  );
  const percent = useTransform(() => Math.round(scrollYProgress.get() * 100));

  useMotionValueEvent(scrollY, 'change', () => {
    const start = document.getElementById(showAfter);
    const end = document.getElementById(hideAt);
    if (!start || !end) return;
    const pastStart = start.getBoundingClientRect().bottom < window.innerHeight * 0.35;
    const beforeEnd = end.getBoundingClientRect().top > window.innerHeight * 0.6;
    setVisible(pastStart && beforeEnd);
  });

  useEffect(() => {
    if (!visible) setIsOpen(false);
  }, [visible]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActiveId(entry.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    for (const t of topics) {
      const el = document.getElementById(t.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [topics]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  const activeTitle = topics.find((t) => t.id === activeId)?.title ?? topics[0]?.title;

  const go = (id: string) => {
    setIsOpen(false);
    scrollToId(id);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            className="bg-ink/20 fixed inset-0 z-[60]"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {visible && (
          <motion.nav
            key="island"
            aria-label="Page index"
            initial={{ y: 96, opacity: 0, filter: 'blur(6px)' }}
            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
            exit={{ y: 96, opacity: 0, filter: 'blur(6px)', transition: { duration: 0.25 } }}
            transition={island}
            className="pointer-events-none fixed inset-x-0 bottom-4 z-[61] flex justify-center px-4 sm:bottom-6"
          >
            <motion.div
              className="bg-ink text-paper pointer-events-auto overflow-hidden shadow-[0_2px_6px_rgb(10_10_10/0.12),0_24px_48px_-16px_rgb(10_10_10/0.45)]"
              initial={false}
              animate={{
                height: bounds.height > 0 ? bounds.height : 'auto',
                width: isOpen ? 'min(360px, calc(100vw - 32px))' : 'min(304px, calc(100vw - 32px))',
                borderRadius: isOpen ? 24 : 30,
              }}
              transition={island}
            >
              <div ref={ref} className="flex w-full flex-col">
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="list"
                      initial={{ opacity: 0, filter: 'blur(4px)' }}
                      animate={{ opacity: 1, filter: 'blur(0px)', transition: { delay: 0.08, duration: 0.3 } }}
                      exit={{ opacity: 0, filter: 'blur(4px)', transition: { duration: 0.12 } }}
                      className="px-2 pt-3"
                    >
                      <ul className="max-h-[min(52dvh,420px)] overflow-y-auto overscroll-contain">
                        {topics.map((t) => {
                          const active = t.id === activeId;
                          return (
                            <li key={t.id}>
                              <button
                                type="button"
                                onClick={() => go(t.id)}
                                aria-current={active ? 'location' : undefined}
                                className={cn(
                                  'relative flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-left text-[15px] transition-colors',
                                  active ? 'text-paper' : 'text-on-inverse-2 hover:text-paper',
                                )}
                              >
                                <span
                                  aria-hidden
                                  className={cn(
                                    'size-1.5 shrink-0 rounded-full transition-colors',
                                    active ? 'bg-paper' : 'bg-[var(--inverse-track)]',
                                  )}
                                />
                                {t.title}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                      <div className="px-1 pt-2 pb-1">
                        <ShimmerButton href={cta.href} onClick={() => setIsOpen(false)} className="w-full" tone="light">
                          {cta.label}
                        </ShimmerButton>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  ref={toggleRef}
                  type="button"
                  aria-expanded={isOpen}
                  aria-label={isOpen ? 'Close page index' : `Page index, now reading ${activeTitle}`}
                  onClick={() => setIsOpen((o) => !o)}
                  className="group flex h-[60px] w-full shrink-0 cursor-pointer items-center justify-between gap-3 pr-3 pl-3.5 select-none"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <motion.span className="relative size-7 shrink-0 rounded-full" style={{ background: ring }}>
                      <span className="bg-ink absolute inset-[2.5px] rounded-full" />
                    </motion.span>
                    <span className="relative h-5 min-w-0 flex-1 overflow-hidden text-left">
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span
                          key={activeTitle}
                          initial={{ y: 14, opacity: 0, filter: 'blur(4px)' }}
                          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                          exit={{ y: -14, opacity: 0, filter: 'blur(4px)' }}
                          transition={{ type: 'spring', bounce: 0, visualDuration: 0.3 }}
                          className="block truncate text-[15px] leading-5 font-medium"
                        >
                          {activeTitle}
                        </motion.span>
                      </AnimatePresence>
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="text-on-inverse-2 rounded-full bg-[var(--inverse-raised)] px-2.5 py-1 font-mono text-[12px] tabular-nums">
                      <motion.span>{percent}</motion.span>%
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={island}
                      className="text-on-inverse-2 group-hover:text-paper flex"
                    >
                      <ChevronUp size={18} strokeWidth={1.75} />
                    </motion.span>
                  </span>
                </button>
              </div>
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
