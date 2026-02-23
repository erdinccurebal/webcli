import type { Command } from "commander";
import { send } from "../client.js";
import { globalOpts, output, type Opts } from "./shared.js";

export function register(program: Command): void {
  const cmd = program.command("title").description("Get the page title");
  globalOpts(cmd);
  cmd.action(async (opts: Opts) => {
    const res = await send({ action: "title", tab: opts.tab, args: {}, timeout: parseInt(opts.timeout) });
    output(res, opts, (d) => d.title);
  });
}
