import type { Metadata } from "next";
import { EB_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "../globals.css";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/components/cart/CartProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["500"],
  display: "swap",
  variable: "--font-eb-garamond",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-plus-jakarta-sans",
});

// Keep the storage key in sync with lib/theme/store.ts's THEME_STORAGE_KEY —
// this raw <script> can't import that TS constant.
const THEME_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem('zariya-theme-v1');var t=s==='dark'||s==='light'?s:null;if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}if(t==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`;

export const metadata: Metadata = {
  title: "Range Ronaq",
  description:
    "Dresses, perfumes, beauty products, and handmade jewellery — cash on delivery, confirmed over WhatsApp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${ebGaramond.variable} ${plusJakartaSans.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <ThemeProvider>
          <CartProvider>
            <div className="bg-maroon dark:bg-maroon-dark-solid">
              <p className="mx-auto max-w-7xl px-margin-mobile py-2 text-center text-label-caps text-white md:px-margin-desktop">
                FREE DELIVERY ON ORDERS ABOVE RS. 3,000 | CASH ON DELIVERY AVAILABLE
              </p>
            </div>
            <Nav />
            {children}
            <Footer />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
