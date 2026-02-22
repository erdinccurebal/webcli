import type { Command } from "commander";

export function register(program: Command): void {
  const cmd = program.command("sleep <ms>").description("Sleep for specified milliseconds");
  cmd.action(async (ms: string) => {
    const duration = parseInt(ms, 10);
    if (isNaN(duration) || duration < 0) {
      process.stderr.write("Error: duration must be a non-negative number\n");
      process.exit(1);
    }
    await new Promise((resolve) => setTimeout(resolve, duration));
    process.stdout.write(`Slept ${duration}ms\n`);
  });
}
