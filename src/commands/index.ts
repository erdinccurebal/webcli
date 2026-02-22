import type { Command } from "commander";

import { register as go } from "./go.js";
import { register as back } from "./back.js";
import { register as forward } from "./forward.js";
import { register as reload } from "./reload.js";
import { register as source } from "./source.js";
import { register as links } from "./links.js";
import { register as forms } from "./forms.js";
import { register as evalCmd } from "./eval.js";
import { register as html } from "./html.js";
import { register as attr } from "./attr.js";
import { register as click } from "./click.js";
import { register as clicksel } from "./clicksel.js";
import { register as focus } from "./focus.js";
import { register as type_ } from "./type.js";
import { register as fill } from "./fill.js";
import { register as select } from "./select.js";
import { register as screenshot } from "./screenshot.js";
import { register as wait } from "./wait.js";
import { register as waitfor } from "./waitfor.js";
import { register as press } from "./press.js";
import { register as sleep } from "./sleep.js";
import { register as cookie } from "./cookie.js";
import { register as viewport } from "./viewport.js";
import { register as useragent } from "./useragent.js";
import { register as network } from "./network.js";
import { register as quit } from "./quit.js";
import { register as tabs } from "./tabs.js";
import { register as status } from "./status.js";
import { register as stop } from "./stop.js";

const commands = [
  go, back, forward, reload,
  source, links, forms, evalCmd,
  html, attr,
  click, clicksel, focus, type_, fill, select,
  screenshot,
  wait, waitfor, press,
  sleep,
  cookie, viewport, useragent, network,
  quit, tabs, status, stop,
];

export function registerAll(program: Command): void {
  for (const register of commands) {
    register(program);
  }
}
