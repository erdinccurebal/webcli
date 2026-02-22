import { Command } from "commander";
import { setVerbose } from "./utils.js";
import { registerAll } from "./commands/index.js";

const program = new Command();

program
  .name("browsercli")
  .description("Headless browser CLI for Claude Code")
  .version("0.1.0")
  .option("--verbose", "enable verbose logging");

registerAll(program);

program.hook("preAction", (thisCommand) => {
  const opts = thisCommand.optsWithGlobals();
  if (opts.verbose) setVerbose(true);
});

program.parse();
