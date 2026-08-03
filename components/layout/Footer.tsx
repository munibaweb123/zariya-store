import { Button } from "@/components/ui/Button";
import { NAV_LINKS } from "./nav-links";

// General support link — distinct from the order-specific wa.me deep link
// that frontend/04-product-detail-page owns in lib/whatsapp.ts.
const WHATSAPP_SUPPORT_URL = "https://wa.me/923000000000";

const HELP_ITEMS = ["Shipping & Delivery", "Returns", "FAQs"];

export function Footer() {
  return (
    <footer className="bg-charcoal text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-section-mobile px-margin-mobile py-section-mobile md:grid-cols-4 md:gap-8 md:px-margin-desktop md:py-section-desktop">
        <div className="col-span-2 md:col-span-1">
          <p className="font-heading text-headline-md-mobile">ZARIYA</p>
          <p className="mt-4 text-body-md text-white/70">
            Dresses, perfumes, beauty products, and handmade jewellery.
          </p>
        </div>

        <div>
          <p className="text-label-caps text-white/60">Shop</p>
          <ul className="mt-4 flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="text-body-md text-white/90">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-label-caps text-white/60">Help</p>
          <ul className="mt-4 flex flex-col gap-3">
            {HELP_ITEMS.map((item) => (
              <li key={item} className="text-body-md text-white/90">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-label-caps text-white/60">Contact</p>
          <div className="mt-4">
            <Button href={WHATSAPP_SUPPORT_URL} variant="secondary" className="border-white text-white">
              Chat on WhatsApp
            </Button>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-margin-mobile py-4 md:px-margin-desktop">
        <p className="text-center text-label-caps text-white/60 md:text-left">
          Cash on Delivery | Bank Transfer | JazzCash | Easypaisa
        </p>
      </div>
    </footer>
  );
}
