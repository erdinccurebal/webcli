import net from "node:net";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { encodeMessage, decodeMessage, type Request, type Response } from "./protocol.js";
import { SOCKET_PATH, PID_PATH, log } from "./utils.js";

function isDaemonRunning(): boolean {
  if (!fs.existsSync(PID_PATH)) return false;
  const pid = parseInt(fs.readFileSync(PID_PATH, "utf-8").trim(), 10);
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function cleanupStale(): void {
  log("Cleaning stale socket/pid files");
  try { fs.unlinkSync(SOCKET_PATH); } catch {}
  try { fs.unlinkSync(PID_PATH); } catch {}
}

function startDaemon(): void {
  const daemonPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "daemon.js",
  );
  log("Starting daemon:", daemonPath);
  const child = spawn(process.execPath, [daemonPath], {
    detached: true,
    stdio: "ignore",
    env: { ...process.env },
  });
  child.unref();
}

async function waitForSocket(timeoutMs = 10_000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (fs.existsSync(SOCKET_PATH)) {
      try {
        await new Promise<void>((resolve, reject) => {
          const conn = net.createConnection(SOCKET_PATH);
          conn.on("connect", () => { conn.destroy(); resolve(); });
          conn.on("error", reject);
        });
        return;
      } catch {}
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error("Timeout waiting for daemon to start");
}

function connectAndSend(req: Request): Promise<Response> {
  return new Promise<Response>((resolve, reject) => {
    const conn = net.createConnection(SOCKET_PATH);
    let buffer = "";
    const timeout = setTimeout(() => {
      conn.destroy();
      reject(new Error("Request timeout"));
    }, req.timeout || 30_000);

    conn.on("connect", () => {
      log(`>> ${req.action} tab=${req.tab}`);
      conn.write(encodeMessage(req));
    });

    conn.on("data", (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (!line.trim()) continue;
        clearTimeout(timeout);
        const res = decodeMessage<Response>(line);
        log(`<< ok=${res.ok}`);
        conn.destroy();
        resolve(res);
        return;
      }
    });

    conn.on("error", (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

export async function send(req: Request): Promise<Response> {
  if (!isDaemonRunning()) {
    cleanupStale();
    startDaemon();
    await waitForSocket();
  }

  try {
    return await connectAndSend(req);
  } catch (err) {
    // Stale socket recovery
    if ((err as NodeJS.ErrnoException).code === "ECONNREFUSED") {
      log("Connection refused, restarting daemon");
      cleanupStale();
      startDaemon();
      await waitForSocket();
      return await connectAndSend(req);
    }
    throw err;
  }
}
