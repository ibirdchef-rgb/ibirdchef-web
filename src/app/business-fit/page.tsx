"use client";

import Image from "next/image";
import { FormEvent, useId, useState } from "react";
import type { BusinessFitReport } from "@/lib/business-fit/types";
import {
  BUSINESS_TYPES,
  CUISINES,
  FACILITY_SIZES,
  INVESTMENT_BUDGETS,
  OWNER_EXPERIENCE,
  SERVICE_MODELS,
} from "@/lib/business-fit/types";
import "./business-fit.css";

const LABELS = {
  businessType: {
    restaurant: "Restaurant",
    cafe: "Cafe",
    food_truck: "Food truck",
    ghost_kitchen: "Ghost kitchen",
    catering: "Catering",
    bakery: "Bakery",
    hybrid: "Hybrid concept",
  },
  cuisine: {
    american: "American",
    south_asian: "South Asian",
    east_asian: "East Asian",
    latin: "Latin",
    mediterranean: "Mediterranean",
    bakery_dessert: "Bakery / dessert",
    multi_cuisine: "Multi-cuisine",
    other: "Other / still deciding",
  },
  investmentBudget: {
    under_50k: "Under $50,000",
    "50_150k": "$50,000 – $150,000",
    "150_300k": "$150,000 – $300,000",
    "300_500k": "$300,000 – $500,000",
    over_500k: "Over $500,000",
    unknown: "Not sure yet",
  },
  ownerExperience: {
    none: "No food-service experience",
    some_food_service: "Some food-service experience",
    management: "Management experience",
    prior_owner: "Prior food-business owner",
  },
  facilitySize: {
    under_1000: "Under 1,000 sq ft",
    "1000_2000": "1,000 – 2,000 sq ft",
    "2000_4000": "2,000 – 4,000 sq ft",
    over_4000: "Over 4,000 sq ft",
    mobile_or_shared: "Mobile or shared / commissary",
    unknown: "Not sure yet",
  },
  serviceModel: {
    dine_in: "Dine-in",
    catering: "Catering",
    delivery: "Delivery",
    food_truck: "Food truck",
    ghost_kitchen: "Ghost kitchen",
    hybrid: "Hybrid",
  },
} as const;

type FormState = {
  zipCode: string;
  businessType: (typeof BUSINESS_TYPES)[number];
  cuisine: (typeof CUISINES)[number];
  investmentBudget: (typeof INVESTMENT_BUDGETS)[number];
  ownerExperience: (typeof OWNER_EXPERIENCE)[number];
  facilitySize: (typeof FACILITY_SIZES)[number];
  serviceModel: (typeof SERVICE_MODELS)[number];
  targetOpeningDate: string;
};

const initialForm: FormState = {
  zipCode: "",
  businessType: "cafe",
  cuisine: "american",
  investmentBudget: "150_300k",
  ownerExperience: "some_food_service",
  facilitySize: "under_1000",
  serviceModel: "dine_in",
  targetOpeningDate: "",
};

