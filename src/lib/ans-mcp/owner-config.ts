/**
 * Owner-supplied marketplace / legal configuration.
 * Do not invent emails, addresses, retention periods, or legal commitments.
 * Fill these via environment variables before ChatGPT App Directory submission.
 */

function readOptional(name: string): string | null {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

export const ansOwnerConfig = {
  publisherName: "ANS Corporation",
  appName: "ANS Food Business Fit",
  productName: "ANS Food Service OS",
  /** Required before marketplace publication */
  supportEmail: readOptional("ANS_SUPPORT_EMAIL"),
  supportUrl: readOptional("ANS_SUPPORT_URL"),
  privacyContactEmail: readOptional("ANS_PRIVACY_CONTACT_EMAIL"),
  businessAddress: readOptional("ANS_BUSINESS_ADDRESS"),
  governingJurisdiction: readOptional("ANS_GOVERNING_JURISDICTION"),
  /** Human-readable retention statement once owner approves (e.g. "90 days") */
  dataRetentionStatement: readOptional("ANS_DATA_RETENTION_STATEMENT"),
  mcpProductionUrl:
    readOptional("ANS_MCP_PRODUCTION_URL") ?? "https://ibirdchef.com/api/mcp",
  supportedCountriesPlaceholder:
    readOptional("ANS_SUPPORTED_COUNTRIES") ?? "United States (placeholder — owner confirmation required)",
} as const;

export function ownerFieldOrPlaceholder(
  value: string | null,
  placeholderLabel: string,
): string {
  return value ?? `[OWNER REQUIRED: ${placeholderLabel}]`;
}

export const ansOwnerMissingFields = [
  !ansOwnerConfig.supportEmail ? "ANS_SUPPORT_EMAIL" : null,
  !ansOwnerConfig.supportUrl ? "ANS_SUPPORT_URL" : null,
  !ansOwnerConfig.privacyContactEmail ? "ANS_PRIVACY_CONTACT_EMAIL" : null,
  !ansOwnerConfig.businessAddress ? "ANS_BUSINESS_ADDRESS" : null,
  !ansOwnerConfig.governingJurisdiction ? "ANS_GOVERNING_JURISDICTION" : null,
  !ansOwnerConfig.dataRetentionStatement ? "ANS_DATA_RETENTION_STATEMENT" : null,
  !process.env.ANS_SUPPORTED_COUNTRIES ? "ANS_SUPPORTED_COUNTRIES" : null,
  !process.env.ANS_MCP_AUTH_TOKEN ? "ANS_MCP_AUTH_TOKEN (production auth)" : null,
].filter((value): value is string => Boolean(value));
