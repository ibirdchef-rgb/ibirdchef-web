const services = [
  {
    title: "Private Chef Dining",
    description:
      "Personalized in-home dining experiences designed around your event, preferences, and dietary needs.",
  },
  {
    title: "Corporate Catering",
    description:
      "Professional breakfast, lunch, reception, and executive catering for workplaces across Greater Seattle and the San Francisco Bay Area.",
  },
  {
    title: "Special Events",
    description:
      "Thoughtful menus and reliable culinary execution for celebrations, weddings, corporate events, and private gatherings.",
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
          Curated hospitality for workplaces and celebrations.
        </h2>
        <p className="mt-5 text-lg leading-8 text-[var(--ink-muted)]">
          From intimate dinners to workplace catering, every menu is planned for
          flavor, presentation, and dependable execution.
        </p>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-3">
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
          </article>
        ))}
      </div>
    </section>
  );
}
