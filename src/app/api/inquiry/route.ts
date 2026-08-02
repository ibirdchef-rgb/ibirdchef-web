import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  buildClowInquiryPayload,
  createSubmissionId,
  forwardInquiryToClow,
  logClowForwardResult,
} from "@/lib/clow-intake";
import {
  eventCategoryLabel,
  parseEventInquiry,
  validateEventInquiry,
  type EventInquiry,
} from "@/lib/event-inquiry";
import {
  buildIBirdOsCostingRequest,
  forwardInquiryToIBirdOs,
} from "@/lib/ibirdos-intake";
import { regionLabel } from "@/lib/regions";

export const runtime = "nodejs";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildEmailHtml(body: EventInquiry, submissionId: string): string {
  const rows: Array<[string, string]> = [
    ["Submission ID", submissionId],
    ["Name", body.name],
    ["Email", body.email],
    ["Phone", body.phone],
    ["Service region", regionLabel(body.serviceRegion)],
    ["Event category", eventCategoryLabel(body.eventCategory)],
    ["Event type", body.eventType],
    ["Event date", body.eventDate],
    ["Event time", body.eventTime || "Not provided"],
    ["Guest count", body.guestCount],
    ["Event city", body.eventCity],
    ["Venue or ZIP", body.venueOrZip],
    ["Event location", body.eventLocation],
    ["Cuisine preference", body.cuisinePreference || "Not provided"],
    ["Service style", body.serviceStyle || "Not provided"],
    ["Service type", body.serviceType],
    ["Estimated budget", body.estimatedBudget || "Not provided"],
    ["Dietary needs", body.dietaryNeeds || "Not provided"],
    ["Lead source", body.leadSource || "Not provided"],
    ["Page source", body.pageSource || "Not provided"],
    ["Contact consent", body.contactConsent ? "Yes" : "No"],
    ["SMS consent", body.smsConsent ? "Yes" : "No"],
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

function buildEmailText(body: EventInquiry, submissionId: string): string {
  return [
    "New catering inquiry",
    "",
    `Submission ID: ${submissionId}`,
    `Name: ${body.name}`,
    `Email: ${body.email}`,
    `Phone: ${body.phone}`,
    `Service region: ${regionLabel(body.serviceRegion)}`,
    `Event category: ${eventCategoryLabel(body.eventCategory)}`,
    `Event type: ${body.eventType}`,
    `Event date: ${body.eventDate}`,
    `Event time: ${body.eventTime || "Not provided"}`,
    `Guest count: ${body.guestCount}`,
    `Event city: ${body.eventCity}`,
    `Venue or ZIP: ${body.venueOrZip}`,
    `Event location: ${body.eventLocation}`,
    `Cuisine preference: ${body.cuisinePreference || "Not provided"}`,
    `Service style: ${body.serviceStyle || "Not provided"}`,
    `Service type: ${body.serviceType}`,
    `Estimated budget: ${body.estimatedBudget || "Not provided"}`,
    `Dietary needs: ${body.dietaryNeeds || "Not provided"}`,
    `Lead source: ${body.leadSource || "Not provided"}`,
    `Page source: ${body.pageSource || "Not provided"}`,
    `Contact consent: ${body.contactConsent ? "Yes" : "No"}`,
    `SMS consent: ${body.smsConsent ? "Yes" : "No"}`,
    "",
    "Message:",
    body.message,
  ].join("\n");
}

export async function POST(request: Request) {
  let json: unknown;

  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = parseEventInquiry(json);
  if (!parsed) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const validation = validateEventInquiry(parsed);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const body = validation.inquiry;

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

  const submissionId = createSubmissionId();

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo: body.email,
      subject: `Catering inquiry from ${body.name}`,
      html: buildEmailHtml(body, submissionId),
      text: buildEmailText(body, submissionId),
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Unable to send inquiry right now. Please try again." },
        { status: 502 },
      );
    }

    const clowResult = await forwardInquiryToClow({
      payload: buildClowInquiryPayload(body, submissionId),
    });
    logClowForwardResult(submissionId, clowResult);

    // Prepare iBirdOS handoff shape; forwarding stays disabled until configured.
    const ibirdOsResult = forwardInquiryToIBirdOs({
      payload: buildIBirdOsCostingRequest(body, submissionId),
    });
    if (!ibirdOsResult.ok) {
      console.info("iBirdOS intake not configured; costing handoff skipped", {
        submissionId,
        category: ibirdOsResult.category,
      });
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
