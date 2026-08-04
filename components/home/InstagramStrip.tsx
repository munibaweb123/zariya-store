const PLACEHOLDER_COUNT = 6;

export function InstagramStrip() {
  return (
    <section className="px-margin-mobile py-section-mobile text-center md:px-margin-desktop md:py-section-desktop">
      <h2 className="font-heading text-headline-md-mobile text-charcoal md:text-headline-md">
        Follow us @zariya_heritage
      </h2>
      <p className="mt-2 text-body-md text-charcoal">
        Tag us to be featured in our lookbook
      </p>
      <div className="mt-8 flex gap-gutter overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] md:grid md:grid-cols-6 md:overflow-visible [&::-webkit-scrollbar]:hidden">
        {Array.from({ length: PLACEHOLDER_COUNT }).map((_, index) => (
          <div key={index} className="aspect-square w-32 flex-shrink-0 bg-blush md:w-auto" />
        ))}
      </div>
    </section>
  );
}
