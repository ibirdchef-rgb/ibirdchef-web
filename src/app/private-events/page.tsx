import type { Metadata } from "next";
import Link from "next/link";
import InquiryForm from "@/components/InquiryForm";
import SiteHeader from "@/components/SiteHeader";
import { PRIVATE_FAMILY_EVENT_TYPES } from "@/lib/event-inquiry";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Private & Family Events",
  description:
    "Request a custom quote for birthdays, anniversaries, baby showers, graduations, housewarmings, religious and cultural celebrations, private dinners, and live cooking with iBirdChef.",
  alternates: {
    canonical: "/private-events",
  },
};

const highlights = [
  {
    title: "Birthdays and children’s birthdays",
    description:
      "Menus planned for the guest list, dietary needs, and the tone of the celebration.",
  },
  {
    title: "Anniversaries",
    description:
      "Private dining and catering shaped around a meaningful meal for two or a larger gathering.",
  },
  {
    title: "Baby showers",
    description:
      "Thoughtful South Asian menus with service styles that fit home and venue hosting.",
  },
  {
    title: "Graduations",
    description:
      "Flexible catering for family gatherings that mark the next chapter.",
  },
  {
    title: "Housewarming events",
    description:
      "Warm, shareable menus designed for welcoming guests into a new home.",
  },
  {
    title: "Family and holiday gatherings",
    description:
      "Holiday tables and family meals planned around tradition, timing, and guest comfort.",
  },
  {
    title: "Religious and cultural celebrations",
    description:
      "Cuisine and service planned with respect for the occasion and dietary practices.",
  },
  {
    title: "Private dinners and live cooking",
    description:
      "In-home private chef dining and live cooking experiences for intimate events.",
  },
] as const;

