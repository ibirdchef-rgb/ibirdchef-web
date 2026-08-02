import Image from "next/image";
import InquiryForm from "@/components/InquiryForm";
import MenuSection from "@/components/MenuSection";
import SiteHeader from "@/components/SiteHeader";
import { siteConfig } from "@/lib/site";

const services = [
  {
    title: "Private Chef Dining",
    description:
      "Personalized in-home dining experiences designed around your event, preferences, and dietary needs.",
  },
  {
    title: "Corporate Catering",
    description:
      "Professional breakfast, lunch, reception, and executive catering for workplaces across Seattle, the Eastside, and the San Francisco Bay Area.",
  },
  {
    title: "Special Events",
    description:
      "Thoughtful menus and reliable culinary execution for celebrations, weddings, corporate events, and private gatherings.",
  },
];

const corporateHighlights = [
  {
    value: "Approved",
    label: "Aramark Vendor",
    description:
      "Approved-vendor experience supporting professional corporate foodservice operations.",
  },
  {
    value: "Approved",
    label: "Sodexo Vendor",
    description:
      "Experience working within established corporate dining and event-service requirements.",
  },
  {
    value: "5,000+",
    label: "Meals Supported",
    description:
      "Meals prepared and served for Bay Area corporate offices and special events.",
  },
];

