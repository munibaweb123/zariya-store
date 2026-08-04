import { Button } from "@/components/ui/Button";

const FEATURES = [
  {
    label: "Handpicked with love",
    description:
      "Every piece in our collection is chosen with an eye for detail and soulful design — nothing added just to fill a rack.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 4v3m0 10v3m8-8h-3M7 12H4m11.5-4.5-2 2m-7 7-2 2m0-11 2 2m7 7 2 2"
        />
      </svg>
    ),
  },
  {
    label: "Supporting Pakistani artisans",
    description:
      "We're proud to champion Pakistani craftsmanship and celebrate traditional techniques passed down through generations.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 13c0 4 3.5 7 8 7s8-3 8-7M4 13V9a2 2 0 0 1 2-2h1m9 0h1a2 2 0 0 1 2 2v4M9 7V5a2 2 0 0 1 4 0v2"
        />
      </svg>
    ),
  },
  {
    label: "Quality you can trust",
    description: "From fine fabrics to delicate finishing, quality is the standard behind every ZARIYA piece.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
        <circle cx="12" cy="10" r="7" />
        <path strokeLinecap="round" strokeLinejoin="round" d="m9 10 2 2 4-4M9 16.5 7.5 21 12 18.5 16.5 21 15 16.5" />
      </svg>
    ),
  },
];

export default function OurStoryPage() {
  return (
    <>
      <div className="bg-blush px-margin-mobile py-section-mobile text-center md:px-margin-desktop md:py-section-desktop">
        <h1 className="font-heading text-display-lg-mobile text-charcoal md:text-display-lg">
          Our Story
        </h1>
        <p className="mt-2 text-label-caps text-charcoal">Crafting heritage for the modern woman.</p>
      </div>

      <section className="flex flex-col gap-gutter px-margin-mobile py-section-mobile md:flex-row md:px-margin-desktop md:py-section-desktop md:gap-16">
        {/*
          No founder photography exists yet — same documented pattern as
          components/home/Hero.tsx: an empty bg-blush frame at the correct
          aspect ratio, no image, no icon, no placeholder text.
        */}
        <div className="aspect-4/5 w-full bg-blush md:aspect-auto md:flex-1" />

        <div className="flex flex-1 flex-col justify-center gap-4">
          <h2 className="font-heading text-headline-md-mobile text-charcoal md:text-headline-md">
            The Visionaries
          </h2>
          {/*
            Placeholder narrative copy for the store owners to confirm or
            replace — "two founders" is confirmed by CLAUDE.md's Users
            section, but the "friends" relationship detail and every other
            specific in this copy is illustrative, not verified.
          */}
          <p className="text-body-md text-charcoal">
            Founded by two friends with a shared passion for the intricate artistry of Pakistan,
            ZARIYA began as a way to bridge traditional craftsmanship with the contemporary
            wardrobe.
          </p>
          <p className="text-body-md text-charcoal">
            Growing up amidst vibrant textile markets and the rhythmic hum of handlooms, we saw
            heritage techniques and talent we didn&apos;t want to see fade. ZARIYA exists to keep
            that craftsmanship visible — so hand-embroidered motifs and hand-spun threads keep
            finding a home with the modern woman.
          </p>
          <p className="text-body-md text-charcoal">
            Our journey is one of curation, care, and quiet pride. We believe what you wear should
            be a reflection of where you come from, made for the life you&apos;re building today.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-gutter border-t border-line px-margin-mobile py-section-mobile md:grid-cols-3 md:px-margin-desktop md:py-section-desktop">
        {FEATURES.map((feature) => (
          <div key={feature.label} className="flex flex-col items-center gap-3 text-center text-charcoal">
            {feature.icon}
            <p className="text-body-md text-charcoal">{feature.label}</p>
            <p className="text-label-caps text-charcoal/60">{feature.description}</p>
          </div>
        ))}
      </section>

      <section className="bg-blush px-margin-mobile py-section-mobile text-center md:px-margin-desktop md:py-section-desktop">
        <p className="mx-auto max-w-2xl font-heading text-headline-md-mobile italic text-charcoal md:text-headline-md">
          &ldquo;We believe in beauty that tells a story, and every piece in ZARIYA carries a
          little of that heritage forward.&rdquo;
        </p>
        <p className="mt-4 text-label-caps text-charcoal/60">— The Founders</p>
      </section>

      <section className="flex flex-col items-center gap-6 px-margin-mobile py-section-mobile text-center md:px-margin-desktop md:py-section-desktop">
        <h2 className="font-heading text-headline-md-mobile text-charcoal md:text-headline-md">
          Explore our collections
        </h2>
        <Button href="/category/all">Shop Now</Button>
      </section>
    </>
  );
}
