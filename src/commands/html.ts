import type { Command } from "commander";
import { send } from "../client.js";
import { globalOpts, output, type Opts } from "./shared.js";

export function register(program: Command): void {
  const cmd = program.command("html <selector>").description("Get innerHTML of element");
  globalOpts(cmd);
  cmd.action(async (selector: string, opts: Opts) => {
    const res = await send({ action: "html", tab: opts.tab, args: { selector }, timeout: parseInt(opts.timeout) });
    output(res, opts, (d) => d.html);
  });
}
