type AccordionItem = {
  title: string;
  content: React.ReactNode;
  defaultOpen?: boolean;
};

type AccordionProps = {
  items: AccordionItem[];
};

/**
 * Native <details>/<summary> — zero JavaScript, works with JS disabled.
 * Each section opens/closes independently.
 */
export function Accordion({ items }: AccordionProps) {
  return (
    <div className="divide-y divide-line dark:divide-line-dark border-t border-line dark:border-line-dark">
      {items.map((item) => (
        <details key={item.title} open={item.defaultOpen} className="group py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between text-label-caps text-charcoal dark:text-charcoal-dark [&::-webkit-details-marker]:hidden">
            {item.title}
            <span className="transition-transform group-open:rotate-180">⌄</span>
          </summary>
          <div className="mt-4 text-body-md text-charcoal dark:text-charcoal-dark">{item.content}</div>
        </details>
      ))}
    </div>
  );
}
