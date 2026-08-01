import { createHmac, randomUUID } from "node:crypto";
import type { EventInquiry } from "@/lib/event-inquiry";

export const CLOW_INTAKE_TIMEOUT_MS = 8_000;

/** @deprecated Prefer EventInquiry — kept as an alias for existing tests/imports. */
export type ValidatedInquiry = EventInquiry;

export type ClowInquiryPayload = EventInquiry & {
  submissionId: string;
};

export type ClowForwardResult =
  | { ok: true; status: number; category: "accepted" | "duplicate" }
  | {
      ok: false;
      status: number | null;
      category:
        | "not_configured"
        | "timeout"
        | "network_error"
        | "http_error"
        | "invalid_response";
    };

export function createSubmissionId(): string {
  return `web_${Date.now()}_${randomUUID().replaceAll("-", "").slice(0, 12)}`;
}

export function buildClowInquiryPayload(
  inquiry: EventInquiry,
  submissionId: string,
): ClowInquiryPayload {
  return {
    submissionId,
    name: inquiry.name,
    email: inquiry.email,
    phone: inquiry.phone,
    eventCategory: inquiry.eventCategory,
    eventType: inquiry.eventType,
    eventDate: inquiry.eventDate,
    eventTime: inquiry.eventTime,
    eventLocation: inquiry.eventLocation,
    guestCount: inquiry.guestCount,
    cuisinePreference: inquiry.cuisinePreference,
    serviceStyle: inquiry.serviceStyle,
    serviceType: inquiry.serviceType,
    estimatedBudget: inquiry.estimatedBudget,
    dietaryNeeds: inquiry.dietaryNeeds,
    leadSource: inquiry.leadSource,
    contactConsent: inquiry.contactConsent,
    smsConsent: inquiry.smsConsent,
    message: inquiry.message,
    pageSource: inquiry.pageSource,
  };
}

export function buildSignaturePayload(timestamp: string, rawBody: string): string {
  return `${timestamp}.${rawBody}`;
}

export function signClowInquiryRequest(
  secret: string,
  timestamp: string,
  rawBody: string,
): string {
  return createHmac("sha256", secret)
    .update(buildSignaturePayload(timestamp, rawBody), "utf8")
    .digest("hex");
}

export function getClowIntakeConfig(): {
  url: string;
  secret: string;
} | null {
  const url = process.env.CLOW_IBIRDCHEF_INTAKE_URL?.trim() ?? "";
  const secret = process.env.IBIRDCHEF_INQUIRY_WEBHOOK_SECRET?.trim() ?? "";

  if (!url || !secret) {
    return null;
  }

  return { url, secret };
}

/**
 * Forward a signed inquiry to CLOW. Never throws — callers treat email success
 * as customer success even when this returns ok:false.
 */
export async function forwardInquiryToClow(input: {
  payload: ClowInquiryPayload;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
  nowSeconds?: number;
}): Promise<ClowForwardResult> {
  const config = getClowIntakeConfig();
  if (!config) {
    return { ok: false, status: null, category: "not_configured" };
  }

  const rawBody = JSON.stringify(input.payload);
  const timestamp = String(
    input.nowSeconds ?? Math.floor(Date.now() / 1000),
  );
  const signature = signClowInquiryRequest(config.secret, timestamp, rawBody);
  const timeoutMs = input.timeoutMs ?? CLOW_INTAKE_TIMEOUT_MS;
  const fetchImpl = input.fetchImpl ?? fetch;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(config.url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-ibirdchef-timestamp": timestamp,
        "x-ibirdchef-signature": signature,
      },
      body: rawBody,
      signal: controller.signal,
    });

    let json: { success?: boolean; duplicate?: boolean } | null = null;
    try {
      json = (await response.json()) as {
        success?: boolean;
        duplicate?: boolean;
      };
    } catch {
      json = null;
    }

    if (!response.ok || !json?.success) {
      return {
        ok: false,
        status: response.status,
        category: "http_error",
      };
    }

    return {
      ok: true,
      status: response.status,
      category: json.duplicate ? "duplicate" : "accepted",
    };
  } catch (error) {
    const name =
      error && typeof error === "object" && "name" in error
        ? String((error as { name?: unknown }).name)
        : "";
    if (name === "AbortError") {
      return { ok: false, status: null, category: "timeout" };
    }
    return { ok: false, status: null, category: "network_error" };
  } finally {
    clearTimeout(timer);
  }
}

export function logClowForwardResult(
  submissionId: string,
  result: ClowForwardResult,
): void {
  if (result.ok) {
    console.info("CLOW intake forward ok", {
      submissionId,
      status: result.status,
      category: result.category,
    });
    return;
  }

  console.error("CLOW intake forward failed", {
    submissionId,
    status: result.status,
    category: result.category,
  });
}
