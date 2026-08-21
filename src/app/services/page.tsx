import type { Metadata } from "next";
import Link from "next/link";
import CtaButtons from "@/components/CtaButtons";
import SiteShell from "@/components/SiteShell";
import { BUYING_CATEGORIES } from "@/lib/buying-categories";
import { paths } from "@/lib/paths";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Corporate Catering Services",
  description:
    "Corporate box meals, office catering, tray and drop-off service, buffets, cultural menus, live stations and private events from iBirdChef in Seattle, Bellevue, Redmond and the Bay Area.",
  alternates: {
    canonical: "/services",
  },
  openGraph: {
    title: "Corporate Catering Services | iBirdChef",
    description:
      "See how iBirdChef plans office meals, buffets, cultural events, live stations and private catering.",
    url: "/services",
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
    title: "Corporate Catering Services | iBirdChef",
    description:
      "See how iBirdChef plans office meals, buffets, cultural events, live stations and private catering.",
    images: ["/ibirdchef-hero.jpg"],
  },
};

export default function ServicesPage() {
  return (
    <SiteShell>
      <main id="main-content">
        <section className="mx-auto max-w-7xl px-6 section-y lg:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--bronze-dark)]">
            Services
          </p>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl font-semibold tracking-tight text-[var(--navy)] sm:text-5xl">
            Corporate catering, office meals, private events and live stations.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--ink-muted)]">
            iBirdChef plans South Asian and mixed-menu catering for workplace
            teams, cultural employee events, and private gatherings across
            Seattle, Bellevue, Redmond, the Eastside, and the Bay Area.
          </p>
          <CtaButtons variant="onLight" className="mt-9" />
        </section>

        <section
          className="mx-auto max-w-7xl px-6 pb-20 lg:px-10"
          aria-labelledby="service-list-heading"
        >
          <h2
            id="service-list-heading"
            className="font-serif text-3xl font-semibold text-[var(--navy)]"
          >
            Choose a catering style
          </h2>
          <ul className="mt-8 grid list-none gap-4 p-0 md:grid-cols-2 xl:grid-cols-3">
            {BUYING_CATEGORIES.map((category) => (
              <li
                key={category.id}
                className="surface-card p-6"
              >
                <h3 className="font-serif text-2xl font-semibold text-[var(--navy)]">
                  {category.title}
                </h3>
                <p className="mt-4 leading-7 text-[var(--ink-muted)]">
                  {category.description}
                </p>
                <Link
                  href={category.href}
                  className="mt-5 inline-flex min-h-11 items-center font-semibold text-[var(--navy)] underline decoration-[var(--bronze)]/50 underline-offset-4"
                >
                  View {category.title}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-8 max-w-3xl text-sm leading-6 text-[var(--ink-muted)]">
            {siteConfig.mealsDeliveredNote} {siteConfig.vendorStatus} Questions?
            Email{" "}
            <a
              href={siteConfig.emailHref}
              className="font-semibold text-[var(--navy)] underline decoration-[var(--bronze)]/50 underline-offset-4"
            >
              {siteConfig.emailDisplay}
            </a>{" "}
            or visit the{" "}
            <Link
              href={paths.contact}
              className="font-semibold text-[var(--navy)] underline decoration-[var(--bronze)]/50 underline-offset-4"
            >
              contact page
            </Link>
            .
          </p>
        </section>
      </main>
    </SiteShell>
  );
}
