export default function ConciergePreview() {
  return (
    <section
      id="concierge"
      className="mx-auto max-w-7xl px-6 py-20 lg:px-10"
      aria-labelledby="concierge-heading"
    >
      <div className="relative overflow-hidden border border-[var(--navy)]/10 bg-[var(--navy)] px-8 py-14 text-white sm:px-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          aria-hidden="true"
          style={{
            backgroundImage:
              "radial-gradient(circle at 85% 20%, rgba(184,137,45,0.28), transparent 40%), linear-gradient(135deg, rgba(4,31,39,0.2), transparent)",
          }}
        />
        <div className="relative max-w-3xl">
          <p className="inline-flex items-center rounded-full border border-white/25 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--bronze)]">
            Coming soon
          </p>
          <h2
            id="concierge-heading"
            className="mt-5 font-serif text-4xl font-semibold tracking-tight sm:text-5xl"
          >
            AI Concierge guided preview
          </h2>
          <p className="mt-5 text-lg leading-8 text-white/80">
            A future guided helper will walk guests through event details before
            an inquiry. This is a preview only—there is no live AI, automated
            quote, availability promise, or booking confirmation.
          </p>
          <ul className="mt-8 space-y-3 text-sm leading-7 text-white/75">
            <li>Share your event details</li>
            <li>iBirdChef follows up</li>
            <li>Receive a custom, chef-approved quote</li>
          </ul>
          <a
            href="#contact"
            className="mt-9 inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--bronze)] px-7 text-sm font-semibold text-white transition hover:bg-[var(--bronze-dark)]"
          >
            Plan your event now
          </a>
        </div>
      </div>
    </section>
  );
}
