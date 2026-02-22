import { describe, it, expect, beforeEach } from "vitest";

// Import fresh module for each test to reset registry
let registerHandler: typeof import("../src/handler-registry.js").registerHandler;
let dispatch: typeof import("../src/handler-registry.js").dispatch;

beforeEach(async () => {
  // Re-import to reset the registry Map
  vi.resetModules();
  const mod = await import("../src/handler-registry.js");
  registerHandler = mod.registerHandler;
  dispatch = mod.dispatch;
});

import { vi } from "vitest";

const mockCtx = {
  browser: {} as any,
  tabManager: {
    get: vi.fn(() => ({ url: () => "https://example.com" })),
    getOrCreate: vi.fn(() => ({ url: () => "https://example.com" })),
  } as any,
  config: {},
  shutdown: vi.fn(),
};

describe("registerHandler + dispatch", () => {
  it("dispatches to a registered handler", async () => {
    registerHandler("ping", async () => ({ ok: true, data: "pong" }));
    const res = await dispatch(mockCtx, { action: "ping", tab: "default", args: {} });
    expect(res).toEqual({ ok: true, data: "pong" });
  });

  it("returns error for unknown action", async () => {
    const res = await dispatch(mockCtx, { action: "nope", tab: "default", args: {} });
    expect(res.ok).toBe(false);
    expect(res.error).toContain("Unknown action: nope");
  });

  it("catches handler errors and returns error response", async () => {
    registerHandler("fail", async () => { throw new Error("boom"); });
    const res = await dispatch(mockCtx, { action: "fail", tab: "default", args: {} });
    expect(res.ok).toBe(false);
    expect(res.error).toBe("boom");
  });

  it("passes page to handler when needsPage is true (default)", async () => {
    let receivedPage: any;
    registerHandler("check", async (_ctx, _req, page) => {
      receivedPage = page;
      return { ok: true };
    });
    await dispatch(mockCtx, { action: "check", tab: "default", args: {} });
    expect(receivedPage).toBeDefined();
    expect(mockCtx.tabManager.get).toHaveBeenCalledWith("default");
  });

  it("uses getOrCreate when createsTab is true", async () => {
    registerHandler("create", async () => ({ ok: true }), { needsPage: true, createsTab: true });
    await dispatch(mockCtx, { action: "create", tab: "mytab", args: {} });
    expect(mockCtx.tabManager.getOrCreate).toHaveBeenCalledWith(mockCtx.browser, "mytab");
  });

  it("does not fetch page when needsPage is false", async () => {
    let receivedPage: any = "unset";
    registerHandler("nopage", async (_ctx, _req, page) => {
      receivedPage = page;
      return { ok: true };
    }, { needsPage: false });
    await dispatch(mockCtx, { action: "nopage", tab: "default", args: {} });
    expect(receivedPage).toBeUndefined();
  });
});
