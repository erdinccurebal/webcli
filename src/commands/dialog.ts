import type { Command } from "commander";
import { send } from "../client.js";
import { globalOpts, output, type Opts } from "./shared.js";

export function register(program: Command): void {
  const cmd = program.command("dialog <action> [text]").description("Handle browser dialogs (accept/dismiss)");
  globalOpts(cmd);
  cmd.action(async (action: string, text: string | undefined, opts: Opts) => {
    const args: Record<string, unknown> = { action };
    if (text) args.promptText = text;
    const res = await send({ action: "dialog", tab: opts.tab, args, timeout: parseInt(opts.timeout) });
    output(res, opts, (d) => `Dialog ${d.action}: "${d.message}"`);
  });
}
