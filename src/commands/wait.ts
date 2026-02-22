import type { Command } from "commander";
import { send } from "../client.js";
import { globalOpts, output, type Opts } from "./shared.js";

export function register(program: Command): void {
  const cmd = program.command("wait <selector>").description("Wait for CSS selector to be visible");
  globalOpts(cmd);
  cmd.action(async (selector: string, opts: Opts) => {
    const res = await send({ action: "wait", tab: opts.tab, args: { selector, waitTimeout: parseInt(opts.timeout) }, timeout: parseInt(opts.timeout) + 5000 });
    output(res, opts, (d) => `Found "${d.selector}"`);
  });
}
