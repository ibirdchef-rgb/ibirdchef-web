/**
 * Owner-supplied marketplace / legal configuration.
 * Do not invent emails, addresses, retention periods, or legal commitments.
 */

/** Approved Marketplace support contact (general support). */
export const ANS_APPROVED_SUPPORT_EMAIL = "support@prosperityaxis.com";
export const ANS_APPROVED_SUPPORT_URL = "https://ibirdchef.com/support";
export const ANS_APPROVED_SUPPORTED_COUNTRIES = "United States";

/** Owner-approved Business Fit privacy / legal publication values. */
export const ANS_APPROVED_PRIVACY_CONTACT_EMAIL = "order@ibirdchef.com";
export const ANS_APPROVED_BUSINESS_ADDRESS =
  "3850 Klahanie Dr SE, Building 23, Apt 306, Sammamish, WA 98029, United States";
export const ANS_APPROVED_BUSINESS_ADDRESS_LINES = [
  "3850 Klahanie Dr SE",
  "Building 23, Apt 306",
  "Sammamish, WA 98029",
  "United States",
] as const;
export const ANS_APPROVED_GOVERNING_JURISDICTION = "Washington State";
export const ANS_APPROVED_DATA_RETENTION_STATEMENT =
  "Submitted data is retained only as long as necessary for the stated purposes, with a maximum standard retention period of 90 days, unless longer retention is legally required or needed for security, fraud prevention, dispute handling, or enforcement.";

function readOptional(name: string): string | null {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

export const ansOwnerConfig = {
  publisherName: "ANS Corporation",
  appName: "ANS Food Business Fit",
  productName: "ANS Food Service OS",
  supportEmail: readOptional("ANS_SUPPORT_EMAIL") ?? ANS_APPROVED_SUPPORT_EMAIL,
  supportEmailHref: `mailto:${readOptional("ANS_SUPPORT_EMAIL") ?? ANS_APPROVED_SUPPORT_EMAIL}`,
  supportUrl: readOptional("ANS_SUPPORT_URL") ?? ANS_APPROVED_SUPPORT_URL,
  privacyContactEmail:
    readOptional("ANS_PRIVACY_CONTACT_EMAIL") ?? ANS_APPROVED_PRIVACY_CONTACT_EMAIL,
  privacyContactEmailHref: `mailto:${
    readOptional("ANS_PRIVACY_CONTACT_EMAIL") ?? ANS_APPROVED_PRIVACY_CONTACT_EMAIL
  }`,
  businessAddress:
    readOptional("ANS_BUSINESS_ADDRESS") ?? ANS_APPROVED_BUSINESS_ADDRESS,
  businessAddressLines: ANS_APPROVED_BUSINESS_ADDRESS_LINES,
  governingJurisdiction:
    readOptional("ANS_GOVERNING_JURISDICTION") ?? ANS_APPROVED_GOVERNING_JURISDICTION,
  dataRetentionStatement:
    readOptional("ANS_DATA_RETENTION_STATEMENT") ??
    ANS_APPROVED_DATA_RETENTION_STATEMENT,
  mcpProductionUrl:
    readOptional("ANS_MCP_PRODUCTION_URL") ?? "https://ibirdchef.com/api/mcp",
  supportedCountries:
    readOptional("ANS_SUPPORTED_COUNTRIES") ?? ANS_APPROVED_SUPPORTED_COUNTRIES,
} as const;

export function ownerFieldOrPlaceholder(
  value: string | null,
  placeholderLabel: string,
): string {
  return value ?? `[OWNER REQUIRED: ${placeholderLabel}]`;
}

/** Fields still awaiting owner confirmation (must not be presented as settled facts). */
export const ansOwnerMissingFields = [
  !process.env.ANS_MCP_AUTH_TOKEN ? "ANS_MCP_AUTH_TOKEN (production auth)" : null,
].filter((value): value is string => Boolean(value));
