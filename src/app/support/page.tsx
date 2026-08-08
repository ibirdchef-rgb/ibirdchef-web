import type { Metadata } from "next";
import AnsPolicyShell from "@/components/ans/AnsPolicyShell";
import { ansOwnerConfig, getBusinessAddressLines } from "@/lib/ans-mcp/owner-config";

export const metadata: Metadata = {
  title: "Support — ANS Food Business Fit",
  description: "Support contacts for the ANS Food Business Fit planning app.",
  alternates: { canonical: "/support" },
};

export default function SupportPage() {
  const businessAddressLines = getBusinessAddressLines();

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
          <a
            className="font-semibold text-[#0b4f9c] underline underline-offset-4"
            href={ansOwnerConfig.supportEmailHref}
          >
            {ansOwnerConfig.supportEmail}
          </a>
        </li>
        <li>
          Support URL:{" "}
          <a
            className="font-semibold text-[#0b4f9c] underline underline-offset-4"
            href={ansOwnerConfig.supportUrl}
          >
            {ansOwnerConfig.supportUrl}
          </a>
        </li>
        <li>
          Business address:{" "}
          <strong className="whitespace-pre-line">
            {businessAddressLines.join("\n")}
          </strong>
        </li>
      </ul>

      <h2 className="pt-4 text-xl font-semibold text-[#071a2b]">What we can help with</h2>
      <p>
        Questions about planning estimates, how to interpret budget alignment /
        timeline readiness / operational fit / planning risks, MCP tool usage, and
        general product support.
      </p>

      <h2 className="pt-4 text-xl font-semibold text-[#071a2b]">What support cannot provide</h2>
      <p>
        Guaranteed revenue, profitability, licensing approvals, financing decisions,
        legal opinions, or confirmation of opening dates. Those require qualified
        local professional review.
      </p>

      <p className="rounded-md border border-[#0b4f9c]/20 bg-white p-4 text-sm">
        Privacy and data-deletion requests for Business Fit should use the approved
        privacy contact on{" "}
        <a className="text-[#0b4f9c] underline" href="/business-fit/privacy">
          /business-fit/privacy
        </a>{" "}
        or the{" "}
        <a className="text-[#0b4f9c] underline" href="/data-request">
          data request
        </a>{" "}
        page, not the general Marketplace support inbox.
      </p>
    </AnsPolicyShell>
  );
}
