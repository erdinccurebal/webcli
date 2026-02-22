import path from "node:path";

export const WEBCLI_DIR = path.join(process.env.HOME || "~", ".browsercli");
export const SOCKET_PATH = path.join(WEBCLI_DIR, "daemon.sock");
export const PID_PATH = path.join(WEBCLI_DIR, "daemon.pid");
export const CONFIG_PATH = path.join(WEBCLI_DIR, "config.json");

let verbose = false;
export function setVerbose(v: boolean) {
  verbose = v;
}
export function log(...args: unknown[]) {
  if (verbose) process.stderr.write(`[browsercli] ${args.join(" ")}\n`);
}
