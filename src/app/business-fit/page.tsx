"use client";

import Image from "next/image";
import { FormEvent, useEffect, useId, useRef, useState } from "react";
import type { BusinessFitReport } from "@/lib/business-fit/types";
import {
  BUSINESS_TYPES,
  CUISINES,
  FACILITY_SIZES,
  INVESTMENT_BUDGETS,
  OWNER_EXPERIENCE,
  SCORE_BAND_COPY,
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
  const reportHeadingRef = useRef<HTMLHeadingElement>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<BusinessFitReport | null>(null);

  const fieldClass =
    "mt-1 w-full rounded-md border border-[var(--ans-blue)]/25 bg-white px-3 py-2 text-[var(--ans-navy)] shadow-sm focus:border-[var(--ans-blue-soft)] focus:outline-none";

  useEffect(() => {
    if (report && reportHeadingRef.current) {
      reportHeadingRef.current.focus();
    }
  }, [report]);

  function validateClient(next: FormState): Partial<Record<keyof FormState, string>> {
    const errors: Partial<Record<keyof FormState, string>> = {};
    if (!/^\d{5}$/.test(next.zipCode.trim())) {
      errors.zipCode = "Enter a valid 5-digit U.S. ZIP code (for example, 98101).";
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(next.targetOpeningDate)) {
      errors.targetOpeningDate = "Choose a valid target opening date.";
    }
    return errors;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApiError(null);
    const errors = validateClient(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setLoading(true);
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
    <div className="ans-fit">
      <header className="ans-topbar ans-no-print">
        <div className="mx-auto flex max-w-6xl items-center px-5 py-3.5 sm:px-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/ans-food-service-os-logo.png"
            alt="ANS Food Service OS"
            width={960}
            height={344}
            className="ans-logo"
          />
        </div>
      </header>

      <section className="ans-hero ans-no-print" aria-labelledby="business-fit-hero-heading">
        <div className="ans-hero-media" aria-hidden="true">
          <Image
            src="/seattle-skyline-hero.webp"
            alt=""
            fill
            priority
            sizes="100vw"
            quality={82}
            className="object-cover object-[center_35%]"
          />
        </div>
        <div className="ans-hero-overlay" aria-hidden="true" />

        <div className="ans-hero-content">
          <div className="ans-hero-grid">
            <div className="ans-hero-copy">
              <p className="ans-eyebrow sans">Food business planning</p>
              <h1 id="business-fit-hero-heading" className="ans-hero-title">
                Is your concept built to thrive?
              </h1>
              <p className="ans-hero-support sans">
                Get a structured preliminary assessment of your concept’s budget, timeline,
                operating complexity, and planning readiness.
              </p>
              <ul className="ans-trust sans">
                <li>Deterministic estimates</li>
                <li>No contact information</li>
                <li>Print-ready report</li>
              </ul>
              <ul className="ans-pillars sans">
                <li>Budget alignment</li>
                <li>Timeline readiness</li>
                <li>Operational fit</li>
                <li>Planning risks</li>
              </ul>
            </div>

            <form
              onSubmit={onSubmit}
              className="ans-form-card grid gap-5"
              noValidate
              aria-describedby={apiError ? `${formId}-api-error` : undefined}
            >
              <div>
                <h2>Build your preliminary fit report</h2>
                <p className="lede sans">
                  Planning estimates only—not live market demand, competition, revenue, or ROI
                  analysis.
                </p>
              </div>

              <div className="ans-form-grid grid gap-5 sm:grid-cols-2">
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
                    aria-invalid={Boolean(fieldErrors.zipCode)}
                    aria-describedby={`${formId}-zip-help${fieldErrors.zipCode ? ` ${formId}-zip-error` : ""}`}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        zipCode: event.target.value.replace(/\D/g, "").slice(0, 5),
                      }))
                    }
                  />
                  <span id={`${formId}-zip-help`} className="ans-helper">
                    Used only for planning context. No live demographic feed is connected.
                  </span>
                  {fieldErrors.zipCode ? (
                    <span id={`${formId}-zip-error`} className="ans-helper text-red-700" role="alert">
                      {fieldErrors.zipCode}
                    </span>
                  ) : null}
                </label>

                <label className="sans text-sm font-medium">
                  Target opening date
                  <input
                    className={fieldClass}
                    type="date"
                    name="targetOpeningDate"
                    required
                    value={form.targetOpeningDate}
                    aria-invalid={Boolean(fieldErrors.targetOpeningDate)}
                    aria-describedby={`${formId}-date-help${fieldErrors.targetOpeningDate ? ` ${formId}-date-error` : ""}`}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, targetOpeningDate: event.target.value }))
                    }
                  />
                  <span id={`${formId}-date-help`} className="ans-helper">
                    Compared against a typical planning timeline for your concept.
                  </span>
                  {fieldErrors.targetOpeningDate ? (
                    <span id={`${formId}-date-error`} className="ans-helper text-red-700" role="alert">
                      {fieldErrors.targetOpeningDate}
                    </span>
                  ) : null}
                </label>

                <label className="sans text-sm font-medium">
                  Business type
                  <select
                    className={fieldClass}
                    value={form.businessType}
                    aria-describedby={`${formId}-type-help`}
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
                  <span id={`${formId}-type-help`} className="ans-helper">
                    Drives budget bands, equipment categories, and timeline length.
                  </span>
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
                    aria-describedby={`${formId}-budget-help`}
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
                  <span id={`${formId}-budget-help`} className="ans-helper">
                    Total available capital band before financing structure is defined.
                  </span>
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

              {apiError ? (
                <p
                  id={`${formId}-api-error`}
                  role="alert"
                  className="sans rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
                >
                  {apiError}
                </p>
              ) : null}

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="sans rounded-md bg-[var(--ans-blue)] px-5 py-2.5 text-sm font-semibold text-white transition enabled:hover:bg-[var(--ans-blue-soft)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Generating report…" : "Generate my fit report"}
                </button>
                <p className="sans text-xs text-[#5b6b7c]">
                  No names, email, or phone collected. No leads or vendor requests are created.
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>

      {(loading || report) ? (
      <main className="ans-report-shell">
        <div className="mx-auto max-w-5xl">
          <div
            className="sans ans-no-print min-h-6 px-1 text-sm text-[var(--ans-navy)]/70"
            aria-live="polite"
          >
            {loading ? "Building your Phase 1.1 planning estimate…" : null}
          </div>

          {report ? (
            <article
              className="mt-2 space-y-8 rounded-xl border border-[var(--ans-blue)]/15 bg-white p-5 shadow-sm sm:p-8"
              aria-labelledby="fit-report-heading"
            >
            <div className="ans-print-block flex flex-wrap items-start justify-between gap-4 border-b border-[var(--ans-blue)]/20 pb-5">
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/ans-food-service-os-logo.png"
                  alt="ANS Food Service OS"
                  width={960}
                  height={344}
                  className="ans-logo ans-logo-report mb-3"
                />
                <p className="sans text-xs uppercase tracking-[0.18em] text-[var(--ans-blue)]">
                  Planning estimate · v{report.reportVersion}
                </p>
                <h2
                  id="fit-report-heading"
                  ref={reportHeadingRef}
                  tabIndex={-1}
                  className="mt-1 text-2xl font-semibold text-[var(--ans-blue)] outline-none"
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
                className="ans-no-print sans rounded-md border border-[var(--ans-blue)]/25 px-4 py-2 text-sm font-medium text-[var(--ans-blue)] hover:bg-[var(--ans-paper)]"
                onClick={() => window.print()}
              >
                Print / Save PDF
              </button>
            </div>

            <section className="ans-print-only ans-print-block sans text-sm">
              <h3 className="mb-2 text-base font-semibold">Input summary</h3>
              <ul className="list-disc pl-5">
                {report.printSummary.inputSummary.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>

            <section className="ans-print-block grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-[var(--ans-paper)] p-4">
                <p className="sans text-xs uppercase tracking-wide text-[var(--ans-navy-soft)]">
                  Fit score
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--ans-blue)]">{report.fitScore}</p>
                <p className="sans mt-1 text-sm text-[var(--ans-navy)]">
                  {report.fitInterpretation}
                </p>
                <p className="sans mt-1 text-xs text-[var(--ans-navy-soft)]">
                  Band {report.fitBandLabel} · {report.confidence} confidence · planning estimate only
                </p>
              </div>
              <div className="rounded-lg bg-[var(--ans-paper)] p-4 sm:col-span-2">
                <p className="sans text-xs uppercase tracking-wide text-[var(--ans-navy-soft)]">
                  Startup budget range
                </p>
                <p className="mt-2 text-xl font-semibold text-[var(--ans-blue)]">
                  {report.startupBudget.total.label}
                </p>
                <p className="sans mt-2 text-sm text-[var(--ans-navy-soft)]">
                  {report.openingTimeline.summary}
                </p>
                <p className="sans mt-1 text-sm text-[var(--ans-navy)]">
                  Target date status: {report.openingTimeline.targetDateStatus} —{" "}
                  {report.openingTimeline.targetDateNote}
                </p>
              </div>
            </section>

            <section className="ans-print-block">
              <h3 className="text-lg font-semibold text-[var(--ans-blue)]">
                How this score was calculated
              </h3>
              <p className="sans mt-1 text-sm text-[var(--ans-navy-soft)]">
                Contributions below sum exactly to the displayed fit score. This is not a prediction
                of business success.
              </p>
              <ul className="sans mt-3 space-y-2 text-sm">
                {report.scoreBreakdown.contributions.map((row) => (
                  <li
                    key={row.key}
                    className="flex flex-col gap-1 border-b border-[var(--ans-blue)]/10 py-2 sm:flex-row sm:justify-between"
                  >
                    <span>
                      <span className="font-medium text-[var(--ans-navy)]">{row.label}</span>
                      <span className="mt-0.5 block text-[var(--ans-navy-soft)]">{row.detail}</span>
                    </span>
                    <span className="font-semibold text-[var(--ans-blue)]">
                      {row.points > 0 ? `+${row.points}` : row.points}
                    </span>
                  </li>
                ))}
                <li className="flex justify-between pt-2 font-semibold text-[var(--ans-navy)]">
                  <span>Total fit score</span>
                  <span>{report.scoreBreakdown.total}</span>
                </li>
              </ul>
            </section>

            <section className="ans-print-block">
              <h3 className="text-lg font-semibold text-[var(--ans-blue)]">Score interpretation</h3>
              <ul className="sans mt-2 space-y-1 text-sm text-[var(--ans-navy-soft)]">
                {(Object.keys(SCORE_BAND_COPY) as Array<keyof typeof SCORE_BAND_COPY>).map((band) => (
                  <li key={band}>
                    <span className="font-medium text-[var(--ans-navy)]">
                      {SCORE_BAND_COPY[band].rangeLabel}:
                    </span>{" "}
                    {SCORE_BAND_COPY[band].interpretation}
                    {report.fitBand === band ? " (current report)" : ""}
                  </li>
                ))}
              </ul>
            </section>

            <section className="ans-print-block">
              <h3 className="text-lg font-semibold text-[var(--ans-blue)]">Budget categories</h3>
              <p className="sans mt-1 text-sm text-[var(--ans-navy-soft)]">
                Category low/high totals reconcile to the startup range above.
              </p>
              <ul className="sans mt-3 space-y-2 text-sm">
                {report.startupBudget.categories.map((category) => (
                  <li
                    key={category.category}
                    className="flex flex-col gap-1 border-b border-[var(--ans-blue)]/10 py-2 sm:flex-row sm:justify-between"
                  >
                    <span>{category.category}</span>
                    <span className="text-[var(--ans-navy-soft)]">{category.range.label}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="ans-print-block">
              <h3 className="text-lg font-semibold text-[var(--ans-blue)]">Opening timeline</h3>
              <ol className="sans mt-3 space-y-2 text-sm">
                {report.openingTimeline.phases.map((phase) => (
                  <li key={phase.name} className="border-b border-[var(--ans-blue)]/10 py-2">
                    <span className="font-medium text-[var(--ans-navy)]">
                      {phase.name} · ~{phase.approximateMonths} mo
                    </span>
                    <span className="mt-0.5 block text-[var(--ans-navy-soft)]">{phase.detail}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section className="ans-print-block">
              <h3 className="text-lg font-semibold text-[var(--ans-blue)]">Actionable next steps</h3>
              <div className="sans mt-3 grid gap-4 sm:grid-cols-3">
                <NextStepColumn title="Do now" items={report.nextStepGroups.doNow} />
                <NextStepColumn
                  title="Validate before signing a lease"
                  items={report.nextStepGroups.validateBeforeLease}
                />
                <NextStepColumn
                  title="Complete before opening"
                  items={report.nextStepGroups.completeBeforeOpening}
                />
              </div>
            </section>

            <ReportList title="Major risks" items={report.majorRisks} />
            <ReportList title="Missing information" items={report.missingInformation} />
            <ReportList title="Assumptions" items={report.assumptions} />

            <section className="ans-print-block">
              <h3 className="text-lg font-semibold text-[var(--ans-blue)]">
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
              <h3 className="text-lg font-semibold text-[var(--ans-blue)]">Equipment categories</h3>
              <ul className="sans mt-3 list-disc pl-5 text-sm text-[var(--ans-navy-soft)]">
                {report.equipmentCategories.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="ans-print-block">
              <h3 className="text-lg font-semibold text-[var(--ans-blue)]">Data sources</h3>
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

            <section className="ans-print-block rounded-lg border border-[var(--ans-blue)]/30 bg-[var(--ans-paper)] p-4">
              <h3 className="text-lg font-semibold text-[var(--ans-blue)]">Disclaimers</h3>
              <ul className="sans mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--ans-navy-soft)]">
                {report.disclaimers.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
            </article>
          ) : null}
        </div>
      </main>
      ) : null}
    </div>
  );
}

function NextStepColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="font-semibold text-[var(--ans-navy)]">{title}</h4>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-[var(--ans-navy-soft)]">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function ReportList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) {
    return (
      <section className="ans-print-block">
        <h3 className="text-lg font-semibold text-[var(--ans-blue)]">{title}</h3>
        <p className="sans mt-2 text-sm text-[var(--ans-navy-soft)]">None flagged for this input set.</p>
      </section>
    );
  }

  return (
    <section className="ans-print-block">
      <h3 className="text-lg font-semibold text-[var(--ans-blue)]">{title}</h3>
      <ul className="sans mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--ans-navy-soft)]">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
