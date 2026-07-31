import type { Metadata } from "next";
import { Cormorant_Garamond, Source_Sans_3 } from "next/font/google";
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
    default:
      "iBirdChef | Seattle, Eastside & Bay Area Private Chef and Catering",
    template: "%s | iBirdChef",
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
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
    title:
      "iBirdChef | Seattle, Eastside & Bay Area Private Chef and Catering",
    description: siteConfig.description,
    images: [
      {
        url: "/ibirdchef-hero.jpg",
        alt: "Plated private chef meal prepared by iBirdChef",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "iBirdChef | Seattle, Eastside & Bay Area Private Chef and Catering",
    description: siteConfig.description,
    images: ["/ibirdchef-hero.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  category: "food",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Caterer",
  name: siteConfig.name,
  description: siteConfig.description,
  url: siteUrl,
  image: `${siteUrl}/ibirdchef-hero.jpg`,
  logo: `${siteUrl}/ibirdchef-logo.jpeg`,
  servesCuisine: "South Asian",
  founder: {
    "@type": "Person",
    name: siteConfig.chef,
  },
  areaServed: siteConfig.serviceAreas.map((name) => ({
    "@type": "Place",
    name,
  })),
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Catering services",
    itemListElement: siteConfig.services.map((service) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: service,
      },
    })),
  },
};

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
      <body className="flex min-h-full flex-col font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
