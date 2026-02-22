import type { Page, Browser } from "playwright";
import type { TabManager } from "./tab-manager.js";
import type { Request, Response } from "./protocol.js";
import type { Config } from "./config.js";

export interface HandlerContext {
  browser: Browser;
  tabManager: TabManager;
  config: Config;
  shutdown: () => Promise<void>;
}

export type ActionHandler = (
  ctx: HandlerContext,
  req: Request,
  page?: Page,
) => Promise<Response>;

interface HandlerEntry {
  handler: ActionHandler;
  needsPage: boolean;
  createsTab: boolean;
}

const registry = new Map<string, HandlerEntry>();

export function registerHandler(
  action: string,
  handler: ActionHandler,
  opts: { needsPage?: boolean; createsTab?: boolean } = {},
): void {
  registry.set(action, {
    handler,
    needsPage: opts.needsPage ?? true,
    createsTab: opts.createsTab ?? false,
  });
}

export async function dispatch(
  ctx: HandlerContext,
  req: Request,
): Promise<Response> {
  const entry = registry.get(req.action);
  if (!entry) return { ok: false, error: `Unknown action: ${req.action}` };

  try {
    let page: Page | undefined;
    if (entry.needsPage) {
      page = entry.createsTab
        ? await ctx.tabManager.getOrCreate(ctx.browser, req.tab)
        : ctx.tabManager.get(req.tab);
    }
    return await entry.handler(ctx, req, page);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  }
}
