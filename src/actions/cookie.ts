import type { Page } from "playwright";

export async function exportCookies(
  page: Page,
): Promise<{ url: string; cookies: unknown[] }> {
  const context = page.context();
  const cookies = await context.cookies();
  return { url: page.url(), cookies };
}

export async function importCookies(
  page: Page,
  cookies: unknown[],
): Promise<{ imported: number }> {
  const context = page.context();
  await context.addCookies(cookies as Parameters<typeof context.addCookies>[0]);
  return { imported: cookies.length };
}
