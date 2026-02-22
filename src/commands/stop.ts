import type { Command } from "commander";
import { send } from "../client.js";

export function register(program: Command): void {
  const cmd = program.command("stop").description("Stop the daemon");
  cmd.action(async () => {
    const res = await send({ action: "stop", tab: "default", args: {} });
    if (res.ok) {
      process.stdout.write("Daemon stopped\n");
    } else {
      process.stderr.write(`Error: ${res.error}\n`);
      process.exit(1);
    }
  });
}
