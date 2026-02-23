import type { Command } from "commander";
import { send } from "../client.js";
import { globalOpts, output, type Opts } from "./shared.js";

export function register(program: Command): void {
  const cmd = program.command("styles <selector> [props...]").description("Get computed CSS styles of an element");
  globalOpts(cmd);
  cmd.action(async (selector: string, props: string[], opts: Opts) => {
    const res = await send({ action: "styles", tab: opts.tab, args: { selector, props }, timeout: parseInt(opts.timeout) });
    output(res, opts, (d) => {
      return Object.entries(d.styles as Record<string, string>)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n");
    });
  });
}
