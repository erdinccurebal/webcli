import type { Command } from "commander";
import { send } from "../client.js";
import { globalOpts, output, type Opts } from "./shared.js";

export function register(program: Command): void {
  const cmd = program.command("clicksel <selector>").description("Click element by CSS selector");
  globalOpts(cmd);
  cmd.action(async (selector: string, opts: Opts) => {
    const res = await send({ action: "clicksel", tab: opts.tab, args: { selector }, timeout: parseInt(opts.timeout) });
    output(res, opts, (d) => `Clicked "${d.selector}" -> ${d.url}`);
  });
}
