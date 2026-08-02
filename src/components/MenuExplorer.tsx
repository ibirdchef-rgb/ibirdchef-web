"use client";

import Link from "next/link";
import { useId, useMemo, useState, type ReactNode } from "react";
import { useRegion } from "@/components/RegionProvider";
import {
  DIETARY_ALLERGEN_NOTICE,
  MENU_INQUIRY_NOTICE,
  PUBLIC_MENU_CATEGORIES,
  PUBLIC_MENU_CATEGORY_LABELS,
  buildInquiryHrefForItemIds,
  curatedMenuItems,
  filterCuratedMenu,
  formatPricingLabel,
  type CuratedMenuItem,
  type PublicMenuCategoryId,
} from "@/lib/curated-menu";
import {
  EVENT_CATEGORIES,
  EVENT_CATEGORY_LABELS,
  SERVICE_STYLES,
  type EventCategory,
} from "@/lib/event-inquiry";
import { formatBoxPrice } from "@/lib/menu";
import { regions, type ServiceRegion } from "@/lib/regions";

const selectClassName =
  "min-h-11 w-full rounded-xl border border-[var(--navy)]/15 bg-white px-3.5 py-2.5 text-sm text-[var(--navy)] outline-none transition focus:border-[var(--bronze)] focus:ring-2 focus:ring-[var(--bronze)]/30";

function pricingText(item: CuratedMenuItem): string {
  return item.pricing === "seasonal_18"
    ? formatBoxPrice(18)
    : formatPricingLabel(item.pricing);
}

function MenuItemCard({
  item,
  selected,
  onToggle,
}: {
  item: CuratedMenuItem;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <article
      className={`flex h-full flex-col rounded-2xl border bg-[var(--ivory-soft)]/90 p-4 shadow-[0_1px_0_rgba(6,43,53,0.04)] transition ${
        selected
          ? "border-[var(--bronze)] ring-1 ring-[var(--bronze)]/35"
          : "border-[var(--navy)]/10"
      }`}
    >
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[var(--bronze-dark)]">
        {PUBLIC_MENU_CATEGORY_LABELS[item.categoryId]}
      </p>
      <h3 className="mt-2 font-serif text-lg font-semibold leading-snug text-[var(--navy)]">
        {item.name}
      </h3>
      <p className="mt-2 text-sm font-semibold text-[var(--bronze-dark)]">
        {pricingText(item)}
      </p>
      <div className="mt-auto pt-4">
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={selected}
          className={`inline-flex min-h-10 w-full items-center justify-center rounded-full px-4 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--bronze-dark)] ${
            selected
              ? "border border-[var(--navy)]/20 bg-white text-[var(--navy)] hover:border-[var(--bronze)]"
              : "bg-[var(--navy)] text-white hover:bg-[var(--navy-deep)]"
          }`}
        >
          {selected ? "Added — Remove" : "Add to Inquiry"}
        </button>
      </div>
    </article>
  );
}

