import type { Command } from "commander";
import { send } from "../client.js";
import { globalOpts, output, type Opts } from "./shared.js";

export function register(program: Command): void {
  const cmd = program.command("errors").description("Show page errors");
  globalOpts(cmd);
  cmd.action(async (opts: Opts) => {
    const res = await send({ action: "errors", tab: opts.tab, args: {}, timeout: parseInt(opts.timeout) });
    output(res, opts, (d) => {
      const errors = d.errors as string[];
      if (errors.length === 0) return "(no errors)";
      return errors.join("\n");
    });
  });
}
