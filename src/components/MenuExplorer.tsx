"use client";

import Link from "next/link";
import { useId, useMemo, useState, type ReactNode } from "react";
import { useRegion } from "@/components/RegionProvider";
import {
  AVAILABILITY_NOTICE,
  DIETARY_ALLERGEN_NOTICE,
  LIVE_STATION_NOTICE,
  PUBLIC_MENU_CATEGORIES,
  PUBLIC_MENU_CATEGORY_LABELS,
  buildAskAboutDishHref,
  curatedMenuItems,
  filterCuratedMenu,
  formatPricingLabel,
  getSeasonalBoxForItem,
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
  "min-h-12 w-full rounded-xl border border-[var(--navy)]/15 bg-white px-4 py-3 text-sm text-[var(--navy)] outline-none transition focus:border-[var(--bronze)] focus:ring-2 focus:ring-[var(--bronze)]/30";

function SeasonalBoxDetails({ item }: { item: CuratedMenuItem }) {
  const box = getSeasonalBoxForItem(item);
  if (!box) {
    return null;
  }

  const veg = box.entrée.vegetarian;
  const protein = box.entrée.protein;

  return (
    <div className="mt-3 space-y-3 text-sm leading-6 text-[var(--ink-muted)]">
      <p>
        16oz lunch box with rice, lentil, hot entrée, and side. Choose
        vegetarian or protein when you inquire.
      </p>
      <dl className="grid gap-3 sm:grid-cols-2">
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
        <ul className="list-disc space-y-1 pl-5">
          {box.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function MenuItemCard({ item }: { item: CuratedMenuItem }) {
  const pricing = formatPricingLabel(item.pricing);
  const askHref = buildAskAboutDishHref(item);
  const isSeasonal = item.categoryId === "seasonal-boxed-lunches";
  const isLive = item.categoryId === "live-cooking-stations";

  return (
    <article className="flex h-full flex-col border-t border-[var(--navy)]/10 pt-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--bronze-dark)]">
            {PUBLIC_MENU_CATEGORY_LABELS[item.categoryId]}
          </p>
          <h3 className="mt-2 font-serif text-xl font-semibold text-[var(--navy)]">
            {item.name}
          </h3>
        </div>
        <p className="shrink-0 text-sm font-semibold text-[var(--bronze-dark)]">
          {isSeasonal ? formatBoxPrice(18) : pricing}
        </p>
      </div>

      {isSeasonal ? <SeasonalBoxDetails item={item} /> : null}

      {item.publicNote ? (
        <p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">
          {item.publicNote}
        </p>
      ) : null}

      {isLive ? (
        <p className="mt-3 text-sm leading-6 text-[var(--ink-muted)]">
          {LIVE_STATION_NOTICE}
        </p>
      ) : null}

      <div className="mt-auto flex flex-wrap items-center gap-3 pt-5">
        <Link
          href={askHref}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--navy)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--navy-deep)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--bronze-dark)]"
        >
          Ask About This Dish
        </Link>
        <span className="text-xs leading-5 text-[var(--ink-muted)]">
          Prefills an inquiry — not a booking or price confirmation.
        </span>
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
      <div className="mt-2">{children}</div>
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

  return (
    <section
      id="menu"
      className="border-y border-[var(--navy)]/10 texture-ivory"
      aria-labelledby="menu-heading"
    >
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--bronze-dark)]">
            Curated Menu
          </p>
          <h2
            id="menu-heading"
            className="mt-4 font-serif text-4xl font-semibold tracking-tight text-[var(--navy)] sm:text-5xl"
          >
            A multi-cuisine menu for thoughtfully planned events.
          </h2>
          <p className="mt-5 text-lg leading-8 text-[var(--ink-muted)]">
            Explore seasonal boxed lunches, signature dishes, and live cooking
            stations. Search and filter to shortlist ideas, then ask about a
            dish to start a custom, chef-approved proposal.
          </p>
        </div>

        <div className="mt-10 grid gap-4 rounded-3xl border border-[var(--navy)]/10 bg-white/80 p-5 sm:p-6 lg:grid-cols-2 xl:grid-cols-5">
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
                setEventCategory(
                  event.target.value as EventCategory | "all",
                )
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

        <div className="mt-4 flex flex-col gap-2 text-sm leading-6 text-[var(--ink-muted)] sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
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
          <p className="font-medium text-[var(--navy)]">{AVAILABILITY_NOTICE}</p>
        </div>

        <div className="mt-12 space-y-14">
          {grouped.length === 0 ? (
            <p className="rounded-2xl border border-[var(--navy)]/10 bg-white/70 px-5 py-8 text-[var(--ink-muted)]">
              No dishes match these filters. Clear search or broaden category,
              service style, or event type.
            </p>
          ) : (
            grouped.map((group) => (
              <section
                key={group.id}
                aria-labelledby={`${baseId}-${group.id}-heading`}
              >
                <div className="max-w-3xl border-b border-[var(--navy)]/15 pb-4">
                  <h3
                    id={`${baseId}-${group.id}-heading`}
                    className="font-serif text-3xl font-semibold text-[var(--navy)]"
                  >
                    {group.label}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--ink-muted)]">
                    {group.items.length}{" "}
                    {group.items.length === 1 ? "selection" : "selections"}
                  </p>
                </div>
                <div className="mt-2 grid gap-8 md:grid-cols-2">
                  {group.items.map((menuItem) => (
                    <MenuItemCard key={menuItem.id} item={menuItem} />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>

        <div className="mt-12 max-w-3xl space-y-4 text-sm leading-6 text-[var(--ink-muted)]">
          <p>
            Pricing shown applies only to seasonal boxed lunches at{" "}
            {formatBoxPrice(18)}. Other items use custom quote, market pricing,
            or a chef-approved custom proposal. Final menus and pricing are
            confirmed after event review.
          </p>
          <p>{DIETARY_ALLERGEN_NOTICE}</p>
          <p>
            <a
              href="#contact"
              className="font-semibold text-[var(--navy)] underline decoration-[var(--bronze)]/50 underline-offset-4 transition hover:decoration-[var(--bronze)]"
            >
              Send an inquiry
            </a>{" "}
            to share event details and receive a custom, chef-approved quote.
          </p>
        </div>
      </div>
    </section>
  );
}
