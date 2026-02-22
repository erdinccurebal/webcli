import type { Command } from "commander";
import { send } from "../client.js";
import { globalOpts, output, type Opts } from "./shared.js";

export function register(program: Command): void {
  const cmd = program.command("forward").description("Go forward in history");
  globalOpts(cmd);
  cmd.action(async (opts: Opts) => {
    const res = await send({ action: "forward", tab: opts.tab, args: {}, timeout: parseInt(opts.timeout) });
    output(res, opts, (d) => `Forward -> ${d.url}`);
  });
}
