import type { Command } from "commander";
import { send } from "../client.js";
import { globalOpts, output, type Opts } from "./shared.js";

export function register(program: Command): void {
  const cmd = program.command("click <text>").description("Click element by visible text");
  globalOpts(cmd);
  cmd.action(async (text: string, opts: Opts) => {
    const res = await send({ action: "click", tab: opts.tab, args: { text }, timeout: parseInt(opts.timeout) });
    output(res, opts, (d) => `Clicked "${d.clicked}" -> ${d.url}`);
  });
}
