import type { Command } from "commander";
import { send } from "../client.js";
import { globalOpts, output, type Opts } from "./shared.js";

export function register(program: Command): void {
  const cmd = program.command("device <name>").description("Emulate a device (e.g. 'iPhone 14', 'iPad Pro 11')");
  globalOpts(cmd);
  cmd.action(async (name: string, opts: Opts) => {
    const res = await send({ action: "device", tab: opts.tab, args: { device: name }, timeout: parseInt(opts.timeout) });
    output(res, opts, (d) => `Device: ${d.device} (${d.viewport.width}x${d.viewport.height})`);
  });
}
