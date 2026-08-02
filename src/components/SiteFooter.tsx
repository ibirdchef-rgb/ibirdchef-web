import Link from "next/link";
import { siteConfig } from "@/lib/site";

export default function SiteFooter() {
  return (
    <footer className="border-t border-[var(--navy)]/10 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-[var(--ink-muted)] lg:px-10">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <p>© 2026 iBirdChef. All rights reserved.</p>
          <p className="sm:max-w-md sm:text-right">
            Premium catering and private-chef experiences in Greater Seattle and
            the San Francisco Bay Area.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6">
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
          <Link
            href="/seattle"
            className="inline-flex min-h-11 items-center font-medium text-[var(--navy)] underline decoration-[var(--bronze)]/50 underline-offset-4 transition hover:decoration-[var(--bronze)]"
          >
            Seattle Area
          </Link>
          <Link
            href="/bay-area"
            className="inline-flex min-h-11 items-center font-medium text-[var(--navy)] underline decoration-[var(--bronze)]/50 underline-offset-4 transition hover:decoration-[var(--bronze)]"
          >
            Bay Area
          </Link>
          <Link
            href="/private-events"
            className="inline-flex min-h-11 items-center font-medium text-[var(--navy)] underline decoration-[var(--bronze)]/50 underline-offset-4 transition hover:decoration-[var(--bronze)]"
          >
            Private & Family Events
          </Link>
          <Link
            href="/privacy"
            className="inline-flex min-h-11 items-center font-medium text-[var(--navy)] underline decoration-[var(--bronze)]/50 underline-offset-4 transition hover:decoration-[var(--bronze)]"
          >
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
