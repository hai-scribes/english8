/* The cheap signal: the site still builds, and the content gates this repo
 * already had still hold.
 *
 * The second half is the point. Everything this lane adds — an auth control, a
 * sync indicator, a service worker — lands in `tools/assets/app.js` and
 * `tools/build.py`, which are the same files that render 103 pages of
 * curriculum. A sync feature that quietly broke the marking engine would
 * otherwise reach a green interaction gate, because no scenario here asks
 * about marking. `gates.sh` does.
 */
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { REPO, walk, metric, gate, finish } from "./lib.mjs";

const results = [];

function run(cmd, args) {
  try {
    const out = execFileSync(cmd, args, { cwd: REPO, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 << 20 });
    return { ok: true, out };
  } catch (e) {
    return { ok: false, out: `${e.stdout || ""}\n${e.stderr || ""}` };
  }
}

/* 1 — the build itself */
const built = run("python3", ["tools/build.py"]);
if (!built.ok) console.log(built.out.split("\n").slice(-25).join("\n"));
results.push(gate("tools/build.py", built.ok));

/* 2 — how much it produced. A build that emits four pages and a build that
 * emits every unit both exit 0; only the count tells them apart. */
const pages = walk(join(REPO, "docs"), [".html"]).length;
metric("pages_built", pages);
results.push(gate("pages built", pages >= 100, `${pages} html pages`));

/* 3 — the repo's own nine gates, in the only order they mean anything in.
 * GATES_SKIP is deliberately NOT honoured here: a gate that excused itself
 * has not been run, and this harness is the thing standing in for a human. */
let gateFailures = 0;
if (existsSync(join(REPO, "tools", "gates.sh"))) {
  const g = run("bash", ["tools/gates.sh"]);
  if (!g.ok) {
    gateFailures = 1;
    console.log(g.out.split("\n").slice(-40).join("\n"));
  }
} else {
  gateFailures = 1;
  console.log("tools/gates.sh is missing — the content gates cannot be run at all");
}
metric("repo_gate_failures", gateFailures);
results.push(gate("tools/gates.sh", gateFailures === 0));

finish(results);
