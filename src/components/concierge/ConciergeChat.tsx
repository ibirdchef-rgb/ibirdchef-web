"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import {
  createConciergeSession,
  getRecommendationCards,
  processConciergeMessage,
  removeDish,
  selectDish,
  submitConciergeInquiry,
} from "@/lib/concierge/engine";
import { listSelectedDishNames } from "@/lib/concierge/menu-retrieval";
import type { ConciergeSession } from "@/lib/concierge/types";
import { DRAFT_PENDING_LABEL } from "@/lib/quote-draft";

function SelectedDishes({
  session,
  onRemove,
}: {
  session: ConciergeSession;
  onRemove: (id: string) => void;
}) {
  if (!session.slots.selectedDishIds.length) {
    return (
      <p className="text-sm text-[var(--ink-muted)]">No dishes selected yet.</p>
    );
  }

  return (
    <ul className="space-y-2">
      {session.slots.selectedDishIds.map((id) => {
        const name =
          listSelectedDishNames([id])[0] ?? "Approved menu selection";
        return (
          <li
            key={id}
            className="flex items-center justify-between gap-3 rounded-xl border border-[var(--navy)]/10 bg-white px-3 py-2 text-sm"
          >
            <span className="font-medium text-[var(--navy)]">{name}</span>
            <button
              type="button"
              onClick={() => onRemove(id)}
              className="text-xs font-semibold text-[var(--bronze-dark)] underline underline-offset-2"
            >
              Remove
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export default function ConciergeChat() {
  const [session, setSession] = useState<ConciergeSession>(() =>
    createConciergeSession(),
  );
  const [input, setInput] = useState("");

  const recommendations = useMemo(
    () => getRecommendationCards(session),
    [session],
  );

  function applyResult(result: { session: ConciergeSession }) {
    setSession(result.session);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!input.trim()) return;
    const result = processConciergeMessage(session, input);
    setInput("");
    applyResult(result);
  }

  return (
    <section
      id="concierge"
      className="mx-auto max-w-7xl px-6 py-14 lg:px-10 lg:py-16"
      aria-labelledby="concierge-heading"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)]">
        <div className="overflow-hidden rounded-3xl border border-[var(--navy)]/10 bg-[var(--navy)] text-white shadow-sm">
          <div className="border-b border-white/10 px-6 py-5 sm:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--bronze)]">
              AI Catering Concierge
            </p>
            <h2
              id="concierge-heading"
              className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              Plan your event with guided menu help.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">
              Deterministic Phase 1 assistant—warm menu guidance and inquiry
              qualification only. No live quote, booking confirmation, or
              automatic customer send.
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
                <p className="mt-1 whitespace-pre-wrap">{message.content}</p>
              </div>
            ))}
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-white/10 px-6 py-4 sm:px-8"
          >
            <label htmlFor="concierge-input" className="sr-only">
              Message the concierge
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="concierge-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Tell me about your event…"
                className="min-h-12 flex-1 rounded-full border border-white/20 bg-white/10 px-5 text-sm text-white outline-none placeholder:text-white/50 focus:border-[var(--bronze)] focus:ring-2 focus:ring-[var(--bronze)]/40"
              />
              <button
                type="submit"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--bronze)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--bronze-dark)]"
              >
                Send
              </button>
            </div>
          </form>
        </div>

        <aside className="space-y-4 rounded-3xl border border-[var(--navy)]/10 bg-[var(--ivory-soft)] p-5">
          <div>
            <h3 className="font-serif text-xl font-semibold text-[var(--navy)]">
              Inquiry selections
            </h3>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">
              {session.slots.selectedDishIds.length} approved{" "}
              {session.slots.selectedDishIds.length === 1 ? "dish" : "dishes"}{" "}
              selected
            </p>
            <div className="mt-3">
              <SelectedDishes
                session={session}
                onRemove={(id) => applyResult(removeDish(session, id))}
              />
            </div>
          </div>

          {recommendations.length ? (
            <div>
              <h3 className="font-serif text-xl font-semibold text-[var(--navy)]">
                Approved recommendations
              </h3>
              <p className="mt-1 text-xs leading-5 text-[var(--ink-muted)]">
                Recommendations only—add a dish to confirm it for your inquiry.
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
                      <button
                        type="button"
                        disabled={selected}
                        onClick={() => applyResult(selectDish(session, item.id))}
                        className="mt-2 inline-flex min-h-9 items-center justify-center rounded-full bg-[var(--navy)] px-4 text-xs font-semibold text-white transition hover:bg-[var(--navy-deep)] disabled:cursor-default disabled:bg-[var(--navy)]/40"
                      >
                        {selected ? "Added" : "Add to Inquiry"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}

          <div className="rounded-xl border border-[var(--navy)]/10 bg-white p-3 text-sm leading-6 text-[var(--ink-muted)]">
            <p>
              Internal draft status:{" "}
              <span className="font-semibold text-[var(--navy)]">
                {session.quoteStatusLabel ?? DRAFT_PENDING_LABEL}
              </span>
            </p>
            <p className="mt-2">
              Customer quote sending remains blocked. Availability and pricing
              require Chef Simbu review.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyResult(submitConciergeInquiry(session))}
                className="inline-flex min-h-10 items-center justify-center rounded-full bg-[var(--bronze-dark)] px-4 text-xs font-semibold text-white transition hover:bg-[var(--bronze)]"
              >
                Prepare inquiry summary
              </button>
              {session.inquiryHref ? (
                <Link
                  href={session.inquiryHref}
                  className="inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--navy)]/20 bg-white px-4 text-xs font-semibold text-[var(--navy)]"
                >
                  Continue to inquiry form
                </Link>
              ) : (
                <Link
                  href="#contact"
                  className="inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--navy)]/20 bg-white px-4 text-xs font-semibold text-[var(--navy)]"
                >
                  Open inquiry form
                </Link>
              )}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
