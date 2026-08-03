import { NextResponse } from "next/server";
import {
  buildBusinessFitReport,
  parseBusinessFitInput,
} from "@/lib/business-fit";

export const runtime = "nodejs";

function jsonError(
  status: number,
  code: string,
  message: string,
  issues?: Array<{ path: string; message: string }>,
) {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code,
        message,
        ...(issues ? { issues } : {}),
      },
    },
    { status },
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "invalid_json", "Request body must be valid JSON");
  }

  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    return jsonError(400, "invalid_body", "Request body must be a JSON object");
  }

  const parsed = parseBusinessFitInput(body);
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  }

  const report = buildBusinessFitReport(parsed.data);
  return NextResponse.json({ ok: true, report });
}
