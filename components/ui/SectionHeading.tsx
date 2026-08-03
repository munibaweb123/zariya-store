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
      <h2 className="font-heading text-headline-md-mobile text-charcoal md:text-headline-md">
        {title}
      </h2>
      {link && (
        <Link href={link.href} className="text-label-caps text-charcoal hover:text-maroon">
          {link.label}
        </Link>
      )}
    </div>
  );
}
