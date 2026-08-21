import { siteConfig } from "@/lib/site";

type BusinessLocationsProps = {
  className?: string;
  compact?: boolean;
};

export default function BusinessLocations({
  className = "",
  compact = false,
}: BusinessLocationsProps) {
  return (
    <div className={className}>
      <div className={`grid gap-4 ${compact ? "sm:grid-cols-2" : "md:grid-cols-2"}`}>
        {siteConfig.locations.map((location) => (
          <address key={location.id} className="surface-card not-italic p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--bronze-dark)]">
              {location.label}
            </p>
            <p className="mt-2 font-serif text-lg font-semibold text-[var(--navy)]">
              {location.addressLocality}
            </p>
            {location.lines.map((line) => (
              <p key={line} className="mt-1 text-sm leading-6 text-[var(--ink-muted)]">
                {line}
              </p>
            ))}
          </address>
        ))}
      </div>
      <p className="mt-3 text-xs leading-5 text-[var(--ink-muted)]">
        {siteConfig.locationDisclaimer}
      </p>
    </div>
  );
}
