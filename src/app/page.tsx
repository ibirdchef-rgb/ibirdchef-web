import type { Metadata } from "next";
import ConciergePreview from "@/components/home/ConciergePreview";
import CorporateBand from "@/components/home/CorporateBand";
import CuisineExperience from "@/components/home/CuisineExperience";
import Hero from "@/components/home/Hero";
import MenuHighlights from "@/components/home/MenuHighlights";
import PlanEventCta from "@/components/home/PlanEventCta";
import PlanningSteps from "@/components/home/PlanningSteps";
import ServiceCategories from "@/components/home/ServiceCategories";
import TrustAreas from "@/components/home/TrustAreas";
import SiteShell from "@/components/SiteShell";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    absolute: "Corporate Catering, Office Meals, Private Events & Live Stations | iBirdChef",
  },
  description: siteConfig.description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Corporate Catering, Office Meals, Private Events & Live Stations | iBirdChef",
    description: siteConfig.description,
    url: "/",
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
    title: "Corporate Catering, Office Meals, Private Events & Live Stations | iBirdChef",
    description: siteConfig.description,
    images: ["/ibirdchef-hero.jpg"],
  },
};

export default function Home() {
  return (
    <SiteShell>
      <main id="main-content">
        <Hero />
        <ServiceCategories />
        <CorporateBand />
        <MenuHighlights />
        <TrustAreas />
        <CuisineExperience />
        <PlanningSteps />
        <PlanEventCta pageSource="homepage" gateInquiryForm />
        <ConciergePreview />
      </main>
    </SiteShell>
  );
}
