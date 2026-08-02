"use client";

import { FormEvent, useEffect, useId, useMemo, useState } from "react";
import { useRegion } from "@/components/RegionProvider";
import {
  BUDGET_RANGES,
  CORPORATE_EVENT_TYPES,
  EVENT_CATEGORIES,
  EVENT_CATEGORY_LABELS,
  LEAD_SOURCES,
  PRIVATE_FAMILY_EVENT_TYPES,
  SERVICE_STYLES,
  SERVICE_TYPES,
  type EventCategory,
  type PageSource,
} from "@/lib/event-inquiry";
import {
  OUTSIDE_AREA_MESSAGE,
  regions,
  SERVICE_REGIONS,
  type ServiceRegion,
} from "@/lib/regions";

const fieldClassName =
  "mt-2 min-h-12 w-full rounded-xl border border-[var(--navy)]/15 bg-white px-4 py-3 text-base text-[var(--navy)] outline-none transition placeholder:text-[var(--ink-muted)] focus:border-[var(--bronze)] focus:ring-2 focus:ring-[var(--bronze)]/30";

const labelClassName = "block text-sm font-semibold text-[var(--navy)]";

type SubmitState = "idle" | "submitting" | "success" | "error";

export type InquiryFormProps = {
  title?: string;
  description?: string;
  submitLabel?: string;
  defaultEventCategory?: EventCategory;
  defaultServiceType?: (typeof SERVICE_TYPES)[number];
  defaultServiceRegion?: ServiceRegion | "";
  pageSource?: PageSource;
};

function eventTypesForCategory(category: EventCategory | ""): readonly string[] {
  if (category === "corporate") {
    return CORPORATE_EVENT_TYPES;
  }
  if (category === "personal_family" || category === "private_chef") {
    return PRIVATE_FAMILY_EVENT_TYPES;
  }
  return [...CORPORATE_EVENT_TYPES, ...PRIVATE_FAMILY_EVENT_TYPES];
}

