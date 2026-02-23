import type { Page } from "playwright";

export async function source(page: Page): Promise<{ url: string; text: string }> {
  const text = await page.innerText("body");
  return { url: page.url(), text };
}

export async function links(
  page: Page
): Promise<{ url: string; links: Array<{ text: string; href: string }> }> {
  const items = await page.$$eval("a[href]", (els) =>
    els.map((a) => ({
      text: (a as HTMLAnchorElement).innerText.trim(),
      href: (a as HTMLAnchorElement).href,
    }))
  );
  return { url: page.url(), links: items.filter((l) => l.text.length > 0) };
}

interface FormField {
  tag: string;
  type?: string;
  name?: string;
  placeholder?: string;
  value?: string;
  options?: string[];
}

interface FormInfo {
  action: string;
  method: string;
  fields: FormField[];
}

export async function forms(
  page: Page
): Promise<{ url: string; forms: FormInfo[] }> {
  const result = await page.$$eval("form", (formEls) =>
    formEls.map((form) => {
      const fields = Array.from(
        form.querySelectorAll("input, textarea, select")
      ).map((el) => {
        const field: FormField = { tag: el.tagName.toLowerCase() };
        if (el instanceof HTMLInputElement) {
          field.type = el.type;
          field.name = el.name || undefined;
          field.placeholder = el.placeholder || undefined;
          field.value = el.value || undefined;
        } else if (el instanceof HTMLTextAreaElement) {
          field.name = el.name || undefined;
          field.placeholder = el.placeholder || undefined;
          field.value = el.value || undefined;
        } else if (el instanceof HTMLSelectElement) {
          field.name = el.name || undefined;
          field.options = Array.from(el.options).map((o) => o.value);
          field.value = el.value || undefined;
        }
        return field;
      });
      return {
        action: (form as HTMLFormElement).action,
        method: (form as HTMLFormElement).method,
        fields,
      };
    })
  );
  return { url: page.url(), forms: result };
}

export async function evaluate(
  page: Page,
  js: string,
): Promise<{ result: unknown }> {
  const result = await page.evaluate(js);
  return { result };
}

export async function html(
  page: Page,
  selector: string,
): Promise<{ url: string; selector: string; html: string }> {
  const element = await page.$(selector);
  if (!element) throw new Error(`Element not found: ${selector}`);
  const innerHTML = await element.innerHTML();
  return { url: page.url(), selector, html: innerHTML };
}

export async function attr(
  page: Page,
  selector: string,
  attribute: string,
): Promise<{ url: string; selector: string; attribute: string; value: string | null }> {
  const element = await page.$(selector);
  if (!element) throw new Error(`Element not found: ${selector}`);
  const value = await element.getAttribute(attribute);
  return { url: page.url(), selector, attribute, value };
}

export async function title(page: Page): Promise<{ title: string }> {
  return { title: await page.title() };
}

export async function url(page: Page): Promise<{ url: string }> {
  return { url: page.url() };
}

export async function value(
  page: Page,
  selector: string,
): Promise<{ selector: string; value: string }> {
  const val = await page.inputValue(selector);
  return { selector, value: val };
}

export async function count(
  page: Page,
  selector: string,
): Promise<{ selector: string; count: number }> {
  const elements = await page.$$(selector);
  return { selector, count: elements.length };
}

export async function box(
  page: Page,
  selector: string,
): Promise<{ selector: string; box: { x: number; y: number; width: number; height: number } | null }> {
  const element = await page.$(selector);
  if (!element) throw new Error(`Element not found: ${selector}`);
  const bb = await element.boundingBox();
  return { selector, box: bb };
}

export async function styles(
  page: Page,
  selector: string,
  props?: string[],
): Promise<{ selector: string; styles: Record<string, string> }> {
  const result = await page.$eval(
    selector,
    (el, propList) => {
      const computed = window.getComputedStyle(el);
      const out: Record<string, string> = {};
      if (propList && propList.length > 0) {
        for (const p of propList) {
          out[p] = computed.getPropertyValue(p);
        }
      } else {
        for (let i = 0; i < computed.length; i++) {
          const name = computed[i];
          out[name] = computed.getPropertyValue(name);
        }
      }
      return out;
    },
    props || [],
  );
  return { selector, styles: result };
}

export async function visible(
  page: Page,
  selector: string,
): Promise<{ selector: string; visible: boolean }> {
  const element = page.locator(selector);
  const isVisible = await element.isVisible();
  return { selector, visible: isVisible };
}

export async function enabled(
  page: Page,
  selector: string,
): Promise<{ selector: string; enabled: boolean }> {
  const element = page.locator(selector);
  const isEnabled = await element.isEnabled();
  return { selector, enabled: isEnabled };
}

export async function checked(
  page: Page,
  selector: string,
): Promise<{ selector: string; checked: boolean }> {
  const element = page.locator(selector);
  const isChecked = await element.isChecked();
  return { selector, checked: isChecked };
}
