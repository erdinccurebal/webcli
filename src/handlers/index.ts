import { registerHandler } from "../handler-registry.js";
import { requireString, requireUrl, optionalString, optionalNumber } from "../validate.js";
import * as navigate from "../actions/navigate.js";
import * as read from "../actions/read.js";
import * as interact from "../actions/interact.js";
import * as wait from "../actions/wait.js";
import * as cookie from "../actions/cookie.js";
import * as browser from "../actions/browser.js";
import * as network from "../actions/network.js";
import { screenshot } from "../actions/screenshot.js";

export function registerAllHandlers(): void {
  // --- Tab-independent ---

  registerHandler("tabs", async (ctx) => ({
    ok: true, data: ctx.tabManager.list(),
  }), { needsPage: false });

  registerHandler("status", async (ctx) => ({
    ok: true,
    data: { pid: process.pid, tabs: ctx.tabManager.list(), uptime: process.uptime() },
  }), { needsPage: false });

  registerHandler("stop", async (ctx) => {
    setTimeout(() => ctx.shutdown(), 100);
    return { ok: true, data: { stopping: true } };
  }, { needsPage: false });

  registerHandler("quit", async (ctx, req) => {
    await ctx.tabManager.close(req.tab);
    return { ok: true, data: { tab: req.tab, closed: true } };
  }, { needsPage: false });

  // --- Navigation ---

  registerHandler("go", async (_ctx, req, page) => {
    const url = requireUrl(req.args, "url");
    const waitUntil = (optionalString(req.args, "waitUntil") as "domcontentloaded" | "networkidle" | "load") || "domcontentloaded";
    return { ok: true, data: await navigate.go(page!, url, waitUntil) };
  }, { needsPage: true, createsTab: true });

  registerHandler("back", async (_ctx, _req, page) => ({
    ok: true, data: await navigate.back(page!),
  }));

  registerHandler("forward", async (_ctx, _req, page) => ({
    ok: true, data: await navigate.forward(page!),
  }));

  registerHandler("reload", async (_ctx, _req, page) => ({
    ok: true, data: await navigate.reload(page!),
  }));

  // --- Reading ---

  registerHandler("source", async (_ctx, _req, page) => ({
    ok: true, data: await read.source(page!),
  }));

  registerHandler("links", async (_ctx, _req, page) => ({
    ok: true, data: await read.links(page!),
  }));

  registerHandler("forms", async (_ctx, _req, page) => ({
    ok: true, data: await read.forms(page!),
  }));

  registerHandler("eval", async (_ctx, req, page) => {
    const js = requireString(req.args, "js", "JavaScript code");
    return { ok: true, data: await read.evaluate(page!, js) };
  });

  registerHandler("html", async (_ctx, req, page) => {
    const selector = requireString(req.args, "selector");
    return { ok: true, data: await read.html(page!, selector) };
  });

  registerHandler("attr", async (_ctx, req, page) => {
    const selector = requireString(req.args, "selector");
    const attribute = requireString(req.args, "attribute");
    return { ok: true, data: await read.attr(page!, selector, attribute) };
  });

  // --- Interaction ---

  registerHandler("click", async (ctx, req, page) => {
    const text = requireString(req.args, "text");
    return { ok: true, data: await interact.click(page!, text, ctx.config.waitAfterClick) };
  });

  registerHandler("clicksel", async (ctx, req, page) => {
    const selector = requireString(req.args, "selector");
    return { ok: true, data: await interact.clicksel(page!, selector, ctx.config.waitAfterClick) };
  });

  registerHandler("focus", async (_ctx, req, page) => {
    const selector = requireString(req.args, "selector");
    return { ok: true, data: await interact.focus(page!, selector) };
  });

  registerHandler("type", async (_ctx, req, page) => {
    const text = requireString(req.args, "text");
    return { ok: true, data: await interact.type(page!, text) };
  });

  registerHandler("fill", async (_ctx, req, page) => {
    const selector = requireString(req.args, "selector");
    const value = requireString(req.args, "value");
    return { ok: true, data: await interact.fill(page!, selector, value) };
  });

  registerHandler("select", async (_ctx, req, page) => {
    const selector = requireString(req.args, "selector");
    const value = requireString(req.args, "value");
    return { ok: true, data: await interact.select(page!, selector, value) };
  });

  registerHandler("press", async (ctx, req, page) => {
    const key = requireString(req.args, "key");
    return { ok: true, data: await interact.press(page!, key, ctx.config.waitAfterPress) };
  });

  // --- Wait ---

  registerHandler("wait", async (_ctx, req, page) => {
    const selector = requireString(req.args, "selector");
    const timeout = optionalNumber(req.args, "waitTimeout") || 10000;
    return { ok: true, data: await wait.waitForSelector(page!, selector, timeout) };
  });

  registerHandler("waitfor", async (_ctx, req, page) => {
    const text = requireString(req.args, "text");
    const timeout = optionalNumber(req.args, "waitTimeout") || 10000;
    return { ok: true, data: await wait.waitForText(page!, text, timeout) };
  });

  // --- Screenshot ---

  registerHandler("screenshot", async (_ctx, req, page) => {
    const output = optionalString(req.args, "output");
    return { ok: true, data: await screenshot(page!, output) };
  });

  // --- Cookie ---

  registerHandler("cookie-export", async (_ctx, _req, page) => ({
    ok: true, data: await cookie.exportCookies(page!),
  }));

  registerHandler("cookie-import", async (_ctx, req, page) => {
    const cookies = req.args.cookies;
    if (!Array.isArray(cookies)) throw new Error("cookies must be an array");
    return { ok: true, data: await cookie.importCookies(page!, cookies) };
  });

  // --- Browser settings ---

  registerHandler("viewport", async (_ctx, req, page) => {
    const width = req.args.width as number;
    const height = req.args.height as number;
    if (!width || !height) throw new Error("width and height are required");
    return { ok: true, data: await browser.setViewport(page!, width, height) };
  });

  registerHandler("useragent", async (_ctx, req, page) => {
    const ua = requireString(req.args, "userAgent");
    return { ok: true, data: await browser.setUserAgent(page!, ua) };
  });

  registerHandler("network", async (_ctx, req, page) => {
    const mode = optionalString(req.args, "mode") || "status";
    if (mode === "on") return { ok: true, data: network.enableNetworkLogging(page!) };
    if (mode === "off") return { ok: true, data: network.disableNetworkLogging(page!) };
    // status: return recent logs
    const logs = network.getNetworkLogs(page!);
    return { ok: true, data: { logs } };
  });
}
