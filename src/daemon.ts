import net from "node:net";
import fs from "node:fs";
import { chromium, firefox, webkit, type Browser } from "playwright";
import { TabManager } from "./tab-manager.js";
import { encodeMessage, decodeMessage, type Request } from "./protocol.js";
import { loadConfig } from "./config.js";
import { WEBCLI_DIR, SOCKET_PATH, PID_PATH } from "./utils.js";
import { dispatch, type HandlerContext } from "./handler-registry.js";
import { registerAllHandlers } from "./handlers/index.js";

let browser: Browser;
let tabManager: TabManager;
let idleTimer: ReturnType<typeof setTimeout>;
let idleTimeoutMs: number;

function resetIdleTimer() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(shutdown, idleTimeoutMs);
}

async function shutdown() {
  console.error("[daemon] shutting down...");
  try {
    await tabManager?.closeAll();
    await browser?.close();
  } catch {}
  cleanup();
  process.exit(0);
}

function cleanup() {
  try { fs.unlinkSync(SOCKET_PATH); } catch {}
  try { fs.unlinkSync(PID_PATH); } catch {}
}

async function main() {
  fs.mkdirSync(WEBCLI_DIR, { recursive: true });

  if (fs.existsSync(SOCKET_PATH)) {
    try { fs.unlinkSync(SOCKET_PATH); } catch {}
  }

  const config = loadConfig();
  idleTimeoutMs = config.idleTimeout ?? 300000;
  const headless = config.headless !== false;
  const browsers = { chromium, firefox, webkit } as const;
  const browserType = browsers[config.browser || "chromium"];

  const launchArgs = [
    "--disable-blink-features=AutomationControlled",
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-infobars",
    "--window-size=1280,800",
  ];

  if (config.userDataDir) {
    const dir = config.userDataDir.replace(/^~/, process.env.HOME || "~");
    fs.mkdirSync(dir, { recursive: true });
    const context = await browserType.launchPersistentContext(dir, {
      headless,
      args: launchArgs,
      viewport: config.viewport || { width: 1280, height: 800 },
      locale: config.locale || "en-US",
      timezoneId: config.timezoneId || "America/New_York",
      bypassCSP: true,
    });
    await context.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => false });
    });
    browser = context.browser()!;
    tabManager = new TabManager(context);
  } else {
    browser = await browserType.launch({ headless, args: launchArgs });
    tabManager = new TabManager();
  }

  registerAllHandlers();
  const ctx: HandlerContext = { browser, tabManager, config, shutdown };

  fs.writeFileSync(PID_PATH, String(process.pid));

  const server = net.createServer((conn) => {
    let buffer = "";
    conn.on("data", async (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.trim()) continue;
        resetIdleTimer();
        const req = decodeMessage<Request>(line);
        const res = await dispatch(ctx, req);
        conn.write(encodeMessage(res));
      }
    });
  });

  server.listen(SOCKET_PATH, () => {
    fs.chmodSync(SOCKET_PATH, 0o600);
    console.error(`[daemon] listening on ${SOCKET_PATH} (pid: ${process.pid})`);
  });

  resetIdleTimer();

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
  process.on("exit", cleanup);
}

main().catch((err) => {
  console.error("[daemon] fatal:", err);
  cleanup();
  process.exit(1);
});