export default function InquiryForm({
  title = "Catering inquiry",
  description = "Share a few details about your event. Required fields are marked with an asterisk.",
  submitLabel = "Send inquiry",
  defaultEventCategory,
  defaultServiceType,
  defaultServiceRegion = "",
  pageSource = "homepage",
}: InquiryFormProps) {
  const formId = useId();
  const { region: preferredRegion } = useRegion();
  const [status, setStatus] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [eventCategory, setEventCategory] = useState<EventCategory | "">(
    defaultEventCategory ?? "",
  );
  const [serviceRegion, setServiceRegion] = useState<ServiceRegion | "">(
    defaultServiceRegion || "",
  );
  const [eventCity, setEventCity] = useState("");
  const [customCity, setCustomCity] = useState("");

  useEffect(() => {
    if (!serviceRegion && (defaultServiceRegion || preferredRegion)) {
      setServiceRegion(defaultServiceRegion || preferredRegion);
    }
  }, [defaultServiceRegion, preferredRegion, serviceRegion]);

  const cityOptions = useMemo(() => {
    if (!serviceRegion) {
      return [] as string[];
    }
    return [...regions[serviceRegion].cities];
  }, [serviceRegion]);

  const showOutsideMessage =
    Boolean(serviceRegion) &&
    (eventCity === "__other__" ||
      (customCity.trim().length > 0 && eventCity === "__other__"));

  const eventTypeOptions = useMemo(
    () => eventTypesForCategory(eventCategory),
    [eventCategory],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const selectedCity = String(formData.get("eventCity") ?? "");
    const resolvedCity =
      selectedCity === "__other__"
        ? String(formData.get("customCity") ?? "").trim()
        : selectedCity;

    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      serviceRegion: String(formData.get("serviceRegion") ?? ""),
      eventCategory: String(formData.get("eventCategory") ?? ""),
      eventType: String(formData.get("eventType") ?? ""),
      eventDate: String(formData.get("eventDate") ?? ""),
      eventTime: String(formData.get("eventTime") ?? ""),
      eventCity: resolvedCity,
      venueOrZip: String(formData.get("venueOrZip") ?? ""),
      guestCount: String(formData.get("guestCount") ?? ""),
      cuisinePreference: String(formData.get("cuisinePreference") ?? ""),
      serviceStyle: String(formData.get("serviceStyle") ?? ""),
      serviceType: String(formData.get("serviceType") ?? ""),
      estimatedBudget: String(formData.get("estimatedBudget") ?? ""),
      dietaryNeeds: String(formData.get("dietaryNeeds") ?? ""),
      leadSource: String(formData.get("leadSource") ?? ""),
      contactConsent: formData.get("contactConsent") === "on",
      smsConsent: formData.get("smsConsent") === "on",
      message: String(formData.get("message") ?? ""),
      pageSource,
    };

    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        setStatus("error");
        setErrorMessage(
          data?.error ?? "Unable to send inquiry right now. Please try again.",
        );
        return;
      }

      form.reset();
      setEventCategory(defaultEventCategory ?? "");
      setServiceRegion(defaultServiceRegion || preferredRegion || "");
      setEventCity("");
      setCustomCity("");
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMessage(
        "Unable to reach the server. Please check your connection and try again.",
      );
    }
  }

  if (status === "success") {
    return (
      <div
        className="rounded-3xl border border-[var(--navy)]/10 bg-white p-8 shadow-sm sm:p-10"
        role="status"
        aria-live="polite"
      >
        <h3 className="font-serif text-2xl font-semibold text-[var(--navy)]">
          Thank you for your inquiry.
        </h3>
        <p className="mt-4 leading-7 text-[var(--ink-muted)]">
          Your message was sent to the iBirdChef team. We will follow up using
          the contact details you provided. Final pricing is confirmed after we
          review your event details and operational requirements.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-8 inline-flex h-12 min-w-[11rem] items-center justify-center rounded-full border border-[var(--navy)]/20 bg-white px-7 text-sm font-semibold text-[var(--navy)] transition hover:border-[var(--bronze)]"
        >
          Submit another inquiry
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-[var(--navy)]/10 bg-white p-8 shadow-sm sm:p-10"
      aria-labelledby={`${formId}-title`}
    >
      <h3
        id={`${formId}-title`}
        className="font-serif text-2xl font-semibold text-[var(--navy)]"
      >
        {title}
      </h3>
      <p className="mt-3 leading-7 text-[var(--ink-muted)]">{description}</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor={`${formId}-name`} className={labelClassName}>
            Name <span aria-hidden="true">*</span>
          </label>
          <input
            id={`${formId}-name`}
            name="name"
            type="text"
            autoComplete="name"
            required
            disabled={status === "submitting"}
            className={fieldClassName}
          />
        </div>

        <div>
          <label htmlFor={`${formId}-email`} className={labelClassName}>
            Email <span aria-hidden="true">*</span>
          </label>
          <input
            id={`${formId}-email`}
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={status === "submitting"}
            className={fieldClassName}
          />
        </div>

        <div>
          <label htmlFor={`${formId}-phone`} className={labelClassName}>
            Phone <span aria-hidden="true">*</span>
          </label>
          <input
            id={`${formId}-phone`}
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            disabled={status === "submitting"}
            className={fieldClassName}
          />
        </div>

        <div>
          <label htmlFor={`${formId}-service-region`} className={labelClassName}>
            Service region <span aria-hidden="true">*</span>
          </label>
          <select
            id={`${formId}-service-region`}
            name="serviceRegion"
            required
            value={serviceRegion}
            disabled={status === "submitting"}
            className={fieldClassName}
            onChange={(event) => {
              setServiceRegion(event.target.value as ServiceRegion | "");
              setEventCity("");
              setCustomCity("");
            }}
          >
            <option value="" disabled>
              Select a region
            </option>
            {SERVICE_REGIONS.map((id) => (
              <option key={id} value={id}>
                {regions[id].shortLabel}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`${formId}-event-city`} className={labelClassName}>
            Event city <span aria-hidden="true">*</span>
          </label>
          <select
            id={`${formId}-event-city`}
            name="eventCity"
            required
            value={eventCity}
            disabled={status === "submitting" || !serviceRegion}
            className={fieldClassName}
            onChange={(event) => setEventCity(event.target.value)}
          >
            <option value="" disabled>
              {serviceRegion ? "Select a city" : "Select a region first"}
            </option>
            {cityOptions.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
            <option value="__other__">Other / outside listed cities</option>
          </select>
        </div>

        {eventCity === "__other__" ? (
          <div>
            <label htmlFor={`${formId}-custom-city`} className={labelClassName}>
              City or community <span aria-hidden="true">*</span>
            </label>
            <input
              id={`${formId}-custom-city`}
              name="customCity"
              type="text"
              required
              value={customCity}
              onChange={(event) => setCustomCity(event.target.value)}
              disabled={status === "submitting"}
              placeholder="Enter your city"
              className={fieldClassName}
            />
          </div>
        ) : null}

        <div className={eventCity === "__other__" ? undefined : "sm:col-span-2"}>
          <label htmlFor={`${formId}-venue`} className={labelClassName}>
            Venue or ZIP <span aria-hidden="true">*</span>
          </label>
          <input
            id={`${formId}-venue`}
            name="venueOrZip"
            type="text"
            required
            disabled={status === "submitting"}
            placeholder="Venue name or ZIP code"
            className={fieldClassName}
          />
        </div>

        {showOutsideMessage ? (
          <p
            className="sm:col-span-2 rounded-xl border border-[var(--bronze)]/30 bg-[var(--ivory-soft)] px-4 py-3 text-sm leading-6 text-[var(--navy)]"
            role="status"
          >
            {OUTSIDE_AREA_MESSAGE}
          </p>
        ) : null}

        <div>
          <label htmlFor={`${formId}-event-category`} className={labelClassName}>
            Event category <span aria-hidden="true">*</span>
          </label>
          <select
            id={`${formId}-event-category`}
            name="eventCategory"
            required
            value={eventCategory}
            disabled={status === "submitting"}
            className={fieldClassName}
            onChange={(event) =>
              setEventCategory(event.target.value as EventCategory | "")
            }
          >
            <option value="" disabled>
              Select a category
            </option>
            {EVENT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {EVENT_CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`${formId}-event-type`} className={labelClassName}>
            Event type <span aria-hidden="true">*</span>
          </label>
          <select
            key={eventCategory || "all"}
            id={`${formId}-event-type`}
            name="eventType"
            required
            defaultValue=""
            disabled={status === "submitting"}
            className={fieldClassName}
          >
            <option value="" disabled>
              Select an event type
            </option>
            {eventTypeOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`${formId}-event-date`} className={labelClassName}>
            Event date <span aria-hidden="true">*</span>
          </label>
          <input
            id={`${formId}-event-date`}
            name="eventDate"
            type="date"
            required
            disabled={status === "submitting"}
            className={fieldClassName}
          />
        </div>

        <div>
          <label htmlFor={`${formId}-event-time`} className={labelClassName}>
            Event time
          </label>
          <input
            id={`${formId}-event-time`}
            name="eventTime"
            type="time"
            disabled={status === "submitting"}
            className={fieldClassName}
          />
        </div>

        <div>
          <label htmlFor={`${formId}-guest-count`} className={labelClassName}>
            Guest count <span aria-hidden="true">*</span>
          </label>
          <input
            id={`${formId}-guest-count`}
            name="guestCount"
            type="number"
            inputMode="numeric"
            min={1}
            required
            disabled={status === "submitting"}
            className={fieldClassName}
          />
        </div>

        <div>
          <label htmlFor={`${formId}-service-style`} className={labelClassName}>
            Service style <span aria-hidden="true">*</span>
          </label>
          <select
            id={`${formId}-service-style`}
            name="serviceStyle"
            required
            defaultValue=""
            disabled={status === "submitting"}
            className={fieldClassName}
          >
            <option value="" disabled>
              Select a style
            </option>
            {SERVICE_STYLES.map((style) => (
              <option key={style} value={style}>
                {style}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`${formId}-cuisine`} className={labelClassName}>
            Cuisine preference
          </label>
          <input
            id={`${formId}-cuisine`}
            name="cuisinePreference"
            type="text"
            placeholder="South Asian favorites, mixed menu, etc."
            disabled={status === "submitting"}
            className={fieldClassName}
          />
        </div>

        <div>
          <label htmlFor={`${formId}-service-type`} className={labelClassName}>
            Service type <span aria-hidden="true">*</span>
          </label>
          <select
            id={`${formId}-service-type`}
            name="serviceType"
            required
            defaultValue={defaultServiceType ?? ""}
            disabled={status === "submitting"}
            className={fieldClassName}
          >
            <option value="" disabled>
              Select a service
            </option>
            {SERVICE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`${formId}-budget`} className={labelClassName}>
            Estimated budget
          </label>
          <select
            id={`${formId}-budget`}
            name="estimatedBudget"
            defaultValue=""
            disabled={status === "submitting"}
            className={fieldClassName}
          >
            <option value="" disabled>
              Select a range
            </option>
            {BUDGET_RANGES.map((range) => (
              <option key={range} value={range}>
                {range}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={`${formId}-lead-source`} className={labelClassName}>
            How did you hear about us?
          </label>
          <select
            id={`${formId}-lead-source`}
            name="leadSource"
            defaultValue="Website"
            disabled={status === "submitting"}
            className={fieldClassName}
          >
            {LEAD_SOURCES.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`${formId}-dietary`} className={labelClassName}>
            Dietary needs / allergies
          </label>
          <input
            id={`${formId}-dietary`}
            name="dietaryNeeds"
            type="text"
            placeholder="Vegetarian, vegan, allergies, or other notes"
            disabled={status === "submitting"}
            className={fieldClassName}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`${formId}-message`} className={labelClassName}>
            Message <span aria-hidden="true">*</span>
          </label>
          <textarea
            id={`${formId}-message`}
            name="message"
            required
            rows={5}
            placeholder="Tell us about your event, menu preferences, and timing."
            disabled={status === "submitting"}
            className={`${fieldClassName} resize-y`}
          />
        </div>

        <div className="sm:col-span-2 space-y-3">
          <label className="flex items-start gap-3 text-sm leading-6 text-[var(--navy)]">
            <input
              type="checkbox"
              name="contactConsent"
              required
              disabled={status === "submitting"}
              className="mt-1 h-4 w-4 accent-[var(--bronze-dark)]"
            />
            <span>
              I agree that iBirdChef may contact me about this inquiry using the
              email and phone number I provided.{" "}
              <span aria-hidden="true">*</span>
            </span>
          </label>

          <label className="flex items-start gap-3 text-sm leading-6 text-[var(--navy)]">
            <input
              type="checkbox"
              name="smsConsent"
              disabled={status === "submitting"}
              className="mt-1 h-4 w-4 accent-[var(--bronze-dark)]"
            />
            <span>
              Optional: I agree to receive SMS follow-up about this inquiry.
            </span>
          </label>
        </div>
      </div>

      {status === "error" ? (
        <p
          className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {errorMessage}
        </p>
      ) : null}

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-[var(--ink-muted)]">
          Share your event details, iBirdChef follows up, and you receive a
          custom, chef-approved quote after review.
        </p>
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex h-12 min-w-[11rem] shrink-0 items-center justify-center rounded-full bg-[var(--bronze-dark)] px-7 text-sm font-semibold text-white transition hover:bg-[var(--bronze)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--bronze-dark)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {status === "submitting" ? "Sending…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
