import type { Metadata } from "next";
import AnsPolicyShell from "@/components/ans/AnsPolicyShell";
import {
  ansOwnerConfig,
  getBusinessAddressLines,
  isApprovedDefaultBusinessAddress,
} from "@/lib/ans-mcp/owner-config";

export const metadata: Metadata = {
  title: "Privacy Policy — ANS Food Business Fit",
  description:
    "Privacy information for the ANS Food Business Fit planning app published by ANS Corporation.",
  alternates: { canonical: "/business-fit/privacy" },
};

export default function BusinessFitPrivacyPage() {
  const businessAddressLines = getBusinessAddressLines();
  const showApprovedAddressNote = isApprovedDefaultBusinessAddress();

  return (
    <AnsPolicyShell title="Privacy Policy">
      <p>
        This page describes privacy practices for{" "}
        <strong>{ansOwnerConfig.appName}</strong>, a planning and qualification
        app published by <strong>{ansOwnerConfig.publisherName}</strong>. It
        applies to the website planning surface at{" "}
        <code>/business-fit</code> and the related read-only MCP tools. It does
        not replace the separate iBirdChef catering privacy page at{" "}
        <a className="text-[#0b4f9c] underline" href="/privacy">
          /privacy
        </a>
        .
      </p>

      <h2 className="pt-4 text-xl font-semibold text-[#071a2b]">
        What information may be received
      </h2>
      <p>
        The five read-only tools (
        <code>analyze_business_fit</code>,{" "}
        <code>compare_food_service_concepts</code>,{" "}
        <code>build_startup_budget</code>,{" "}
        <code>generate_opening_checklist</code>, and{" "}
        <code>simulate_event_profit</code>) may receive operator-entered planning
        inputs such as ZIP code, business concept bands, target opening date,
        guest count, budget, proposed selling price, target margin, cost
        components, capacity-status planning flags, optional notes, and pilot
        region. The Business Fit web form is designed <strong>not</strong> to
        collect contact information (name, email, or phone) in Phase 1 planning
        inputs.
      </p>

      <h2 className="pt-4 text-xl font-semibold text-[#071a2b]">
        Why information is processed
      </h2>
      <p>
        Inputs are processed only to return preliminary planning estimates and
        read-only simulation outputs (for example budget alignment, timeline
        readiness, operational fit, planning risks, startup budget ranges,
        opening checklist categories, and event-profit planning signals). Results
        are planning guidance, not guarantees of profit, demand, licensing, or
        operational feasibility.
      </p>
      <p>
        These tools do not send customer quotes, accept payments, book events,
        confirm operational capacity, or bypass human approval. Human approval is
        required before any commercial action.
      </p>

      <h2 className="pt-4 text-xl font-semibold text-[#071a2b]">
        Service providers and infrastructure
      </h2>
      <p>
        Planning inputs and technical request metadata may be processed by
        website hosting, application runtime, content-delivery, logging, and (if
        configured for production) shared rate-limit infrastructure providers that
        operate the public website and MCP endpoint. This Phase 1 app does not
        create vendor leads, payment records, or CRM opportunities, and no sale of
        planning inputs is intended.
      </p>

      <h2 className="pt-4 text-xl font-semibold text-[#071a2b]">
        Retention and deletion
      </h2>
      <p>
        <strong>{ansOwnerConfig.dataRetentionStatement}</strong> Server logs for
        the MCP endpoint are intended to exclude contact information and request
        bodies containing secrets. Deletion requests may be limited where longer
        retention is legally required or needed for security, fraud prevention,
        dispute handling, or enforcement.
      </p>

      <h2 className="pt-4 text-xl font-semibold text-[#071a2b]">Security</h2>
      <p>
        Reasonable administrative and technical safeguards are used to protect the
        service, including authentication and rate-limiting controls on the
        production MCP endpoint. No method of transmission or storage is
        absolutely secure, and absolute security is not claimed.
      </p>

      <h2 className="pt-4 text-xl font-semibold text-[#071a2b]">
        Privacy rights and contact
      </h2>
      <p>
        You may request access to or deletion of information associated with this
        app through the{" "}
        <a className="text-[#0b4f9c] underline" href="/data-request">
          data request
        </a>{" "}
        page or by emailing the privacy contact below. Where California privacy
        rights and requirements apply to a request or user, those applicable
        California rights and requirements will be honored. California law is not
        described here as a second governing jurisdiction for every user.
      </p>

      <h2 className="pt-4 text-xl font-semibold text-[#071a2b]">Governing law</h2>
      <p>
        This Business Fit privacy policy is governed by the laws of{" "}
        <strong>{ansOwnerConfig.governingJurisdiction}</strong>, without treating
        California as a second governing jurisdiction for all users.
      </p>

      <h2 className="pt-4 text-xl font-semibold text-[#071a2b]">Contact</h2>
      <p>
        Publisher: {ansOwnerConfig.publisherName}
        <br />
        Support:{" "}
        <a
          className="font-semibold text-[#0b4f9c] underline underline-offset-4"
          href={ansOwnerConfig.supportEmailHref}
        >
          {ansOwnerConfig.supportEmail}
        </a>
        <br />
        Privacy / data requests:{" "}
        <a
          className="font-semibold text-[#0b4f9c] underline underline-offset-4"
          href={ansOwnerConfig.privacyContactEmailHref}
        >
          {ansOwnerConfig.privacyContactEmail}
        </a>
        <br />
        Public mailing address:
      </p>
      <p className="whitespace-pre-line">{businessAddressLines.join("\n")}</p>
      {showApprovedAddressNote ? (
        <p className="text-sm text-[#334155]">
          This mailing address was owner-approved for publication.
        </p>
      ) : null}
    </AnsPolicyShell>
  );
}
