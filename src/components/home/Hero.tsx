"use client";

import Image from "next/image";
import CtaButtons from "@/components/CtaButtons";
import RegionSelector from "@/components/RegionSelector";
import { useRegion } from "@/components/RegionProvider";
import { DUAL_MARKET_HEADLINE, regions } from "@/lib/regions";

export default function Hero() {
  const { region, ready } = useRegion();
  const selected = region ? regions[region] : null;
  const headline =
    ready && selected
      ? selected.id === "bay_area"
        ? "Corporate Catering for the Bay Area"
        : "Corporate Catering for Seattle & the Eastside"
      : DUAL_MARKET_HEADLINE;

  const supportingLine =
    ready && selected?.id === "bay_area"
      ? "Office lunches, box meals, buffets, cultural menus, private events and live culinary stations across Santa Clara, San Jose, Palo Alto, San Francisco and surrounding communities."
      : "Office lunches, box meals, buffets, cultural menus, private events and live culinary stations across Bellevue, Redmond, Seattle and surrounding areas.";

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-[var(--navy)] text-white"
      aria-labelledby="hero-heading"
    >
      <div className="absolute inset-0">
        <Image
          src="/ibirdchef-hero.jpg"
          alt="Grilled skewers with rice and sides prepared by iBirdChef"
          fill
          sizes="100vw"
          className="object-cover object-[50%_40%] opacity-40"
          priority
          quality={75}
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(105deg,rgba(8,47,53,0.94)_0%,rgba(11,61,68,0.82)_48%,rgba(11,61,68,0.58)_100%)]"
          aria-hidden="true"
        />
      </div>

      <div className="relative mx-auto flex min-h-[min(68vh,36rem)] max-w-7xl flex-col justify-center px-6 py-12 lg:px-10 lg:py-16">
        <div className="max-w-3xl reveal-up">
          <p className="font-serif text-5xl font-semibold tracking-tight text-[var(--ivory-soft)] sm:text-6xl lg:text-7xl">
            iBirdChef
          </p>

          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--bronze)]">
            Corporate Catering · Office Meals · Private Events · Live Stations
          </p>

          <h1
            id="hero-heading"
            className="mt-6 font-serif text-3xl font-semibold leading-[1.12] tracking-tight text-[var(--ivory-soft)] sm:text-4xl lg:text-[2.75rem]"
          >
            {headline}
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">
            {supportingLine}
          </p>

          <p className="mt-4 text-sm font-medium tracking-wide text-white/70">
            Seattle · Bellevue · Redmond · Eastside · Bay Area
          </p>

          <div className="mt-8">
            <RegionSelector variant="hero" />
          </div>

          <CtaButtons className="mt-9" />
        </div>
      </div>
    </section>
  );
}
