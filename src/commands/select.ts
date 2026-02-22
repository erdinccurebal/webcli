import type { Command } from "commander";
import { send } from "../client.js";
import { globalOpts, output, type Opts } from "./shared.js";

export function register(program: Command): void {
  const cmd = program.command("select <selector> <value>").description("Select dropdown option");
  globalOpts(cmd);
  cmd.action(async (selector: string, value: string, opts: Opts) => {
    const res = await send({ action: "select", tab: opts.tab, args: { selector, value }, timeout: parseInt(opts.timeout) });
    output(res, opts, (d) => `Selected "${d.value}" in "${d.selector}"`);
  });
}
