import type { Page, Dialog } from "playwright";

const pending = new WeakMap<Page, Dialog>();

export function setupDialogHandler(page: Page): void {
  page.on("dialog", (dialog: Dialog) => {
    pending.set(page, dialog);
  });
}

export async function acceptDialog(
  page: Page,
  promptText?: string,
): Promise<{ action: "accept"; message: string }> {
  const dialog = pending.get(page);
  if (!dialog) throw new Error("No pending dialog");
  const message = dialog.message();
  await dialog.accept(promptText);
  pending.delete(page);
  return { action: "accept", message };
}

export async function dismissDialog(
  page: Page,
): Promise<{ action: "dismiss"; message: string }> {
  const dialog = pending.get(page);
  if (!dialog) throw new Error("No pending dialog");
  const message = dialog.message();
  await dialog.dismiss();
  pending.delete(page);
  return { action: "dismiss", message };
}
