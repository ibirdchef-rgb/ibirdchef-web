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

/** Resolve the configured business address, honoring ANS_BUSINESS_ADDRESS. */
export function resolveBusinessAddress(): string {
  return readOptional("ANS_BUSINESS_ADDRESS") ?? ANS_APPROVED_BUSINESS_ADDRESS;
}

/**
 * Derive safe display lines from a configured address.
 * Keeps the approved default's multi-line layout; splits overrides on newlines
 * or commas so pages do not hard-code the default lines.
 */
export function businessAddressLinesFor(address: string): string[] {
  const normalized = address.trim();
  if (!normalized) {
    return [...ANS_APPROVED_BUSINESS_ADDRESS_LINES];
  }
  if (normalized === ANS_APPROVED_BUSINESS_ADDRESS) {
    return [...ANS_APPROVED_BUSINESS_ADDRESS_LINES];
  }
  const byNewline = normalized
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (byNewline.length > 1) {
    return byNewline;
  }
  return normalized
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

/** Current configured address as display lines (reads env at call time). */
export function getBusinessAddressLines(): string[] {
  return businessAddressLinesFor(resolveBusinessAddress());
}

export function isApprovedDefaultBusinessAddress(address = resolveBusinessAddress()): boolean {
  return address.trim() === ANS_APPROVED_BUSINESS_ADDRESS;
}

/** Resolve the configured Marketplace support email, honoring ANS_SUPPORT_EMAIL. */
export function resolveSupportEmail(): string {
  return readOptional("ANS_SUPPORT_EMAIL") ?? ANS_APPROVED_SUPPORT_EMAIL;
}

export const ansOwnerConfig = {
  publisherName: "ANS Corporation",
  appName: "ANS Food Business Fit",
  productName: "ANS Food Service OS",
  get supportEmail() {
    return resolveSupportEmail();
  },
  get supportEmailHref() {
    return `mailto:${resolveSupportEmail()}`;
  },
  supportUrl: readOptional("ANS_SUPPORT_URL") ?? ANS_APPROVED_SUPPORT_URL,
  privacyContactEmail:
    readOptional("ANS_PRIVACY_CONTACT_EMAIL") ?? ANS_APPROVED_PRIVACY_CONTACT_EMAIL,
  privacyContactEmailHref: `mailto:${
    readOptional("ANS_PRIVACY_CONTACT_EMAIL") ?? ANS_APPROVED_PRIVACY_CONTACT_EMAIL
  }`,
  get businessAddress() {
    return resolveBusinessAddress();
  },
  get businessAddressLines() {
    return getBusinessAddressLines();
  },
  governingJurisdiction:
    readOptional("ANS_GOVERNING_JURISDICTION") ?? ANS_APPROVED_GOVERNING_JURISDICTION,
  dataRetentionStatement:
    readOptional("ANS_DATA_RETENTION_STATEMENT") ??
    ANS_APPROVED_DATA_RETENTION_STATEMENT,
  mcpProductionUrl:
    readOptional("ANS_MCP_PRODUCTION_URL") ?? "https://ibirdchef.com/api/mcp",
  supportedCountries:
    readOptional("ANS_SUPPORTED_COUNTRIES") ?? ANS_APPROVED_SUPPORTED_COUNTRIES,
};

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
