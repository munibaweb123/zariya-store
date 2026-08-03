import type { Metadata } from "next";
import { EB_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "../globals.css";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";

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

export const metadata: Metadata = {
  title: "ZARIYA",
  description:
    "Dresses, perfumes, beauty products, and handmade jewellery — cash on delivery, confirmed over WhatsApp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${ebGaramond.variable} ${plusJakartaSans.variable}`}>
      <body>
        <div className="bg-maroon">
          <p className="mx-auto max-w-7xl px-margin-mobile py-2 text-center text-label-caps text-white md:px-margin-desktop">
            FREE DELIVERY ON ORDERS ABOVE RS. 3,000 | CASH ON DELIVERY AVAILABLE
          </p>
        </div>
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  );
}
