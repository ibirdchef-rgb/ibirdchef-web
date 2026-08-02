const experiencePoints = [
  {
    title: "Custom South Asian menus",
    description:
      "Menus shaped around your occasion, guest preferences, and the flavors that define iBirdChef’s South Asian cuisine catering.",
  },
  {
    title: "Corporate hospitality",
    description:
      "Dependable breakfast, lunch, reception, and executive service planned around production timing and dietary needs.",
  },
  {
    title: "Private dining",
    description:
      "In-home and private-chef experiences for intimate gatherings, celebrations, and thoughtfully paced service.",
  },
  {
    title: "Dietary and allergy-aware planning",
    description:
      "Event planning that accounts for dietary needs, allergies, and guest comfort from inquiry through service.",
  },
] as const;

export default function CuisineExperience() {
  return (
    <section
      id="experience"
      className="mx-auto max-w-7xl px-6 py-20 lg:px-10"
      aria-labelledby="experience-heading"
    >
      <div className="grid items-start gap-12 lg:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--bronze-dark)]">
            Culinary Focus
          </p>
          <h2
            id="experience-heading"
            className="mt-4 font-serif text-4xl font-semibold tracking-tight text-[var(--navy)] sm:text-5xl"
          >
            A refined South Asian hospitality experience.
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--ink-muted)]">
            iBirdChef focuses on custom South Asian menus, corporate catering,
            private dining, and dietary and allergy-aware planning—prepared for
            the way your guests actually gather.
          </p>
        </div>

        <ul className="grid list-none gap-8 p-0 sm:grid-cols-2">
          {experiencePoints.map((point) => (
            <li
              key={point.title}
              className="border-t border-[var(--navy)]/15 pt-6"
            >
              <h3 className="font-serif text-xl font-semibold text-[var(--navy)]">
                {point.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--ink-muted)]">
                {point.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
