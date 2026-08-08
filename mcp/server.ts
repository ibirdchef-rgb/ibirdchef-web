/**
 * ANS Food Business Fit — local MCP development server.
 * Prefer production endpoint at /api/mcp after deploy.
 * Do not expose this unauthenticated local listener publicly.
 */

import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createAnsFoodBusinessFitMcpServer } from "../src/lib/ans-mcp/create-mcp-server";
import {
  LOCAL_MCP_MAX_BODY_BYTES,
  readLimitedNodeBody,
} from "./read-limited-body";

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

function writeJson(
  res: ServerResponse,
  status: number,
  payload: unknown,
  extraHeaders?: Record<string, string>,
) {
  if (res.headersSent || res.writableEnded) {
    return;
  }
  res.writeHead(status, {
    "content-type": "application/json",
    "cache-control": "no-store",
    ...extraHeaders,
  });
  res.end(JSON.stringify(payload));
}

const httpServer = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${HOST}:${PORT}`);

  if (req.method === "GET" && url.pathname === "/health") {
    writeJson(res, 200, {
      ok: true,
      service: "ans-food-business-fit-mcp",
      mcpPath: "/mcp",
      note: "Development server only. Production path is /api/mcp.",
    });
    return;
  }

  if (url.pathname !== "/mcp") {
    writeJson(res, 404, { ok: false, error: "Not found" });
    return;
  }

  if (req.method === "GET") {
    writeJson(
      res,
      405,
      {
        ok: false,
        error: {
          code: "method_not_allowed",
          message: "GET is not supported on this MCP endpoint. Use POST.",
        },
      },
      { allow: "POST, DELETE" },
    );
    return;
  }

  if (req.method !== "POST" && req.method !== "DELETE") {
    writeJson(
      res,
      405,
      { ok: false, error: { code: "method_not_allowed", message: "Method not allowed" } },
      { allow: "POST, DELETE" },
    );
    return;
  }

  try {
    const body = req.method === "POST" ? await readLimitedNodeBody(req) : "";
    await handleMcp(req, res, body);
  } catch (error) {
    const isLarge = error instanceof Error && error.message === "payload_too_large";
    writeJson(res, isLarge ? 413 : 500, {
      ok: false,
      error: {
        code: isLarge ? "payload_too_large" : "internal_error",
        message: isLarge
          ? `Request body exceeds ${LOCAL_MCP_MAX_BODY_BYTES} bytes.`
          : "Unable to process MCP request.",
      },
    });
  }
});

httpServer.listen(PORT, HOST, () => {
  console.log(`ANS MCP development server listening at http://${HOST}:${PORT}/mcp`);
  console.log("Local testing only. Production endpoint target: https://ibirdchef.com/api/mcp");
});
