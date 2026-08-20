import type { Metadata } from "next";
import { Suspense } from "react";
import MenuExplorer from "@/components/MenuExplorer";
import SiteShell from "@/components/SiteShell";

export const metadata: Metadata = {
  title: "Catering Menu",
  description:
    "Corporate box meals, office lunch packages, tray and drop-off catering, buffets, vegetarian options, cultural menus, live dosa, chaat and tandoor stations from iBirdChef.",
  alternates: {
    canonical: "/menu",
  },
  openGraph: {
    title: "Catering Menu | iBirdChef",
    description:
      "Browse corporate box meals, drop-off catering, buffets, cultural menus and live stations, then request a custom quote.",
    url: "/menu",
    type: "website",
    images: [
      {
        url: "/ibirdchef-hero.jpg",
        alt: "Grilled skewers with rice and sides prepared by iBirdChef",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Catering Menu | iBirdChef",
    description:
      "Browse corporate box meals, drop-off catering, buffets, cultural menus and live stations, then request a custom quote.",
    images: ["/ibirdchef-hero.jpg"],
  },
};

export default function MenuPage() {
  return (
    <SiteShell>
      <main id="main-content">
        <section className="mx-auto max-w-7xl px-6 pt-12 lg:px-10">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[var(--bronze-dark)]">
            Catering Menu
          </p>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl font-semibold tracking-tight text-[var(--navy)] sm:text-5xl">
            Corporate box meals, buffets, cultural menus and live stations.
          </h1>
        </section>
        <Suspense
          fallback={
            <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
              <p className="font-serif text-3xl font-semibold text-[var(--navy)]">
                Loading catering menu…
              </p>
            </section>
          }
        >
          <MenuExplorer />
        </Suspense>
      </main>
    </SiteShell>
  );
}
