# browsercli

Headless browser CLI for AI coding agents. Control a real Chromium browser from the command line.

Built for [Claude Code](https://claude.com/claude-code) and similar AI-powered development tools that need to interact with web pages programmatically.

## Features

- **30+ commands** — navigate, read page content, interact with elements, take screenshots
- **Persistent daemon** — browser stays open between commands, no startup overhead
- **Multi-tab** — manage multiple named browser tabs simultaneously
- **Anti-detection** — realistic user-agent, webdriver flag removal, configurable viewport
- **Session persistence** — cookies and localStorage persist across daemon restarts
- **JSON output** — structured output for programmatic consumption
- **Headed/headless** — toggle via config for sites with bot detection

## Installation

```bash
npm install -g browsercli
npx playwright install chromium
```

## Quick Start

```bash
browsercli go https://example.com          # Navigate (auto-starts daemon)
browsercli source                           # Read page text
browsercli links                            # List all links
browsercli click "More information..."      # Click by visible text
browsercli screenshot -o page.png           # Take screenshot
browsercli stop                             # Stop daemon
```

## Commands

### Navigation

| Command | Description |
|---------|-------------|
| `browsercli go <url>` | Navigate to URL |
| `browsercli back` | Go back in history |
| `browsercli forward` | Go forward in history |
| `browsercli reload` | Reload current page |

Options for `go`: `-w, --wait <strategy>` — `domcontentloaded` (default), `networkidle`, `load`

### Reading

| Command | Description |
|---------|-------------|
| `browsercli source` | Get visible text content of the page |
| `browsercli html <selector>` | Get innerHTML of a specific element |
| `browsercli attr <selector> <attribute>` | Get an element's attribute value |
| `browsercli links` | List all links (text + href) |
| `browsercli forms` | List all forms with their inputs |
| `browsercli eval <js>` | Execute JavaScript and return result |

### Interaction

| Command | Description |
|---------|-------------|
| `browsercli click <text>` | Click element by visible text |
| `browsercli clicksel <selector>` | Click element by CSS selector |
| `browsercli focus <selector>` | Focus element by CSS selector |
| `browsercli type <text>` | Type text with keyboard |
| `browsercli fill <selector> <value>` | Fill an input field |
| `browsercli select <selector> <value>` | Select a dropdown option |
| `browsercli press <key>` | Press a keyboard key (Enter, Tab, Escape...) |

### Waiting

| Command | Description |
|---------|-------------|
| `browsercli wait <selector>` | Wait for CSS selector to become visible |
| `browsercli waitfor <text>` | Wait for text to appear on page |
| `browsercli sleep <ms>` | Sleep for specified milliseconds |

### Cookies & Browser

| Command | Description |
|---------|-------------|
| `browsercli cookie export` | Export cookies as JSON |
| `browsercli cookie import <file>` | Import cookies from JSON file |
| `browsercli viewport <width> <height>` | Change viewport size |
| `browsercli useragent <string>` | Change user agent |
| `browsercli network [on\|off]` | Toggle request/response logging |
| `browsercli screenshot` | Take a full-page screenshot |

### Tab & Daemon Management

| Command | Description |
|---------|-------------|
| `browsercli tabs` | List all open tabs |
| `browsercli quit` | Close a tab |
| `browsercli status` | Show daemon status (PID, uptime, tabs) |
| `browsercli stop` | Stop the daemon and close browser |

### Global Options

| Option | Description |
|--------|-------------|
| `-t, --tab <name>` | Target tab (default: `"default"`) |
| `--json` | Output as JSON |
| `--timeout <ms>` | Command timeout (default: `30000`) |
| `--verbose` | Enable debug logging |

## Configuration

Create `~/.browsercli/config.json`:

```json
{
  "headless": true,
  "browser": "chromium",
  "userDataDir": "~/.browsercli/browser-data",
  "viewport": { "width": 1280, "height": 800 },
  "locale": "en-US",
  "timezoneId": "America/New_York",
  "waitAfterClick": 500,
  "waitAfterPress": 300,
  "idleTimeout": 300000,
  "defaultTimeout": 30000
}
```

Set `"headless": false` to use headed mode (required for sites with aggressive bot detection like X/Twitter).

## Architecture

```
CLI Client (browsercli)
    │
    │── Unix Socket (~/.browsercli/daemon.sock)
    │
    ▼
Daemon (background process)
    │
    ├── Playwright Browser (Chromium/Firefox/WebKit)
    │   ├── Tab: "default" → Page
    │   ├── Tab: "search"  → Page
    │   └── Tab: "login"   → Page
    │
    ├── Tab Manager (named page instances)
    ├── Handler Registry (action dispatch)
    └── Auto-shutdown after 5min idle
```

The daemon starts automatically on the first command and persists in the background. All commands communicate via a Unix domain socket using newline-delimited JSON.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup and guidelines.

## License

[MIT](./LICENSE)
