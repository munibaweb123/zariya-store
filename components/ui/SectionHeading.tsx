import Link from "next/link";

type SectionHeadingProps = {
  title: string;
  link?: {
    href: string;
    label: string;
  };
};

export function SectionHeading({ title, link }: SectionHeadingProps) {
  return (
    <div className="flex items-baseline justify-between">
      <h2 className="font-heading text-headline-md-mobile text-charcoal dark:text-charcoal-dark md:text-headline-md">
        {title}
      </h2>
      {link && (
        <Link href={link.href} className="text-label-caps text-charcoal dark:text-charcoal-dark hover:text-maroon dark:hover:text-maroon-dark">
          {link.label}
        </Link>
      )}
    </div>
  );
}
