/**
 * Smoke-test helper for pnpm mcp:dev.
 * Sends initialize + tools/list + tools/call for each Phase 1 tool, then exits.
 */

const BASE = process.env.ANS_MCP_URL ?? "http://127.0.0.1:8787";

const sampleInput = {
  zipCode: "98101",
  businessType: "cafe",
  cuisine: "american",
  investmentBudget: "150_300k",
  ownerExperience: "some_food_service",
  facilitySize: "under_1000",
  serviceModel: "dine_in",
  targetOpeningDate: "2027-06-01",
};

async function mcp(method, params, id = 1) {
  const response = await fetch(`${BASE}/mcp`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id,
      method,
      params,
    }),
  });
  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    // SSE-ish: take last data line
    const dataLine = text
      .split("\n")
      .filter((line) => line.startsWith("data: "))
      .at(-1);
    if (!dataLine) {
      throw new Error(`Non-JSON MCP response (${response.status}): ${text.slice(0, 400)}`);
    }
    json = JSON.parse(dataLine.slice(6));
  }
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${text.slice(0, 400)}`);
  }
  if (json.error) {
    throw new Error(`${method} error: ${JSON.stringify(json.error)}`);
  }
  return json.result;
}

async function main() {
  const health = await fetch(`${BASE}/health`);
  const healthJson = await health.json();
  console.log("health", healthJson);

  await mcp("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "ans-smoke", version: "1.0.0" },
  }, 1);

  const listed = await mcp("tools/list", {}, 2);
  const names = (listed.tools ?? []).map((tool) => tool.name).sort();
  console.log("tools", names);

  const expected = [
    "analyze_business_fit",
    "build_startup_budget",
    "compare_food_service_concepts",
    "generate_opening_checklist",
    "simulate_event_profit",
  ];
  for (const name of expected) {
    if (!names.includes(name)) {
      throw new Error(`Missing tool: ${name}`);
    }
  }

  const calls = [
    ["analyze_business_fit", sampleInput],
    ["build_startup_budget", sampleInput],
    ["generate_opening_checklist", sampleInput],
    [
      "compare_food_service_concepts",
      {
        concepts: [
          { label: "Cafe", input: sampleInput },
          {
            label: "Truck",
            input: {
              ...sampleInput,
              businessType: "food_truck",
              facilitySize: "mobile_or_shared",
              serviceModel: "food_truck",
            },
          },
        ],
      },
    ],
    [
      "simulate_event_profit",
      {
        guestCount: 150,
        customerBudgetUsd: 3500,
        proposedSellingPriceUsd: 4125,
        foodCostUsd: 1120,
        laborCostUsd: 620,
        packagingCostUsd: 185,
        deliveryCostUsd: 145,
        capacityStatus: "available_for_planning",
        serviceRegion: "seattle",
      },
    ],
  ];

  let id = 10;
  for (const [name, args] of calls) {
    const result = await mcp(
      "tools/call",
      { name, arguments: args },
      id++,
    );
    const text = result?.content?.[0]?.text ?? "";
    const parsed = JSON.parse(text);
    if (!parsed.ok) {
      throw new Error(`${name} returned not ok: ${text.slice(0, 300)}`);
    }
    console.log("tool_ok", name);
  }

  console.log("MCP_SMOKE_OK");
}

main().catch((error) => {
  console.error("MCP_SMOKE_FAIL", error);
  process.exit(1);
});
