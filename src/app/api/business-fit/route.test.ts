import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { POST } from "@/app/api/business-fit/route";

const validBody = {
  zipCode: "94105",
  businessType: "catering",
  cuisine: "south_asian",
  investmentBudget: "150_300k",
  ownerExperience: "management",
  facilitySize: "1000_2000",
  serviceModel: "catering",
  targetOpeningDate: "2027-03-15",
};

async function postJson(body: unknown, raw?: string) {
  const request = new Request("http://localhost/api/business-fit", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: raw ?? JSON.stringify(body),
  });
  const response = await POST(request);
  const json = await response.json();
  return { response, json };
}

describe("POST /api/business-fit", () => {
  it("returns a versioned report for a valid request", async () => {
    const { response, json } = await postJson(validBody);
    assert.equal(response.status, 200);
    assert.equal(json.ok, true);
    assert.equal(json.report.planningEstimateOnly, true);
    assert.ok(json.report.fitScore >= 0);
    assert.ok(!JSON.stringify(json).toLowerCase().includes("password"));
  });

  it("rejects missing required fields", async () => {
    const partial = {
      businessType: validBody.businessType,
      cuisine: validBody.cuisine,
      investmentBudget: validBody.investmentBudget,
      ownerExperience: validBody.ownerExperience,
      facilitySize: validBody.facilitySize,
      serviceModel: validBody.serviceModel,
      targetOpeningDate: validBody.targetOpeningDate,
    };
    const { response, json } = await postJson(partial);
    assert.equal(response.status, 400);
    assert.equal(json.ok, false);
    assert.equal(json.error.code, "validation_error");
  });

  it("rejects invalid ZIP code", async () => {
    const { response, json } = await postJson({ ...validBody, zipCode: "ABCDE" });
    assert.equal(response.status, 400);
    assert.ok(json.error.issues.some((issue: { path: string }) => issue.path === "zipCode"));
  });

  it("rejects invalid budget values", async () => {
    const { response, json } = await postJson({
      ...validBody,
      investmentBudget: "not-a-band",
    });
    assert.equal(response.status, 400);
    assert.equal(json.ok, false);
  });

  it("rejects invalid facility size", async () => {
    const { response, json } = await postJson({
      ...validBody,
      facilitySize: "huge",
    });
    assert.equal(response.status, 400);
    assert.equal(json.ok, false);
  });

  it("rejects unknown fields", async () => {
    const { response, json } = await postJson({
      ...validBody,
      phone: "555-0100",
    });
    assert.equal(response.status, 400);
    assert.equal(json.ok, false);
  });

  it("rejects malformed JSON with a safe error", async () => {
    const { response, json } = await postJson(null, "{not-json");
    assert.equal(response.status, 400);
    assert.equal(json.ok, false);
    assert.equal(json.error.code, "invalid_json");
    assert.equal(typeof json.error.message, "string");
    assert.equal(json.error.message.includes("{not-json"), false);
  });
});
