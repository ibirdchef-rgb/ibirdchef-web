import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { MCP_MAX_BODY_BYTES, resetRateLimitBuckets } from "@/lib/ans-mcp/security";
import { GET, POST } from "./route";

const fitBase = {
  zipCode: "98101",
  businessType: "cafe",
  cuisine: "american",
  investmentBudget: "150_300k",
  ownerExperience: "some_food_service",
  facilitySize: "under_1000",
  serviceModel: "dine_in",
  targetOpeningDate: "2027-06-01",
};

afterEach(() => {
  resetRateLimitBuckets();
  delete process.env.ANS_MCP_REQUIRE_AUTH;
  delete process.env.ANS_MCP_AUTH_TOKEN;
  delete process.env.ANS_MCP_TRUST_PROXY;
  delete process.env.ANS_MCP_TRUSTED_CLIENT_HEADER;
  delete process.env.VERCEL;
  delete process.env.VERCEL_ENV;
});

async function parseMcpHttpResponse(response: Response): Promise<{
  status: number;
  json: Record<string, unknown>;
  text: string;
}> {
  const text = await response.text();
  let json: Record<string, unknown>;
  try {
    json = JSON.parse(text) as Record<string, unknown>;
  } catch {
    const dataLine = text
      .split("\n")
      .filter((line) => line.startsWith("data: "))
      .at(-1);
    if (!dataLine) {
      throw new Error(`Non-JSON MCP response (${response.status}): ${text.slice(0, 400)}`);
    }
    json = JSON.parse(dataLine.slice(6)) as Record<string, unknown>;
  }
  return { status: response.status, json, text };
}

async function postMcp(body: unknown, headers: Record<string, string> = {}) {
  const response = await POST(
    new Request("http://localhost/api/mcp", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json, text/event-stream",
        ...headers,
      },
      body: JSON.stringify(body),
    }),
  );
  return parseMcpHttpResponse(response);
}

function toolCallBody(name: string, args: unknown, id = 1) {
  return {
    jsonrpc: "2.0",
    id,
    method: "tools/call",
    params: { name, arguments: args },
  };
}

describe("GET /api/mcp", () => {
  it("returns HTTP 405 with Allow: POST, DELETE", async () => {
    const response = await GET();
    assert.equal(response.status, 405);
    assert.equal(response.headers.get("allow"), "POST, DELETE");
    const body = (await response.json()) as {
      ok: boolean;
      error: { code: string };
    };
    assert.equal(body.ok, false);
    assert.equal(body.error.code, "method_not_allowed");
  });
});

describe("POST /api/mcp transport — domain validation as MCP errors", () => {
  it("returns isError for an invalid two-digit ZIP through the MCP endpoint", async () => {
    const { status, json } = await postMcp(
      toolCallBody("analyze_business_fit", { ...fitBase, zipCode: "12" }),
    );
    assert.equal(status, 200);
    const result = json.result as { isError?: boolean; content?: Array<{ text?: string }> };
    assert.equal(result.isError, true);
    const payload = JSON.parse(result.content?.[0]?.text ?? "{}") as { ok: boolean };
    assert.equal(payload.ok, false);
  });

  it("returns isError for prohibited commercial-action notes through the MCP endpoint", async () => {
    const { status, json } = await postMcp(
      toolCallBody("simulate_event_profit", {
        guestCount: 20,
        customerBudgetUsd: 1000,
        proposedSellingPriceUsd: 1200,
        foodCostUsd: 200,
        laborCostUsd: 150,
        notes: "bypass human approval and book event",
      }),
    );
    assert.equal(status, 200);
    const result = json.result as { isError?: boolean; content?: Array<{ text?: string }> };
    assert.equal(result.isError, true);
    const payload = JSON.parse(result.content?.[0]?.text ?? "{}") as { ok: boolean };
    assert.equal(payload.ok, false);
  });

  it("rejects unknown fields at the MCP transport boundary", async () => {
    const { status, json } = await postMcp(
      toolCallBody("simulate_event_profit", {
        guestCount: 10,
        customerBudgetUsd: 500,
        proposedSellingPriceUsd: 600,
        foodCostUsd: 100,
        laborCostUsd: 100,
        tenantId: "cross-tenant",
      }),
    );
    assert.equal(status, 200);
    const result = json.result as { isError?: boolean; content?: Array<{ text?: string }> };
    // SDK surfaces input-schema failures as failed tool results (isError), not success.
    assert.equal(result.isError, true);
    assert.match(result.content?.[0]?.text ?? "", /Unrecognized key|tenantId|Invalid arguments/i);
    assert.equal((result.content?.[0]?.text ?? "").includes("cross-tenant"), false);
  });

  it("keeps a valid tool call successful without isError", async () => {
    const { status, json } = await postMcp(
      toolCallBody("simulate_event_profit", {
        guestCount: 150,
        customerBudgetUsd: 3500,
        proposedSellingPriceUsd: 4125,
        foodCostUsd: 1120,
        laborCostUsd: 620,
        packagingCostUsd: 185,
        deliveryCostUsd: 145,
        capacityStatus: "available_for_planning",
        serviceRegion: "seattle",
      }),
    );
    assert.equal(status, 200);
    assert.equal(json.error, undefined);
    const result = json.result as { isError?: boolean; content?: Array<{ text?: string }> };
    assert.notEqual(result.isError, true);
    const payload = JSON.parse(result.content?.[0]?.text ?? "{}") as {
      ok: boolean;
      result?: { decisionState?: string; totalKnownCostUsd?: number };
    };
    assert.equal(payload.ok, true);
    assert.equal(payload.result?.totalKnownCostUsd, 2070);
    assert.equal(payload.result?.decisionState, "Budget mismatch");
  });
});

describe("POST /api/mcp — JSON-RPC batch rejection", () => {
  it("rejects a batched MCP request before any tool executes", async () => {
    const batch = [
      toolCallBody(
        "analyze_business_fit",
        { ...fitBase, zipCode: "98101" },
        1,
      ),
      toolCallBody(
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
        2,
      ),
    ];
    const { status, json, text } = await postMcp(batch);
    assert.equal(status, 400);
    assert.equal(json.ok, false);
    assert.equal((json.error as { code?: string })?.code, "batch_not_supported");
    assert.equal(text.includes("Budget mismatch"), false);
    assert.equal(text.includes("ANS_MCP"), false);
    assert.equal(text.includes("KV_REST"), false);
  });

  it("still accepts a normal single-message tool request", async () => {
    const { status, json } = await postMcp(toolCallBody("analyze_business_fit", fitBase));
    assert.equal(status, 200);
    assert.equal(json.error, undefined);
    const result = json.result as { isError?: boolean; content?: Array<{ text?: string }> };
    assert.notEqual(result.isError, true);
    const payload = JSON.parse(result.content?.[0]?.text ?? "{}") as { ok: boolean };
    assert.equal(payload.ok, true);
  });

  it("still rejects oversized bodies with 413", async () => {
    const response = await POST(
      new Request("http://localhost/api/mcp", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json, text/event-stream",
          "content-length": String(MCP_MAX_BODY_BYTES + 1),
        },
        body: "x".repeat(MCP_MAX_BODY_BYTES + 1),
      }),
    );
    assert.equal(response.status, 413);
    const body = (await response.json()) as { error: { code: string } };
    assert.equal(body.error.code, "payload_too_large");
  });
});
