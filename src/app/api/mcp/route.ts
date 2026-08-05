import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createAnsFoodBusinessFitMcpServer } from "@/lib/ans-mcp/create-mcp-server";
import {
  checkAuth,
  checkRateLimit,
  getClientKey,
  logMcpEvent,
  readLimitedBody,
  safeErrorResponse,
} from "@/lib/ans-mcp/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handleMcp(request: Request): Promise<Response> {
  const clientKey = getClientKey(request);

  const auth = checkAuth(request);
  if (!auth.ok) {
    logMcpEvent({
      level: "warn",
      message: "mcp_auth_rejected",
      clientKey,
      status: auth.status,
    });
    return safeErrorResponse(auth.status, auth.error.code, auth.error.message);
  }

  const rate = checkRateLimit(clientKey);
  if (!rate.ok) {
    logMcpEvent({
      level: "warn",
      message: "mcp_rate_limited",
      clientKey,
      status: rate.status,
    });
    return safeErrorResponse(rate.status, rate.error.code, rate.error.message);
  }

  try {
    const bodyResult =
      request.method === "POST" ? await readLimitedBody(request) : { ok: true as const, text: "" };
    if (!bodyResult.ok) {
      logMcpEvent({
        level: "warn",
        message: "mcp_payload_rejected",
        clientKey,
        status: bodyResult.status,
      });
      return safeErrorResponse(
        bodyResult.status,
        bodyResult.error.code,
        bodyResult.error.message,
      );
    }

    const server = createAnsFoodBusinessFitMcpServer();
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });

    await server.connect(transport);

    let parsedBody: unknown;
    if (bodyResult.text) {
      try {
        parsedBody = JSON.parse(bodyResult.text);
      } catch {
        return safeErrorResponse(400, "invalid_json", "Request body must be valid JSON.");
      }
    }

    const response = await transport.handleRequest(request, {
      parsedBody,
    });

    logMcpEvent({
      level: "info",
      message: "mcp_request_ok",
      clientKey,
      status: response.status,
    });

    // Ensure security headers on successful transport responses.
    const headers = new Headers(response.headers);
    headers.set("cache-control", "no-store");
    headers.set("x-content-type-options", "nosniff");
    headers.set("referrer-policy", "no-referrer");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error) {
    logMcpEvent({
      level: "error",
      message: "mcp_handler_error",
      clientKey,
      status: 500,
    });
    const safeMessage =
      error instanceof SyntaxError
        ? "Request body must be valid JSON."
        : "Unable to process MCP request.";
    return safeErrorResponse(
      error instanceof SyntaxError ? 400 : 500,
      error instanceof SyntaxError ? "invalid_json" : "internal_error",
      safeMessage,
    );
  }
}

export async function GET(request: Request) {
  return handleMcp(request);
}

export async function POST(request: Request) {
  return handleMcp(request);
}

export async function DELETE(request: Request) {
  return handleMcp(request);
}
