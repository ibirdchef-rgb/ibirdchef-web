import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "iBirdChef privacy policy page. Full policy text will be published once approved.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/privacy",
  },
};

/**
 * Route exists for Scope A, but policy copy is held until an approved draft
 * is provided. Do not invent privacy language from another project.
 */
export default function PrivacyPage() {
  return (
    <SiteShell>
      <main id="main-content" className="mx-auto max-w-3xl px-6 py-20 lg:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--bronze-dark)]">
          Legal
        </p>

        <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight text-[var(--navy)] sm:text-5xl">
          Privacy Policy
        </h1>

        <p className="mt-6 text-lg leading-8 text-[var(--ink-muted)]">
          The privacy policy for {siteConfig.name} is not published yet. This
          page is reserved for the approved policy text and will be updated
          when that draft is provided.
        </p>

        <p className="mt-4 text-base leading-7 text-[var(--ink-muted)]">
          Questions in the meantime? Contact us at{" "}
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

        <p className="mt-10">
          <Link
            href="/#contact"
            className="inline-flex min-h-12 items-center rounded-full bg-[var(--bronze)] px-7 text-sm font-semibold text-white transition hover:bg-[var(--bronze-dark)]"
          >
            Back to inquiry
          </Link>
        </p>
      </main>
    </SiteShell>
  );
}
