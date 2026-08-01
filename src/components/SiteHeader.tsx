"use client";

import Image from "next/image";
import { useEffect, useId, useState } from "react";

const navLinks = [
  { href: "/#services", label: "Services" },
  { href: "/#corporate", label: "Corporate" },
  { href: "/#menu", label: "Menu" },
  { href: "/#about", label: "About" },
  { href: "/#experience", label: "Food Experience" },
  { href: "/#areas", label: "Service Areas" },
] as const;

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--navy)]/10 bg-[var(--ivory)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3 lg:px-10">
        <a href="/#home" className="flex min-w-0 items-center gap-3" onClick={closeMenu}>
          <Image
            src="/ibirdchef-logo.jpeg"
            alt="iBirdChef South Asian Cuisine Catering Company"
            width={64}
            height={64}
            className="h-12 w-12 shrink-0 rounded-lg object-cover sm:h-14 sm:w-14"
            priority
          />

          <div className="min-w-0">
            <p className="font-serif text-lg font-semibold tracking-tight text-[var(--navy)] sm:text-xl">
              iBirdChef
            </p>
            <p className="truncate text-[0.65rem] uppercase tracking-[0.18em] text-[var(--bronze-dark)] sm:text-xs sm:tracking-[0.22em]">
              South Asian Cuisine Catering
            </p>
          </div>
        </a>

        <nav
          className="hidden items-center gap-6 text-sm font-medium text-[var(--navy)] lg:flex"
          aria-label="Primary"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition hover:text-[var(--bronze)]"
            >
              {link.label}
            </a>
          ))}

          <a
            href="/#contact"
            className="inline-flex min-h-12 items-center rounded-full bg-[var(--bronze)] px-6 py-3 font-semibold text-white transition hover:bg-[var(--bronze-dark)]"
          >
            Book
          </a>
        </nav>

        <div className="flex items-center gap-2 lg:hidden">
          <a
            href="/#contact"
            className="inline-flex min-h-11 items-center rounded-full bg-[var(--bronze)] px-4 py-2.5 text-sm font-semibold text-white"
            onClick={closeMenu}
          >
            Book
          </a>

          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-[var(--navy)]/20 bg-white px-3 text-sm font-semibold text-[var(--navy)]"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id={menuId}
          className="border-t border-[var(--navy)]/10 bg-[var(--ivory)] lg:hidden"
          aria-label="Mobile"
        >
          <ul className="mx-auto flex max-w-7xl list-none flex-col gap-1 px-6 py-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="flex min-h-12 items-center rounded-xl px-3 text-base font-medium text-[var(--navy)] hover:bg-[var(--navy)]/5"
                  onClick={closeMenu}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href="/#contact"
                className="mt-2 flex min-h-12 items-center justify-center rounded-full bg-[var(--bronze)] px-4 text-base font-semibold text-white"
                onClick={closeMenu}
              >
                Book
              </a>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
