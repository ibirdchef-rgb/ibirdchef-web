import Link from "next/link";
import PlanEventCta from "@/components/home/PlanEventCta";
import PlanningSteps from "@/components/home/PlanningSteps";
import RegionPageSync from "@/components/RegionPageSync";
import SiteShell from "@/components/SiteShell";
import { regions, type ServiceRegion } from "@/lib/regions";
import { siteConfig } from "@/lib/site";

export default function RegionLanding({ regionId }: { regionId: ServiceRegion }) {
  const region = regions[regionId];
  const texture =
    region.accentHint === "pacific" ? "texture-pacific" : "texture-california";
  const pageSource = regionId === "seattle" ? "seattle" : "bay-area";

  return (
    <SiteShell>
      <RegionPageSync region={regionId} />
      <main id="main-content">
        <section
          className={`relative overflow-hidden border-b border-[var(--navy)]/10 ${texture}`}
          aria-labelledby="region-heading"
        >
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
            <p className="font-serif text-4xl font-semibold tracking-tight text-[var(--navy)] sm:text-5xl">
              iBirdChef
            </p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--bronze-dark)]">
              {region.shortLabel}
            </p>
            <h1
              id="region-heading"
              className="mt-6 max-w-3xl font-serif text-4xl font-semibold leading-[1.1] tracking-tight text-[var(--navy)] sm:text-5xl"
            >
              {region.headline}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--ink-muted)]">
              {region.summary}
            </p>
            <p className="mt-4 text-sm font-medium text-[var(--navy)]">
              {region.cities.join(" · ")} {region.surroundingLabel}.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="#contact"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--bronze)] px-7 text-sm font-semibold text-white transition hover:bg-[var(--bronze-dark)]"
              >
                Plan an event in {region.shortLabel}
              </a>
              <Link
                href="/#menu"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--navy)]/20 bg-white/70 px-7 text-sm font-semibold text-[var(--navy)] transition hover:border-[var(--bronze)]"
              >
                View seasonal boxes
              </Link>
            </div>
          </div>
        </section>

        <section
          className="mx-auto max-w-7xl px-6 py-20 lg:px-10"
          aria-labelledby="local-points-heading"
        >
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--bronze-dark)]">
              Local Focus
            </p>
            <h2
              id="local-points-heading"
              className="mt-4 font-serif text-4xl font-semibold tracking-tight text-[var(--navy)] sm:text-5xl"
            >
              Planned for {region.label}.
            </h2>
            <p className="mt-5 text-lg leading-8 text-[var(--ink-muted)]">
              Regional logistics and pricing assumptions stay separate. Your
              quote is prepared after we review the details for this market.
            </p>
          </div>

          <ul className="mt-12 grid list-none gap-8 p-0 md:grid-cols-3">
            {region.localPoints.map((point) => (
              <li
                key={point.title}
                className="border-t border-[var(--bronze)]/40 pt-8"
              >
                <h3 className="font-serif text-2xl font-semibold text-[var(--navy)]">
                  {point.title}
                </h3>
                <p className="mt-4 leading-7 text-[var(--ink-muted)]">
                  {point.description}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <PlanningSteps />

        <section className="border-y border-[var(--navy)]/10 bg-[var(--ivory-soft)]">
          <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
            <p className="text-sm leading-7 text-[var(--ink-muted)]">
              Prefer the other market? Explore{" "}
              <Link
                href={regionId === "seattle" ? "/bay-area" : "/seattle"}
                className="font-semibold text-[var(--navy)] underline decoration-[var(--bronze)]/50 underline-offset-4"
              >
                {regionId === "seattle"
                  ? regions.bay_area.shortLabel
                  : regions.seattle.shortLabel}
              </Link>
              , or call{" "}
              <a
                href={siteConfig.phoneHref}
                className="font-semibold text-[var(--navy)] underline decoration-[var(--bronze)]/50 underline-offset-4"
              >
                {siteConfig.phoneDisplay}
              </a>
              .
            </p>
          </div>
        </section>

        <PlanEventCta
          pageSource={pageSource}
          defaultServiceRegion={regionId}
          heading={`Tell us about your ${region.shortLabel} event.`}
          description={`Share your city, venue or ZIP, date, guests, event type, and service style for ${region.label}. Outside listed cities may still be available after confirmation.`}
        />
      </main>
    </SiteShell>
  );
}
