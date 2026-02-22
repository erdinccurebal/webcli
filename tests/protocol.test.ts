import { describe, it, expect } from "vitest";
import { encodeMessage, decodeMessage, type Request, type Response } from "../src/protocol.js";

describe("encodeMessage", () => {
  it("encodes a request as JSON with newline", () => {
    const req: Request = { action: "go", tab: "default", args: { url: "https://example.com" } };
    const encoded = encodeMessage(req);
    expect(encoded).toBe(JSON.stringify(req) + "\n");
  });

  it("encodes a response as JSON with newline", () => {
    const res: Response = { ok: true, data: { url: "https://example.com" } };
    const encoded = encodeMessage(res);
    expect(encoded).toBe(JSON.stringify(res) + "\n");
  });
});

describe("decodeMessage", () => {
  it("decodes a JSON line into a request", () => {
    const req: Request = { action: "source", tab: "main", args: {} };
    const decoded = decodeMessage<Request>(JSON.stringify(req));
    expect(decoded).toEqual(req);
  });

  it("handles trailing whitespace", () => {
    const res: Response = { ok: false, error: "not found" };
    const decoded = decodeMessage<Response>(JSON.stringify(res) + "  \n");
    expect(decoded).toEqual(res);
  });

  it("roundtrips correctly", () => {
    const req: Request = { action: "click", tab: "t1", args: { text: "Login" }, timeout: 5000 };
    const decoded = decodeMessage<Request>(encodeMessage(req).trim());
    expect(decoded).toEqual(req);
  });
});
