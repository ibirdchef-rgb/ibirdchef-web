import type { Metadata } from "next";
import RegionLanding, {
  regionPageMetadata,
} from "@/components/home/RegionLanding";

export const metadata: Metadata = regionPageMetadata("seattle");

export default function SeattlePage() {
  return <RegionLanding regionId="seattle" />;
}
