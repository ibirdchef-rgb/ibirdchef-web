import type { Metadata } from "next";
import Link from "next/link";
import BusinessLocations from "@/components/BusinessLocations";
import SiteShell from "@/components/SiteShell";
import { paths } from "@/lib/paths";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    absolute: "Catering Terms & Policies | iBirdChef",
  },
  description:
    "Review iBirdChef catering terms for estimates, bookings, payments, cancellations, guest counts, dietary requests, delivery and event service.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Catering Terms & Policies | iBirdChef",
    description:
      "Review iBirdChef catering terms for estimates, bookings, payments, cancellations, guest counts, dietary requests, delivery and event service.",
    url: "/terms",
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
    title: "Catering Terms & Policies | iBirdChef",
    description:
      "Review iBirdChef catering terms for estimates, bookings, payments, cancellations, guest counts, dietary requests, delivery and event service.",
    images: ["/ibirdchef-hero.jpg"],
  },
};

const sections = [
  {
    id: "inquiries-estimates",
    title: "Inquiries & Estimates",
    body: [
      "Website inquiries and estimates are not confirmed bookings.",
      "Availability, menu, staffing, delivery, rentals, venue requirements, and pricing are confirmed during event review.",
      "A booking becomes confirmed only after iBirdChef provides written confirmation and any required event-specific payment or approval requirements are satisfied.",
    ],
  },
  {
    id: "pricing-proposals",
    title: "Pricing & Proposals",
    body: [
      "Website and menu examples may include starting prices for selected items, or dishes that require a custom quote.",
      "Final pricing depends on guest count, menu, service style, staffing, location, delivery, rentals, market pricing, and other event requirements.",
      "The written proposal or quote controls the final event price.",
    ],
  },
  {
    id: "deposits-payments",
    title: "Deposits & Payments",
    body: [
      "Some events may require a deposit or advance payment to reserve the date. The amount, due date, remaining balance schedule, and payment terms will be stated in the written proposal or event agreement.",
    ],
  },
  {
    id: "cancellations-rescheduling",
    title: "Cancellations & Rescheduling",
    body: [
      "Cancellation, refund, credit, and rescheduling eligibility depends on the event date, committed food and product purchases, staffing, rentals, third-party costs, and the terms stated in the customer's approved proposal or event agreement.",
      "Please contact iBirdChef as soon as possible if your plans change.",
      "Event-specific written terms control cancellations, credits, refunds, and rescheduling.",
    ],
  },
  {
    id: "guest-count-menu-changes",
    title: "Guest Count & Menu Changes",
    body: [
      "Final guest count and menu deadlines are communicated during booking.",
      "Changes are subject to availability and may affect price.",
      "Late increases may not always be accommodated.",
      "The approved proposal or event agreement controls guest-count and menu changes.",
    ],
  },
  {
    id: "allergies-dietary",
    title: "Food Allergies & Dietary Requests",
    body: [
      "Please disclose allergies and dietary requirements before final menu approval.",
      "iBirdChef will review requested accommodations as part of event planning.",
      "Kitchens may handle common allergens. While iBirdChef will review requested dietary accommodations during event planning, we cannot guarantee an allergen-free environment or completely eliminate the risk of cross-contact.",
      "Customers with severe or life-threatening food allergies should inform iBirdChef before final menu approval so the request can be reviewed before the event is confirmed.",
      "Dietary and allergen information is provided for planning purposes and is not a guarantee that any menu item is completely free from a particular allergen.",
    ],
  },
  {
    id: "delivery-setup-service",
    title: "Delivery, Setup & Service",
    body: [
      "Delivery, setup, and service availability depend on location, venue access, timing, staffing, and event requirements.",
      "The customer or venue is responsible for providing accurate access, loading, and event instructions.",
      "Additional delivery, setup, or service requirements are documented in the written proposal.",
    ],
  },
  {
    id: "venue-third-party",
    title: "Venue & Third-Party Requirements",
    body: [
      "Venue rules, permits, loading restrictions, rentals, utilities, fire rules for live cooking, and other third-party requirements may affect service.",
      "Please disclose venue restrictions early so we can plan accurately.",
    ],
  },
  {
    id: "live-stations",
    title: "Live Stations",
    body: [
      "Live dosa, chaat, tandoor/grill, BBQ, or similar stations require event and venue review before confirmation.",
      "Not every venue allows open-flame or live cooking. Confirmation depends on venue rules, equipment, staffing, and the written proposal.",
    ],
  },
  {
    id: "outside-control",
    title: "Event Changes Outside iBirdChef Control",
    body: [
      "Severe weather, venue closure, government restrictions, utility failure, transportation interruption, emergencies, or other circumstances outside reasonable control may require changes to timing, menu, service style, or delivery.",
      "iBirdChef will communicate available options based on the situation and the event agreement.",
    ],
  },
] as const;

