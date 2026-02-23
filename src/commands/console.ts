import type { Command } from "commander";
import { send } from "../client.js";
import { globalOpts, output, type Opts } from "./shared.js";

export function register(program: Command): void {
  const cmd = program.command("console [mode]").description("Console logging (on/off/show)");
  globalOpts(cmd);
  cmd.action(async (mode: string | undefined, opts: Opts) => {
    const res = await send({ action: "console", tab: opts.tab, args: { mode: mode || "show" }, timeout: parseInt(opts.timeout) });
    output(res, opts, (d) => {
      if (d.enabled !== undefined) return `Console logging: ${d.enabled ? "on" : "off"}`;
      const logs = d.logs as Array<{ type: string; text: string }>;
      if (logs.length === 0) return "(no console messages)";
      return logs.map((l) => `[${l.type}] ${l.text}`).join("\n");
    });
  });
}
