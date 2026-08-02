import ConciergePreview from "@/components/home/ConciergePreview";
import CorporateBand from "@/components/home/CorporateBand";
import CuisineExperience from "@/components/home/CuisineExperience";
import Hero from "@/components/home/Hero";
import PlanEventCta from "@/components/home/PlanEventCta";
import PlanningSteps from "@/components/home/PlanningSteps";
import ServiceCategories from "@/components/home/ServiceCategories";
import TrustAreas from "@/components/home/TrustAreas";
import MenuSection from "@/components/MenuSection";
import SiteShell from "@/components/SiteShell";

export default function Home() {
  return (
    <SiteShell>
      <main id="main-content">
        <Hero />
        <TrustAreas />
        <ServiceCategories />
        <CorporateBand />
        <MenuSection />
        <CuisineExperience />
        <PlanningSteps />
        <ConciergePreview />
        <PlanEventCta pageSource="homepage" />
      </main>
    </SiteShell>
  );
}
