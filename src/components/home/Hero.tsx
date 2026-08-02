"use client";

import Image from "next/image";
import Link from "next/link";
import RegionSelector from "@/components/RegionSelector";
import { useRegion } from "@/components/RegionProvider";
import { DUAL_MARKET_HEADLINE, regions } from "@/lib/regions";

export default function Hero() {
  const { region, ready } = useRegion();
  const selected = region ? regions[region] : null;
  const marketLine =
    ready && selected
      ? `Premium catering & private chef experiences in ${selected.label}`
      : DUAL_MARKET_HEADLINE;

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-[var(--navy)] text-white"
      aria-labelledby="hero-heading"
    >
      <div className="absolute inset-0">
        <Image
          src="/ibirdchef-hero.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[50%_40%] opacity-40"
          priority
          quality={75}
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(105deg,rgba(4,31,39,0.94)_0%,rgba(4,31,39,0.8)_48%,rgba(4,31,39,0.58)_100%)]"
          aria-hidden="true"
        />
      </div>

      <div className="relative mx-auto flex min-h-[min(90vh,48rem)] max-w-7xl flex-col justify-center px-6 py-16 lg:px-10 lg:py-24">
        <div className="max-w-3xl reveal-up">
          <p className="font-serif text-5xl font-semibold tracking-tight text-[var(--ivory-soft)] sm:text-6xl lg:text-7xl">
            iBirdChef
          </p>

          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--bronze)]">
            South Asian Cuisine Catering
          </p>

          <h1
            id="hero-heading"
            className="mt-6 font-serif text-3xl font-semibold leading-[1.12] tracking-tight text-[var(--ivory-soft)] sm:text-4xl lg:text-[2.75rem]"
          >
            {marketLine}
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-white/80 sm:text-lg">
            Custom South Asian menus for corporate workplaces, private dinners,
            and family celebrations—planned with dietary care and chef-led
            follow-up.
          </p>

          <div className="mt-8">
            <RegionSelector variant="hero" />
          </div>

          <div className="mt-9 flex w-full max-w-lg flex-col gap-3 sm:max-w-none sm:flex-row">
            <a
              href="#corporate"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--bronze)] px-7 text-sm font-semibold text-white transition hover:bg-[var(--bronze-dark)] sm:w-auto"
            >
              Corporate Catering
            </a>
            <Link
              href="/private-events"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-white/35 bg-white/5 px-7 text-sm font-semibold text-white transition hover:border-white/60 sm:w-auto"
            >
              Private & Family Events
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
