import { Button } from "@/components/ui/Button";

/**
 * Hero imagery is intentionally absent until real marketing photography
 * exists — the image side renders as an empty bg-blush frame at the correct
 * dimensions, no image, no icon, no placeholder text. The hero is a
 * full-width composition with overlaid text where contrast and focal point
 * matter; substituting a portrait product thumbnail would verify a layout
 * that will never ship and would hide problems only real photography
 * reveals. An empty frame at correct dimensions verifies the layout
 * honestly. When photography exists, drop a static asset into /public and
 * reference it here, or add a hero image field to Sanity if the owners
 * should control it.
 */
export function Hero() {
  return (
    <section className="flex flex-col md:flex-row">
      <div className="flex flex-1 flex-col justify-center gap-4 bg-blush px-margin-mobile py-section-mobile md:px-margin-desktop md:py-section-desktop">
        <p className="text-label-caps text-maroon">Featured Collection</p>
        <h1 className="font-heading text-display-lg-mobile text-charcoal md:text-display-lg">
          New Eid Collection
        </h1>
        <p className="max-w-md text-body-md text-charcoal">
          Embrace the essence of tradition with our curated selection of ethereal silhouettes,
          intricate hand-embroidery, and timeless Pakistani craftsmanship designed for your most
          celebrated moments.
        </p>
        <div>
          <Button href="/category/dresses">Shop Collection</Button>
        </div>
      </div>
      <div className="aspect-4/5 w-full bg-blush md:aspect-auto md:flex-1" />
    </section>
  );
}
