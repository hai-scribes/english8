/* Signing in with Google — driven through the UI, against the Auth emulator.
 *
 * Driven, not stubbed. Calling signInWithCredential from the harness would go
 * green against a page with no sign-in button on it; the thing being gated is
 * that a learner can start the flow from the page and end it signed in.
 */
import { metric, gate, finish } from "./lib.mjs";
import { launch, device, url, aLessonPath, signIn } from "./browser.mjs";

const violations = [];
let swept = 0;
const browser = await launch();


const state = p => p.$eval("[data-en8-auth-state]", el => el.getAttribute("data-en8-auth-state")).catch(() => null);

try {
  const { page } = await device(browser);
  await page.goto(url(aLessonPath()), { waitUntil: "domcontentloaded" });

  /* 1 — signed out is a STATE the page declares, not an absence. A page that
   *     renders nothing about identity is indistinguishable from one whose
   *     auth failed to load. */
  swept++;
  const initial = await state(page);
  if (initial !== "signed-out") violations.push(`initial auth state is ${initial ?? "absent"}, expected signed-out`);

  /* 2 — the flow completes and the page says who you are */
  swept++;
  try {
    await signIn(page, "learner@example.com");
    const who = await page.$eval("[data-en8-identity]", el => el.textContent.trim()).catch(() => "");
    if (!who.includes("learner")) violations.push(`signed in but [data-en8-identity] reads ${JSON.stringify(who)}`);
  } catch (e) { violations.push(`sign-in flow: ${e.message}`); }

  /* 3 — it survives a reload. A session that evaporates on refresh is not a
   *     login, and "access it everywhere" starts with "access it again". */
  swept++;
  try {
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForFunction(
      () => document.querySelector("[data-en8-auth-state]")?.getAttribute("data-en8-auth-state") === "signed-in",
      null, { timeout: 15_000 });
  } catch { violations.push("signed-in state did not survive a reload"); }

  /* 4 — signing out actually ends it */
  swept++;
  try {
    await page.locator("[data-en8-signout]").first().click({ timeout: 10_000 });
    await page.waitForFunction(
      () => document.querySelector("[data-en8-auth-state]")?.getAttribute("data-en8-auth-state") === "signed-out",
      null, { timeout: 15_000 });
  } catch (e) { violations.push(`sign-out: ${e.message}`); }
} catch (e) {
  violations.push(`harness could not drive the page: ${e.message}`);
} finally {
  await browser.close();
}

for (const v of violations) console.log(`  · ${v}`);
metric("auth_flows_swept", swept);
metric("auth_contract_violations", violations.length);
finish([
  gate("auth flows swept", swept >= 4, `${swept} flows`),
  gate("auth contract", violations.length === 0, `${violations.length} violation(s)`),
]);
