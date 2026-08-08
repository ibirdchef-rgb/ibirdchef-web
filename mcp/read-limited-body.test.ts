import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { describe, it } from "node:test";
import type { IncomingMessage } from "node:http";
import { LOCAL_MCP_MAX_BODY_BYTES, readLimitedNodeBody } from "./read-limited-body";

function fakeRequest(chunks: Buffer[]): IncomingMessage {
  const emitter = new EventEmitter() as IncomingMessage & EventEmitter;
  let resumed = false;
  (emitter as IncomingMessage).resume = (() => {
    resumed = true;
  }) as IncomingMessage["resume"];
  queueMicrotask(() => {
    for (const chunk of chunks) {
      emitter.emit("data", chunk);
    }
    emitter.emit("end");
  });
  Object.defineProperty(emitter, "wasResumed", {
    get: () => resumed,
  });
  return emitter;
}

describe("local MCP body reader", () => {
  it("rejects oversized bodies with payload_too_large without destroying the socket", async () => {
    const oversized = Buffer.alloc(LOCAL_MCP_MAX_BODY_BYTES + 32, 0x61);
    const req = fakeRequest([oversized]);
    await assert.rejects(
      () => readLimitedNodeBody(req),
      (error: unknown) =>
        error instanceof Error && error.message === "payload_too_large",
    );
    assert.equal((req as IncomingMessage & { wasResumed?: boolean }).wasResumed, true);
  });

  it("returns UTF-8 text for in-limit bodies", async () => {
    const req = fakeRequest([Buffer.from('{"ok":true}', "utf8")]);
    const text = await readLimitedNodeBody(req);
    assert.equal(text, '{"ok":true}');
  });
});
