import type { Page } from "playwright";
import { devices } from "playwright";

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

export async function setDevice(
  page: Page,
  deviceName: string,
): Promise<{ device: string; viewport: { width: number; height: number }; userAgent: string }> {
  const device = devices[deviceName];
  if (!device) {
    const available = Object.keys(devices).slice(0, 20).join(", ");
    throw new Error(`Unknown device: "${deviceName}". Available: ${available}...`);
  }
  await page.setViewportSize(device.viewport);
  await page.setExtraHTTPHeaders({ "User-Agent": device.userAgent });
  return { device: deviceName, viewport: device.viewport, userAgent: device.userAgent };
}
