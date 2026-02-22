import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import { loadConfig } from "../src/config.js";

vi.mock("../src/utils.js", () => ({
  CONFIG_PATH: "/tmp/browsercli-test-config.json",
}));

describe("loadConfig", () => {
  beforeEach(() => {
    try { fs.unlinkSync("/tmp/browsercli-test-config.json"); } catch {}
  });

  afterEach(() => {
    try { fs.unlinkSync("/tmp/browsercli-test-config.json"); } catch {}
  });

  it("returns defaults when no config file exists", () => {
    const config = loadConfig();
    expect(config.waitAfterClick).toBe(500);
    expect(config.waitAfterPress).toBe(300);
    expect(config.idleTimeout).toBe(300000);
    expect(config.defaultTimeout).toBe(30000);
  });

  it("merges user config with defaults", () => {
    fs.writeFileSync("/tmp/browsercli-test-config.json", JSON.stringify({
      headless: false,
      waitAfterClick: 1000,
    }));
    const config = loadConfig();
    expect(config.headless).toBe(false);
    expect(config.waitAfterClick).toBe(1000);
    expect(config.waitAfterPress).toBe(300); // default preserved
  });

  it("handles malformed config gracefully", () => {
    fs.writeFileSync("/tmp/browsercli-test-config.json", "not json{{{");
    const config = loadConfig();
    expect(config.waitAfterClick).toBe(500); // falls back to defaults
  });
});