export default function TermsPage() {
  return (
    <SiteShell>
      <main id="main-content">
        <section className="border-b border-[var(--navy)]/10 bg-[var(--surface-contrast)]">
          <div className="mx-auto max-w-3xl px-6 section-y lg:px-10">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--bronze-dark)]">
              Policies
            </p>
            <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-[var(--navy)] sm:text-5xl">
              Catering Terms & Policies
            </h1>
            <p className="mt-4 text-base leading-7 text-[var(--ink-muted)] sm:text-lg">
              These terms explain how iBirdChef handles catering inquiries,
              proposals, and event planning. Event-specific written proposals and
              agreements control the final details for each booking.
            </p>
            <p className="mt-3 text-sm text-[var(--ink-muted)]">
              Last updated: August 20, 2026
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-10 lg:px-10 lg:py-12">
          <nav
            aria-label="Terms sections"
            className="rounded-2xl border border-[var(--navy)]/10 bg-[var(--ivory)] p-5"
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--bronze-dark)]">
              On this page
            </p>
            <ul className="mt-3 grid list-none gap-1 p-0 sm:grid-cols-2">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="inline-flex min-h-10 items-center text-sm font-medium text-[var(--navy)] underline decoration-[var(--bronze)]/40 underline-offset-4 hover:decoration-[var(--bronze)]"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#contact"
                  className="inline-flex min-h-10 items-center text-sm font-medium text-[var(--navy)] underline decoration-[var(--bronze)]/40 underline-offset-4 hover:decoration-[var(--bronze)]"
                >
                  Contact
                </a>
              </li>
            </ul>
          </nav>

          <div className="mt-10 space-y-10">
            {sections.map((section) => (
              <section key={section.id} id={section.id}>
                <h2 className="font-serif text-2xl font-semibold text-[var(--navy)]">
                  {section.title}
                </h2>
                <div className="mt-3 space-y-3 text-base leading-7 text-[var(--ink-muted)]">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}

            <section id="contact">
              <h2 className="font-serif text-2xl font-semibold text-[var(--navy)]">
                Contact
              </h2>
              <p className="mt-3 text-base leading-7 text-[var(--ink-muted)]">
                Questions about catering terms, proposals, or event planning can
                be sent to{" "}
                <a
                  href={siteConfig.emailHref}
                  className="font-semibold text-[var(--navy)] underline decoration-[var(--bronze)]/50 underline-offset-4"
                >
                  {siteConfig.emailDisplay}
                </a>{" "}
                or{" "}
                <a
                  href={siteConfig.phoneHref}
                  className="font-semibold text-[var(--navy)] underline decoration-[var(--bronze)]/50 underline-offset-4"
                >
                  {siteConfig.phoneDisplay}
                </a>
                .
              </p>
              <div className="mt-6">
                <h3 className="font-serif text-xl font-semibold text-[var(--navy)]">
                  Operating locations
                </h3>
                <BusinessLocations className="mt-4" />
              </div>
            </section>
          </div>

          <div className="mt-12 flex flex-col gap-3 sm:flex-row">
            <Link
              href={paths.contact}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--bronze)] px-7 text-sm font-semibold text-white transition hover:bg-[var(--bronze-dark)]"
            >
              Request Catering
            </Link>
            <Link
              href={paths.privacy}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--navy)]/20 bg-white px-7 text-sm font-semibold text-[var(--navy)] transition hover:border-[var(--bronze)]"
            >
              Privacy Policy
            </Link>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
