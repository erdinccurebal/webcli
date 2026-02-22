import type { Command } from "commander";
import { send } from "../client.js";
import { globalOpts, output, type Opts } from "./shared.js";

export function register(program: Command): void {
  const cmd = program.command("network [mode]").description("Toggle request/response logging (on|off) or show logs");
  globalOpts(cmd);
  cmd.action(async (mode: string | undefined, opts: Opts) => {
    const res = await send({ action: "network", tab: opts.tab, args: { mode: mode || "status" }, timeout: parseInt(opts.timeout) });
    output(res, opts, (d) => {
      if (d.enabled === true) return "Network logging enabled";
      if (d.enabled === false) return "Network logging disabled";
      if (d.logs) {
        if (!d.logs.length) return "(no network logs)";
        return d.logs.join("\n");
      }
      return JSON.stringify(d);
    });
  });
}
