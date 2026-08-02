"use client";

import { useId, useState, type ReactNode } from "react";
import {
  formatBoxPrice,
  menuCategories,
  seasonalBoxes,
  type SeasonalBox,
} from "@/lib/menu";

function AccordionPanel({
  id,
  title,
  subtitle,
  open,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const panelId = `${id}-panel`;
  const buttonId = `${id}-button`;

  return (
    <div className="border-t border-[var(--navy)]/15">
      <h3 className="m-0">
        <button
          type="button"
          id={buttonId}
          className="flex w-full min-h-14 items-center justify-between gap-4 py-4 text-left"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
        >
          <span>
            <span className="block font-serif text-2xl font-semibold text-[var(--navy)]">
              {title}
            </span>
            {subtitle ? (
              <span className="mt-1 block text-sm font-medium text-[var(--bronze-dark)]">
                {subtitle}
              </span>
            ) : null}
          </span>
          <span
            aria-hidden="true"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--navy)]/20 text-lg text-[var(--navy)]"
          >
            {open ? "−" : "+"}
          </span>
        </button>
      </h3>

      {open ? (
        <div
          id={panelId}
          role="region"
          aria-labelledby={buttonId}
          className="pb-6"
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

function SeasonalBoxDetails({ box }: { box: SeasonalBox }) {
  const veg = box.entrée.vegetarian;
  const protein = box.entrée.protein;

  return (
    <div className="space-y-4 text-[var(--ink-muted)]">
      <p className="text-base leading-7">
        16oz lunch box with rice, lentil, hot entrée, and side. Choose
        vegetarian or protein when you inquire.
      </p>

      <dl className="grid gap-3 text-sm leading-6 sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-[var(--navy)]">Rice</dt>
          <dd>{box.rice}</dd>
        </div>
        <div>
          <dt className="font-semibold text-[var(--navy)]">Lentil</dt>
          <dd>{box.lentil}</dd>
        </div>
        <div>
          <dt className="font-semibold text-[var(--navy)]">Side</dt>
          <dd>{box.side}</dd>
        </div>
        <div>
          <dt className="font-semibold text-[var(--navy)]">Entrée choice</dt>
          <dd>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>
                Vegetarian: {veg.name}
                {veg.includedInBoxPrice ? "" : " (priced separately)"}
              </li>
              <li>
                Protein: {protein.name}
                {protein.includedInBoxPrice ? "" : " (priced separately)"}
              </li>
            </ul>
          </dd>
        </div>
      </dl>

      {box.notes?.length ? (
        <ul className="list-disc space-y-1 pl-5 text-sm leading-6">
          {box.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default function MenuSection() {
  const baseId = useId();
  const [openId, setOpenId] = useState<string | null>("seasonal-boxes");

  function toggle(id: string) {
    setOpenId((current) => (current === id ? null : id));
  }

  return (
    <section
      id="menu"
      className="border-y border-[var(--navy)]/10 texture-ivory"
      aria-labelledby="menu-heading"
    >
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--bronze-dark)]">
            Seasonal Boxes
          </p>

          <h2
            id="menu-heading"
            className="mt-4 font-serif text-4xl font-semibold tracking-tight text-[var(--navy)] sm:text-5xl"
          >
            Seasonal boxed lunches, thoughtfully composed.
          </h2>

          <p className="mt-5 text-lg leading-8 text-[var(--ink-muted)]">
            Explore our seasonal lunch box program and the dishes that build
            each box. À la carte selections are customized per event — share
            preferences in your inquiry and we will confirm the final menu.
          </p>
        </div>

        <div className="mt-12 max-w-3xl border-b border-[var(--navy)]/15">
          <AccordionPanel
            id={`${baseId}-seasonal-boxes`}
            title="Seasonal Boxes"
            subtitle={`${formatBoxPrice(18)} · required vegetarian or protein choice`}
            open={openId === "seasonal-boxes"}
            onToggle={() => toggle("seasonal-boxes")}
          >
            <div className="space-y-8">
              {seasonalBoxes.map((box) => (
                <article key={box.id} className="border-t border-[var(--navy)]/10 pt-6 first:border-t-0 first:pt-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h4 className="font-serif text-xl font-semibold text-[var(--navy)]">
                      {box.season}
                    </h4>
                    <p className="text-sm font-semibold text-[var(--bronze-dark)]">
                      {formatBoxPrice(box.pricePerPerson)}
                    </p>
                  </div>
                  <div className="mt-4">
                    <SeasonalBoxDetails box={box} />
                  </div>
                </article>
              ))}
            </div>
          </AccordionPanel>

          {menuCategories.map((category) => (
            <AccordionPanel
              key={category.id}
              id={`${baseId}-${category.id}`}
              title={category.title}
              open={openId === category.id}
              onToggle={() => toggle(category.id)}
            >
              <p className="mb-4 text-sm leading-6 text-[var(--ink-muted)]">
                {category.description}
              </p>
              <ul className="grid list-none gap-2 p-0 sm:grid-cols-2">
                {category.items.map((item) => (
                  <li
                    key={item.id}
                    className="border-t border-[var(--navy)]/10 pt-3 text-sm font-medium text-[var(--navy)]"
                  >
                    {item.name}
                  </li>
                ))}
              </ul>
            </AccordionPanel>
          ))}
        </div>

        <p className="mt-8 max-w-3xl text-sm leading-6 text-[var(--ink-muted)]">
          Pricing shown applies only to seasonal boxed lunches. Other menu
          items are quoted for your event.{" "}
          <a
            href="#contact"
            className="font-semibold text-[var(--navy)] underline decoration-[var(--bronze)]/50 underline-offset-4 transition hover:decoration-[var(--bronze)]"
          >
            Send an inquiry
          </a>{" "}
          to reserve dates and finalize selections.
        </p>
      </div>
    </section>
  );
}
