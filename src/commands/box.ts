import type { Command } from "commander";
import { send } from "../client.js";
import { globalOpts, output, type Opts } from "./shared.js";

export function register(program: Command): void {
  const cmd = program.command("box <selector>").description("Get element bounding box (x, y, width, height)");
  globalOpts(cmd);
  cmd.action(async (selector: string, opts: Opts) => {
    const res = await send({ action: "box", tab: opts.tab, args: { selector }, timeout: parseInt(opts.timeout) });
    output(res, opts, (d) => {
      if (!d.box) return "Element has no bounding box (not visible)";
      return `x=${d.box.x} y=${d.box.y} w=${d.box.width} h=${d.box.height}`;
    });
  });
}
