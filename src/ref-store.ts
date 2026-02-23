import type { Page, ElementHandle } from "playwright";

const store = new WeakMap<Page, Map<string, ElementHandle>>();

export function setRefs(page: Page, refs: Map<string, ElementHandle>): void {
  store.set(page, refs);
}

export function getRef(page: Page, ref: string): ElementHandle | undefined {
  const map = store.get(page);
  if (!map) return undefined;
  return map.get(ref);
}

export function isRef(text: string): boolean {
  return /^@e\d+$/.test(text);
}
