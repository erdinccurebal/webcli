import path from "node:path";
import type { Command } from "commander";
import { send } from "../client.js";
import { globalOpts, output, type Opts } from "./shared.js";

export function register(program: Command): void {
  const cmd = program.command("screenshot").description("Take a screenshot");
  globalOpts(cmd);
  cmd.option("-o, --output <file>", "output file path");
  cmd.option("--full", "full-page screenshot (default)");
  cmd.option("--no-full", "viewport-only screenshot");
  cmd.option("--annotate", "annotate interactive elements with numbers");
  cmd.action(async (opts: Opts & { output?: string; full?: boolean; annotate?: boolean }) => {
    const outputPath = opts.output
      ? path.resolve(opts.output)
      : undefined;

    if (opts.annotate) {
      const res = await send({
        action: "screenshot-annotated",
        tab: opts.tab,
        args: { output: outputPath },
        timeout: parseInt(opts.timeout),
      });
      output(res, opts, (d) => `Annotated screenshot saved: ${d.path} (${d.annotations} elements)`);
    } else {
      const finalOutput = outputPath || path.resolve(`screenshot-${Date.now()}.png`);
      const res = await send({
        action: "screenshot",
        tab: opts.tab,
        args: { output: finalOutput, fullPage: opts.full !== false },
        timeout: parseInt(opts.timeout),
      });
      output(res, opts, (d) => `Screenshot saved: ${d.path}`);
    }
  });
}
