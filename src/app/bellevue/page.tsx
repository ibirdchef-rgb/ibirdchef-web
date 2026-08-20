import type { Metadata } from "next";
import RegionLanding from "@/components/home/RegionLanding";

export const metadata: Metadata = {
  title: "Corporate Catering in Bellevue",
  description:
    "Office lunch catering, corporate box meals, buffets, cultural menus and live stations in Bellevue and the Eastside from iBirdChef.",
  alternates: {
    canonical: "/bellevue",
  },
  openGraph: {
    title: "Corporate Catering in Bellevue | iBirdChef",
    description:
      "iBirdChef provides office catering, box meals, buffets and live stations for Bellevue workplaces and Eastside events.",
    url: "/bellevue",
    type: "website",
    images: [
      {
        url: "/ibirdchef-hero.jpg",
        alt: "Grilled skewers with rice and sides prepared by iBirdChef",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Corporate Catering in Bellevue | iBirdChef",
    description:
      "Office lunch catering, box meals, buffets and live stations in Bellevue and the Eastside.",
    images: ["/ibirdchef-hero.jpg"],
  },
};

export default function BellevuePage() {
  return (
    <RegionLanding
      regionId="seattle"
      pageSource="bellevue"
      focus={{
        city: "Bellevue",
        eyebrow: "Bellevue & Eastside",
        headline: "Corporate catering for Bellevue and the Eastside.",
        summary:
          "Office lunches, box meals, buffets, cultural menus, private events and live culinary stations for Bellevue workplaces and nearby Eastside offices.",
      }}
    />
  );
}
