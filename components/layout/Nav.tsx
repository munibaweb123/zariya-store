import Link from "next/link";
import { MobileMenu } from "./MobileMenu";
import { NavCartBadge } from "./NavCartBadge";
import { NAV_LINKS } from "./nav-links";

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-margin-mobile py-4 md:px-margin-desktop">
        <div className="flex items-center gap-gutter">
          <MobileMenu />
          <Link
            href="/"
            className="font-heading text-headline-md-mobile text-charcoal md:text-headline-md"
          >
            ZARIYA
          </Link>
        </div>

        <nav aria-label="Main" className="hidden md:flex md:items-center md:gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-label-caps text-charcoal hover:text-maroon"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Search"
            className="flex h-11 w-11 items-center justify-center"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
              <circle cx="11" cy="11" r="6" />
              <path strokeLinecap="round" d="m20 20-3.5-3.5" />
            </svg>
          </button>
          <NavCartBadge />
        </div>
      </div>
    </header>
  );
}
