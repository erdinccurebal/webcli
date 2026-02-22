import type { Command } from "commander";
import { send } from "../client.js";
import { globalOpts, output, type Opts } from "./shared.js";

export function register(program: Command): void {
  const cmd = program.command("eval <js>").description("Execute JavaScript on page");
  globalOpts(cmd);
  cmd.action(async (js: string, opts: Opts) => {
    const res = await send({ action: "eval", tab: opts.tab, args: { js }, timeout: parseInt(opts.timeout) });
    output(res, opts, (d) => {
      const val = d.result;
      return typeof val === "object" ? JSON.stringify(val, null, 2) : String(val);
    });
  });
}
