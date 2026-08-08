import type { Metadata } from "next";
import AnsPolicyShell from "@/components/ans/AnsPolicyShell";
import { ansOwnerConfig } from "@/lib/ans-mcp/owner-config";

export const metadata: Metadata = {
  title: "Disclaimer — ANS Food Business Fit",
  description:
    "Important limitations for ANS Food Business Fit preliminary planning estimates.",
  alternates: { canonical: "/business-fit/disclaimer" },
};

export default function BusinessFitDisclaimerPage() {
  return (
    <AnsPolicyShell title="Planning disclaimer">
      <p>
        <strong>{ansOwnerConfig.appName}</strong> from{" "}
        <strong>{ansOwnerConfig.publisherName}</strong> provides preliminary
        planning guidance only.
      </p>

      <h2 className="pt-4 text-xl font-semibold text-[#071a2b]">What the app provides</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>Budget alignment planning ranges</li>
        <li>Timeline readiness checks against typical planning windows</li>
        <li>Operational fit indicators</li>
        <li>Potential planning risks and missing-information prompts</li>
      </ul>

      <h2 className="pt-4 text-xl font-semibold text-[#071a2b]">What the app does not provide</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>Live market demand, competition, rent, or demographic verification</li>
        <li>Revenue, profitability, or ROI predictions</li>
        <li>Guaranteed licensing, permitting, financing, or opening outcomes</li>
        <li>Legal, tax, accounting, or investment advice</li>
        <li>Quotes, payments, bookings, customer outreach, or event confirmation</li>
      </ul>

      <p>
        All checklist and licensing categories require local professional review.
        Manual review is recommended before leases, purchases, hires, or filings.
      </p>

      <p>
        See also the{" "}
        <a className="text-[#0b4f9c] underline" href="/terms">
          Terms of Use
        </a>{" "}
        and{" "}
        <a className="text-[#0b4f9c] underline" href="/business-fit/privacy">
          Privacy Policy
        </a>
        .
      </p>
    </AnsPolicyShell>
  );
}
