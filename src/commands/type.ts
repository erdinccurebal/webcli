import type { Command } from "commander";
import { send } from "../client.js";
import { globalOpts, output, type Opts } from "./shared.js";

export function register(program: Command): void {
  const cmd = program.command("type <text>").description("Type text with keyboard");
  globalOpts(cmd);
  cmd.action(async (text: string, opts: Opts) => {
    const res = await send({ action: "type", tab: opts.tab, args: { text }, timeout: parseInt(opts.timeout) });
    output(res, opts, (d) => `Typed "${d.typed}"`);
  });
}
