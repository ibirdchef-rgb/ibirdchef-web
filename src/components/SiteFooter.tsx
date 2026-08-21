import Link from "next/link";
import { contactHref, paths } from "@/lib/paths";
import { siteConfig } from "@/lib/site";

const exploreLinks = [
  { href: paths.contact, label: "Request Catering" },
  { href: contactHref("quote"), label: "Get a Quote" },
  { href: contactHref("tasting"), label: "Book a Tasting" },
  { href: paths.menu, label: "Menu" },
  { href: paths.services, label: "Services" },
  { href: paths.seattle, label: "Seattle Area" },
  { href: paths.bellevue, label: "Bellevue" },
  { href: paths.bayArea, label: "Bay Area" },
  { href: paths.privateEvents, label: "Private Events" },
  { href: paths.privacy, label: "Privacy" },
] as const;

export default function SiteFooter() {
  return (
    <footer className="bg-[var(--navy)] text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10 lg:px-10">
        <div>
          <p className="font-serif text-2xl font-semibold text-[var(--ivory-soft)]">
            iBirdChef
          </p>
          <p className="mt-3 max-w-xs text-sm leading-6 text-white/75">
            {siteConfig.shortTagline} for Seattle, Bellevue, Redmond, the
            Eastside, and the Bay Area.
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--bronze)]">
            Contact
          </p>
          <a
            href={siteConfig.phoneHref}
            className="mt-3 flex min-h-11 items-center font-semibold text-[var(--ivory-soft)] underline decoration-[var(--bronze)]/60 underline-offset-4"
          >
            {siteConfig.phoneDisplay}
          </a>
          <a
            href={siteConfig.emailHref}
            className="flex min-h-11 items-center font-semibold text-[var(--ivory-soft)] underline decoration-[var(--bronze)]/60 underline-offset-4"
          >
            {siteConfig.emailDisplay}
          </a>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--bronze)]">
            Locations
          </p>
          <div className="mt-3 space-y-3 text-sm leading-6 text-white/80">
            {siteConfig.locations.map((location) => (
              <p key={location.id}>
                <span className="font-semibold text-[var(--ivory-soft)]">
                  {location.label}
                </span>
                <br />
                {location.lines.join(", ")}
              </p>
            ))}
          </div>
          <p className="mt-3 text-xs leading-5 text-white/55">
            {siteConfig.locationDisclaimer}
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--bronze)]">
            Explore
          </p>
          <ul className="mt-3 grid list-none grid-cols-1 gap-1 p-0 sm:grid-cols-1">
            {exploreLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-10 items-center text-sm font-medium text-white/85 underline decoration-transparent underline-offset-4 transition hover:text-white hover:decoration-[var(--bronze)]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-5 text-xs leading-5 text-white/60 sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <p>© 2026 iBirdChef. All rights reserved.</p>
          <p>Corporate catering, office meals, private events and live stations.</p>
        </div>
      </div>
    </footer>
  );
}
