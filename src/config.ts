import fs from "node:fs";
import { CONFIG_PATH } from "./utils.js";

export interface Config {
  headless?: boolean;
  userDataDir?: string;
  browser?: "chromium" | "firefox" | "webkit";
  viewport?: { width: number; height: number };
  locale?: string;
  timezoneId?: string;
  waitAfterClick?: number;
  waitAfterPress?: number;
  idleTimeout?: number;
  defaultTimeout?: number;
}

const DEFAULTS = {
  waitAfterClick: 500,
  waitAfterPress: 300,
  idleTimeout: 300000,
  defaultTimeout: 30000,
};

export function loadConfig(): Config {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
      return { ...DEFAULTS, ...raw };
    }
  } catch {}
  return { ...DEFAULTS };
}
