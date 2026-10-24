import { ArrowRight, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Announcement1Props {
  badge?: string;
  message: string;
  /** Shown below the sm breakpoint. */
  shortMessage?: string;
  linkLabel: string;
  href: string;
  onDismiss?: () => void;
}

export default function Announcement1({ badge = "New", message, shortMessage, linkLabel, href, onDismiss }: Announcement1Props) {
  return (
    <div className="border-line flex w-full items-center justify-center border-b">
      <div className="container flex h-10 items-center justify-between gap-3">
        <span aria-hidden className="hidden size-8 sm:block" />
        <div className="flex min-w-0 items-center gap-2.5 text-[13px]">
          <Badge className="bg-ink text-paper h-5 rounded-full px-2 font-mono text-[10.5px] font-normal tracking-[0.02em]">
            {badge}
          </Badge>
          <p className="text-ink-2 truncate">
            <span className="hidden sm:inline">{message}</span>
            <span className="sm:hidden">{shortMessage ?? message}</span>
          </p>
          <a href={href} className="group text-ink flex shrink-0 items-center gap-1 font-medium no-underline">
            <span className="before:bg-ink relative before:absolute before:-bottom-0.5 before:left-0 before:h-px before:w-full before:origin-right before:scale-x-0 before:transition-transform before:duration-300 before:ease-out group-hover:before:origin-left group-hover:before:scale-x-100">
              {linkLabel}
            </span>
            <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={1.75} />
          </a>
        </div>
        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss announcement"
            className="text-ink-3 hover:text-ink hover:bg-paper-2 flex size-8 shrink-0 items-center justify-center rounded-full transition-colors"
          >
            <X className="size-4" strokeWidth={1.75} />
          </button>
        ) : (
          <span aria-hidden className="size-8" />
        )}
      </div>
    </div>
  );
}
