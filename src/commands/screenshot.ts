import path from "node:path";
import type { Command } from "commander";
import { send } from "../client.js";
import { globalOpts, output, type Opts } from "./shared.js";

export function register(program: Command): void {
  const cmd = program.command("screenshot").description("Take a full-page screenshot");
  globalOpts(cmd);
  cmd.option("-o, --output <file>", "output file path");
  cmd.action(async (opts: Opts & { output?: string }) => {
    // Resolve path client-side so daemon gets absolute path
    const outputPath = opts.output
      ? path.resolve(opts.output)
      : path.resolve(`screenshot-${Date.now()}.png`);
    const res = await send({ action: "screenshot", tab: opts.tab, args: { output: outputPath }, timeout: parseInt(opts.timeout) });
    output(res, opts, (d) => `Screenshot saved: ${d.path}`);
  });
}
