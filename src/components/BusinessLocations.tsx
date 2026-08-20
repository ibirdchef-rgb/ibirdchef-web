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
      <div className={`grid gap-6 ${compact ? "sm:grid-cols-2" : "md:grid-cols-2"}`}>
        {siteConfig.locations.map((location) => (
          <address
            key={location.id}
            className="not-italic"
          >
            <p className="text-sm font-semibold text-[var(--navy)]">
              {location.label}
            </p>
            {location.lines.map((line) => (
              <p key={line} className="mt-1 text-sm leading-6 text-[var(--ink-muted)]">
                {line}
              </p>
            ))}
          </address>
        ))}
      </div>
      <p className="mt-4 text-xs leading-5 text-[var(--ink-muted)]">
        {siteConfig.locationDisclaimer}
      </p>
    </div>
  );
}
