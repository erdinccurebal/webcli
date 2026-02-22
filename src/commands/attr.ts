import type { Command } from "commander";
import { send } from "../client.js";
import { globalOpts, output, type Opts } from "./shared.js";

export function register(program: Command): void {
  const cmd = program.command("attr <selector> <attribute>").description("Get element attribute value");
  globalOpts(cmd);
  cmd.action(async (selector: string, attribute: string, opts: Opts) => {
    const res = await send({ action: "attr", tab: opts.tab, args: { selector, attribute }, timeout: parseInt(opts.timeout) });
    output(res, opts, (d) => d.value ?? "(null)");
  });
}
