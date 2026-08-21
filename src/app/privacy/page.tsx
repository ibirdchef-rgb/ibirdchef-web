import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import { paths } from "@/lib/paths";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How iBirdChef collects and uses contact and event details submitted through the catering website.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <SiteShell>
      <main id="main-content" className="mx-auto max-w-3xl px-6 py-12 lg:px-10 lg:py-16">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--bronze-dark)]">
          Legal
        </p>
        <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-[var(--navy)] sm:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-4 text-sm text-[var(--ink-muted)]">
          Last updated: August 20, 2026
        </p>

        <div className="mt-8 space-y-8 text-base leading-7 text-[var(--ink-muted)]">
          <section>
            <h2 className="font-serif text-2xl font-semibold text-[var(--navy)]">
              Who we are
            </h2>
            <p className="mt-3">
              {siteConfig.name} provides corporate catering, office meals, private
              events, cultural menus, and live culinary stations in Greater
              Seattle and the San Francisco Bay Area. This policy explains how
              we handle information submitted through ibirdchef.com.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-[var(--navy)]">
              Information we collect
            </h2>
            <p className="mt-3">
              When you request catering, request a quote, or book a tasting, we
              collect the details you provide, which may include:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>Name, email address, and phone number</li>
              <li>Event date, time, city, venue or ZIP, and guest count</li>
              <li>Service region, event type, service style, and menu notes</li>
              <li>Dietary needs, budget range, and how you heard about us</li>
              <li>Any message you include with the inquiry</li>
            </ul>
            <p className="mt-3">
              If you use the catering inquiry experience on this website, the
              same kinds of event and contact details may be collected so we can
              prepare an inquiry for follow-up.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-[var(--navy)]">
              How we use information
            </h2>
            <p className="mt-3">
              We use this information to respond to catering inquiries, prepare
              quotes, schedule tastings, confirm event details, and follow up
              about service. We do not sell personal information.
            </p>
            <p className="mt-3">
              Optional SMS follow-up is sent only if you check the SMS consent
              box on the inquiry form.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-[var(--navy)]">
              Browser storage
            </h2>
            <p className="mt-3">
              The website may store your selected service region in your
              browser so we can show Seattle Area or Bay Area preference on
              later visits. This stays on your device and is not required to
              submit an inquiry.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-[var(--navy)]">
              Sharing
            </h2>
            <p className="mt-3">
              Inquiry details are shared with the iBirdChef catering team that
              handles quotes and event planning. We may also use service
              providers that help us receive and store website inquiries. We do
              not share your information for unrelated marketing.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-[var(--navy)]">
              Retention and requests
            </h2>
            <p className="mt-3">
              We keep inquiry records as long as needed to plan and follow up
              on catering requests and related business records. You may ask us
              to correct or delete contact details we hold by emailing{" "}
              <a
                href={siteConfig.emailHref}
                className="font-semibold text-[var(--navy)] underline decoration-[var(--bronze)]/50 underline-offset-4"
              >
                {siteConfig.emailDisplay}
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-semibold text-[var(--navy)]">
              Contact
            </h2>
            <p className="mt-3">
              Privacy questions can be sent to {siteConfig.emailDisplay} or{" "}
              {siteConfig.phoneDisplay}. Operating locations are business
              addresses for catering operations, not public restaurants.
            </p>
          </section>
        </div>

        <p className="mt-8 text-base leading-7 text-[var(--ink-muted)]">
          Related:{" "}
          <Link
            href={paths.terms}
            className="font-semibold text-[var(--navy)] underline decoration-[var(--bronze)]/50 underline-offset-4"
          >
            Catering Terms
          </Link>
        </p>

        <p className="mt-8">
          <Link
            href={paths.contact}
            className="inline-flex min-h-12 items-center rounded-full bg-[var(--bronze)] px-7 text-sm font-semibold text-white transition hover:bg-[var(--bronze-dark)]"
          >
            Request Catering
          </Link>
        </p>
      </main>
    </SiteShell>
  );
}
