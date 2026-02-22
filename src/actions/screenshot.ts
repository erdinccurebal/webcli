import type { Page } from "playwright";
import { resolve } from "node:path";

export async function screenshot(
  page: Page,
  outputPath?: string
): Promise<{ path: string }> {
  const filename =
    outputPath || `screenshot-${Date.now()}.png`;
  const fullPath = resolve(filename);
  await page.screenshot({ path: fullPath, fullPage: true });
  return { path: fullPath };
}