const experiencePoints = [
  {
    title: "Custom South Asian menus",
    description:
      "Menus shaped around your occasion, guest preferences, and the flavors that define iBirdChef’s South Asian cuisine catering.",
  },
  {
    title: "Corporate catering",
    description:
      "Dependable breakfast, lunch, reception, and executive service for workplaces across Seattle, the Eastside, and the Bay Area.",
  },
  {
    title: "Private dining",
    description:
      "In-home and private-chef experiences planned for intimate gatherings, celebrations, and thoughtfully paced service.",
  },
  {
    title: "Dietary and allergy-aware planning",
    description:
      "Event planning that accounts for dietary needs, allergies, production timing, and guest comfort from inquiry through service.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--ivory)] text-[var(--foreground)]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg"
      >
        Skip to main content
      </a>

      <SiteHeader />

      <main id="main-content">
        <section
          id="home"
          className="relative overflow-hidden bg-[var(--navy)] text-white"
          aria-labelledby="hero-heading"
        >
          <div className="absolute inset-0">
            <Image
              src="/ibirdchef-hero.jpg"
              alt=""
              fill
              sizes="100vw"
              className="object-cover object-[50%_40%] opacity-35"
              priority
              quality={75}
            />
            <div
              className="absolute inset-0 bg-[linear-gradient(105deg,rgba(4,31,39,0.92)_0%,rgba(4,31,39,0.78)_45%,rgba(4,31,39,0.55)_100%)]"
              aria-hidden="true"
            />
          </div>

          <div className="relative mx-auto flex min-h-[min(88vh,46rem)] max-w-7xl flex-col justify-center px-6 py-16 lg:px-10 lg:py-24">
            <div className="max-w-2xl">
              <p className="font-serif text-4xl font-semibold tracking-tight text-[var(--ivory-soft)] sm:text-5xl lg:text-6xl">
                iBirdChef
              </p>

              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--bronze)]">
                South Asian Cuisine Catering · Seattle, Eastside & Bay Area
              </p>

              <h1
                id="hero-heading"
                className="mt-6 font-serif text-4xl font-semibold leading-[1.08] tracking-tight text-[var(--ivory-soft)] sm:text-5xl lg:text-[3.35rem]"
              >
                Private chef dining and corporate catering, prepared with care.
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-white/80 sm:text-lg">
                Custom South Asian menus for private events and workplaces across
                Seattle, the Eastside, and the San Francisco Bay Area — with
                dietary and allergy-aware planning built into every inquiry.
              </p>

              <div className="mt-9 flex w-full max-w-md flex-col gap-3 sm:max-w-none sm:flex-row">
                <a
                  href="#contact"
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[var(--bronze)] px-7 text-sm font-semibold text-white transition hover:bg-[var(--bronze-dark)] sm:w-auto"
                >
                  Book Chef Simbu
                </a>

                <a
                  href="#services"
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-white/35 bg-white/5 px-7 text-sm font-semibold text-white transition hover:border-white/60 sm:w-auto"
                >
                  Explore Services
                </a>
              </div>
            </div>
          </div>
        </section>

        <section
          id="services"
          className="mx-auto max-w-7xl px-6 py-20 lg:px-10"
          aria-labelledby="services-heading"
        >
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--bronze-dark)]">
              Our Services
            </p>

            <h2
              id="services-heading"
              className="mt-4 font-serif text-4xl font-semibold tracking-tight text-[var(--navy)] sm:text-5xl"
            >
              Private chef and catering services built around your event.
            </h2>

            <p className="mt-5 text-lg leading-8 text-[var(--ink-muted)]">
              From intimate dinners to workplace catering and large celebrations,
              every menu is planned for flavor, presentation, and dependable
              execution.
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

        <section
          id="corporate"
          className="border-y border-[var(--navy)]/10 bg-[var(--ivory-soft)]"
          aria-labelledby="corporate-heading"
        >
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--bronze-dark)]">
                  Corporate Experience
                </p>

                <h2
                  id="corporate-heading"
                  className="mt-4 font-serif text-4xl font-semibold tracking-tight text-[var(--navy)] sm:text-5xl"
                >
                  Proven experience supporting corporate dining and events.
                </h2>
              </div>

              <div>
                <p className="text-lg leading-8 text-[var(--ink-muted)]">
                  iBirdChef is an approved vendor for Aramark and Sodexo and has
                  supported the preparation and service of more than 5,000 meals
                  for Bay Area corporate offices and events.
                </p>

                <p className="mt-4 text-sm leading-6 text-[var(--ink-muted)]">
                  Our experience includes workplace meals, corporate events,
                  executive service, high-volume production, dietary
                  accommodations, and dependable event execution.
                </p>
              </div>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {corporateHighlights.map((highlight) => (
                <article
                  key={highlight.label}
                  className="border-t border-[var(--navy)]/15 pt-8"
                >
                  <p className="font-serif text-4xl font-semibold text-[var(--bronze-dark)]">
                    {highlight.value}
                  </p>

                  <h3 className="mt-3 text-lg font-semibold text-[var(--navy)]">
                    {highlight.label}
                  </h3>

                  <p className="mt-4 leading-7 text-[var(--ink-muted)]">
                    {highlight.description}
                  </p>
                </article>
              ))}
            </div>

            <p className="mt-8 text-center text-xs leading-5 text-[var(--ink-muted)]">
              Approved-vendor status is presented as factual business experience
              and does not imply endorsement by the named organizations.
            </p>
          </div>
        </section>

        <MenuSection />

        <section
          id="about"
          className="bg-[var(--navy)] text-white"
          aria-labelledby="about-heading"
        >
          <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:px-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--bronze)]">
                About Chef Simbu
              </p>

              <h2
                id="about-heading"
                className="mt-4 font-serif text-4xl font-semibold tracking-tight sm:text-5xl"
              >
                Culinary experience grounded in real hospitality operations.
              </h2>
            </div>

            <div>
              <p className="text-lg leading-8 text-white/75">
                Chef Simbu brings more than 16 years of culinary and foodservice
                leadership experience. His approach combines quality ingredients,
                disciplined preparation, thoughtful presentation, and dependable
                service.
              </p>

              <p className="mt-6 leading-7 text-white/65">
                Every event is planned with attention to the guest experience,
                dietary requirements, production timing, food safety, and the
                details that make food memorable.
              </p>
            </div>
          </div>
        </section>

        <section
          id="experience"
          className="mx-auto max-w-7xl px-6 py-20 lg:px-10"
          aria-labelledby="experience-heading"
        >
          <div className="grid items-start gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--bronze-dark)]">
                Culinary Focus
              </p>

              <h2
                id="experience-heading"
                className="mt-4 font-serif text-4xl font-semibold tracking-tight text-[var(--navy)] sm:text-5xl"
              >
                Food & Event Experience
              </h2>

              <p className="mt-5 max-w-xl text-lg leading-8 text-[var(--ink-muted)]">
                iBirdChef focuses on custom South Asian menus, corporate
                catering, private dining, and dietary and allergy-aware planning
                — prepared for the way your guests actually gather.
              </p>

              <ul className="mt-10 grid list-none gap-8 p-0 sm:grid-cols-2">
                {experiencePoints.map((point) => (
                  <li key={point.title}>
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

            <figure className="relative aspect-[4/5] overflow-hidden bg-[var(--navy)] sm:aspect-[5/6] lg:sticky lg:top-28">
              <Image
                src="/ibirdchef-hero.jpg"
                alt="Plated private chef meal with grilled kabob, seasoned rice, salad, and sides prepared by iBirdChef"
                fill
                sizes="(max-width: 1024px) 100vw, 28rem"
                className="object-cover object-[50%_42%]"
                quality={80}
              />
            </figure>
          </div>
        </section>

        <section
          id="areas"
          className="border-y border-[var(--navy)]/10 bg-[var(--ivory-soft)]"
          aria-labelledby="areas-heading"
        >
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
            <h2
              id="areas-heading"
              className="text-center font-serif text-3xl font-semibold tracking-tight text-[var(--navy)] sm:text-4xl"
            >
              Service Areas
            </h2>

            <ul className="mt-8 flex list-none flex-wrap justify-center gap-3 p-0">
              {siteConfig.serviceAreas.map((area) => (
                <li
                  key={area}
                  className="rounded-full border border-[var(--navy)]/15 bg-white px-5 py-3 text-sm font-medium text-[var(--navy)]"
                >
                  {area}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          id="contact"
          className="mx-auto max-w-7xl px-6 py-20 lg:px-10"
          aria-labelledby="contact-heading"
        >
          <div className="bg-[var(--navy)] px-8 py-14 text-white sm:px-12">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--bronze)]">
              Request Catering
            </p>

            <h2
              id="contact-heading"
              className="mt-5 max-w-3xl font-serif text-4xl font-semibold tracking-tight sm:text-5xl"
            >
              Tell us about your event.
            </h2>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/80">
              Share your event date, guest count, location, menu preferences,
              dietary needs, service style, and estimated budget. We serve
              Seattle, the Eastside, and the San Francisco Bay Area.
            </p>

            <div className="mt-8 flex flex-col gap-3 text-base sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-8 sm:gap-y-3">
              <a
                href={siteConfig.phoneHref}
                className="inline-flex min-h-11 items-center font-semibold text-[var(--ivory-soft)] underline decoration-[var(--bronze)] underline-offset-4 transition hover:text-white"
              >
                {siteConfig.phoneDisplay}
              </a>
              <a
                href={siteConfig.emailHref}
                className="inline-flex min-h-11 items-center font-semibold text-[var(--ivory-soft)] underline decoration-[var(--bronze)] underline-offset-4 transition hover:text-white"
              >
                {siteConfig.emailDisplay}
              </a>
            </div>
          </div>

          <div className="mt-8">
            <InquiryForm />
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--navy)]/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-[var(--ink-muted)] lg:px-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <p>© 2026 iBirdChef. All rights reserved.</p>

            <p className="sm:max-w-md sm:text-right">
              Private chef and catering services in Seattle, the Eastside, and
              the San Francisco Bay Area.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
            <a
              href={siteConfig.phoneHref}
              className="inline-flex min-h-11 items-center font-medium text-[var(--navy)] underline decoration-[var(--bronze)]/50 underline-offset-4 transition hover:decoration-[var(--bronze)]"
            >
              {siteConfig.phoneDisplay}
            </a>
            <a
              href={siteConfig.emailHref}
              className="inline-flex min-h-11 items-center font-medium text-[var(--navy)] underline decoration-[var(--bronze)]/50 underline-offset-4 transition hover:decoration-[var(--bronze)]"
            >
              {siteConfig.emailDisplay}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
