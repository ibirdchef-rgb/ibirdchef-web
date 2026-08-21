import type { Metadata } from "next";
import BusinessLocations from "@/components/BusinessLocations";
import CtaButtons from "@/components/CtaButtons";
import PlanEventCta from "@/components/home/PlanEventCta";
import SiteShell from "@/components/SiteShell";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Request Catering",
  description:
    "Request catering, get a quote, or book a tasting with iBirdChef. Email order@ibirdchef.com for corporate catering in Seattle, Bellevue, Redmond and the Bay Area.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact iBirdChef | Request Catering",
    description:
      "Request catering, get a quote, or book a tasting. iBirdChef serves Seattle, Bellevue, Redmond, the Eastside, and the Bay Area.",
    url: "/contact",
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
    title: "Contact iBirdChef | Request Catering",
    description:
      "Request catering, get a quote, or book a tasting with iBirdChef.",
    images: ["/ibirdchef-hero.jpg"],
  },
};

export default function ContactPage() {
  return (
    <SiteShell>
      <main id="main-content">
        <section className="border-b border-[var(--navy)]/10 bg-[var(--surface-contrast)]">
          <div className="mx-auto max-w-7xl px-6 section-y lg:px-10">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--bronze-dark)]">
              Contact
            </p>
            <h1 className="mt-3 max-w-3xl font-serif text-3xl font-semibold tracking-tight text-[var(--navy)] sm:text-5xl">
              Request catering, get a quote, or book a tasting.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--ink-muted)] sm:text-lg">
              Workplace Experience teams, office managers, and event planners
              can reach iBirdChef directly. We follow up after reviewing your
              event details.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <a
                href={siteConfig.emailHref}
                className="surface-card block p-5 transition hover:border-[var(--bronze)]"
              >
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--bronze-dark)]">
                  Catering email
                </p>
                <p className="mt-2 font-serif text-xl font-semibold text-[var(--navy)]">
                  {siteConfig.emailDisplay}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">
                  Best for quotes, tastings, and workplace catering requests.
                </p>
              </a>
              <a
                href={siteConfig.phoneHref}
                className="surface-card block p-5 transition hover:border-[var(--bronze)]"
              >
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--bronze-dark)]">
                  Phone
                </p>
                <p className="mt-2 font-serif text-xl font-semibold text-[var(--navy)]">
                  {siteConfig.phoneDisplay}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">
                  Call for timing, guest count, and service-style questions.
                </p>
              </a>
            </div>

            <CtaButtons variant="onLight" includeQuote className="mt-8" />

            <div className="mt-10">
              <h2 className="font-serif text-2xl font-semibold text-[var(--navy)]">
                Operating locations
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ink-muted)]">
                Use these business locations when planning delivery or production.
                They are not walk-in restaurants.
              </p>
              <BusinessLocations className="mt-5" />
            </div>
          </div>
        </section>

        <PlanEventCta
          pageSource="contact"
          heading="Tell us about your event."
          description="Share your region, city, venue or ZIP, date, guest count, and service style. We will follow up with a custom, chef-approved quote after review."
        />
      </main>
    </SiteShell>
  );
}
