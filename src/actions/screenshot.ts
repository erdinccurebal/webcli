import type { Page } from "playwright";
import { resolve } from "node:path";

export async function screenshot(
  page: Page,
  outputPath?: string,
  options?: { fullPage?: boolean },
): Promise<{ path: string }> {
  const filename =
    outputPath || `screenshot-${Date.now()}.png`;
  const fullPath = resolve(filename);
  const fullPage = options?.fullPage ?? true;
  await page.screenshot({ path: fullPath, fullPage });
  return { path: fullPath };
}

export async function screenshotAnnotated(
  page: Page,
  outputPath?: string,
): Promise<{ path: string; annotations: number }> {
  // Inject annotation overlays onto interactive elements
  const count = await page.evaluate(() => {
    const interactiveSelectors = 'a, button, input, textarea, select, [role="button"], [role="link"], [role="textbox"], [role="checkbox"], [role="radio"]';
    const elements = document.querySelectorAll(interactiveSelectors);
    let n = 0;
    elements.forEach((el, i) => {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      n++;
      const overlay = document.createElement("div");
      overlay.className = "__webcli_annotation";
      overlay.style.cssText = `position:absolute;left:${rect.left + window.scrollX}px;top:${rect.top + window.scrollY}px;background:rgba(255,0,0,0.7);color:#fff;font-size:11px;padding:1px 4px;z-index:999999;pointer-events:none;border-radius:3px;font-family:monospace;`;
      overlay.textContent = String(i + 1);
      document.body.appendChild(overlay);
    });
    return n;
  });

  const filename = outputPath || `annotated-${Date.now()}.png`;
  const fullPath = resolve(filename);
  await page.screenshot({ path: fullPath, fullPage: true });

  // Remove annotations
  await page.evaluate(() => {
    document.querySelectorAll(".__webcli_annotation").forEach((el) => el.remove());
  });

  return { path: fullPath, annotations: count };
}
