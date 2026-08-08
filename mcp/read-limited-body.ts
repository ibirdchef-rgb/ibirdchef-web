import type { IncomingMessage } from "node:http";

export const LOCAL_MCP_MAX_BODY_BYTES = 64 * 1024;

/**
 * Read a bounded Node request body without destroying the socket on overflow
 * so a controlled HTTP 413 response can still be written.
 */
export function readLimitedNodeBody(
  req: IncomingMessage,
  maxBytes = LOCAL_MCP_MAX_BODY_BYTES,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let total = 0;
    let tooLarge = false;

    req.on("data", (chunk) => {
      if (tooLarge) {
        return;
      }
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      total += buf.length;
      if (total > maxBytes) {
        tooLarge = true;
        chunks.length = 0;
        req.resume();
        return;
      }
      chunks.push(buf);
    });
    req.on("end", () => {
      if (tooLarge) {
        reject(new Error("payload_too_large"));
        return;
      }
      resolve(Buffer.concat(chunks).toString("utf8"));
    });
    req.on("error", reject);
  });
}
