import { ansOwnerConfig } from "@/lib/ans-mcp/owner-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const authConfigured = Boolean(process.env.ANS_MCP_AUTH_TOKEN?.trim());
  const requireAuth =
    process.env.ANS_MCP_REQUIRE_AUTH === "true" ||
    process.env.VERCEL_ENV === "production";

  return Response.json(
    {
      ok: true,
      service: "ans-food-business-fit-mcp",
      app: ansOwnerConfig.appName,
      publisher: ansOwnerConfig.publisherName,
      mcpPath: "/api/mcp",
      transport: "streamable-http",
      tools: [
        "analyze_business_fit",
        "compare_food_service_concepts",
        "build_startup_budget",
        "generate_opening_checklist",
        "simulate_event_profit",
      ],
      authConfigured,
      requireAuth,
      planningEstimateOnly: true,
      humanApprovalRequired: true,
      note: "Read-only planning tools. No quotes, payments, bookings, capacity confirmation, outreach, or tenant-data access.",
    },
    {
      headers: {
        "cache-control": "no-store",
        "x-content-type-options": "nosniff",
      },
    },
  );
}
