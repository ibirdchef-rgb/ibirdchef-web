import type { Metadata } from "next";
import AnsPolicyShell from "@/components/ans/AnsPolicyShell";
import {
  ansOwnerConfig,
  ownerFieldOrPlaceholder,
} from "@/lib/ans-mcp/owner-config";

export const metadata: Metadata = {
  title: "Support — ANS Food Business Fit",
  description: "Support contacts for the ANS Food Business Fit planning app.",
  alternates: { canonical: "/support" },
};

export default function SupportPage() {
  return (
    <AnsPolicyShell title="Support">
      <p>
        Support for <strong>{ansOwnerConfig.appName}</strong> is provided by{" "}
        <strong>{ansOwnerConfig.publisherName}</strong>.
      </p>

      <h2 className="pt-4 text-xl font-semibold text-[#071a2b]">How to contact support</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          Email:{" "}
          <strong>
            {ownerFieldOrPlaceholder(ansOwnerConfig.supportEmail, "ANS_SUPPORT_EMAIL")}
          </strong>
        </li>
        <li>
          Support URL:{" "}
          <strong>
            {ownerFieldOrPlaceholder(ansOwnerConfig.supportUrl, "ANS_SUPPORT_URL")}
          </strong>
        </li>
        <li>
          Business address:{" "}
          <strong>
            {ownerFieldOrPlaceholder(
              ansOwnerConfig.businessAddress,
              "ANS_BUSINESS_ADDRESS",
            )}
          </strong>
        </li>
      </ul>

      <h2 className="pt-4 text-xl font-semibold text-[#071a2b]">What we can help with</h2>
      <p>
        Questions about planning estimates, how to interpret budget alignment /
        timeline readiness / operational fit / planning risks, MCP tool usage, and
        privacy or data requests.
      </p>

      <h2 className="pt-4 text-xl font-semibold text-[#071a2b]">What support cannot provide</h2>
      <p>
        Guaranteed revenue, profitability, licensing approvals, financing decisions,
        legal opinions, or confirmation of opening dates. Those require qualified
        local professional review.
      </p>

      <p className="rounded-md border border-[#0b4f9c]/20 bg-white p-4 text-sm">
        Do not invent a support email. Owner must set{" "}
        <code>ANS_SUPPORT_EMAIL</code> and related fields before submission.
      </p>
    </AnsPolicyShell>
  );
}
