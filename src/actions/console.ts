import type { Page, ConsoleMessage } from "playwright";

interface Listeners {
  onConsole: (msg: ConsoleMessage) => void;
  onError: (err: Error) => void;
}

const active = new WeakMap<Page, Listeners>();
const consoleLogs = new WeakMap<Page, Array<{ type: string; text: string }>>();
const errorLogs = new WeakMap<Page, string[]>();

export function enableConsoleLogging(page: Page): { enabled: boolean } {
  if (active.has(page)) return { enabled: true };

  const messages: Array<{ type: string; text: string }> = [];
  const errors: string[] = [];
  consoleLogs.set(page, messages);
  errorLogs.set(page, errors);

  const onConsole = (msg: ConsoleMessage) => {
    messages.push({ type: msg.type(), text: msg.text() });
  };
  const onError = (err: Error) => {
    errors.push(err.message);
  };

  page.on("console", onConsole);
  page.on("pageerror", onError);
  active.set(page, { onConsole, onError });
  return { enabled: true };
}

export function disableConsoleLogging(page: Page): { enabled: boolean } {
  const l = active.get(page);
  if (l) {
    page.removeListener("console", l.onConsole);
    page.removeListener("pageerror", l.onError);
    active.delete(page);
  }
  consoleLogs.delete(page);
  errorLogs.delete(page);
  return { enabled: false };
}

export function getConsoleLogs(page: Page): Array<{ type: string; text: string }> {
  return consoleLogs.get(page) || [];
}

export function getErrors(page: Page): string[] {
  return errorLogs.get(page) || [];
}
