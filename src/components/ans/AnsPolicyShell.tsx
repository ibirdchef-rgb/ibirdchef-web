import Link from "next/link";
import type { ReactNode } from "react";
import { ansOwnerConfig } from "@/lib/ans-mcp/owner-config";

export default function AnsPolicyShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f4f7fb] text-[#122033]">
      <header className="border-b border-[#0b4f9c]/15 bg-white">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/ans-food-service-os-logo.png"
            alt="ANS Food Service OS"
            width={960}
            height={344}
            className="h-auto w-[220px]"
          />
          <p className="text-xs uppercase tracking-[0.18em] text-[#0b4f9c]">
            {ansOwnerConfig.publisherName}
          </p>
        </div>
      </header>
      <main id="main-content" className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0b4f9c]">
          {ansOwnerConfig.appName}
        </p>
        <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-[#071a2b]">
          {title}
        </h1>
        <div className="prose-ans mt-8 space-y-4 text-base leading-7 text-[#334155]">
          {children}
        </div>
        <nav className="mt-12 flex flex-wrap gap-4 border-t border-[#0b4f9c]/15 pt-6 text-sm">
          <Link className="text-[#0b4f9c] underline-offset-4 hover:underline" href="/business-fit/privacy">
            Privacy
          </Link>
          <Link className="text-[#0b4f9c] underline-offset-4 hover:underline" href="/terms">
            Terms
          </Link>
          <Link className="text-[#0b4f9c] underline-offset-4 hover:underline" href="/support">
            Support
          </Link>
          <Link
            className="text-[#0b4f9c] underline-offset-4 hover:underline"
            href="/data-request"
          >
            Data request
          </Link>
          <Link
            className="text-[#0b4f9c] underline-offset-4 hover:underline"
            href="/business-fit/disclaimer"
          >
            Disclaimer
          </Link>
          <Link
            className="text-[#0b4f9c] underline-offset-4 hover:underline"
            href="/business-fit"
          >
            Business Fit
          </Link>
        </nav>
      </main>
    </div>
  );
}
