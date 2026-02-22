import type { Command } from "commander";
import { send } from "../client.js";

export function register(program: Command): void {
  const cmd = program.command("tabs").description("List open tabs");
  cmd.option("--json", "output as JSON");
  cmd.action(async (opts: { json?: boolean }) => {
    const res = await send({ action: "tabs", tab: "default", args: {} });
    if (!res.ok) {
      process.stderr.write(`Error: ${res.error}\n`);
      process.exit(1);
    }
    if (opts.json) {
      process.stdout.write(JSON.stringify(res.data, null, 2) + "\n");
    } else {
      const tabs = res.data as Array<{ name: string; url: string }>;
      if (!tabs.length) {
        process.stdout.write("(no open tabs)\n");
      } else {
        for (const t of tabs) {
          process.stdout.write(`${t.name}: ${t.url}\n`);
        }
      }
    }
  });
}
