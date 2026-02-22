import type { Command } from "commander";
import { send } from "../client.js";

export function register(program: Command): void {
  const cmd = program.command("status").description("Show daemon status");
  cmd.option("--json", "output as JSON");
  cmd.action(async (opts: { json?: boolean }) => {
    const res = await send({ action: "status", tab: "default", args: {} });
    if (!res.ok) {
      process.stderr.write(`Error: ${res.error}\n`);
      process.exit(1);
    }
    if (opts.json) {
      process.stdout.write(JSON.stringify(res.data, null, 2) + "\n");
    } else {
      const d = res.data as any;
      process.stdout.write(`Daemon running (pid: ${d.pid}, uptime: ${Math.floor(d.uptime)}s, tabs: ${d.tabs.length})\n`);
    }
  });
}
