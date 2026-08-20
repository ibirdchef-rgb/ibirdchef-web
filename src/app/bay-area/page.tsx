import type { Metadata } from "next";
import RegionLanding, {
  regionPageMetadata,
} from "@/components/home/RegionLanding";

export const metadata: Metadata = regionPageMetadata("bay_area");

export default function BayAreaPage() {
  return <RegionLanding regionId="bay_area" />;
}
