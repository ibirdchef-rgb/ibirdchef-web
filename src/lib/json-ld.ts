import { getSiteUrl, siteConfig, type OperatingLocation } from "@/lib/site";

function postalAddress(location: OperatingLocation) {
  return {
    "@type": "PostalAddress" as const,
    streetAddress: location.streetAddress,
    addressLocality: location.addressLocality,
    addressRegion: location.addressRegion,
    ...(location.postalCode ? { postalCode: location.postalCode } : {}),
    addressCountry: location.addressCountry,
  };
}

export function buildCatererJsonLd() {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "Caterer",
    name: siteConfig.name,
    alternateName: siteConfig.positioning,
    description: siteConfig.description,
    url: siteUrl,
    image: `${siteUrl}/ibirdchef-hero.jpg`,
    logo: `${siteUrl}/ibirdchef-logo.jpeg`,
    telephone: siteConfig.phoneHref.replace("tel:", ""),
    email: siteConfig.emailDisplay,
    servesCuisine: "South Asian",
    founder: {
      "@type": "Person",
      name: siteConfig.chef,
    },
    address: siteConfig.locations.map(postalAddress),
    location: siteConfig.locations.map((location) => ({
      "@type": "Place",
      name: location.schemaName,
      address: postalAddress(location),
    })),
    areaServed: [
      ...siteConfig.serviceAreas.map((name) => ({
        "@type": "Place",
        name,
      })),
      { "@type": "Place", name: "Eastside" },
      { "@type": "Place", name: "Greater Seattle" },
      { "@type": "Place", name: "San Francisco Bay Area" },
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: siteConfig.emailDisplay,
      telephone: siteConfig.phoneHref.replace("tel:", ""),
      areaServed: ["US"],
      availableLanguage: ["English"],
    },
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
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value);
}
