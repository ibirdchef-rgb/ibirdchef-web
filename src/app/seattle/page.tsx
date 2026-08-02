import type { Metadata } from "next";
import RegionLanding from "@/components/home/RegionLanding";
import { regions } from "@/lib/regions";

export const metadata: Metadata = {
  title: regions.seattle.seoTitle,
  description: regions.seattle.seoDescription,
  alternates: {
    canonical: "/seattle",
  },
  openGraph: {
    title: `${regions.seattle.seoTitle} | iBirdChef`,
    description: regions.seattle.seoDescription,
    url: "/seattle",
  },
};

export default function SeattlePage() {
  return <RegionLanding regionId="seattle" />;
}
