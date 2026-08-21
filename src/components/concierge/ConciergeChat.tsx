"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  CONTACT_PRIVACY_NOTICE,
  contactFieldError,
  inputConfigForContactField,
  maskContactText,
} from "@/lib/concierge/contact";
import {
  createConciergeSession,
  getActiveContactField,
  getRecommendationCards,
  processConciergeMessage,
  removeDish,
  selectDish,
  submitConciergeInquiry,
} from "@/lib/concierge/engine";
import { listSelectedDishNames } from "@/lib/concierge/menu-retrieval";
import type { ConciergeSession } from "@/lib/concierge/types";
import { openInquiryFormSection } from "@/lib/inquiry-form-gate";

function SelectedDishes({
  session,
  onRemove,
}: {
  session: ConciergeSession;
  onRemove: (id: string) => void;
}) {
  if (!session.slots.selectedDishIds.length) {
    return null;
  }

  return (
    <ul className="mt-3 space-y-2">
      {session.slots.selectedDishIds.map((id) => {
        const name = listSelectedDishNames([id])[0] ?? "Menu selection";
        return (
          <li
            key={id}
            className="flex items-center justify-between gap-3 rounded-xl border border-[var(--navy)]/10 bg-white px-3 py-2 text-sm"
          >
            <span className="font-medium text-[var(--navy)]">{name}</span>
            <button
              type="button"
              onClick={() => onRemove(id)}
              className="text-xs font-semibold text-[var(--bronze-dark)] underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--bronze-dark)]"
            >
              Remove
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function ActionButtons({
  hasReviewed,
  inquiryHref,
  onReview,
  reviewPrimary,
}: {
  hasReviewed: boolean;
  inquiryHref?: string;
  onReview: () => void;
  reviewPrimary?: boolean;
}) {
  const reviewClass = reviewPrimary
    ? "inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--bronze-dark)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--bronze)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--bronze-dark)]"
    : "inline-flex min-h-10 items-center justify-center rounded-full bg-[var(--bronze-dark)] px-4 text-xs font-semibold text-white transition hover:bg-[var(--bronze)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--bronze-dark)]";

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={onReview} className={reviewClass}>
        Review My Event
      </button>
      {hasReviewed && inquiryHref ? (
        <a
          href={inquiryHref}
          className="inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--navy)]/20 bg-white px-4 text-xs font-semibold text-[var(--navy)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--bronze-dark)]"
        >
          Continue to Inquiry
        </a>
      ) : (
        <button
          type="button"
          onClick={openInquiryFormSection}
          className="inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--navy)]/20 bg-white px-4 text-xs font-semibold text-[var(--navy)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--bronze-dark)]"
        >
          Open Inquiry Form
        </button>
      )}
    </div>
  );
}

export default function ConciergeChat() {
  const [session, setSession] = useState<ConciergeSession>(() =>
    createConciergeSession(),
  );
  const [input, setInput] = useState("");
  const [inlineError, setInlineError] = useState<string | null>(null);

  const recommendations = useMemo(
    () => getRecommendationCards(session),
    [session],
  );

  const selectedCount = session.slots.selectedDishIds.length;
  const hasRecommendations = recommendations.length > 0;
  const hasReviewed = Boolean(session.inquiryHref);
  const awaitingSummary =
    session.phase === "summary" || session.phase === "ready_to_submit";
  const showExpandedPanel =
    selectedCount > 0 || hasRecommendations || hasReviewed || awaitingSummary;

  const contactField =
  session.pendingQuestionKeys[0] === "contact"
    ? getActiveContactField(session.slots)
    : null;
  const inputConfig = inputConfigForContactField(contactField);

  function applyResult(result: { session: ConciergeSession }) {
    setSession(result.session);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const value = input.trim();
    if (!value && !(contactField === "phone")) return;

    if (contactField) {
      const error = contactFieldError(contactField, value);
      if (error) {
        setInlineError(error);
        return;
      }
    }

    setInlineError(null);
    const result = processConciergeMessage(session, value || "skip");
    setInput("");
    applyResult(result);
  }

  function handleSkipPhone() {
    setInlineError(null);
    const result = processConciergeMessage(session, "skip");
    setInput("");
    applyResult(result);
  }

  function handleReviewEvent() {
    applyResult(submitConciergeInquiry(session));
  }

  return (
    <section
      id="concierge"
      className="mx-auto max-w-7xl px-6 section-y lg:px-10"
      aria-labelledby="concierge-heading"
    >
      <div
        className={`grid gap-6 ${
          showExpandedPanel
            ? "lg:grid-cols-[minmax(0,1.4fr)_minmax(17rem,0.8fr)]"
            : "lg:grid-cols-1"
        }`}
      >
        <div className="overflow-hidden rounded-3xl border border-[var(--navy)]/10 bg-[var(--navy)] text-white shadow-sm">
          <div className="border-b border-white/10 px-6 py-5 sm:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--bronze)]">
              Catering Concierge
            </p>
            <h2
              id="concierge-heading"
              className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              Plan your event with guided menu help.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">
              Chat through your event details, choose dishes, review your plan,
              then send an inquiry—our team follows up with a chef-reviewed
              proposal.
            </p>
          </div>

          <div
            className="max-h-[28rem] space-y-4 overflow-y-auto px-6 py-5 sm:px-8"
            aria-live="polite"
          >
            {session.messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                  message.role === "customer"
                    ? "ml-auto bg-[var(--bronze)] text-white"
                    : "bg-white/10 text-white"
                }`}
              >
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] opacity-70">
                  {message.role === "customer" ? "You" : "iBirdChef Concierge"}
                </p>
                <p className="mt-1 whitespace-pre-wrap">
                  {maskContactText(message.content)}
                </p>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-white/10 px-6 py-4 sm:px-8"
          >
            {contactField ? (
              <p className="mb-3 text-xs leading-5 text-white/70">
                {CONTACT_PRIVACY_NOTICE}
              </p>
            ) : null}
            <label htmlFor="concierge-input" className="sr-only">
              {inputConfig.label}
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="concierge-input"
                type={inputConfig.type}
                value={input}
                onChange={(event) => {
                  setInput(event.target.value);
                  if (inlineError) setInlineError(null);
                }}
                placeholder={inputConfig.placeholder}
                autoComplete={
                  contactField === "email"
                    ? "email"
                    : contactField === "phone"
                      ? "tel"
                      : contactField === "name"
                        ? "name"
                        : "off"
                }
                inputMode={
                  contactField === "email"
                    ? "email"
                    : contactField === "phone"
                      ? "tel"
                      : "text"
                }
                aria-invalid={inlineError ? true : undefined}
                aria-describedby={
                  inlineError ? "concierge-input-error" : undefined
                }
                className="min-h-12 flex-1 rounded-full border border-white/20 bg-white/10 px-5 text-sm text-white outline-none placeholder:text-white/50 focus:border-[var(--bronze)] focus:ring-2 focus:ring-[var(--bronze)]/40"
              />
              <button
                type="submit"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--bronze)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--bronze-dark)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Send
              </button>
            </div>
            {contactField === "phone" ? (
              <button
                type="button"
                onClick={handleSkipPhone}
                className="mt-3 text-xs font-semibold text-white/80 underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Skip phone — prefer email
              </button>
            ) : null}
            {inlineError ? (
              <p
                id="concierge-input-error"
                role="alert"
                className="mt-2 text-sm text-[var(--bronze)]"
              >
                {inlineError}
              </p>
            ) : null}
          </form>
        </div>

        <aside
          className={`rounded-3xl border border-[var(--navy)]/10 bg-[var(--ivory-soft)] ${
            showExpandedPanel ? "space-y-4 p-5" : "px-5 py-4"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-serif text-xl font-semibold text-[var(--navy)]">
                Your selections
              </h3>
              <p
                className="mt-1 text-sm text-[var(--ink-muted)]"
                aria-live="polite"
              >
                {selectedCount} {selectedCount === 1 ? "dish" : "dishes"}{" "}
                selected
              </p>
            </div>
            {!showExpandedPanel ? (
              <ActionButtons
                hasReviewed={hasReviewed}
                inquiryHref={session.inquiryHref}
                onReview={handleReviewEvent}
                reviewPrimary={awaitingSummary}
              />
            ) : null}
          </div>

          {showExpandedPanel ? (
            <>
              <SelectedDishes
                session={session}
                onRemove={(id) => applyResult(removeDish(session, id))}
              />

              {hasRecommendations ? (
                <div>
                  <h3 className="font-serif text-xl font-semibold text-[var(--navy)]">
                    You may also like.
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-[var(--ink-muted)]">
                    Suggestions only—add a dish to include it in your inquiry.
                  </p>
                  <ul className="mt-3 space-y-2">
                    {recommendations.map((item) => {
                      const selected = session.slots.selectedDishIds.includes(
                        item.id,
                      );
                      return (
                        <li
                          key={item.id}
                          className="rounded-xl border border-[var(--navy)]/10 bg-white p-3"
                        >
                          <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[var(--bronze-dark)]">
                            {item.categoryLabel}
                          </p>
                          <p className="mt-1 font-medium text-[var(--navy)]">
                            {item.name}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-[var(--bronze-dark)]">
                            {item.pricingLabel}
                          </p>
                          {item.categoryId === "rice-biryani" ? (
                            <p className="mt-1 text-xs leading-5 text-[var(--ink-muted)]">
                              Alternative rice options are available if you
                              prefer a different style.
                            </p>
                          ) : null}
                          <button
                            type="button"
                            disabled={selected}
                            onClick={() =>
                              applyResult(selectDish(session, item.id))
                            }
                            className="mt-2 inline-flex min-h-9 items-center justify-center rounded-full bg-[var(--navy)] px-4 text-xs font-semibold text-white transition hover:bg-[var(--navy-deep)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--bronze-dark)] disabled:cursor-default disabled:bg-[var(--navy)]/40"
                          >
                            {selected ? "Added" : "Add to Inquiry"}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}

              <div
                className={`rounded-xl border p-3 ${
                  awaitingSummary || hasReviewed
                    ? "border-[var(--bronze)] bg-white"
                    : "border-[var(--navy)]/10 bg-white"
                }`}
              >
                <p className="text-sm leading-6 text-[var(--ink-muted)]">
                  {awaitingSummary || hasReviewed
                    ? "Your event summary is ready. Review My Event is the next step before the inquiry form."
                    : "When your details look right, review your event, then continue to the inquiry form to send it to our team."}
                </p>
                <div className="mt-3">
                  <ActionButtons
                    hasReviewed={hasReviewed}
                    inquiryHref={session.inquiryHref}
                    onReview={handleReviewEvent}
                    reviewPrimary={awaitingSummary || !hasReviewed}
                  />
                </div>
              </div>
            </>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
