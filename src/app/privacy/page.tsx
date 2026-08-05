import type { Metadata } from "next";
import AnsPolicyShell from "@/components/ans/AnsPolicyShell";
import {
  ansOwnerConfig,
  ownerFieldOrPlaceholder,
} from "@/lib/ans-mcp/owner-config";

export const metadata: Metadata = {
  title: "Privacy Policy — ANS Food Business Fit",
  description:
    "Privacy information for the ANS Food Business Fit planning app published by ANS Corporation.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <AnsPolicyShell title="Privacy Policy">
      <p>
        This page describes privacy practices for{" "}
        <strong>{ansOwnerConfig.appName}</strong>, a planning and qualification
        app published by <strong>{ansOwnerConfig.publisherName}</strong>. It does
        not replace separate privacy terms that may apply to iBirdChef catering
        website inquiries.
      </p>

      <h2 className="pt-4 text-xl font-semibold text-[#071a2b]">What information is collected</h2>
      <p>
        Business Fit planning inputs may include ZIP code, business type, cuisine,
        investment budget band, owner experience band, facility size band, service
        model, and target opening date. The app is designed{" "}
        <strong>not</strong> to collect contact information (name, email, or phone)
        in Phase 1 planning inputs.
      </p>

      <h2 className="pt-4 text-xl font-semibold text-[#071a2b]">Why it is collected</h2>
      <p>
        Inputs are used only to generate preliminary planning estimates (budget
        alignment, timeline readiness, operational fit, and planning risks) and to
        operate the related MCP tools. Results are planning guidance, not guarantees.
      </p>

      <h2 className="pt-4 text-xl font-semibold text-[#071a2b]">How long it is retained</h2>
      <p>
        Retention period:{" "}
        <strong>
          {ownerFieldOrPlaceholder(
            ansOwnerConfig.dataRetentionStatement,
            "ANS_DATA_RETENTION_STATEMENT",
          )}
        </strong>
        . Server logs for the MCP endpoint are intended to exclude contact
        information and request bodies containing secrets.
      </p>

      <h2 className="pt-4 text-xl font-semibold text-[#071a2b]">Whether it is shared</h2>
      <p>
        Planning inputs are processed to return estimates to the requesting user or
        ChatGPT session. This Phase 1 app does not create vendor leads, payment
        records, or CRM opportunities. Hosting/infrastructure providers may process
        technical request metadata as part of operating the website and MCP endpoint.
        No sale of planning inputs is intended.
      </p>

      <h2 className="pt-4 text-xl font-semibold text-[#071a2b]">Access or deletion requests</h2>
      <p>
        Submit requests through the{" "}
        <a className="text-[#0b4f9c] underline" href="/data-request">
          data request
        </a>{" "}
        page or contact{" "}
        <strong>
          {ownerFieldOrPlaceholder(
            ansOwnerConfig.privacyContactEmail,
            "ANS_PRIVACY_CONTACT_EMAIL",
          )}
        </strong>
        .
      </p>

      <h2 className="pt-4 text-xl font-semibold text-[#071a2b]">Contact</h2>
      <p>
        Publisher: {ansOwnerConfig.publisherName}
        <br />
        Support:{" "}
        {ownerFieldOrPlaceholder(ansOwnerConfig.supportEmail, "ANS_SUPPORT_EMAIL")}
        <br />
        Address:{" "}
        {ownerFieldOrPlaceholder(
          ansOwnerConfig.businessAddress,
          "ANS_BUSINESS_ADDRESS",
        )}
      </p>

      <p className="rounded-md border border-[#0b4f9c]/20 bg-white p-4 text-sm">
        Owner configuration placeholders above must be replaced with approved ANS
        Corporation values before ChatGPT App Directory submission.
      </p>
    </AnsPolicyShell>
  );
}
