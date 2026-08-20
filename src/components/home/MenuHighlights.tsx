import Link from "next/link";
import CtaButtons from "@/components/CtaButtons";
import { formatBoxPrice, seasonalBoxes } from "@/lib/menu";
import { paths } from "@/lib/paths";

export default function MenuHighlights() {
  return (
    <section
      id="menu"
      className="border-y border-[var(--navy)]/10 texture-ivory"
      aria-labelledby="menu-heading"
    >
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10 lg:py-16">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--bronze-dark)]">
            Catering Menu
          </p>
          <h2
            id="menu-heading"
            className="mt-3 font-serif text-4xl font-semibold tracking-tight text-[var(--navy)] sm:text-5xl"
          >
            Choose the catering style, then request a quote.
          </h2>
          <p className="mt-4 text-lg leading-7 text-[var(--ink-muted)]">
            A curated buying path for workplace meals, drop-off trays, buffets,
            cultural menus, live stations, and private events. The full dish
            list is available when you are ready to browse.
          </p>
        </div>

        <div className="mt-10 rounded-3xl border border-[var(--navy)]/10 bg-white/80 p-6 sm:p-8">
          <h3 className="font-serif text-2xl font-semibold text-[var(--navy)]">
            Corporate boxed lunches
          </h3>
          <p className="mt-2 text-sm font-semibold text-[var(--bronze-dark)]">
            {formatBoxPrice(18)}
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-muted)]">
            Seasonal boxes include rice, dal or a side, and a required
            vegetarian or protein entrée. Availability is confirmed after event
            review.
          </p>
          <ul className="mt-6 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4">
            {seasonalBoxes.map((box) => (
              <li
                key={box.id}
                className="rounded-2xl border border-[var(--navy)]/10 bg-[var(--ivory-soft)] px-4 py-4"
              >
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--bronze-dark)]">
                  {box.season}
                </p>
                <p className="mt-2 font-serif text-lg font-semibold text-[var(--navy)]">
                  {box.season} Boxed Lunch
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">
                  {box.entrée.vegetarian.name} or {box.entrée.protein.name}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          <article className="rounded-2xl border border-[var(--navy)]/10 bg-white/80 p-5">
            <h3 className="font-serif text-xl font-semibold text-[var(--navy)]">
              Live Dosa
            </h3>
            <p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">
              Chef-attended dosa station from the approved live-cooking offerings.
            </p>
            <Link
              href={`${paths.menu}?buy=live-stations`}
              className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-[var(--navy)] underline decoration-[var(--bronze)]/50 underline-offset-4"
            >
              View live stations
            </Link>
          </article>
          <article className="rounded-2xl border border-[var(--navy)]/10 bg-white/80 p-5">
            <h3 className="font-serif text-xl font-semibold text-[var(--navy)]">
              Live Chaat
            </h3>
            <p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">
              Live chaat and bites for receptions, cultural events, and office gatherings.
            </p>
          </article>
          <article className="rounded-2xl border border-[var(--navy)]/10 bg-white/80 p-5">
            <h3 className="font-serif text-xl font-semibold text-[var(--navy)]">
              Tandoor / Grill
            </h3>
            <p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">
              Tandoori, grill, and live BBQ/grill stations quoted after event review.
            </p>
          </article>
        </div>

        <div className="mt-10">
          <CtaButtons variant="onLight" />
        </div>
        <p className="mt-4 text-sm leading-6 text-[var(--ink-muted)]">
          Live-station examples currently offered include dosa, chaat, and
          tandoor/grill. Browse the{" "}
          <Link
            href={paths.menu}
            className="font-semibold text-[var(--navy)] underline decoration-[var(--bronze)]/50 underline-offset-4"
          >
            full catering menu
          </Link>{" "}
          when you want dish-level detail.
        </p>
      </div>
    </section>
  );
}
