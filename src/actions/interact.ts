import type { Page } from "playwright";

export async function click(
  page: Page,
  text: string,
  waitAfterClick = 500,
): Promise<{ clicked: string; url: string }> {
  const locator = page
    .getByText(text, { exact: false })
    .or(page.getByRole("button", { name: text }))
    .or(page.getByRole("link", { name: text }))
    .or(page.getByLabel(text));

  await locator.first().click();
  await page.waitForTimeout(waitAfterClick);
  return { clicked: text, url: page.url() };
}

export async function clicksel(
  page: Page,
  selector: string,
  waitAfterClick = 500,
): Promise<{ selector: string; url: string }> {
  await page.click(selector);
  await page.waitForTimeout(waitAfterClick);
  return { selector, url: page.url() };
}

export async function focus(
  page: Page,
  selector: string,
): Promise<{ selector: string }> {
  await page.focus(selector);
  return { selector };
}

export async function press(
  page: Page,
  key: string,
  waitAfterPress = 300,
): Promise<{ key: string; url: string }> {
  await page.keyboard.press(key);
  await page.waitForTimeout(waitAfterPress);
  return { key, url: page.url() };
}

export async function type(
  page: Page,
  text: string
): Promise<{ typed: string }> {
  await page.keyboard.type(text);
  return { typed: text };
}

export async function fill(
  page: Page,
  selector: string,
  value: string
): Promise<{ selector: string; value: string }> {
  await page.fill(selector, value);
  return { selector, value };
}

export async function select(
  page: Page,
  selector: string,
  value: string
): Promise<{ selector: string; value: string }> {
  await page.selectOption(selector, value);
  return { selector, value };
}
