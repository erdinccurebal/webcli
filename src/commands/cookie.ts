import fs from "node:fs";
import path from "node:path";
import type { Command } from "commander";
import { send } from "../client.js";
import { globalOpts, output, type Opts } from "./shared.js";

export function register(program: Command): void {
  const cookie = program.command("cookie").description("Cookie management");

  // cookie export
  const exp = cookie.command("export").description("Export cookies as JSON");
  globalOpts(exp);
  exp.option("-o, --output <file>", "write to file instead of stdout");
  exp.action(async (opts: Opts & { output?: string }) => {
    const res = await send({ action: "cookie-export", tab: opts.tab, args: {}, timeout: parseInt(opts.timeout) });
    if (!res.ok) {
      process.stderr.write(`Error: ${res.error}\n`);
      process.exit(1);
    }
    const data = res.data as any;
    const json = JSON.stringify(data.cookies, null, 2);
    if (opts.output) {
      fs.writeFileSync(path.resolve(opts.output), json);
      process.stdout.write(`Cookies exported to ${opts.output} (${data.cookies.length} cookies)\n`);
    } else {
      process.stdout.write(json + "\n");
    }
  });

  // cookie import
  const imp = cookie.command("import <file>").description("Import cookies from JSON file");
  globalOpts(imp);
  imp.action(async (file: string, opts: Opts) => {
    const filePath = path.resolve(file);
    if (!fs.existsSync(filePath)) {
      process.stderr.write(`Error: File not found: ${filePath}\n`);
      process.exit(1);
    }
    const cookies = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const res = await send({ action: "cookie-import", tab: opts.tab, args: { cookies }, timeout: parseInt(opts.timeout) });
    output(res, opts, (d) => `Imported ${d.imported} cookies`);
  });
}
