import { execFileSync } from "node:child_process";

/* The builds the test site serves; made once and reused until a source
   changes (see builds.mjs). EN8_TEST_SKIP_BUILD=1 serves whatever is there. */
export default function globalSetup() {
  if (process.env.EN8_TEST_SKIP_BUILD) return;
  execFileSync("node", ["tests/support/builds.mjs"], { stdio: ["ignore", "ignore", "inherit"] });
}
