import Link from "next/link";
import BusinessLocations from "@/components/BusinessLocations";
import { contactHref, paths } from "@/lib/paths";
import { siteConfig } from "@/lib/site";

export default function SiteFooter() {
  return (
    <footer className="border-t border-[var(--navy)]/10 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 text-sm text-[var(--ink-muted)] lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="font-serif text-2xl font-semibold text-[var(--navy)]">
              iBirdChef
            </p>
            <p className="mt-2 max-w-xl leading-7">
              {siteConfig.tagline}. Serving Seattle, Bellevue, Redmond, the
              Eastside, and the San Francisco Bay Area.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6">
              <a
                href={siteConfig.phoneHref}
                className="inline-flex min-h-11 items-center font-medium text-[var(--navy)] underline decoration-[var(--bronze)]/50 underline-offset-4 transition hover:decoration-[var(--bronze)]"
              >
                {siteConfig.phoneDisplay}
              </a>
              <a
                href={siteConfig.emailHref}
                className="inline-flex min-h-11 items-center font-medium text-[var(--navy)] underline decoration-[var(--bronze)]/50 underline-offset-4 transition hover:decoration-[var(--bronze)]"
              >
                {siteConfig.emailDisplay}
              </a>
            </div>
          </div>
          <BusinessLocations compact />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6">
          <Link
            href={paths.contact}
            className="inline-flex min-h-11 items-center font-medium text-[var(--navy)] underline decoration-[var(--bronze)]/50 underline-offset-4 transition hover:decoration-[var(--bronze)]"
          >
            Request Catering
          </Link>
          <Link
            href={contactHref("quote")}
            className="inline-flex min-h-11 items-center font-medium text-[var(--navy)] underline decoration-[var(--bronze)]/50 underline-offset-4 transition hover:decoration-[var(--bronze)]"
          >
            Get a Quote
          </Link>
          <Link
            href={contactHref("tasting")}
            className="inline-flex min-h-11 items-center font-medium text-[var(--navy)] underline decoration-[var(--bronze)]/50 underline-offset-4 transition hover:decoration-[var(--bronze)]"
          >
            Book a Tasting
          </Link>
          <Link
            href={paths.menu}
            className="inline-flex min-h-11 items-center font-medium text-[var(--navy)] underline decoration-[var(--bronze)]/50 underline-offset-4 transition hover:decoration-[var(--bronze)]"
          >
            Menu
          </Link>
          <Link
            href={paths.seattle}
            className="inline-flex min-h-11 items-center font-medium text-[var(--navy)] underline decoration-[var(--bronze)]/50 underline-offset-4 transition hover:decoration-[var(--bronze)]"
          >
            Seattle Area
          </Link>
          <Link
            href={paths.bellevue}
            className="inline-flex min-h-11 items-center font-medium text-[var(--navy)] underline decoration-[var(--bronze)]/50 underline-offset-4 transition hover:decoration-[var(--bronze)]"
          >
            Bellevue
          </Link>
          <Link
            href={paths.bayArea}
            className="inline-flex min-h-11 items-center font-medium text-[var(--navy)] underline decoration-[var(--bronze)]/50 underline-offset-4 transition hover:decoration-[var(--bronze)]"
          >
            Bay Area
          </Link>
          <Link
            href={paths.privateEvents}
            className="inline-flex min-h-11 items-center font-medium text-[var(--navy)] underline decoration-[var(--bronze)]/50 underline-offset-4 transition hover:decoration-[var(--bronze)]"
          >
            Private Events
          </Link>
          <Link
            href={paths.privacy}
            className="inline-flex min-h-11 items-center font-medium text-[var(--navy)] underline decoration-[var(--bronze)]/50 underline-offset-4 transition hover:decoration-[var(--bronze)]"
          >
            Privacy
          </Link>
        </div>

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <p>© 2026 iBirdChef. All rights reserved.</p>
          <p className="sm:max-w-md sm:text-right">
            Corporate catering, office meals, private events and live stations
            in Greater Seattle and the San Francisco Bay Area.
          </p>
        </div>
      </div>
    </footer>
  );
}
