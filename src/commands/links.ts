import type { Command } from "commander";
import { send } from "../client.js";
import { globalOpts, output, type Opts } from "./shared.js";

export function register(program: Command): void {
  const cmd = program.command("links").description("List all links on page");
  globalOpts(cmd);
  cmd.action(async (opts: Opts) => {
    const res = await send({ action: "links", tab: opts.tab, args: {}, timeout: parseInt(opts.timeout) });
    output(res, opts, (d) => {
      if (!d.links.length) return `[Links on ${d.url}]\n(no links found)`;
      const lines = d.links.map((l: any, i: number) => `${i + 1}. "${l.text}" -> ${l.href}`);
      return `[Links on ${d.url}]\n${lines.join("\n")}`;
    });
  });
}
