"use client";

import Link from "next/link";
import { contactHref } from "@/lib/paths";
import { paths } from "@/lib/paths";

type CtaButtonsProps = {
  variant?: "onDark" | "onLight";
  includeMenu?: boolean;
  includeQuote?: boolean;
  className?: string;
};

const base =
  "inline-flex min-h-12 w-full items-center justify-center rounded-full px-7 text-sm font-semibold transition sm:w-auto";

export default function CtaButtons({
  variant = "onDark",
  includeMenu = true,
  includeQuote = false,
  className = "",
}: CtaButtonsProps) {
  const primary = `${base} bg-[var(--bronze)] text-white hover:bg-[var(--bronze-dark)]`;
  const secondary =
    variant === "onDark"
      ? `${base} border border-white/35 bg-white/5 text-white hover:border-white/60`
      : `${base} border border-[var(--navy)]/20 bg-white text-[var(--navy)] hover:border-[var(--bronze)]`;

  return (
    <div className={`flex w-full max-w-lg flex-col gap-3 sm:max-w-none sm:flex-row sm:flex-wrap ${className}`}>
      <Link href={paths.contact} className={primary}>
        Request Catering
      </Link>
      <Link href={contactHref("tasting")} className={secondary}>
        Book a Tasting
      </Link>
      {includeQuote ? (
        <Link href={contactHref("quote")} className={secondary}>
          Get a Quote
        </Link>
      ) : null}
      {includeMenu ? (
        <Link href={paths.menu} className={secondary}>
          View Catering Menu
        </Link>
      ) : null}
    </div>
  );
}
