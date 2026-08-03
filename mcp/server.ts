/**
 * ANS Food Service OS — Phase 1 MCP development server.
 * Local/private testing only. Do not publish this unauthenticated endpoint.
 */

import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import { runMcpTool } from "./tools";

const HOST = process.env.ANS_MCP_HOST ?? "127.0.0.1";
const PORT = Number(process.env.ANS_MCP_PORT ?? "8787");

const businessFitShape = {
  zipCode: z.string(),
  businessType: z.string(),
  cuisine: z.string(),
  investmentBudget: z.string(),
  ownerExperience: z.string(),
  facilitySize: z.string(),
  serviceModel: z.string(),
  targetOpeningDate: z.string(),
};

function textResult(payload: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(payload, null, 2),
      },
    ],
  };
}

function createMcpServer() {
  const server = new McpServer({
    name: "ans-food-service-os",
    version: "1.0.0",
  });

  server.registerTool(
    "analyze_business_fit",
    {
      title: "Analyze Business Fit",
      description:
        "Generate a Phase 1 ANS Food Business Fit Report from concept inputs. Planning estimates only; no live market data.",
      inputSchema: businessFitShape,
    },
    async (args) => textResult(runMcpTool("analyze_business_fit", args)),
  );

  server.registerTool(
    "build_startup_budget",
    {
      title: "Build Startup Budget",
      description:
        "Build a deterministic Phase 1 startup budget range and category breakdown. Planning estimates only.",
      inputSchema: businessFitShape,
    },
    async (args) => textResult(runMcpTool("build_startup_budget", args)),
  );

  server.registerTool(
    "generate_opening_checklist",
    {
      title: "Generate Opening Checklist",
      description:
        "Generate generic licensing/checklist and equipment categories. Requires local professional review.",
      inputSchema: businessFitShape,
    },
    async (args) => textResult(runMcpTool("generate_opening_checklist", args)),
  );

  server.registerTool(
    "compare_food_service_concepts",
    {
      title: "Compare Food Service Concepts",
      description:
        "Compare 2–3 food-service concepts with the same deterministic Phase 1 model. Read-only planning estimates.",
      inputSchema: {
        concepts: z
          .array(
            z.object({
              label: z.string(),
              input: z.object(businessFitShape),
            }),
          )
          .min(2)
          .max(3),
      },
    },
    async (args) => textResult(runMcpTool("compare_food_service_concepts", args)),
  );

  return server;
}

async function handleMcp(
  req: IncomingMessage,
  res: ServerResponse,
  body: string,
) {
  const server = createMcpServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  res.on("close", () => {
    void transport.close();
    void server.close();
  });

  await server.connect(transport);

  const parsedBody = body ? JSON.parse(body) : undefined;
  await transport.handleRequest(req, res, parsedBody);
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

const httpServer = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${HOST}:${PORT}`);

  if (req.method === "GET" && url.pathname === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        ok: true,
        service: "ans-food-service-os-mcp",
        mcpPath: "/mcp",
        note: "Development server only. Do not expose publicly without auth.",
      }),
    );
    return;
  }

  if (url.pathname !== "/mcp") {
    res.writeHead(404, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: false, error: "Not found" }));
    return;
  }

  if (req.method !== "POST" && req.method !== "GET" && req.method !== "DELETE") {
    res.writeHead(405, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: false, error: "Method not allowed" }));
    return;
  }

  try {
    const body = req.method === "POST" ? await readBody(req) : "";
    await handleMcp(req, res, body);
  } catch (error) {
    const message = error instanceof Error ? error.message : "MCP handler error";
    if (!res.headersSent) {
      res.writeHead(500, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: message }));
    }
  }
});

httpServer.listen(PORT, HOST, () => {
  console.log(`ANS MCP development server listening at http://${HOST}:${PORT}/mcp`);
  console.log("Private/local testing only. Do not publish this unauthenticated endpoint.");
});
