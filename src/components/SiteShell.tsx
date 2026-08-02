"use client";

import type { ReactNode } from "react";
import { RegionProvider } from "@/components/RegionProvider";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

export default function SiteShell({ children }: { children: ReactNode }) {
  return (
    <RegionProvider>
      <div className="min-h-screen bg-[var(--ivory)] text-[var(--foreground)]">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg"
        >
          Skip to main content
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </div>
    </RegionProvider>
  );
}
