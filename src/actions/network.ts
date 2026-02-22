import type {
  Page,
  Request as PwRequest,
  Response as PwResponse,
} from "playwright";

interface Listeners {
  onReq: (r: PwRequest) => void;
  onRes: (r: PwResponse) => void;
}

const active = new WeakMap<Page, Listeners>();
const logs = new WeakMap<Page, string[]>();

export function enableNetworkLogging(
  page: Page,
): { enabled: boolean } {
  if (active.has(page)) return { enabled: true };
  const entries: string[] = [];
  logs.set(page, entries);
  const onReq = (r: PwRequest) => {
    entries.push(`>> ${r.method()} ${r.url()}`);
  };
  const onRes = (r: PwResponse) => {
    entries.push(`<< ${r.status()} ${r.url()}`);
  };
  page.on("request", onReq);
  page.on("response", onRes);
  active.set(page, { onReq, onRes });
  return { enabled: true };
}

export function disableNetworkLogging(
  page: Page,
): { enabled: boolean } {
  const l = active.get(page);
  if (l) {
    page.removeListener("request", l.onReq);
    page.removeListener("response", l.onRes);
    active.delete(page);
  }
  logs.delete(page);
  return { enabled: false };
}

export function getNetworkLogs(page: Page): string[] {
  return logs.get(page) || [];
}

export function clearNetworkLogs(page: Page): void {
  const entries = logs.get(page);
  if (entries) entries.length = 0;
}
