import type { Page, ElementHandle } from "playwright";
import { setRefs } from "../ref-store.js";

interface SnapshotNode {
  role: string;
  name: string;
  ref?: string;
  children?: SnapshotNode[];
}

interface SnapshotResult {
  tree: string;
  refCount: number;
}

const INTERACTIVE_ROLES = new Set([
  "button", "link", "textbox", "checkbox", "radio",
  "combobox", "menuitem", "tab", "switch", "slider",
  "spinbutton", "searchbox", "option", "menuitemcheckbox",
  "menuitemradio", "treeitem",
]);

function isInteractive(role: string): boolean {
  return INTERACTIVE_ROLES.has(role);
}

interface AXNode {
  role: string;
  name: string;
  value?: string;
  description?: string;
  checked?: boolean | "mixed";
  disabled?: boolean;
  expanded?: boolean;
  focused?: boolean;
  selected?: boolean;
  children?: AXNode[];
}

function buildTree(
  node: AXNode,
  counter: { n: number },
  refMap: Map<string, string>,
  interactiveOnly: boolean,
  maxDepth: number,
  depth = 0,
): SnapshotNode | null {
  if (maxDepth > 0 && depth > maxDepth) return null;

  const role = node.role || "none";
  if (role === "none" || role === "presentation" || role === "generic") {
    // Still process children
    const children: SnapshotNode[] = [];
    if (node.children) {
      for (const child of node.children) {
        const c = buildTree(child, counter, refMap, interactiveOnly, maxDepth, depth + 1);
        if (c) children.push(c);
      }
    }
    if (children.length === 1) return children[0];
    if (children.length > 1) return { role: "group", name: "", children };
    if (!interactiveOnly && node.name) return { role, name: node.name };
    return null;
  }

  const result: SnapshotNode = { role, name: node.name || "" };

  if (isInteractive(role)) {
    const ref = `@e${++counter.n}`;
    result.ref = ref;
    refMap.set(ref, `[role="${role}"][name="${node.name || ""}"]`);
  }

  if (node.value !== undefined) result.name = `${result.name} [value: ${node.value}]`;
  if (node.checked === true) result.name += " [checked]";
  if (node.checked === "mixed") result.name += " [mixed]";
  if (node.disabled) result.name += " [disabled]";

  if (node.children) {
    const children: SnapshotNode[] = [];
    for (const child of node.children) {
      const c = buildTree(child, counter, refMap, interactiveOnly, maxDepth, depth + 1);
      if (c) children.push(c);
    }
    if (children.length > 0) result.children = children;
  }

  if (interactiveOnly && !result.ref && !result.children) {
    // Skip non-interactive leaf nodes
    if (role !== "heading" && role !== "img" && role !== "text" && role !== "StaticText") {
      return null;
    }
  }

  return result;
}

function formatTree(node: SnapshotNode, indent = 0): string {
  const pad = "  ".repeat(indent);
  const ref = node.ref ? ` ${node.ref}` : "";
  const name = node.name ? ` "${node.name}"` : "";
  let line = `${pad}[${node.role}${ref}]${name}`;

  if (node.children) {
    const childLines = node.children.map((c) => formatTree(c, indent + 1));
    line += "\n" + childLines.join("\n");
  }

  return line;
}

export async function snapshot(
  page: Page,
  options?: { interactiveOnly?: boolean; maxDepth?: number },
): Promise<SnapshotResult> {
  const interactiveOnly = options?.interactiveOnly ?? true;
  const maxDepth = options?.maxDepth ?? 0;

  const axTree = await page.accessibility.snapshot() as AXNode | null;
  if (!axTree) return { tree: "(empty page)", refCount: 0 };

  const counter = { n: 0 };
  const refMap = new Map<string, string>();

  const tree = buildTree(axTree, counter, refMap, interactiveOnly, maxDepth);
  const treeStr = tree ? formatTree(tree) : "(empty)";

  // Resolve refs to element handles
  const handleMap = new Map<string, ElementHandle>();
  for (const [ref, selector] of refMap) {
    try {
      const el = await page.$(selector);
      if (el) handleMap.set(ref, el);
    } catch {
      // Some selectors may not match exactly, try by role + name via locator
      try {
        const role = selector.match(/role="([^"]+)"/)?.[1];
        const name = selector.match(/name="([^"]+)"/)?.[1];
        if (role) {
          const loc = page.getByRole(role as any, name ? { name } : undefined);
          const el = await loc.first().elementHandle();
          if (el) handleMap.set(ref, el);
        }
      } catch {
        // ref won't resolve — that's fine
      }
    }
  }

  setRefs(page, handleMap);

  return { tree: treeStr, refCount: counter.n };
}
