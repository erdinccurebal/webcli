import type { Command } from "commander";
import { send } from "../client.js";
import { globalOpts, output, type Opts } from "./shared.js";

export function register(program: Command): void {
  const cmd = program.command("snapshot").description("Get accessibility tree snapshot with element refs");
  globalOpts(cmd);
  cmd.option("--all", "include non-interactive elements");
  cmd.option("--max-depth <n>", "max tree depth");
  cmd.action(async (opts: Opts & { all?: boolean; maxDepth?: string }) => {
    const args: Record<string, unknown> = {};
    if (opts.all) args.interactiveOnly = false;
    if (opts.maxDepth) args.maxDepth = parseInt(opts.maxDepth, 10);
    const res = await send({ action: "snapshot", tab: opts.tab, args, timeout: parseInt(opts.timeout) });
    output(res, opts, (d) => `${d.tree}\n\n(${d.refCount} interactive refs)`);
  });
}
