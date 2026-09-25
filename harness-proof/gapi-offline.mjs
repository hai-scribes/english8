/* Preload (node --import) for the proof runs only, used when GAPI_SHIM=1:
 * every browser context the harness opens answers apis.google.com/js/api.js
 * with gapi-shim.js instead of the network. See gapi-shim.js for why. The
 * harness files themselves are not touched — this wraps chromium.launch. */
import { readFileSync } from "node:fs";
import { chromium } from "playwright";

const SHIM = readFileSync(new URL("./gapi-shim.js", import.meta.url), "utf8");
const launch = chromium.launch.bind(chromium);
chromium.launch = async (...a) => {
  const browser = await launch(...a);
  const newContext = browser.newContext.bind(browser);
  browser.newContext = async (...b) => {
    const ctx = await newContext(...b);
    await ctx.route("https://apis.google.com/js/api.js*", r =>
      r.fulfill({ status: 200, contentType: "text/javascript", body: SHIM }));
    return ctx;
  };
  return browser;
};
