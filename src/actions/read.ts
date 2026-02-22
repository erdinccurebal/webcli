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
