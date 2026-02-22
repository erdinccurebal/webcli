import type { Command } from "commander";
import { send } from "../client.js";
import { globalOpts, output, type Opts } from "./shared.js";

export function register(program: Command): void {
  const cmd = program.command("quit").description("Close a tab");
  globalOpts(cmd);
  cmd.action(async (opts: Opts) => {
    const res = await send({ action: "quit", tab: opts.tab, args: {}, timeout: parseInt(opts.timeout) });
    output(res, opts, (d) => `Tab "${d.tab}" closed`);
  });
}
