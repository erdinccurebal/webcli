import type { Command } from "commander";
import type { Response } from "../protocol.js";

export interface Opts {
  tab: string;
  json?: boolean;
  timeout: string;
}

export function tabOpt(cmd: Command): Command {
  return cmd.option("-t, --tab <name>", "tab name", "default");
}

export function globalOpts(cmd: Command): Command {
  return tabOpt(cmd)
    .option("--json", "output as JSON")
    .option("--timeout <ms>", "timeout in ms", "30000");
}

export function output(
  res: Response,
  opts: Opts,
  formatter: (data: any) => string,
) {
  if (!res.ok) {
    const msg = res.error || "Unknown error";
    process.stderr.write(`Error: ${msg}\n`);

    if (msg.includes("not found")) {
      process.stderr.write(
        'Hint: Use "browsercli tabs" to see open tabs, or "browsercli go <url>" to open a page first.\n',
      );
    } else if (msg.includes("Timeout") || msg.includes("timeout")) {
      process.stderr.write(
        "Hint: Increase timeout with --timeout <ms>.\n",
      );
    } else if (msg.includes("waiting for selector")) {
      process.stderr.write(
        'Hint: Verify the selector. Use "browsercli source" to inspect the page.\n',
      );
    }

    process.exit(1);
  }
  if (opts.json) {
    process.stdout.write(JSON.stringify(res.data, null, 2) + "\n");
  } else {
    process.stdout.write(formatter(res.data) + "\n");
  }
}