export default function BusinessFitPage() {
  const formId = useId();
  const [form, setForm] = useState<FormState>(initialForm);
  const [clientError, setClientError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<BusinessFitReport | null>(null);

  const fieldClass =
    "mt-1 w-full rounded-md border border-[var(--ans-navy)]/20 bg-white px-3 py-2 text-[var(--ans-navy)] shadow-sm focus:border-[var(--ans-gold)] focus:outline-none";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setClientError(null);
    setApiError(null);

    if (!/^\d{5}$/.test(form.zipCode.trim())) {
      setClientError("Enter a valid 5-digit U.S. ZIP code.");
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.targetOpeningDate)) {
      setClientError("Choose a valid target opening date.");
      return;
    }

    setLoading(true);
    setReport(null);
    try {
      const response = await fetch("/api/business-fit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...form,
          zipCode: form.zipCode.trim(),
        }),
      });
      const json = await response.json();
      if (!response.ok || !json.ok) {
        const issueText =
          json?.error?.issues?.map((issue: { message: string }) => issue.message).join(" ") ||
          json?.error?.message ||
          "Unable to generate the planning report.";
        setApiError(issueText);
        return;
      }
      setReport(json.report as BusinessFitReport);
    } catch {
      setApiError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ans-fit text-[var(--ans-navy)]">
      <header className="border-b border-[var(--ans-navy)]/10 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-5 py-4 sm:px-8">
          <Image
            src="/ans-food-service-os-logo.png"
            alt="ANS Food Service OS"
            width={220}
            height={70}
            priority
            className="h-14 w-auto"
          />
          <div className="sans min-w-0">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--ans-gold)]">
              Phase 1 planning prototype
            </p>
            <p className="truncate text-sm text-[var(--ans-navy-soft)]">
              Food Business Fit Report
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
        <section className="ans-no-print mb-10 max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--ans-navy)] sm:text-4xl">
            ANS Food Business Fit
          </h1>
          <p className="sans mt-3 text-base leading-relaxed text-[var(--ans-navy-soft)]">
            Clarify your concept, a preliminary startup range, likely opening timeline, major
            risks, and the validation work still required—before you invest. All outputs are
            planning estimates, not live market data or financial advice.
          </p>
        </section>

        <form
          onSubmit={onSubmit}
          className="ans-no-print grid gap-5 rounded-xl border border-[var(--ans-navy)]/10 bg-white/90 p-5 shadow-sm sm:p-8"
          noValidate
          aria-describedby={clientError || apiError ? `${formId}-error` : undefined}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="sans text-sm font-medium">
              ZIP code
              <input
                className={fieldClass}
                name="zipCode"
                inputMode="numeric"
                autoComplete="postal-code"
                maxLength={5}
                required
                value={form.zipCode}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    zipCode: event.target.value.replace(/\D/g, "").slice(0, 5),
                  }))
                }
                aria-invalid={Boolean(clientError?.includes("ZIP"))}
              />
            </label>

            <label className="sans text-sm font-medium">
              Target opening date
              <input
                className={fieldClass}
                type="date"
                name="targetOpeningDate"
                required
                value={form.targetOpeningDate}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, targetOpeningDate: event.target.value }))
                }
              />
            </label>

            <label className="sans text-sm font-medium">
              Business type
              <select
                className={fieldClass}
                value={form.businessType}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    businessType: event.target.value as FormState["businessType"],
                  }))
                }
              >
                {BUSINESS_TYPES.map((value) => (
                  <option key={value} value={value}>
                    {LABELS.businessType[value]}
                  </option>
                ))}
              </select>
            </label>

            <label className="sans text-sm font-medium">
              Cuisine
              <select
                className={fieldClass}
                value={form.cuisine}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    cuisine: event.target.value as FormState["cuisine"],
                  }))
                }
              >
                {CUISINES.map((value) => (
                  <option key={value} value={value}>
                    {LABELS.cuisine[value]}
                  </option>
                ))}
              </select>
            </label>

            <label className="sans text-sm font-medium">
              Investment budget
              <select
                className={fieldClass}
                value={form.investmentBudget}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    investmentBudget: event.target.value as FormState["investmentBudget"],
                  }))
                }
              >
                {INVESTMENT_BUDGETS.map((value) => (
                  <option key={value} value={value}>
                    {LABELS.investmentBudget[value]}
                  </option>
                ))}
              </select>
            </label>

            <label className="sans text-sm font-medium">
              Owner experience
              <select
                className={fieldClass}
                value={form.ownerExperience}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    ownerExperience: event.target.value as FormState["ownerExperience"],
                  }))
                }
              >
                {OWNER_EXPERIENCE.map((value) => (
                  <option key={value} value={value}>
                    {LABELS.ownerExperience[value]}
                  </option>
                ))}
              </select>
            </label>

            <label className="sans text-sm font-medium">
              Facility size
              <select
                className={fieldClass}
                value={form.facilitySize}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    facilitySize: event.target.value as FormState["facilitySize"],
                  }))
                }
              >
                {FACILITY_SIZES.map((value) => (
                  <option key={value} value={value}>
                    {LABELS.facilitySize[value]}
                  </option>
                ))}
              </select>
            </label>

            <label className="sans text-sm font-medium">
              Service model
              <select
                className={fieldClass}
                value={form.serviceModel}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    serviceModel: event.target.value as FormState["serviceModel"],
                  }))
                }
              >
                {SERVICE_MODELS.map((value) => (
                  <option key={value} value={value}>
                    {LABELS.serviceModel[value]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {(clientError || apiError) && (
            <p
              id={`${formId}-error`}
              role="alert"
              className="sans rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
            >
              {clientError || apiError}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="sans rounded-md bg-[var(--ans-navy)] px-5 py-2.5 text-sm font-semibold text-white transition enabled:hover:bg-[var(--ans-navy-soft)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Generating report…" : "Generate Fit Report"}
            </button>
            <p className="sans text-xs text-[var(--ans-navy-soft)]">
              No contact details collected. No leads or vendor requests are created.
            </p>
          </div>
        </form>

        {loading && (
          <p className="sans ans-no-print mt-6 text-sm text-[var(--ans-navy-soft)]" aria-live="polite">
            Building your Phase 1 planning estimate…
          </p>
        )}

        {report && (
          <article
            className="mt-10 space-y-8 rounded-xl border border-[var(--ans-navy)]/10 bg-white p-5 sm:p-8"
            aria-labelledby="fit-report-heading"
          >
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--ans-gold-soft)] pb-5">
              <div>
                <p className="sans text-xs uppercase tracking-[0.18em] text-[var(--ans-gold)]">
                  Planning estimate · v{report.reportVersion}
                </p>
                <h2
                  id="fit-report-heading"
                  className="mt-1 text-2xl font-semibold text-[var(--ans-navy)]"
                >
                  Food Business Fit Report
                </h2>
                <p className="sans mt-2 text-sm text-[var(--ans-navy-soft)]">
                  Generated {new Date(report.generatedAt).toLocaleString()} · Estimator{" "}
                  {report.estimatorVersion}
                </p>
              </div>
              <button
                type="button"
                className="ans-no-print sans rounded-md border border-[var(--ans-navy)]/20 px-4 py-2 text-sm font-medium text-[var(--ans-navy)] hover:bg-[var(--ans-paper)]"
                onClick={() => window.print()}
              >
                Print / Save PDF
              </button>
            </div>

            <section className="ans-print-block grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-[var(--ans-paper)] p-4">
                <p className="sans text-xs uppercase tracking-wide text-[var(--ans-navy-soft)]">
                  Fit score
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--ans-navy)]">
                  {report.fitScore}
                </p>
                <p className="sans mt-1 text-sm capitalize text-[var(--ans-gold)]">
                  {report.fitBand} · {report.confidence} confidence
                </p>
              </div>
              <div className="rounded-lg bg-[var(--ans-paper)] p-4 sm:col-span-2">
                <p className="sans text-xs uppercase tracking-wide text-[var(--ans-navy-soft)]">
                  Startup budget range
                </p>
                <p className="mt-2 text-xl font-semibold text-[var(--ans-navy)]">
                  {report.startupBudget.total.label}
                </p>
                <p className="sans mt-2 text-sm text-[var(--ans-navy-soft)]">
                  {report.openingTimeline.summary}
                </p>
              </div>
            </section>

            <ReportList title="Major risks" items={report.majorRisks} />
            <ReportList title="Missing information" items={report.missingInformation} />
            <ReportList title="Assumptions" items={report.assumptions} />
            <ReportList title="Suggested next steps" items={report.nextSteps} />

            <section className="ans-print-block">
              <h3 className="text-lg font-semibold text-[var(--ans-navy)]">Budget categories</h3>
              <ul className="sans mt-3 space-y-2 text-sm">
                {report.startupBudget.categories.map((category) => (
                  <li
                    key={category.category}
                    className="flex flex-col gap-1 border-b border-[var(--ans-navy)]/5 py-2 sm:flex-row sm:justify-between"
                  >
                    <span>{category.category}</span>
                    <span className="text-[var(--ans-navy-soft)]">{category.range.label}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="ans-print-block">
              <h3 className="text-lg font-semibold text-[var(--ans-navy)]">
                Licensing & checklist categories
              </h3>
              <div className="sans mt-3 space-y-4 text-sm">
                {report.licensingChecklistCategories.map((category) => (
                  <div key={category.category}>
                    <p className="font-semibold">
                      {category.category}
                      {category.requiresLocalReview ? " · local review required" : ""}
                    </p>
                    <ul className="mt-1 list-disc pl-5 text-[var(--ans-navy-soft)]">
                      {category.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <section className="ans-print-block">
              <h3 className="text-lg font-semibold text-[var(--ans-navy)]">Equipment categories</h3>
              <ul className="sans mt-3 list-disc pl-5 text-sm text-[var(--ans-navy-soft)]">
                {report.equipmentCategories.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="ans-print-block">
              <h3 className="text-lg font-semibold text-[var(--ans-navy)]">Data sources</h3>
              <ul className="sans mt-3 space-y-2 text-sm text-[var(--ans-navy-soft)]">
                {report.dataSources.map((source) => (
                  <li key={source.domain}>
                    <span className="font-medium text-[var(--ans-navy)]">{source.domain}</span>
                    {" · "}
                    {source.kind}
                    {" — "}
                    {source.note}
                    {source.asOf ? ` (as of ${source.asOf})` : ""}
                  </li>
                ))}
              </ul>
            </section>

            <section className="ans-print-block rounded-lg border border-[var(--ans-gold)]/40 bg-[var(--ans-gold-soft)]/30 p-4">
              <h3 className="text-lg font-semibold text-[var(--ans-navy)]">Disclaimers</h3>
              <ul className="sans mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--ans-navy-soft)]">
                {report.disclaimers.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="sans mt-4 text-sm text-[var(--ans-navy)]">
                Optional ANS consultation is available only after explicit consent in a later
                step. This Phase 1 report does not collect email or phone and does not create a
                lead.
              </p>
            </section>
          </article>
        )}
      </main>
    </div>
  );
}

function ReportList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) {
    return (
      <section className="ans-print-block">
        <h3 className="text-lg font-semibold text-[var(--ans-navy)]">{title}</h3>
        <p className="sans mt-2 text-sm text-[var(--ans-navy-soft)]">None flagged for this input set.</p>
      </section>
    );
  }

  return (
    <section className="ans-print-block">
      <h3 className="text-lg font-semibold text-[var(--ans-navy)]">{title}</h3>
      <ul className="sans mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--ans-navy-soft)]">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
