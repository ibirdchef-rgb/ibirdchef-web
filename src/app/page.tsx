import Image from "next/image";

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

const serviceAreas = [
  "Seattle",
  "Bellevue",
  "Redmond",
  "Sammamish",
  "Issaquah",
  "Eastside Communities",
  "San Francisco Bay Area",
  "San Jose",
  "Oakland",
  "Fremont",
];

const galleryItems = [
  {
    title: "Corporate Breakfast",
    style: "bg-[linear-gradient(135deg,#d7b985,#87613c)]",
  },
  {
    title: "Private Dining",
    style: "bg-[linear-gradient(135deg,#8e4f32,#d5a56d)]",
  },
  {
    title: "Special Event Catering",
    style: "bg-[linear-gradient(135deg,#737c53,#d2be8b)]",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fffdf8] text-[#241b15]">
      <header className="sticky top-0 z-50 border-b border-[#241b15]/10 bg-[#fffdf8]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 lg:px-10">
          <a href="#home" className="flex items-center gap-3">
            <Image
              src="/ibirdchef-logo.jpeg"
              alt="iBirdChef South Asian Cuisine Catering Company"
              width={500}
              height={500}
              className="h-16 w-16 rounded-xl object-cover shadow-sm"
              priority
            />

            <div className="hidden sm:block">
              <p className="font-serif text-xl font-semibold">iBirdChef</p>
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#76685d]">
                South Asian Cuisine Catering
              </p>
            </div>
          </a>

          <nav className="hidden items-center gap-6 text-sm font-medium lg:flex">
            <a href="#home" className="transition hover:text-[#a5741d]">
              Home
            </a>

            <a href="#services" className="transition hover:text-[#a5741d]">
              Services
            </a>

            <a href="#corporate" className="transition hover:text-[#a5741d]">
              Corporate
            </a>

            <a href="#about" className="transition hover:text-[#a5741d]">
              About
            </a>

            <a href="#gallery" className="transition hover:text-[#a5741d]">
              Menus & Gallery
            </a>

            <a href="#contact" className="transition hover:text-[#a5741d]">
              Contact
            </a>

            <a
              href="#contact"
              className="rounded-full bg-[#b8892d] px-6 py-3 font-semibold text-white transition hover:bg-[#926b24]"
            >
              Request Catering
            </a>
          </nav>

          <a
            href="#contact"
            className="rounded-full bg-[#b8892d] px-4 py-2 text-sm font-semibold text-white lg:hidden"
          >
            Book
          </a>
        </div>
      </header>

      <section
        id="home"
        className="border-b border-[#241b15]/10 bg-[#f3efe7]"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:px-10 lg:py-24">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#a5741d]">
              Seattle & Bay Area Private Chef and Catering
            </p>

            <h1 className="mt-5 max-w-2xl font-serif text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Memorable food, professionally prepared for every occasion.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-[#6e6259]">
              iBirdChef provides private dining, corporate catering, and
              special-event culinary services across Seattle, the Eastside,
              and the San Francisco Bay Area.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <a
                href="#contact"
                className="inline-flex h-12 items-center justify-center rounded-full bg-[#b8892d] px-7 text-sm font-semibold text-white transition hover:bg-[#926b24]"
              >
                Book Chef Simbu
              </a>

              <a
                href="#services"
                className="inline-flex h-12 items-center justify-center rounded-full border border-[#241b15]/20 bg-white px-7 text-sm font-semibold transition hover:border-[#b8892d]"
              >
                Explore Services
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] overflow-hidden rounded-[2rem] bg-[#062b35] shadow-2xl">
              <div className="relative flex h-full items-center justify-center p-8">
                <Image
                  src="/ibirdchef-logo.jpeg"
                  alt="iBirdChef South Asian Cuisine Catering Company"
                  width={500}
                  height={500}
                  className="h-full w-full object-contain"
                  priority
                />
              </div>
            </div>

            <div className="absolute -bottom-5 -left-4 rounded-2xl bg-white px-6 py-5 shadow-xl">
              <p className="text-sm font-semibold">16+ years</p>
              <p className="mt-1 text-xs text-[#76685d]">
                Culinary and foodservice experience
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="services"
        className="mx-auto max-w-7xl px-6 py-20 lg:px-10"
      >
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#a5741d]">
            Our Services
          </p>

          <h2 className="mt-4 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
            Private chef and catering services built around your event.
          </h2>

          <p className="mt-5 text-lg leading-8 text-[#6e6259]">
            From intimate dinners to workplace catering and large celebrations,
            every menu is planned for flavor, presentation, and dependable
            execution.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {services.map((service, index) => (
            <article
              key={service.title}
              className="rounded-3xl border border-[#241b15]/10 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <p className="text-sm font-bold text-[#b8892d]">
                0{index + 1}
              </p>

              <h3 className="mt-8 font-serif text-2xl font-semibold">
                {service.title}
              </h3>

              <p className="mt-4 leading-7 text-[#6e6259]">
                {service.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="corporate"
        className="border-y border-[#241b15]/10 bg-[#f3efe7]"
      >
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#a5741d]">
                Corporate Experience
              </p>

              <h2 className="mt-4 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
                Proven experience supporting corporate dining and events.
              </h2>
            </div>

            <div>
              <p className="text-lg leading-8 text-[#6e6259]">
                iBirdChef is an approved vendor for Aramark and Sodexo and has
                supported the preparation and service of more than 5,000 meals
                for Bay Area corporate offices and events.
              </p>

              <p className="mt-4 text-sm leading-6 text-[#81746a]">
                Our experience includes workplace meals, corporate events,
                executive service, high-volume production, dietary
                accommodations, and dependable event execution.
              </p>
            </div>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {corporateHighlights.map((highlight) => (
              <article
                key={highlight.label}
                className="rounded-3xl border border-[#241b15]/10 bg-white p-8 shadow-sm"
              >
                <p className="font-serif text-4xl font-semibold text-[#9b6c18]">
                  {highlight.value}
                </p>

                <h3 className="mt-3 text-lg font-semibold">
                  {highlight.label}
                </h3>

                <p className="mt-4 leading-7 text-[#6e6259]">
                  {highlight.description}
                </p>
              </article>
            ))}
          </div>

          <p className="mt-8 text-center text-xs leading-5 text-[#81746a]">
            Approved-vendor status is presented as factual business experience
            and does not imply endorsement by the named organizations.
          </p>
        </div>
      </section>

      <section id="about" className="bg-[#062b35] text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:px-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#d8ae58]">
              About Chef Simbu
            </p>

            <h2 className="mt-4 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
              Culinary experience grounded in real hospitality operations.
            </h2>
          </div>

          <div>
            <p className="text-lg leading-8 text-white/70">
              Chef Simbu brings more than 16 years of culinary and foodservice
              leadership experience. His approach combines quality ingredients,
              disciplined preparation, thoughtful presentation, and dependable
              service.
            </p>

            <p className="mt-6 leading-7 text-white/60">
              Every event is planned with attention to the guest experience,
              dietary requirements, production timing, food safety, and the
              details that make food memorable.
            </p>
          </div>
        </div>
      </section>

      <section
        id="gallery"
        className="mx-auto max-w-7xl px-6 py-20 lg:px-10"
      >
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#a5741d]">
              Menus & Gallery
            </p>

            <h2 className="mt-4 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
              Food created for real celebrations.
            </h2>
          </div>

          <p className="max-w-md leading-7 text-[#6e6259]">
            Our complete menu collections and original event photography will
            be added as the website is completed.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {galleryItems.map((item) => (
            <article
              key={item.title}
              className="overflow-hidden rounded-3xl border border-[#241b15]/10 bg-white"
            >
              <div className={`aspect-[4/3] ${item.style}`} />

              <div className="p-6">
                <h3 className="font-serif text-xl font-semibold">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm text-[#76685d]">
                  Original iBirdChef photography coming next.
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-[#241b15]/10 bg-[#f3efe7]">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
          <p className="text-center text-xs font-bold uppercase tracking-[0.25em] text-[#a5741d]">
            Service Areas
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {serviceAreas.map((area) => (
              <span
                key={area}
                className="rounded-full border border-[#241b15]/15 bg-white px-5 py-3 text-sm font-medium"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section
        id="contact"
        className="mx-auto max-w-7xl px-6 py-20 lg:px-10"
      >
        <div className="rounded-[2rem] bg-[#b8892d] px-8 py-14 text-white sm:px-12">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/75">
            Request Catering
          </p>

          <div className="mt-5 flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
            <div>
              <h2 className="max-w-3xl font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
                Tell us about your event.
              </h2>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/80">
                Share your event date, guest count, location, menu preferences,
                dietary needs, service style, and estimated budget. The
                complete inquiry form will be connected during the next build
                stage.
              </p>
            </div>

            <button
              type="button"
              className="h-12 shrink-0 rounded-full bg-white px-7 text-sm font-semibold text-[#7e591c]"
            >
              Inquiry Form Coming Next
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#241b15]/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-6 py-8 text-sm text-[#76685d] sm:flex-row lg:px-10">
          <p>© 2026 iBirdChef. All rights reserved.</p>

          <p>
            Private chef and catering services in Seattle, the Eastside, and
            the San Francisco Bay Area.
          </p>
        </div>
      </footer>
    </main>
  );
}