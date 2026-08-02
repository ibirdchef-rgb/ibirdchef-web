import InquiryForm from "@/components/InquiryForm";
import { siteConfig } from "@/lib/site";
import type { PageSource } from "@/lib/event-inquiry";
import type { ServiceRegion } from "@/lib/regions";

type PlanEventCtaProps = {
  pageSource?: PageSource;
  defaultServiceRegion?: ServiceRegion | "";
  heading?: string;
  description?: string;
};

export default function PlanEventCta({
  pageSource = "homepage",
  defaultServiceRegion = "",
  heading = "Tell us about your event.",
  description = "Share your region, city, venue or ZIP, date, guest count, event type, and service style. We serve Greater Seattle and the San Francisco Bay Area.",
}: PlanEventCtaProps) {
  return (
    <section
      id="contact"
      className="mx-auto max-w-7xl px-6 py-20 lg:px-10"
      aria-labelledby="contact-heading"
    >
      <div className="bg-[var(--navy)] px-8 py-14 text-white sm:px-12">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--bronze)]">
          Plan Your Event
        </p>
        <h2
          id="contact-heading"
          className="mt-5 max-w-3xl font-serif text-4xl font-semibold tracking-tight sm:text-5xl"
        >
          {heading}
        </h2>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-white/80">
          {description}
        </p>
        <div className="mt-8 flex flex-col gap-3 text-base sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8 sm:gap-y-3">
          <a
            href={siteConfig.phoneHref}
            className="inline-flex min-h-11 items-center font-semibold text-[var(--ivory-soft)] underline decoration-[var(--bronze)] underline-offset-4 transition hover:text-white"
          >
            {siteConfig.phoneDisplay}
          </a>
          <a
            href={siteConfig.emailHref}
            className="inline-flex min-h-11 items-center font-semibold text-[var(--ivory-soft)] underline decoration-[var(--bronze)] underline-offset-4 transition hover:text-white"
          >
            {siteConfig.emailDisplay}
          </a>
        </div>
      </div>

      <div className="mt-8">
        <InquiryForm
          pageSource={pageSource}
          defaultServiceRegion={defaultServiceRegion}
        />
      </div>
    </section>
  );
}
