import Link from "next/link";
import { paths } from "@/lib/paths";

const services = [
  {
    title: "Corporate Box Meals",
    description:
      "Seasonal boxed lunches with vegetarian and protein choices, planned for office teams.",
    href: `${paths.menu}?buy=corporate-box-meals`,
  },
  {
    title: "Tray / Drop-Off Catering",
    description:
      "Drop-off trays for workplaces that need reliable lunch or meeting service without a full on-site crew.",
    href: `${paths.menu}?buy=tray-drop-off`,
  },
  {
    title: "Buffets",
    description:
      "Shareable buffet menus for meetings, receptions, and larger workplace gatherings.",
    href: `${paths.menu}?buy=buffet-catering`,
  },
  {
    title: "Corporate & Cultural Events",
    description:
      "South Asian and cultural menus for employee events, tenant gatherings, and office celebrations.",
    href: `${paths.menu}?buy=cultural-regional`,
  },
  {
    title: "Live Stations",
    description:
      "Chef-attended dosa, chaat, and tandoor/grill stations quoted after event review.",
    href: `${paths.menu}?buy=live-stations`,
  },
  {
    title: "Private Events",
    description:
      "Birthdays, cultural celebrations, private dinners, and family gatherings with a custom quote.",
    href: paths.privateEvents,
  },
] as const;

export default function ServiceCategories() {
  return (
    <section
      id="services"
      className="mx-auto max-w-7xl px-6 py-20 lg:px-10"
      aria-labelledby="services-heading"
    >
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--bronze-dark)]">
          Services
        </p>
        <h2
          id="services-heading"
          className="mt-4 font-serif text-4xl font-semibold tracking-tight text-[var(--navy)] sm:text-5xl"
        >
          Corporate catering, office meals, events and live stations.
        </h2>
        <p className="mt-5 text-lg leading-8 text-[var(--ink-muted)]">
          Start with the service style that fits your workplace or celebration.
          Menus are confirmed after we review guest count, timing, and dietary
          needs.
        </p>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {services.map((service, index) => (
          <article
            key={service.title}
            className="border-t border-[var(--bronze)]/40 pt-8"
          >
            <p className="text-sm font-bold text-[var(--bronze-dark)]">
              0{index + 1}
            </p>
            <h3 className="mt-6 font-serif text-2xl font-semibold text-[var(--navy)]">
              {service.title}
            </h3>
            <p className="mt-4 leading-7 text-[var(--ink-muted)]">
              {service.description}
            </p>
            <Link
              href={service.href}
              className="mt-5 inline-flex min-h-11 items-center font-semibold text-[var(--navy)] underline decoration-[var(--bronze)]/50 underline-offset-4 hover:decoration-[var(--bronze)]"
            >
              Explore {service.title}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
