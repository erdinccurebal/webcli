import type { Command } from "commander";
import { send } from "../client.js";
import { globalOpts, output, type Opts } from "./shared.js";

export function register(program: Command): void {
  const cmd = program.command("storage <action> [key] [value]").description("localStorage operations (get/set/clear)");
  globalOpts(cmd);
  cmd.action(async (action: string, key: string | undefined, value: string | undefined, opts: Opts) => {
    const args: Record<string, unknown> = { action };
    if (key) args.key = key;
    if (value) args.value = value;
    const res = await send({ action: "storage", tab: opts.tab, args, timeout: parseInt(opts.timeout) });
    output(res, opts, (d) => {
      if (d.cleared) return "localStorage cleared";
      if (d.key !== undefined) return `${d.key} = ${d.value}`;
      const storage = d.storage;
      if (typeof storage === "string" || storage === null) return String(storage);
      return Object.entries(storage as Record<string, string>)
        .map(([k, v]) => `${k} = ${v}`)
        .join("\n") || "(empty)";
    });
  });
}
