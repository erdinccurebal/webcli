import type { Page } from "playwright";

export async function setViewport(
  page: Page,
  width: number,
  height: number,
): Promise<{ width: number; height: number }> {
  await page.setViewportSize({ width, height });
  return { width, height };
}

export async function setUserAgent(
  page: Page,
  userAgent: string,
): Promise<{ userAgent: string }> {
  await page.setExtraHTTPHeaders({ "User-Agent": userAgent });
  return { userAgent };
}
