import type { Command } from "commander";
import { send } from "../client.js";
import { globalOpts, output, type Opts } from "./shared.js";

export function register(program: Command): void {
  const cmd = program.command("frame <selector>").description("Switch to iframe (or 'main' to return)");
  globalOpts(cmd);
  cmd.action(async (selector: string, opts: Opts) => {
    const action = selector === "main" ? "frame-main" : "frame";
    const res = await send({ action, tab: opts.tab, args: { selector }, timeout: parseInt(opts.timeout) });
    output(res, opts, (d) => `Switched to frame: ${d.frame}`);
  });
}
