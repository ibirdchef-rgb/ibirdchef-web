"use client";

import { regions, type ServiceRegion } from "@/lib/regions";
import { useRegion } from "@/components/RegionProvider";

type RegionSelectorProps = {
  variant?: "header" | "hero";
  className?: string;
};

export default function RegionSelector({
  variant = "header",
  className = "",
}: RegionSelectorProps) {
  const { region, setRegion } = useRegion();
  const options = Object.values(regions);

  if (variant === "hero") {
    return (
      <div
        className={`flex flex-wrap items-center gap-2 ${className}`}
        role="group"
        aria-label="Choose your service region"
      >
        <p className="mr-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
          Serving
        </p>
        {options.map((option) => {
          const selected = region === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setRegion(option.id)}
              aria-pressed={selected}
              className={`inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-semibold transition ${
                selected
                  ? "border-[var(--bronze)] bg-[var(--bronze)] text-white"
                  : "border-white/35 bg-white/5 text-white hover:border-white/60"
              }`}
            >
              {option.shortLabel}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--navy)] ${className}`}
      role="group"
      aria-label="Service region"
    >
      {options.map((option, index) => {
        const selected = region === option.id;
        return (
          <span key={option.id} className="inline-flex items-center gap-1">
            {index > 0 ? (
              <span className="px-1 text-[var(--bronze-dark)]/70" aria-hidden="true">
                |
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => setRegion(option.id as ServiceRegion)}
              aria-pressed={selected}
              className={`rounded-full px-2 py-1 transition ${
                selected
                  ? "bg-[var(--navy)] text-white"
                  : "text-[var(--navy)]/70 hover:text-[var(--bronze-dark)]"
              }`}
            >
              {option.shortLabel}
            </button>
          </span>
        );
      })}
    </div>
  );
}
