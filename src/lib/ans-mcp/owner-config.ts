/**
 * Owner-supplied marketplace / legal configuration.
 * Do not invent emails, addresses, retention periods, or legal commitments.
 */

/** Approved Marketplace support contact (not for privacy/data-deletion unless separately approved). */
export const ANS_APPROVED_SUPPORT_EMAIL = "support@prosperityaxis.com";
export const ANS_APPROVED_SUPPORT_URL = "https://ibirdchef.com/support";
export const ANS_APPROVED_SUPPORTED_COUNTRIES = "United States";

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
  /** Do not reuse support email for privacy/data-deletion until separately approved. */
  privacyContactEmail: readOptional("ANS_PRIVACY_CONTACT_EMAIL"),
  businessAddress: readOptional("ANS_BUSINESS_ADDRESS"),
  governingJurisdiction: readOptional("ANS_GOVERNING_JURISDICTION"),
  dataRetentionStatement: readOptional("ANS_DATA_RETENTION_STATEMENT"),
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
  !ansOwnerConfig.privacyContactEmail ? "ANS_PRIVACY_CONTACT_EMAIL" : null,
  !ansOwnerConfig.businessAddress ? "ANS_BUSINESS_ADDRESS" : null,
  !ansOwnerConfig.governingJurisdiction ? "ANS_GOVERNING_JURISDICTION" : null,
  !ansOwnerConfig.dataRetentionStatement ? "ANS_DATA_RETENTION_STATEMENT" : null,
  !process.env.ANS_MCP_AUTH_TOKEN ? "ANS_MCP_AUTH_TOKEN (production auth)" : null,
].filter((value): value is string => Boolean(value));
