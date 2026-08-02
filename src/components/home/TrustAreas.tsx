"use client";

import Link from "next/link";
import { useRegion } from "@/components/RegionProvider";
import { regions } from "@/lib/regions";

const vendorNotes = [
  {
    title: "Aramark approved vendor",
    description:
      "Approved-vendor experience supporting professional corporate foodservice operations.",
  },
  {
    title: "Sodexo approved vendor",
    description:
      "Experience working within established corporate dining and event-service requirements.",
  },
] as const;

export default function TrustAreas() {
  const { region } = useRegion();
  const seattle = regions.seattle;
  const bay = regions.bay_area;
  const focus = region ? regions[region] : null;

  return (
    <section
      id="areas"
      className="border-b border-[var(--navy)]/10 texture-ivory"
      aria-labelledby="areas-heading"
    >
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--bronze-dark)]">
            Where We Serve
          </p>
          <h2
            id="areas-heading"
            className="mt-4 font-serif text-4xl font-semibold tracking-tight text-[var(--navy)] sm:text-5xl"
          >
            Greater Seattle and the San Francisco Bay Area.
          </h2>
          <p className="mt-5 text-lg leading-8 text-[var(--ink-muted)]">
            Choose your region anytime. Until then, we present both markets
            clearly—using only our approved service cities.
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <article className="texture-pacific border-t border-[var(--pacific)]/35 pt-8">
            <h3 className="font-serif text-2xl font-semibold text-[var(--navy)]">
              {seattle.label}
            </h3>
            <p className="mt-3 leading-7 text-[var(--ink-muted)]">
              {seattle.cities.join(" · ")} {seattle.surroundingLabel}.
            </p>
            <Link
              href={seattle.path}
              className="mt-5 inline-flex min-h-11 items-center font-semibold text-[var(--navy)] underline decoration-[var(--bronze)]/50 underline-offset-4 hover:decoration-[var(--bronze)]"
            >
              Explore Seattle Area
            </Link>
          </article>

          <article className="texture-california border-t border-[var(--california)]/45 pt-8">
            <h3 className="font-serif text-2xl font-semibold text-[var(--navy)]">
              {bay.label}
            </h3>
            <p className="mt-3 leading-7 text-[var(--ink-muted)]">
              {bay.cities.join(" · ")} {bay.surroundingLabel}.
            </p>
            <Link
              href={bay.path}
              className="mt-5 inline-flex min-h-11 items-center font-semibold text-[var(--navy)] underline decoration-[var(--bronze)]/50 underline-offset-4 hover:decoration-[var(--bronze)]"
            >
              Explore Bay Area
            </Link>
          </article>
        </div>

        {focus ? (
          <p className="mt-8 text-sm leading-6 text-[var(--ink-muted)]" aria-live="polite">
            Showing preference for {focus.shortLabel}. You can change this in the
            header anytime.
          </p>
        ) : null}

        <div className="mt-14 grid gap-8 md:grid-cols-2">
          {vendorNotes.map((note) => (
            <article
              key={note.title}
              className="border-t border-[var(--navy)]/15 pt-6"
            >
              <h3 className="text-lg font-semibold text-[var(--navy)]">
                {note.title}
              </h3>
              <p className="mt-3 leading-7 text-[var(--ink-muted)]">
                {note.description}
              </p>
            </article>
          ))}
        </div>

        <p className="mt-8 text-center text-xs leading-5 text-[var(--ink-muted)]">
          Approved-vendor status is presented as factual business experience and
          does not imply endorsement by the named organizations.
        </p>
      </div>
    </section>
  );
}
