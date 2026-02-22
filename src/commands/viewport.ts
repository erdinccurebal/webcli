import type { Command } from "commander";
import { send } from "../client.js";
import { globalOpts, output, type Opts } from "./shared.js";

export function register(program: Command): void {
  const cmd = program.command("viewport <width> <height>").description("Change viewport size");
  globalOpts(cmd);
  cmd.action(async (width: string, height: string, opts: Opts) => {
    const w = parseInt(width, 10);
    const h = parseInt(height, 10);
    if (isNaN(w) || isNaN(h)) {
      process.stderr.write("Error: width and height must be numbers\n");
      process.exit(1);
    }
    const res = await send({ action: "viewport", tab: opts.tab, args: { width: w, height: h }, timeout: parseInt(opts.timeout) });
    output(res, opts, (d) => `Viewport set to ${d.width}x${d.height}`);
  });
}
