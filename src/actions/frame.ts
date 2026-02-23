import type { Page, Frame } from "playwright";

const activeFrame = new WeakMap<Page, Frame>();

export async function switchToFrame(
  page: Page,
  selector: string,
): Promise<{ frame: string }> {
  const elementHandle = await page.$(selector);
  if (!elementHandle) throw new Error(`Frame not found: ${selector}`);
  const frame = await elementHandle.contentFrame();
  if (!frame) throw new Error(`Element is not an iframe: ${selector}`);
  activeFrame.set(page, frame);
  return { frame: selector };
}

export function switchToMain(
  page: Page,
): { frame: "main" } {
  activeFrame.delete(page);
  return { frame: "main" };
}

export function getActiveFrame(page: Page): Frame {
  return activeFrame.get(page) || page.mainFrame();
}
