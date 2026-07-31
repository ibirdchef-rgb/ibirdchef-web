"use client";

import { FormEvent, useId, useState } from "react";

const serviceTypes = [
  "Private Chef Dining",
  "Corporate Catering",
  "Special Events",
  "Other",
] as const;

const budgetRanges = [
  "Under $1,000",
  "$1,000 – $2,500",
  "$2,500 – $5,000",
  "$5,000 – $10,000",
  "$10,000+",
  "Not sure yet",
] as const;

const fieldClassName =
  "mt-2 min-h-12 w-full rounded-xl border border-[#241b15]/15 bg-white px-4 py-3 text-base text-[#241b15] outline-none transition placeholder:text-[#6e6259] focus:border-[#b8892d] focus:ring-2 focus:ring-[#b8892d]/30";

const labelClassName = "block text-sm font-semibold text-[#241b15]";

type SubmitState = "idle" | "submitting" | "success" | "error";

export default function InquiryForm() {
  const formId = useId();
  const [status, setStatus] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      eventDate: String(formData.get("eventDate") ?? ""),
      guestCount: String(formData.get("guestCount") ?? ""),
      eventLocation: String(formData.get("eventLocation") ?? ""),
      serviceType: String(formData.get("serviceType") ?? ""),
      estimatedBudget: String(formData.get("estimatedBudget") ?? ""),
      dietaryNeeds: String(formData.get("dietaryNeeds") ?? ""),
      message: String(formData.get("message") ?? ""),
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
        className="rounded-3xl border border-[#241b15]/10 bg-white p-8 shadow-sm sm:p-10"
        role="status"
        aria-live="polite"
      >
        <h3 className="font-serif text-2xl font-semibold text-[#241b15]">
          Thank you for your inquiry.
        </h3>
        <p className="mt-4 leading-7 text-[#6e6259]">
          Your message was sent to the iBirdChef team. We will follow up using
          the contact details you provided.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-8 inline-flex h-12 min-w-[11rem] items-center justify-center rounded-full border border-[#241b15]/20 bg-white px-7 text-sm font-semibold text-[#241b15] transition hover:border-[#b8892d]"
        >
          Submit another inquiry
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-[#241b15]/10 bg-white p-8 shadow-sm sm:p-10"
      aria-labelledby={`${formId}-title`}
    >
      <h3
        id={`${formId}-title`}
        className="font-serif text-2xl font-semibold text-[#241b15]"
      >
        Catering inquiry
      </h3>
      <p className="mt-3 leading-7 text-[#6e6259]">
        Share a few details about your event. Required fields are marked with an
        asterisk.
      </p>

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
          <label htmlFor={`${formId}-location`} className={labelClassName}>
            Event location <span aria-hidden="true">*</span>
          </label>
          <input
            id={`${formId}-location`}
            name="eventLocation"
            type="text"
            autoComplete="address-level2"
            required
            placeholder="City or venue"
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
            defaultValue=""
            disabled={status === "submitting"}
            className={fieldClassName}
          >
            <option value="" disabled>
              Select a service
            </option>
            {serviceTypes.map((type) => (
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
            {budgetRanges.map((range) => (
              <option key={range} value={range}>
                {range}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`${formId}-dietary`} className={labelClassName}>
            Dietary needs
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
        <p className="text-sm leading-6 text-[#5f534a]">
          Your inquiry is emailed to the iBirdChef team. Prefer to call or
          email directly? Use the contact links above this form.
        </p>
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex h-12 min-w-[11rem] shrink-0 items-center justify-center rounded-full bg-[#926b24] px-7 text-sm font-semibold text-white transition hover:bg-[#7e591c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7e591c] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {status === "submitting" ? "Sending…" : "Send inquiry"}
        </button>
      </div>
    </form>
  );
}
