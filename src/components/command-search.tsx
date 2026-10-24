import {
  useState,
  useMemo,
  useEffect,
  useId,
  useRef,
  type KeyboardEvent,
  type FC,
  type ReactNode,
} from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CommandItem {
  id: string;
  title: string;
  section: string;
  icon: ReactNode;
  hint?: string;
  action: () => void;
}

interface Props {
  items: CommandItem[];
  placeholder?: string;
  className?: string;
}

const morph = { type: 'spring', bounce: 0, visualDuration: 0.28 } as const;

export const CommandSearch: FC<Props> = ({ items, placeholder = 'Ask or jump to…', className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName ?? '');
      const ownsSlash = e.target instanceof Element && !!e.target.closest('#terminal');
      const combo = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      if (!isOpen && (combo || (e.key === '/' && !typing && !ownsSlash))) {
        e.preventDefault();
        setIsOpen(true);
      } else if (isOpen && e.key === 'Escape') {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [isOpen]);

  const close = () => {
    setIsOpen(false);
    setQuery('');
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? items.filter((i) => `${i.title} ${i.section}`.toLowerCase().includes(q)) : items;
  }, [query, items]);

  useEffect(() => setActiveIndex(0), [query]);

  const sections = useMemo(() => {
    const groups = new Map<string, CommandItem[]>();
    for (const item of filteredItems) {
      const list = groups.get(item.section) ?? [];
      list.push(item);
      groups.set(item.section, list);
    }
    return [...groups.entries()].map(([name, list]) => ({ name, items: list }));
  }, [filteredItems]);

  const run = (item: CommandItem) => {
    setIsOpen(false);
    setQuery('');
    item.action();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!filteredItems.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((p) => (p + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((p) => (p - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = filteredItems[activeIndex];
      if (item) run(item);
    }
  };

  const activeId = filteredItems[activeIndex] ? `${listId}-${filteredItems[activeIndex].id}` : undefined;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            className="bg-ink/10 fixed inset-0 z-40"
            onClick={close}
          />
        )}
      </AnimatePresence>

      <div className={cn('relative z-50 h-9 w-44', className)}>
        <AnimatePresence mode="popLayout" initial={false}>
          {!isOpen ? (
            <motion.button
              key="trigger"
              ref={triggerRef}
              type="button"
              layoutId="command-palette"
              onClick={() => setIsOpen(true)}
              aria-haspopup="dialog"
              aria-label="Open command menu"
              className="group border-line text-ink-3 hover:text-ink hover:border-line-strong absolute inset-0 flex h-9 w-full items-center gap-2.5 overflow-hidden rounded-full border bg-paper px-3.5 transition-colors"
              transition={morph}
              style={{ borderRadius: 999 }}
            >
              <motion.span layoutId="command-icon" transition={morph} className="flex">
                <Search size={15} strokeWidth={1.75} />
              </motion.span>
              <motion.span layoutId="command-text" transition={morph} className="text-[length:var(--text-sm)]">
                Ask JARVIS
              </motion.span>
              <motion.kbd
                layoutId="command-key"
                transition={morph}
                className="border-line text-ink-3 absolute right-2 rounded-md border bg-paper-2 px-1.5 py-px font-mono text-[11px] leading-[18px]"
              >
                /
              </motion.kbd>
            </motion.button>
          ) : (
            <motion.div
              key="panel"
              role="dialog"
              aria-modal="true"
              aria-label="Command menu"
              layoutId="command-palette"
              transition={morph}
              style={{ borderRadius: 18 }}
              className="border-line absolute -top-2 -right-2 z-50 flex max-h-[min(440px,calc(100dvh-96px))] w-[min(420px,calc(100vw-32px))] flex-col overflow-hidden border bg-paper shadow-[var(--shadow-2)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-line flex items-center gap-3 border-b px-4 py-3.5">
                <motion.span layoutId="command-icon" transition={morph} className="text-ink-3 flex">
                  <Search size={17} strokeWidth={1.75} />
                </motion.span>
                <div className="relative flex flex-1 items-center">
                  <input
                    ref={inputRef}
                    type="text"
                    role="combobox"
                    aria-expanded="true"
                    aria-controls={listId}
                    aria-activedescendant={activeId}
                    aria-label="Search commands"
                    autoComplete="off"
                    spellCheck={false}
                    className="text-ink w-full bg-transparent text-[15px] outline-none"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  {!query && (
                    <motion.span
                      layoutId="command-text"
                      transition={morph}
                      className="text-ink-3 pointer-events-none absolute left-0 text-[15px]"
                    >
                      {placeholder}
                    </motion.span>
                  )}
                </div>
                <motion.kbd
                  layoutId="command-key"
                  transition={morph}
                  className="border-line text-ink-3 rounded-md border bg-paper-2 px-1.5 py-px font-mono text-[11px] leading-[18px]"
                >
                  esc
                </motion.kbd>
              </div>

              <div id={listId} role="listbox" aria-label="Commands" className="flex-1 overflow-y-auto overscroll-contain p-1.5">
                {filteredItems.length === 0 ? (
                  <p className="text-ink-3 px-3 py-10 text-center text-sm">Nothing matches “{query}”.</p>
                ) : (
                  sections.map((section) => (
                    <div key={section.name} role="group" aria-label={section.name} className="py-1">
                      <p className="text-ink-3 px-3 pt-2 pb-1.5 font-mono text-[11px]">{section.name}</p>
                      {section.items.map((item) => {
                        const index = filteredItems.indexOf(item);
                        const active = index === activeIndex;
                        return (
                          <div
                            key={item.id}
                            id={`${listId}-${item.id}`}
                            role="option"
                            aria-selected={active}
                            onMouseMove={() => setActiveIndex(index)}
                            onClick={() => run(item)}
                            className={cn(
                              'relative flex cursor-pointer items-center justify-between gap-4 rounded-[10px] px-3 py-2.5 text-[14px]',
                              active ? 'text-ink' : 'text-ink-2',
                            )}
                          >
                            {active && (
                              <motion.span
                                layoutId="command-active"
                                transition={{ type: 'spring', bounce: 0, visualDuration: 0.2 }}
                                className="bg-paper-2 absolute inset-0 rounded-[10px]"
                              />
                            )}
                            <span className="relative flex min-w-0 items-center gap-3">
                              <span className={cn('flex shrink-0', active ? 'text-ink' : 'text-ink-3')}>{item.icon}</span>
                              <span className="truncate">{item.title}</span>
                            </span>
                            {item.hint && (
                              <span className="text-ink-3 relative shrink-0 font-mono text-[11px]">{item.hint}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              <div className="border-line text-ink-3 flex items-center gap-4 border-t px-4 py-2.5 font-mono text-[11px]">
                <span>↑↓ move</span>
                <span>enter open</span>
                <span className="ml-auto">⌘K or /</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
