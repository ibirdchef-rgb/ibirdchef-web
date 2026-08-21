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
    title: "Live culinary stations",
    description:
      "Chef-attended dosa, chaat, and tandoor/grill stations for cultural events, receptions, and private gatherings.",
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
      className="border-b border-[var(--navy)]/10 bg-[var(--ivory)]"
      aria-labelledby="experience-heading"
    >
      <div className="mx-auto max-w-7xl px-6 section-y lg:px-10">
      <div className="grid items-start gap-8 lg:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--bronze-dark)]">
            Culinary Focus
          </p>
          <h2
            id="experience-heading"
            className="mt-3 font-serif text-3xl font-semibold tracking-tight text-[var(--navy)] sm:text-4xl"
          >
            A refined South Asian catering experience for workplaces and celebrations.
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--ink-muted)]">
            iBirdChef focuses on corporate catering, office meals, cultural
            menus, live stations, and private dining—prepared for the way your
            guests actually gather.
          </p>
        </div>

        <ul className="grid list-none gap-4 p-0 sm:grid-cols-2">
          {experiencePoints.map((point) => (
            <li
              key={point.title}
              className="surface-card p-5"
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
      </div>
    </section>
  );
}
