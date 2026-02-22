import type { Browser, BrowserContext, Page } from "playwright";

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

export class TabManager {
  private tabs = new Map<string, Page>();
  private context: BrowserContext | null = null;

  constructor(existingContext?: BrowserContext) {
    if (existingContext) {
      this.context = existingContext;
    }
  }

  private async getContext(browser: Browser): Promise<BrowserContext> {
    if (this.context) return this.context;
    this.context = await browser.newContext({
      userAgent: USER_AGENT,
      viewport: { width: 1280, height: 800 },
      locale: "en-US",
      timezoneId: "America/New_York",
      bypassCSP: true,
    });
    // Remove webdriver flag from all new pages
    await this.context.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => false });
      // Override permissions query
      const originalQuery = window.navigator.permissions.query;
      window.navigator.permissions.query = (parameters: any) =>
        parameters.name === "notifications"
          ? Promise.resolve({ state: Notification.permission } as PermissionStatus)
          : originalQuery(parameters);
    });
    return this.context;
  }

  async getOrCreate(browser: Browser, name: string): Promise<Page> {
    let page = this.tabs.get(name);
    if (page && !page.isClosed()) return page;

    const context = await this.getContext(browser);
    page = await context.newPage();
    this.tabs.set(name, page);
    return page;
  }

  get(name: string): Page {
    const page = this.tabs.get(name);
    if (!page || page.isClosed()) {
      this.tabs.delete(name);
      throw new Error(`Tab "${name}" not found`);
    }
    return page;
  }

  async close(name: string): Promise<void> {
    const page = this.tabs.get(name);
    if (page && !page.isClosed()) {
      await page.close();
    }
    this.tabs.delete(name);
  }

  list(): Array<{ name: string; url: string }> {
    const result: Array<{ name: string; url: string }> = [];
    for (const [name, page] of this.tabs) {
      if (page.isClosed()) {
        this.tabs.delete(name);
        continue;
      }
      result.push({ name, url: page.url() });
    }
    return result;
  }

  async closeAll(): Promise<void> {
    for (const [name, page] of this.tabs) {
      if (!page.isClosed()) await page.close();
      this.tabs.delete(name);
    }
  }
}
