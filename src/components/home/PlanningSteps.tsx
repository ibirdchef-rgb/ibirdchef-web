const steps = [
  {
    title: "Share your event details",
    description:
      "Tell us your region, city, venue or ZIP, date, guests, event type, and service style.",
  },
  {
    title: "iBirdChef follows up",
    description:
      "Our team reviews your inquiry and follows up to clarify preferences and timing.",
  },
  {
    title: "Receive a custom, chef-approved quote",
    description:
      "Final pricing is confirmed after event details and operational requirements are reviewed.",
  },
] as const;

export default function PlanningSteps() {
  return (
    <section
      id="planning"
      className="border-y border-[var(--navy)]/10 bg-[var(--ivory-soft)]"
      aria-labelledby="planning-heading"
    >
      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--bronze-dark)]">
            How Planning Works
          </p>
          <h2
            id="planning-heading"
            className="mt-4 font-serif text-4xl font-semibold tracking-tight text-[var(--navy)] sm:text-5xl"
          >
            Simple steps from inquiry to a chef-approved quote.
          </h2>
        </div>

        <ol className="mt-12 grid list-none gap-8 p-0 md:grid-cols-3">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="border-t border-[var(--navy)]/15 pt-6"
            >
              <p className="text-sm font-bold text-[var(--bronze-dark)]">
                0{index + 1}
              </p>
              <h3 className="mt-3 font-serif text-xl font-semibold text-[var(--navy)]">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--ink-muted)]">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
