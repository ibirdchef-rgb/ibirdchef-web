import Link from "next/link";
import { paths } from "@/lib/paths";
import { siteConfig } from "@/lib/site";

export default function CorporateBand() {
  return (
    <section
      id="corporate"
      className="border-y border-[var(--navy)]/10 bg-[var(--navy)] text-white"
      aria-labelledby="corporate-heading"
    >
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--bronze)]">
              Corporate Catering
            </p>
            <h2
              id="corporate-heading"
              className="mt-4 font-serif text-4xl font-semibold tracking-tight sm:text-5xl"
            >
              Built for workplace teams, events, and hospitality partners.
            </h2>
          </div>
          <div>
            <p className="text-lg leading-8 text-white/75">
              {siteConfig.mealsDeliveredNote} Breakfast, lunch, reception, and
              executive catering for offices across Greater Seattle and the San
              Francisco Bay Area.
            </p>
            <p className="mt-4 text-sm leading-6 text-white/70">
              {siteConfig.vendorStatus}
            </p>
            <p className="mt-4 text-sm leading-6 text-white/60">
              Final pricing is confirmed after we review your event details and
              operational requirements.
            </p>
            <Link
              href={paths.contact}
              className="mt-6 inline-flex min-h-12 items-center font-semibold text-[var(--ivory-soft)] underline decoration-[var(--bronze)] underline-offset-4 hover:text-white"
            >
              Request Catering
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
