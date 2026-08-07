import type { Metadata } from "next";
import AnsPolicyShell from "@/components/ans/AnsPolicyShell";
import { ansOwnerConfig } from "@/lib/ans-mcp/owner-config";

export const metadata: Metadata = {
  title: "Data Request — ANS Food Business Fit",
  description:
    "How to request access to or deletion of information related to ANS Food Business Fit.",
  alternates: { canonical: "/data-request" },
};

export default function DataRequestPage() {
  return (
    <AnsPolicyShell title="Data access or deletion request">
      <p>
        Use this page to request access to or deletion of information associated
        with <strong>{ansOwnerConfig.appName}</strong> from{" "}
        <strong>{ansOwnerConfig.publisherName}</strong>.
      </p>

      <h2 className="pt-4 text-xl font-semibold text-[#071a2b]">How to submit a request</h2>
      <ol className="list-decimal space-y-2 pl-5">
        <li>
          Email{" "}
          <a
            className="font-semibold text-[#0b4f9c] underline underline-offset-4"
            href={ansOwnerConfig.privacyContactEmailHref}
          >
            {ansOwnerConfig.privacyContactEmail}
          </a>
          .
        </li>
        <li>State whether you are requesting access, correction, or deletion.</li>
        <li>
          Provide enough information for ANS Corporation to locate relevant records
          (for example, approximate date/time of use and the ZIP/concept inputs you
          submitted). Do not send unnecessary sensitive personal data.
        </li>
      </ol>

      <h2 className="pt-4 text-xl font-semibold text-[#071a2b]">What Phase 1 typically stores</h2>
      <p>
        Phase 1 planning inputs intentionally exclude name, email, and phone. Some
        technical logs or hosting metadata may still exist and will be handled
        according to the owner-approved retention statement:{" "}
        <strong>{ansOwnerConfig.dataRetentionStatement}</strong>.
      </p>

      <p className="rounded-md border border-[#0b4f9c]/20 bg-white p-4 text-sm">
        The Marketplace support email (
        <a
          className="font-semibold text-[#0b4f9c] underline underline-offset-4"
          href={ansOwnerConfig.supportEmailHref}
        >
          {ansOwnerConfig.supportEmail}
        </a>
        ) remains for general support only. Privacy and data-deletion requests should
        use the privacy contact shown above and described on{" "}
        <a className="text-[#0b4f9c] underline" href="/business-fit/privacy">
          /business-fit/privacy
        </a>
        .
      </p>
    </AnsPolicyShell>
  );
}
