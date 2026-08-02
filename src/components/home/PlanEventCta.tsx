"use client";

import { startTransition, useEffect, useState } from "react";
import InquiryForm from "@/components/InquiryForm";
import { OPEN_INQUIRY_FORM_EVENT } from "@/lib/inquiry-form-gate";
import { siteConfig } from "@/lib/site";
import type { PageSource } from "@/lib/event-inquiry";
import type { ServiceRegion } from "@/lib/regions";

type PlanEventCtaProps = {
  pageSource?: PageSource;
  defaultServiceRegion?: ServiceRegion | "";
  heading?: string;
  description?: string;
  /** When true, hide the full inquiry form until the guest explicitly opens it. */
  gateInquiryForm?: boolean;
};

function shouldOpenFromLocation(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  if (params.get("inquiry") === "open") return true;
  if (params.get("askDishes")?.trim()) return true;
  if (params.get("askDish")?.trim()) return true;
  if (params.get("conciergeSession")?.trim()) return true;
  if (window.location.hash === "#contact") return true;
  return false;
}

export default function PlanEventCta({
  pageSource = "homepage",
  defaultServiceRegion = "",
  heading = "Tell us about your event.",
  description = "Share your region, city, venue or ZIP, date, guest count, event type, and service style. We serve Greater Seattle and the San Francisco Bay Area.",
  gateInquiryForm = false,
}: PlanEventCtaProps) {
  const [formOpen, setFormOpen] = useState(!gateInquiryForm);

  useEffect(() => {
    if (!gateInquiryForm) return;

    const openForm = () => {
      startTransition(() => setFormOpen(true));
    };
    const syncOpenState = () => {
      if (shouldOpenFromLocation()) {
        openForm();
      }
    };

    syncOpenState();
    window.addEventListener("hashchange", syncOpenState);
    window.addEventListener("popstate", syncOpenState);
    window.addEventListener(OPEN_INQUIRY_FORM_EVENT, openForm);
    return () => {
      window.removeEventListener("hashchange", syncOpenState);
      window.removeEventListener("popstate", syncOpenState);
      window.removeEventListener(OPEN_INQUIRY_FORM_EVENT, openForm);
    };
  }, [gateInquiryForm]);

  const showForm = !gateInquiryForm || formOpen;

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
            className="inline-flex min-h-11 items-center font-semibold text-[var(--ivory-soft)] underline decoration-[var(--bronze)] underline-offset-4 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--bronze)]"
          >
            {siteConfig.phoneDisplay}
          </a>
          <a
            href={siteConfig.emailHref}
            className="inline-flex min-h-11 items-center font-semibold text-[var(--ivory-soft)] underline decoration-[var(--bronze)] underline-offset-4 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--bronze)]"
          >
            {siteConfig.emailDisplay}
          </a>
        </div>
      </div>

      {showForm ? (
        <div className="mt-8">
          <InquiryForm
            pageSource={pageSource}
            defaultServiceRegion={defaultServiceRegion}
          />
        </div>
      ) : (
        <div className="mt-8 rounded-3xl border border-[var(--navy)]/10 bg-[var(--ivory-soft)] px-6 py-8 sm:px-8">
          <p className="max-w-2xl text-base leading-7 text-[var(--ink-muted)]">
            Prefer to start with the Catering Concierge above, or open the
            inquiry form when you are ready to send your event details.
          </p>
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--bronze-dark)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--bronze)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--bronze-dark)]"
          >
            Open Inquiry Form
          </button>
        </div>
      )}
    </section>
  );
}
