import { defineConfig } from "@playwright/test";
import { SITE, AUTH } from "./tests/support/ports.mjs";

/* The tests for syncing, the day record and the offline copy. They drive a
   real browser against the built site and the Firebase emulators; nothing here
   reaches Google or the live project. `npx playwright test` starts all of it. */
export default defineConfig({
  testDir: "tests",
  testMatch: /.*\.spec\.ts$/,
  timeout: 120_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  workers: process.env.EN8_TEST_WORKERS ? Number(process.env.EN8_TEST_WORKERS) : 3,
  reporter: [["list"]],
  globalSetup: "./tests/support/global-setup.ts",
  use: {
    baseURL: SITE,
    serviceWorkers: "allow",
    trace: "retain-on-failure",
  },
  outputDir: "node_modules/.cache/en8-test-results",
  webServer: [
    { command: "node tests/support/emulators.mjs", url: AUTH, reuseExistingServer: true, timeout: 120_000 },
    { command: "node tests/support/server.mjs", url: SITE + "/__test/site", reuseExistingServer: true, timeout: 30_000 },
  ],
});
