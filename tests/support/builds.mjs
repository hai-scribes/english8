/* Two whole builds of the site for the tests: b1, and b2 — the same sources
   built again as a later build, for the tests that publish an update.

   The build takes about a minute, so the pair is kept and reused until a file
   the build reads has changed.

   The build is asked for another folder and another build id through
   EN8_OUT and EN8_BUILD_SALT. A build that does not know those names writes
   docs/ as it always has; that output is then copied for both, and the tests
   that need two different builds fail, as they should before the feature. */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const BUILDS = process.env.EN8_TEST_BUILDS || join(ROOT, "node_modules", ".cache", "en8-builds");
const READS = ["tools", "units", "data", "art", "package.json", "tests/support/auth-page.mjs", "tests/support/builds.mjs"];

function sourcesKey() {
  const git = args => execFileSync("git", args, { cwd: ROOT, maxBuffer: 1 << 28 }).toString();
  const h = createHash("sha256");
  h.update(git(["ls-files", "-s", "--", ...READS]));
  h.update(git(["diff", "--", ...READS]));
  for (const f of git(["ls-files", "--others", "--exclude-standard", "--", ...READS]).split("\n").filter(Boolean)) {
    h.update(f);
    h.update(readFileSync(join(ROOT, f)));
  }
  return h.digest("hex");
}

export function prepareBuilds() {
  const key = sourcesKey();
  const stamp = join(BUILDS, "key");
  if (existsSync(stamp) && readFileSync(stamp, "utf8") === key) return BUILDS;
  rmSync(BUILDS, { recursive: true, force: true });
  mkdirSync(BUILDS, { recursive: true });
  for (const [name, salt] of [["b1", ""], ["b2", "later"]]) {
    const out = join(BUILDS, name);
    execFileSync("python3", ["tools/build.py"], {
      cwd: ROOT, stdio: ["ignore", "ignore", "inherit"],
      env: { ...process.env, EN8_OUT: out, EN8_BUILD_SALT: salt },
    });
    if (!existsSync(join(out, "index.html"))) cpSync(join(ROOT, "docs"), out, { recursive: true });
  }
  /* The test's own sign-in page (see auth-page.mjs), bundled beside them. */
  execFileSync(join(ROOT, "node_modules", ".bin", "esbuild"), [
    join(ROOT, "tests", "support", "auth-page.mjs"), "--bundle", "--format=esm", "--minify",
    "--log-level=warning", "--outfile=" + join(BUILDS, "testpage", "auth.js"),
  ], { cwd: ROOT, stdio: "inherit" });
  writeFileSync(join(BUILDS, "testpage", "auth.html"),
    '<!doctype html><meta charset="utf-8"><title>out</title><button id="go" type="button">Sign in</button>'
    + '<script src="/assets/firebase-config.js"></script><script type="module" src="/__test/auth.js"></script>\n');
  writeFileSync(stamp, key);
  return BUILDS;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) console.log(prepareBuilds());
