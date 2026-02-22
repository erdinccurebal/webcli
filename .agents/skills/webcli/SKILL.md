---
name: webcli
description: Browse the web, read page content, click buttons, fill forms, and take screenshots using the webcli headless browser. Use when the user asks to visit a website, gather information from a web page, or interact with a web app.
allowed-tools: Bash(webcli *)
---

# webcli — Headless Browser CLI

You have access to a headless browser via the `webcli` command. Use it to navigate websites, read content, interact with elements, and take screenshots.

## Prerequisites

```bash
npm install -g @erdinccurebal/webcli
npx playwright install chromium
```

Homepage: https://erdinccurebal.github.io/webcli/
Repository: https://github.com/erdinccurebal/webcli

## Commands Reference

### Navigation
```bash
webcli go <url>                    # Navigate to URL (auto-starts daemon)
webcli go <url> -w networkidle     # Wait for network to settle
webcli go <url> -t mytab           # Open in named tab
webcli back                        # Go back in history
webcli forward                     # Go forward
webcli reload                      # Reload current page
```

### Reading Page Content
```bash
webcli source                      # Get full visible text of the page
webcli links                       # List all links (text + href)
webcli forms                       # List all forms with their inputs
webcli html <selector>             # Get innerHTML of element
webcli attr <selector> <attribute> # Get element attribute value
```

### Interaction
```bash
webcli click "<visible text>"      # Click element by visible text
webcli clicksel "<css selector>"   # Click element by CSS selector
webcli fill "<selector>" "<value>" # Fill an input field (preferred for forms)
webcli type "<text>"               # Type with keyboard (for focused element)
webcli select "<selector>" "<val>" # Select dropdown option
webcli press Enter                 # Press keyboard key (Enter, Tab, Escape...)
webcli focus "<selector>"          # Focus an element
```

### Waiting
```bash
webcli wait "<selector>"           # Wait for CSS selector to be visible
webcli waitfor "<text>"            # Wait for text to appear on page
webcli sleep 2000                  # Sleep for N milliseconds
```

### Screenshots
```bash
webcli screenshot                  # Take screenshot (returns path)
webcli screenshot -o page.png      # Save to specific file
```

### Browser Settings
```bash
webcli viewport 1920 1080          # Change viewport size
webcli useragent "<string>"        # Change user agent
```

### Tab & Daemon Management
```bash
webcli tabs                        # List open tabs
webcli quit                        # Close current tab
webcli quit -t mytab               # Close specific tab
webcli status                      # Show daemon info (PID, uptime, tabs)
webcli stop                        # Stop daemon and close browser
```

### Global Options
All commands support:
- `-t, --tab <name>` — target a specific tab (default: "default")
- `--json` — output as structured JSON
- `--timeout <ms>` — command timeout (default: 30000)

## Best Practices

### General workflow
1. `webcli go <url>` to navigate
2. `webcli source` to read the page content
3. Use `webcli click`, `webcli fill`, `webcli press` to interact
4. `webcli source` again to see the result
5. `webcli screenshot` if user wants visual confirmation

### Form filling
- Always use `webcli fill` for input fields — it properly sets React/Vue controlled inputs
- Use `webcli click` or `webcli clicksel` for buttons
- Use `webcli press Enter` to submit forms
- After submitting, use `webcli sleep 1000` then `webcli source` to check the result

### Multi-tab browsing
```bash
webcli go https://site-a.com -t research
webcli go https://site-b.com -t reference
webcli source -t research          # Read from specific tab
webcli source -t reference
```

### Error recovery
- If a command times out, try `webcli sleep 2000` then retry
- If an element is not found, use `webcli source` to check what's on the page
- If the daemon seems stuck, use `webcli stop` then retry the command
- Use `webcli wait "<selector>"` before interacting with dynamically loaded content

## Important Notes
- Always read the page with `webcli source` before trying to interact — understand what's on the page first
- Prefer `webcli fill` over `webcli type` for form inputs
- Prefer `webcli click` (by text) over `webcli clicksel` (by selector) when possible — it's more robust
- Use `webcli sleep` between rapid interactions to let pages update
- The daemon persists between commands — no need to re-navigate unless the page changes
