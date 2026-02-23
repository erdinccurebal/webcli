# Contributing to webcli

## Prerequisites

- Node.js 22+
- npm

## Development Setup

```bash
git clone https://github.com/erdinccurebal/webcli.git
cd webcli
npm install
npx playwright install chromium
npm run build
```

## Development Workflow

```bash
npm run dev          # Watch mode (auto-rebuild on changes)
npm run build        # Production build
npm run lint         # Run ESLint
npm run test         # Run tests
```

## Project Structure

```
src/
├── cli.ts                  # CLI entry point (registers all commands)
├── daemon.ts               # Background daemon (browser + socket server)
├── client.ts               # Socket client (auto-starts daemon)
├── protocol.ts             # IPC message types
├── tab-manager.ts          # Tab (Page) management
├── utils.ts                # Shared constants and logging
├── config.ts               # Configuration loading
├── validate.ts             # Input validation helpers
├── handler-registry.ts     # Action handler dispatch
├── ref-store.ts            # Snapshot ref (@e1) -> ElementHandle mapping
├── commands/               # CLI command definitions (one per file)
│   ├── shared.ts           # Shared CLI helpers (globalOpts, output)
│   ├── index.ts            # Registers all commands
│   └── *.ts                # Individual command files
├── handlers/
│   └── index.ts            # All daemon action handlers
└── actions/                # Playwright action implementations
    ├── navigate.ts         # go, back, forward, reload
    ├── read.ts             # source, links, forms, eval, html, attr, title, url, value, count, box, styles, visible, enabled, checked
    ├── interact.ts         # click, clicksel, dblclick, hover, focus, type, fill, select, press, check, uncheck, drag, upload, scroll
    ├── snapshot.ts         # accessibility tree snapshot with ref assignment
    ├── wait.ts             # waitForSelector, waitForText
    ├── screenshot.ts       # screenshot capture (full, viewport, annotated)
    ├── pdf.ts              # PDF export
    ├── console.ts          # console message + page error tracking
    ├── dialog.ts           # browser dialog handling (alert/confirm/prompt)
    ├── frame.ts            # iframe switching
    ├── storage.ts          # localStorage operations
    ├── state.ts            # full state save/load (cookies + storage)
    ├── cookie.ts           # cookie export/import
    ├── browser.ts          # viewport, user agent, device emulation
    └── network.ts          # request/response logging
```

## Adding a New Command

1. **Create the action** in `src/actions/` (Playwright logic)
2. **Register the handler** in `src/handlers/index.ts` (daemon-side dispatch)
3. **Create the CLI command** in `src/commands/` (argument parsing + output formatting)
4. **Register the command** in `src/commands/index.ts`
5. **Add tests** in `tests/`

### Example: Adding `webcli title` command

**1. Action** (`src/actions/read.ts`):
```typescript
export async function title(page: Page): Promise<{ title: string }> {
  return { title: await page.title() };
}
```

**2. Handler** (`src/handlers/index.ts`):
```typescript
registerHandler("title", async (_ctx, _req, page) => ({
  ok: true, data: await read.title(page!),
}));
```

**3. CLI command** (`src/commands/title.ts`):
```typescript
import type { Command } from "commander";
import { send } from "../client.js";
import { globalOpts, output, type Opts } from "./shared.js";

export function register(program: Command): void {
  const cmd = program.command("title").description("Get page title");
  globalOpts(cmd);
  cmd.action(async (opts: Opts) => {
    const res = await send({ action: "title", tab: opts.tab, args: {}, timeout: parseInt(opts.timeout) });
    output(res, opts, (d) => d.title);
  });
}
```

**4. Register** (`src/commands/index.ts`):
```typescript
import { register as title } from "./title.js";
// add to commands array
```

## Ref System

The snapshot command assigns `@e1`, `@e2`, ... refs to interactive elements. These refs are stored in `src/ref-store.ts` as a `WeakMap<Page, Map<string, ElementHandle>>`. Interaction commands (click, fill, hover, etc.) check if the selector starts with `@e` and resolve it from the ref store.

## Code Style

- TypeScript strict mode
- ES modules (import/export)
- No default exports from action modules
- Use `requireString()` / `requireUrl()` from `validate.ts` for all handler args
