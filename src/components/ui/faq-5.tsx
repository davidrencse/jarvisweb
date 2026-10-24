import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { FadeIn } from "@/components/FadeIn";
import { RevealText } from "@/components/RevealText";

export interface FaqItem {
  question: string;
  answer: React.ReactNode;
}

export interface FaqCategory {
  title: string;
  description?: React.ReactNode;
  items: FaqItem[];
}

export interface Faq5Props {
  /** Heading id for the section's aria-labelledby. */
  headingId: string;
  categories: FaqCategory[];
  className?: string;
}

export function Faq5({ headingId, categories, className }: Faq5Props) {
  return (
    <div className={cn("text-foreground w-full", className)}>
      <div className="flex flex-col gap-24">
        {categories.map((category, idx) => (
          <div
            key={idx}
            className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-16"
          >
            <div className="flex flex-col gap-5 lg:sticky lg:top-[calc(var(--nav-h)+48px)] lg:col-span-4">
              <RevealText
                id={idx === 0 ? headingId : undefined}
                as="h2"
                variant="blur"
                step={0.045}
                text={category.title}
                className="max-w-[12ch] text-[length:var(--text-4xl)] leading-[var(--leading-tight)] tracking-[var(--tracking-display)]"
              />
              {category.description && (
                <FadeIn delay={0.2} className="text-ink-2 max-w-[36ch] text-[length:var(--text-lg)] leading-normal">
                  {category.description}
                </FadeIn>
              )}
            </div>
            <FadeIn className="lg:col-span-8" delay={0.1}>
              <Accordion type="single" collapsible className="border-line w-full border-t">
                {category.items.map((item, itemIdx) => (
                  <AccordionItem
                    key={itemIdx}
                    value={`item-${idx}-${itemIdx}`}
                    className="border-line border-b last:border-b"
                  >
                    <AccordionTrigger className="font-display cursor-pointer py-6 text-left text-[length:var(--text-xl)] leading-snug font-[520] tracking-[-0.02em]">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-ink-2 max-w-[60ch] pb-7 text-[length:var(--text-base)] leading-relaxed lg:pr-12">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </FadeIn>
          </div>
        ))}
      </div>
    </div>
  );
}
