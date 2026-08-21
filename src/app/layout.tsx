import type { Metadata } from "next";
import { Cormorant_Garamond, Source_Sans_3 } from "next/font/google";
import { buildCatererJsonLd, serializeJsonLd } from "@/lib/json-ld";
import { getSiteUrl, siteConfig } from "@/lib/site";
import "./globals.css";

const displaySerif = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const bodySans = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Corporate Catering in Seattle, Bellevue & the Bay Area | iBirdChef",
    template: "%s | iBirdChef",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.chef }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: siteConfig.name,
    title: "Corporate Catering in Seattle, Bellevue & the Bay Area | iBirdChef",
    description: siteConfig.description,
    images: [
      {
        url: "/ibirdchef-hero.jpg",
        alt: "Grilled skewers with rice and sides prepared by iBirdChef",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Corporate Catering in Seattle, Bellevue & the Bay Area | iBirdChef",
    description: siteConfig.description,
    images: ["/ibirdchef-hero.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  category: "food",
};

const jsonLd = buildCatererJsonLd();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${displaySerif.variable} ${bodySans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
