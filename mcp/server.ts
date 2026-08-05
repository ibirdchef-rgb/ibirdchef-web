/**
 * ANS Food Business Fit — local MCP development server.
 * Prefer production endpoint at /api/mcp after deploy.
 * Do not expose this unauthenticated local listener publicly.
 */

import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createAnsFoodBusinessFitMcpServer } from "../src/lib/ans-mcp/create-mcp-server";

const HOST = process.env.ANS_MCP_HOST ?? "127.0.0.1";
const PORT = Number(process.env.ANS_MCP_PORT ?? "8787");

async function handleMcp(req: IncomingMessage, res: ServerResponse, body: string) {
  const server = createAnsFoodBusinessFitMcpServer();
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
    let total = 0;
    const max = 64 * 1024;
    req.on("data", (chunk) => {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      total += buf.length;
      if (total > max) {
        reject(new Error("payload_too_large"));
        req.destroy();
        return;
      }
      chunks.push(buf);
    });
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
        service: "ans-food-business-fit-mcp",
        mcpPath: "/mcp",
        note: "Development server only. Production path is /api/mcp.",
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
    if (!res.headersSent) {
      const isLarge = error instanceof Error && error.message === "payload_too_large";
      res.writeHead(isLarge ? 413 : 500, { "content-type": "application/json" });
      res.end(
        JSON.stringify({
          ok: false,
          error: {
            code: isLarge ? "payload_too_large" : "internal_error",
            message: isLarge
              ? "Request body exceeds 65536 bytes."
              : "Unable to process MCP request.",
          },
        }),
      );
    }
  }
});

httpServer.listen(PORT, HOST, () => {
  console.log(`ANS MCP development server listening at http://${HOST}:${PORT}/mcp`);
  console.log("Local testing only. Production endpoint target: https://ibirdchef.com/api/mcp");
});
