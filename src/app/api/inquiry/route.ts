import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const MAX_LENGTH = {
  name: 120,
  email: 254,
  phone: 40,
  eventDate: 40,
  guestCount: 20,
  eventLocation: 200,
  serviceType: 80,
  estimatedBudget: 80,
  dietaryNeeds: 500,
  message: 4000,
} as const;

type InquiryBody = {
  name: string;
  email: string;
  phone: string;
  eventDate: string;
  guestCount: string;
  eventLocation: string;
  serviceType: string;
  estimatedBudget: string;
  dietaryNeeds: string;
  message: string;
};

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function parseBody(raw: unknown): InquiryBody | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const data = raw as Record<string, unknown>;

  return {
    name: asTrimmedString(data.name),
    email: asTrimmedString(data.email),
    phone: asTrimmedString(data.phone),
    eventDate: asTrimmedString(data.eventDate),
    guestCount: asTrimmedString(data.guestCount),
    eventLocation: asTrimmedString(data.eventLocation),
    serviceType: asTrimmedString(data.serviceType),
    estimatedBudget: asTrimmedString(data.estimatedBudget),
    dietaryNeeds: asTrimmedString(data.dietaryNeeds),
    message: asTrimmedString(data.message),
  };
}

function validate(body: InquiryBody): string | null {
  const required: Array<keyof InquiryBody> = [
    "name",
    "email",
    "phone",
    "eventDate",
    "guestCount",
    "eventLocation",
    "serviceType",
    "message",
  ];

  for (const field of required) {
    if (!body[field]) {
      return `Missing required field: ${field}`;
    }
  }

  if (!isValidEmail(body.email)) {
    return "Please provide a valid email address.";
  }

  const guestCount = Number(body.guestCount);
  if (!Number.isFinite(guestCount) || guestCount < 1) {
    return "Guest count must be a positive number.";
  }

  for (const [key, max] of Object.entries(MAX_LENGTH) as Array<
    [keyof InquiryBody, number]
  >) {
    if (body[key].length > max) {
      return `${key} is too long.`;
    }
  }

  return null;
}

function buildEmailHtml(body: InquiryBody): string {
  const rows: Array<[string, string]> = [
    ["Name", body.name],
    ["Email", body.email],
    ["Phone", body.phone],
    ["Event date", body.eventDate],
    ["Guest count", body.guestCount],
    ["Event location", body.eventLocation],
    ["Service type", body.serviceType],
    ["Estimated budget", body.estimatedBudget || "Not provided"],
    ["Dietary needs", body.dietaryNeeds || "Not provided"],
    ["Message", body.message],
  ];

  const listItems = rows
    .map(
      ([label, value]) =>
        `<li style="margin:0 0 12px;"><strong>${escapeHtml(label)}:</strong><br>${escapeHtml(value).replaceAll("\n", "<br>")}</li>`,
    )
    .join("");

  return `
    <div style="font-family:Georgia,serif;color:#241b15;line-height:1.5;">
      <h1 style="font-size:22px;margin:0 0 16px;">New catering inquiry</h1>
      <p style="margin:0 0 20px;">A new inquiry was submitted on the iBirdChef website.</p>
      <ul style="padding-left:18px;margin:0;">${listItems}</ul>
    </div>
  `;
}

export async function POST(request: Request) {
  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const body = parseBody(json);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const validationError = validate(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.INQUIRY_TO_EMAIL;
  const fromEmail = process.env.INQUIRY_FROM_EMAIL;

  if (!apiKey || !toEmail || !fromEmail) {
    console.error(
      "Inquiry email is not configured. Set RESEND_API_KEY, INQUIRY_TO_EMAIL, and INQUIRY_FROM_EMAIL.",
    );
    return NextResponse.json(
      { error: "Inquiry email is not configured yet. Please try again later." },
      { status: 503 },
    );
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo: body.email,
      subject: `Catering inquiry from ${body.name}`,
      html: buildEmailHtml(body),
      text: [
        "New catering inquiry",
        "",
        `Name: ${body.name}`,
        `Email: ${body.email}`,
        `Phone: ${body.phone}`,
        `Event date: ${body.eventDate}`,
        `Guest count: ${body.guestCount}`,
        `Event location: ${body.eventLocation}`,
        `Service type: ${body.serviceType}`,
        `Estimated budget: ${body.estimatedBudget || "Not provided"}`,
        `Dietary needs: ${body.dietaryNeeds || "Not provided"}`,
        "",
        "Message:",
        body.message,
      ].join("\n"),
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Unable to send inquiry right now. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Inquiry send failed:", error);
    return NextResponse.json(
      { error: "Unable to send inquiry right now. Please try again." },
      { status: 502 },
    );
  }
}
