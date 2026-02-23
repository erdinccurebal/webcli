import type { Page } from "playwright";

export async function storageGet(
  page: Page,
  key?: string,
): Promise<{ storage: Record<string, string> | string | null }> {
  if (key) {
    const value = await page.evaluate((k) => localStorage.getItem(k), key);
    return { storage: value };
  }
  const all = await page.evaluate(() => {
    const result: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k) result[k] = localStorage.getItem(k) || "";
    }
    return result;
  });
  return { storage: all };
}

export async function storageSet(
  page: Page,
  key: string,
  value: string,
): Promise<{ key: string; value: string }> {
  await page.evaluate(([k, v]) => localStorage.setItem(k, v), [key, value] as const);
  return { key, value };
}

export async function storageClear(
  page: Page,
): Promise<{ cleared: boolean }> {
  await page.evaluate(() => localStorage.clear());
  return { cleared: true };
}
