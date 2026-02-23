import path from "node:path";
import type { Command } from "commander";
import { send } from "../client.js";
import { globalOpts, output, type Opts } from "./shared.js";

export function register(program: Command): void {
  const cmd = program.command("pdf").description("Save page as PDF");
  globalOpts(cmd);
  cmd.option("-o, --output <file>", "output file path");
  cmd.action(async (opts: Opts & { output?: string }) => {
    const outputPath = opts.output
      ? path.resolve(opts.output)
      : path.resolve(`page-${Date.now()}.pdf`);
    const res = await send({ action: "pdf", tab: opts.tab, args: { output: outputPath }, timeout: parseInt(opts.timeout) });
    output(res, opts, (d) => `PDF saved: ${d.path}`);
  });
}
