import type { Command } from "commander";
import { send } from "../client.js";
import { globalOpts, output, type Opts } from "./shared.js";

export function register(program: Command): void {
  const cmd = program.command("forms").description("List forms and inputs");
  globalOpts(cmd);
  cmd.action(async (opts: Opts) => {
    const res = await send({ action: "forms", tab: opts.tab, args: {}, timeout: parseInt(opts.timeout) });
    output(res, opts, (d) => {
      if (!d.forms.length) return `[Forms on ${d.url}]\n(no forms found)`;
      const parts = d.forms.map((f: any, i: number) => {
        const fields = f.fields.map((fld: any) =>
          `  - <${fld.tag}> name=${fld.name || "?"} type=${fld.type || "?"} placeholder="${fld.placeholder || ""}"`
        ).join("\n");
        return `Form ${i + 1}: action=${f.action} method=${f.method}\n${fields}`;
      });
      return `[Forms on ${d.url}]\n${parts.join("\n\n")}`;
    });
  });
}