export default function PrivateEventsPage() {
  return (
    <div className="min-h-screen bg-[var(--ivory)] text-[var(--foreground)]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg"
      >
        Skip to main content
      </a>

      <SiteHeader />

      <main id="main-content">
        <section
          className="relative overflow-hidden bg-[var(--navy)] text-white"
          aria-labelledby="private-events-heading"
        >
          <div
            className="absolute inset-0 bg-[linear-gradient(120deg,rgba(4,31,39,0.96)_0%,rgba(4,31,39,0.88)_55%,rgba(6,43,53,0.82)_100%)]"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
            <p className="font-serif text-4xl font-semibold tracking-tight text-[var(--ivory-soft)] sm:text-5xl">
              iBirdChef
            </p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--bronze)]">
              Private & Family Events
            </p>
            <h1
              id="private-events-heading"
              className="mt-6 max-w-3xl font-serif text-4xl font-semibold leading-[1.08] tracking-tight text-[var(--ivory-soft)] sm:text-5xl lg:text-[3.2rem]"
            >
              Custom South Asian menus for the gatherings that matter.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">
              From birthdays and baby showers to religious celebrations and
              private dinners, every personal and family event receives a custom
              quote after we review your details — the same careful workflow we
              use for corporate catering.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="#request-quote"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--bronze)] px-7 text-sm font-semibold text-white transition hover:bg-[var(--bronze-dark)]"
              >
                Request a Custom Quote
              </a>
              <Link
                href="/#menu"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/35 bg-white/5 px-7 text-sm font-semibold text-white transition hover:border-white/60"
              >
                View seasonal boxes
              </Link>
            </div>
          </div>
        </section>

        <section
          className="mx-auto max-w-7xl px-6 py-20 lg:px-10"
          aria-labelledby="occasions-heading"
        >
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--bronze-dark)]">
              Occasions
            </p>
            <h2
              id="occasions-heading"
              className="mt-4 font-serif text-4xl font-semibold tracking-tight text-[var(--navy)] sm:text-5xl"
            >
              Celebrations we plan with care.
            </h2>
            <p className="mt-5 text-lg leading-8 text-[var(--ink-muted)]">
              Personal and family events are quoted individually. We do not
              publish fixed private-event pricing — your menu, guest count,
              service style, and location shape the proposal.
            </p>
          </div>

          <ul className="mt-12 grid list-none gap-8 p-0 md:grid-cols-2">
            {highlights.map((item) => (
              <li
                key={item.title}
                className="border-t border-[var(--bronze)]/40 pt-8"
              >
                <h3 className="font-serif text-2xl font-semibold text-[var(--navy)]">
                  {item.title}
                </h3>
                <p className="mt-4 leading-7 text-[var(--ink-muted)]">
                  {item.description}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-12 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--bronze-dark)]">
              Event types we commonly support
            </p>
            <ul className="mt-4 flex list-none flex-wrap gap-2 p-0">
              {PRIVATE_FAMILY_EVENT_TYPES.map((type) => (
                <li
                  key={type}
                  className="rounded-full border border-[var(--navy)]/15 bg-white px-4 py-2 text-sm text-[var(--navy)]"
                >
                  {type}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          className="border-y border-[var(--navy)]/10 bg-[var(--ivory-soft)]"
          aria-labelledby="process-heading"
        >
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
            <h2
              id="process-heading"
              className="font-serif text-3xl font-semibold tracking-tight text-[var(--navy)] sm:text-4xl"
            >
              How your quote is prepared
            </h2>
            <ol className="mt-8 grid list-none gap-8 p-0 md:grid-cols-3">
              <li className="border-t border-[var(--navy)]/15 pt-6">
                <p className="text-sm font-bold text-[var(--bronze-dark)]">01</p>
                <h3 className="mt-3 font-serif text-xl font-semibold text-[var(--navy)]">
                  Share your event details
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--ink-muted)]">
                  Tell us the occasion, date, guest count, location, cuisine
                  preferences, dietary needs, and service style.
                </p>
              </li>
              <li className="border-t border-[var(--navy)]/15 pt-6">
                <p className="text-sm font-bold text-[var(--bronze-dark)]">02</p>
                <h3 className="mt-3 font-serif text-xl font-semibold text-[var(--navy)]">
                  Lead follow-up
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--ink-muted)]">
                  Your inquiry is captured for follow-up so the team can qualify
                  details and keep the conversation moving.
                </p>
              </li>
              <li className="border-t border-[var(--navy)]/15 pt-6">
                <p className="text-sm font-bold text-[var(--bronze-dark)]">03</p>
                <h3 className="mt-3 font-serif text-xl font-semibold text-[var(--navy)]">
                  Custom quote after review
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--ink-muted)]">
                  Final pricing is confirmed after event requirements and
                  operational costs are reviewed — never as an automated instant
                  price.
                </p>
              </li>
            </ol>
          </div>
        </section>

        <section
          id="request-quote"
          className="mx-auto max-w-7xl px-6 py-20 lg:px-10"
          aria-labelledby="quote-heading"
        >
          <div className="bg-[var(--navy)] px-8 py-14 text-white sm:px-12">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--bronze)]">
              Request a Custom Quote
            </p>
            <h2
              id="quote-heading"
              className="mt-5 max-w-3xl font-serif text-4xl font-semibold tracking-tight sm:text-5xl"
            >
              Tell us about your celebration.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/80">
              No fixed private-event pricing is published on this page. Share
              your details below and we will prepare a custom quote for your
              gathering across {siteConfig.serviceAreas.slice(0, 3).join(", ")},
              and beyond.
            </p>
            <div className="mt-8 flex flex-col gap-3 text-base sm:flex-row sm:gap-x-8">
              <a
                href={siteConfig.phoneHref}
                className="inline-flex min-h-11 items-center font-semibold text-[var(--ivory-soft)] underline decoration-[var(--bronze)] underline-offset-4"
              >
                {siteConfig.phoneDisplay}
              </a>
              <a
                href={siteConfig.emailHref}
                className="inline-flex min-h-11 items-center font-semibold text-[var(--ivory-soft)] underline decoration-[var(--bronze)] underline-offset-4"
              >
                {siteConfig.emailDisplay}
              </a>
            </div>
          </div>

          <div className="mt-8">
            <InquiryForm
              title="Request a Custom Quote"
              description="Include the details below so we can qualify your event and prepare a thoughtful custom quote. Required fields are marked with an asterisk."
              submitLabel="Request a Custom Quote"
              defaultEventCategory="personal_family"
              defaultServiceType="Private & Family Events"
              pageSource="private-events"
            />
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--navy)]/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-[var(--ink-muted)] lg:px-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <p>© 2026 iBirdChef. All rights reserved.</p>
            <p className="sm:max-w-md sm:text-right">
              Private chef and catering services in Seattle, the Eastside, and
              the San Francisco Bay Area.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
            <a
              href={siteConfig.phoneHref}
              className="inline-flex min-h-11 items-center font-medium text-[var(--navy)] underline decoration-[var(--bronze)]/50 underline-offset-4"
            >
              {siteConfig.phoneDisplay}
            </a>
            <a
              href={siteConfig.emailHref}
              className="inline-flex min-h-11 items-center font-medium text-[var(--navy)] underline decoration-[var(--bronze)]/50 underline-offset-4"
            >
              {siteConfig.emailDisplay}
            </a>
            <Link
              href="/#menu"
              className="inline-flex min-h-11 items-center font-medium text-[var(--navy)] underline decoration-[var(--bronze)]/50 underline-offset-4"
            >
              Seasonal menu
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
