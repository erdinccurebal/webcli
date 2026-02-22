import type { Command } from "commander";
import { send } from "../client.js";
import { globalOpts, output, type Opts } from "./shared.js";

export function register(program: Command): void {
  const cmd = program.command("waitfor <text>").description("Wait for text to appear on page");
  globalOpts(cmd);
  cmd.action(async (text: string, opts: Opts) => {
    const res = await send({ action: "waitfor", tab: opts.tab, args: { text, waitTimeout: parseInt(opts.timeout) }, timeout: parseInt(opts.timeout) + 5000 });
    output(res, opts, (d) => `Found text "${d.text}"`);
  });
}
