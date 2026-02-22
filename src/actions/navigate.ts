import type { Page } from "playwright";

export async function go(
  page: Page,
  url: string,
  waitUntil: "domcontentloaded" | "networkidle" | "load" = "domcontentloaded"
): Promise<{ url: string; title: string }> {
  await page.goto(url, { waitUntil });
  return { url: page.url(), title: await page.title() };
}

export async function back(page: Page): Promise<{ url: string; title: string }> {
  await page.goBack({ waitUntil: "domcontentloaded" });
  return { url: page.url(), title: await page.title() };
}

export async function forward(
  page: Page
): Promise<{ url: string; title: string }> {
  await page.goForward({ waitUntil: "domcontentloaded" });
  return { url: page.url(), title: await page.title() };
}

export async function reload(
  page: Page
): Promise<{ url: string; title: string }> {
  await page.reload({ waitUntil: "domcontentloaded" });
  return { url: page.url(), title: await page.title() };
}
