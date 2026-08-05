import type { Metadata } from "next";
import AnsPolicyShell from "@/components/ans/AnsPolicyShell";
import {
  ansOwnerConfig,
  ownerFieldOrPlaceholder,
} from "@/lib/ans-mcp/owner-config";

export const metadata: Metadata = {
  title: "Terms of Use — ANS Food Business Fit",
  description:
    "Terms of use for the ANS Food Business Fit planning app published by ANS Corporation.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <AnsPolicyShell title="Terms of Use">
      <p>
        These terms apply to <strong>{ansOwnerConfig.appName}</strong> provided by{" "}
        <strong>{ansOwnerConfig.publisherName}</strong>. By using the app, website
        prototype, or MCP tools, you agree to use the outputs as preliminary
        planning guidance only.
      </p>

      <h2 className="pt-4 text-xl font-semibold text-[#071a2b]">Planning estimates only</h2>
      <p>
        Outputs are deterministic planning estimates. They are not legal, tax,
        accounting, investment, licensing, financing, engineering, or real-estate
        advice. No quote, capacity, profit, financing approval, licensing outcome,
        or opening date is guaranteed.
      </p>

      <h2 className="pt-4 text-xl font-semibold text-[#071a2b]">Acceptable use</h2>
      <p>
        Do not use the service to attempt unauthorized access, abuse rate limits,
        inject malicious content, harvest data about other users, or connect the
        tools to systems that would disclose private recipes, costs, customer data,
        or tenant data.
      </p>

      <h2 className="pt-4 text-xl font-semibold text-[#071a2b]">No automated commitments</h2>
      <p>
        The app does not place orders, send customer outreach, collect payments,
        confirm events, or create binding vendor or lease commitments.
      </p>

      <h2 className="pt-4 text-xl font-semibold text-[#071a2b]">Jurisdiction</h2>
      <p>
        Governing jurisdiction:{" "}
        <strong>
          {ownerFieldOrPlaceholder(
            ansOwnerConfig.governingJurisdiction,
            "ANS_GOVERNING_JURISDICTION",
          )}
        </strong>
        .
      </p>

      <h2 className="pt-4 text-xl font-semibold text-[#071a2b]">Contact</h2>
      <p>
        Support:{" "}
        <a
          className="font-semibold text-[#0b4f9c] underline underline-offset-4"
          href={ansOwnerConfig.supportEmailHref}
        >
          {ansOwnerConfig.supportEmail}
        </a>
      </p>

      <p className="rounded-md border border-[#0b4f9c]/20 bg-white p-4 text-sm">
        Final legal wording and jurisdiction must be approved by ANS Corporation
        before marketplace publication. Placeholders are intentional.
      </p>
    </AnsPolicyShell>
  );
}
