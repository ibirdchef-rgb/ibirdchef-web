import type { Metadata } from "next";
import BusinessLocations from "@/components/BusinessLocations";
import CtaButtons from "@/components/CtaButtons";
import PlanEventCta from "@/components/home/PlanEventCta";
import SiteShell from "@/components/SiteShell";
import { contactHref } from "@/lib/paths";
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
        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--bronze-dark)]">
            Contact
          </p>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl font-semibold tracking-tight text-[var(--navy)] sm:text-5xl">
            Request catering, get a quote, or book a tasting.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--ink-muted)]">
            Workplace Experience teams, office managers, and event planners can
            reach iBirdChef at{" "}
            <a
              href={siteConfig.emailHref}
              className="font-semibold text-[var(--navy)] underline decoration-[var(--bronze)]/50 underline-offset-4"
            >
              {siteConfig.emailDisplay}
            </a>{" "}
            or {siteConfig.phoneDisplay}.
          </p>
          <CtaButtons variant="onLight" includeQuote className="mt-8" />
          <p className="mt-4 text-sm leading-6 text-[var(--ink-muted)]">
            Prefer a tasting first?{" "}
            <a
              href={contactHref("tasting")}
              className="font-semibold text-[var(--navy)] underline decoration-[var(--bronze)]/50 underline-offset-4"
            >
              Book a tasting
            </a>
            .
          </p>
          <div className="mt-12">
            <h2 className="font-serif text-2xl font-semibold text-[var(--navy)]">
              Operating locations
            </h2>
            <BusinessLocations className="mt-5" />
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
