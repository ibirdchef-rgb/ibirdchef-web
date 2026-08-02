export const CONTACT_PRIVACY_NOTICE =
  "We’ll only use your contact information to follow up about this inquiry.";

export type ContactField = "name" | "email" | "phone";

const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const PHONE_DIGITS_PATTERN = /^\d{10}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  const normalized =
    digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  return PHONE_DIGITS_PATTERN.test(normalized);
}

export function wantsToSkipPhone(text: string): boolean {
  return /\b(skip|no phone|email only|prefer email|don'?t (?:want|have)|do not (?:want|have)|without (?:a )?phone)\b/i.test(
    text,
  );
}

export function maskEmail(email: string): string {
  const trimmed = email.trim();
  const at = trimmed.indexOf("@");
  if (at <= 0) return "***@***";
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}***@${domain}`;
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "***-****";
  return `***-***-${digits.slice(-4)}`;
}

export function maskName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => `${part[0] ?? "*"}***`)
    .join(" ");
}

/** Mask emails, phones, and simple name-like tokens in chat/audit text. */
export function maskContactText(text: string): string {
  let masked = text.replace(
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
    (match) => maskEmail(match),
  );
  masked = masked.replace(
    /(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b/g,
    (match) => maskPhone(match),
  );
  return masked;
}

export function formatMaskedContactLine(input: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  phoneSkipped?: boolean;
}): string {
  const name = input.customerName ? maskName(input.customerName) : "Name pending";
  const email = input.customerEmail
    ? maskEmail(input.customerEmail)
    : "email pending";
  const phone = input.customerPhone
    ? maskPhone(input.customerPhone)
    : input.phoneSkipped
      ? "phone skipped"
      : "phone optional";
  return `${name}, ${email}, ${phone}`;
}

export function contactFieldError(
  field: ContactField,
  value: string,
): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    if (field === "phone") return null;
    return field === "email"
      ? "Please enter a valid email address."
      : "Please enter your name.";
  }
  if (field === "email" && !isValidEmail(trimmed)) {
    return "That email doesn’t look quite right. Please check it and try again.";
  }
  if (field === "phone" && !wantsToSkipPhone(trimmed) && !isValidPhone(trimmed)) {
    return "That phone number doesn’t look quite right. Use a 10-digit number, or skip if you prefer email.";
  }
  return null;
}

export function inputConfigForContactField(field: ContactField | null): {
  type: "text" | "email" | "tel";
  placeholder: string;
  label: string;
} {
  if (field === "email") {
    return {
      type: "email",
      placeholder: "Enter your email address",
      label: "Email address",
    };
  }
  if (field === "phone") {
    return {
      type: "tel",
      placeholder: "Enter your phone number",
      label: "Phone number",
    };
  }
  if (field === "name") {
    return {
      type: "text",
      placeholder: "Enter your name",
      label: "Your name",
    };
  }
  return {
    type: "text",
    placeholder: "Tell me about your event…",
    label: "Message the concierge",
  };
}
