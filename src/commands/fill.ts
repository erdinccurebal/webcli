import type { Command } from "commander";
import { send } from "../client.js";
import { globalOpts, output, type Opts } from "./shared.js";

export function register(program: Command): void {
  const cmd = program.command("fill <selector> <value>").description("Fill input by selector");
  globalOpts(cmd);
  cmd.action(async (selector: string, value: string, opts: Opts) => {
    const res = await send({ action: "fill", tab: opts.tab, args: { selector, value }, timeout: parseInt(opts.timeout) });
    output(res, opts, (d) => `Filled "${d.selector}" with "${d.value}"`);
  });
}
