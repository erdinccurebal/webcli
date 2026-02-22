import type { Command } from "commander";
import { send } from "../client.js";
import { globalOpts, output, type Opts } from "./shared.js";

export function register(program: Command): void {
  const cmd = program.command("useragent <string>").description("Change user agent");
  globalOpts(cmd);
  cmd.action(async (ua: string, opts: Opts) => {
    const res = await send({ action: "useragent", tab: opts.tab, args: { userAgent: ua }, timeout: parseInt(opts.timeout) });
    output(res, opts, (d) => `User-Agent set to "${d.userAgent}"`);
  });
}
