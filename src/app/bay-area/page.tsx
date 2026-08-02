import type { Metadata } from "next";
import RegionLanding from "@/components/home/RegionLanding";
import { regions } from "@/lib/regions";

export const metadata: Metadata = {
  title: regions.bay_area.seoTitle,
  description: regions.bay_area.seoDescription,
  alternates: {
    canonical: "/bay-area",
  },
  openGraph: {
    title: `${regions.bay_area.seoTitle} | iBirdChef`,
    description: regions.bay_area.seoDescription,
    url: "/bay-area",
  },
};

export default function BayAreaPage() {
  return <RegionLanding regionId="bay_area" />;
}
