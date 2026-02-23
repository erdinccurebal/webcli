import type { Page } from "playwright";
import { resolve } from "node:path";

export async function pdf(
  page: Page,
  outputPath?: string,
): Promise<{ path: string }> {
  const filename = outputPath || `page-${Date.now()}.pdf`;
  const fullPath = resolve(filename);
  await page.pdf({ path: fullPath, format: "A4" });
  return { path: fullPath };
}
