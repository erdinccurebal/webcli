import type { Command } from "commander";
import { send } from "../client.js";
import { globalOpts, output, type Opts } from "./shared.js";

export function register(program: Command): void {
  const cmd = program.command("press <key>").description("Press keyboard key (Enter, Tab, Escape, etc.)");
  globalOpts(cmd);
  cmd.action(async (key: string, opts: Opts) => {
    const res = await send({ action: "press", tab: opts.tab, args: { key }, timeout: parseInt(opts.timeout) });
    output(res, opts, (d) => `Pressed "${d.key}" -> ${d.url}`);
  });
}
