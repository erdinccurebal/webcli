import type { Command } from "commander";
import { send } from "../client.js";
import { globalOpts, output, type Opts } from "./shared.js";

export function register(program: Command): void {
  const cmd = program.command("go <url>").description("Navigate to URL");
  globalOpts(cmd);
  cmd.option("-w, --wait <strategy>", "wait strategy: domcontentloaded|networkidle|load", "domcontentloaded");
  cmd.addHelpText("after", "\nExamples:\n  browsercli go https://example.com\n  browsercli go https://example.com -w networkidle -t mytab");
  cmd.action(async (url: string, opts: Opts & { wait: string }) => {
    const res = await send({ action: "go", tab: opts.tab, args: { url, waitUntil: opts.wait }, timeout: parseInt(opts.timeout) });
    output(res, opts, (d) => `Navigated to ${d.url} (tab: ${opts.tab})`);
  });
}