function FilterField({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-[var(--navy)]">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

export default function MenuExplorer() {
  const baseId = useId();
  const { region: preferredRegion } = useRegion();
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState<ServiceRegion | "all">("all");
  const [categoryId, setCategoryId] = useState<PublicMenuCategoryId | "all">(
    "all",
  );
  const [serviceStyle, setServiceStyle] = useState<
    (typeof SERVICE_STYLES)[number] | "all"
  >("all");
  const [eventCategory, setEventCategory] = useState<EventCategory | "all">(
    "all",
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const effectiveRegion = region === "all" ? preferredRegion : region;

  const filtered = useMemo(
    () =>
      filterCuratedMenu(curatedMenuItems, {
        query,
        region,
        categoryId,
        serviceStyle,
        eventCategory,
      }),
    [query, region, categoryId, serviceStyle, eventCategory],
  );

  const grouped = useMemo(() => {
    const map = new Map<PublicMenuCategoryId, CuratedMenuItem[]>();
    for (const id of PUBLIC_MENU_CATEGORIES) {
      map.set(id, []);
    }
    for (const item of filtered) {
      map.get(item.categoryId)?.push(item);
    }
    return PUBLIC_MENU_CATEGORIES.map((id) => ({
      id,
      label: PUBLIC_MENU_CATEGORY_LABELS[id],
      items: map.get(id) ?? [],
    })).filter((group) => group.items.length > 0);
  }, [filtered]);

  const selectedCount = selectedIds.length;
  const inquiryHref = buildInquiryHrefForItemIds(selectedIds);

  function toggleSelected(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((entry) => entry !== id)
        : [...current, id],
    );
  }

  return (
    <section
      id="menu"
      className="border-y border-[var(--navy)]/10 texture-ivory"
      aria-labelledby="menu-heading"
    >
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-10 lg:py-16">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--bronze-dark)]">
            Curated Menu
          </p>
          <h2
            id="menu-heading"
            className="mt-3 font-serif text-4xl font-semibold tracking-tight text-[var(--navy)] sm:text-5xl"
          >
            A multi-cuisine menu for thoughtfully planned events.
          </h2>
          <p className="mt-4 text-lg leading-7 text-[var(--ink-muted)]">
            Explore seasonal boxed lunches, signature dishes, and live cooking
            stations. Add selections to one inquiry for a custom, chef-approved
            proposal.
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--navy)]">
            {MENU_INQUIRY_NOTICE}
          </p>
        </div>

        <div className="mt-8 grid gap-3 rounded-2xl border border-[var(--navy)]/10 bg-white/80 p-4 sm:p-5 md:grid-cols-2 xl:grid-cols-5">
          <FilterField id={`${baseId}-search`} label="Search dishes">
            <input
              id={`${baseId}-search`}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by dish or category"
              className={selectClassName}
            />
          </FilterField>

          <FilterField id={`${baseId}-region`} label="Region">
            <select
              id={`${baseId}-region`}
              value={region}
              onChange={(event) =>
                setRegion(event.target.value as ServiceRegion | "all")
              }
              className={selectClassName}
            >
              <option value="all">All regions</option>
              <option value="seattle">{regions.seattle.shortLabel}</option>
              <option value="bay_area">{regions.bay_area.shortLabel}</option>
            </select>
          </FilterField>

          <FilterField id={`${baseId}-category`} label="Menu category">
            <select
              id={`${baseId}-category`}
              value={categoryId}
              onChange={(event) =>
                setCategoryId(
                  event.target.value as PublicMenuCategoryId | "all",
                )
              }
              className={selectClassName}
            >
              <option value="all">All categories</option>
              {PUBLIC_MENU_CATEGORIES.map((id) => (
                <option key={id} value={id}>
                  {PUBLIC_MENU_CATEGORY_LABELS[id]}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField id={`${baseId}-service-style`} label="Service style">
            <select
              id={`${baseId}-service-style`}
              value={serviceStyle}
              onChange={(event) =>
                setServiceStyle(
                  event.target.value as (typeof SERVICE_STYLES)[number] | "all",
                )
              }
              className={selectClassName}
            >
              <option value="all">All service styles</option>
              {SERVICE_STYLES.map((style) => (
                <option key={style} value={style}>
                  {style}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField id={`${baseId}-event-type`} label="Event type">
            <select
              id={`${baseId}-event-type`}
              value={eventCategory}
              onChange={(event) =>
                setEventCategory(event.target.value as EventCategory | "all")
              }
              className={selectClassName}
            >
              <option value="all">All event types</option>
              {EVENT_CATEGORIES.map((id) => (
                <option key={id} value={id}>
                  {EVENT_CATEGORY_LABELS[id]}
                </option>
              ))}
            </select>
          </FilterField>
        </div>

        <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-[var(--navy)]/10 bg-white/70 px-4 py-3 text-sm leading-6 text-[var(--ink-muted)] sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <p>
            Showing{" "}
            <span className="font-semibold text-[var(--navy)]">
              {filtered.length}
            </span>{" "}
            of {curatedMenuItems.length} curated selections
            {effectiveRegion ? (
              <>
                {" "}
                for{" "}
                <span className="font-semibold text-[var(--navy)]">
                  {regions[effectiveRegion].shortLabel}
                </span>
              </>
            ) : null}
            .
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <p
              className="font-semibold text-[var(--navy)]"
              aria-live="polite"
            >
              {selectedCount === 0
                ? "No dishes selected"
                : `${selectedCount} ${selectedCount === 1 ? "dish" : "dishes"} selected`}
            </p>
            {selectedCount > 0 ? (
              <>
                <Link
                  href={inquiryHref}
                  className="inline-flex min-h-10 items-center justify-center rounded-full bg-[var(--bronze-dark)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--bronze)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--bronze-dark)]"
                >
                  Continue to Inquiry
                </Link>
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="text-sm font-semibold text-[var(--navy)] underline decoration-[var(--bronze)]/40 underline-offset-4 transition hover:decoration-[var(--bronze)]"
                >
                  Clear selection
                </button>
              </>
            ) : null}
          </div>
        </div>

        <div className="mt-8 space-y-8">
          {grouped.length === 0 ? (
            <p className="rounded-2xl border border-[var(--navy)]/10 bg-white/70 px-5 py-6 text-[var(--ink-muted)]">
              No dishes match these filters. Clear search or broaden category,
              service style, or event type.
            </p>
          ) : (
            grouped.map((group) => (
              <section
                key={group.id}
                aria-labelledby={`${baseId}-${group.id}-heading`}
              >
                <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--navy)]/12 pb-2">
                  <h3
                    id={`${baseId}-${group.id}-heading`}
                    className="font-serif text-2xl font-semibold text-[var(--navy)] sm:text-3xl"
                  >
                    {group.label}
                  </h3>
                  <p className="text-sm text-[var(--ink-muted)]">
                    {group.items.length}{" "}
                    {group.items.length === 1 ? "selection" : "selections"}
                  </p>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {group.items.map((menuItem) => (
                    <MenuItemCard
                      key={menuItem.id}
                      item={menuItem}
                      selected={selectedIds.includes(menuItem.id)}
                      onToggle={() => toggleSelected(menuItem.id)}
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>

        <div className="mt-10 max-w-3xl space-y-3 text-sm leading-6 text-[var(--ink-muted)]">
          <p>
            Pricing shown applies only to seasonal boxed lunches at{" "}
            {formatBoxPrice(18)}. Other items use custom quote, market pricing,
            or a chef-approved custom proposal.
          </p>
          <p>{DIETARY_ALLERGEN_NOTICE}</p>
        </div>
      </div>
    </section>
  );
}
