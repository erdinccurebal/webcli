import type { Page } from "playwright";

export async function waitForSelector(
  page: Page,
  selector: string,
  timeout = 10000,
): Promise<{ selector: string; found: boolean }> {
  await page.waitForSelector(selector, { state: "visible", timeout });
  return { selector, found: true };
}

export async function waitForText(
  page: Page,
  text: string,
  timeout = 10000,
): Promise<{ text: string; found: boolean }> {
  await page
    .getByText(text, { exact: false })
    .first()
    .waitFor({ state: "visible", timeout });
  return { text, found: true };
}
