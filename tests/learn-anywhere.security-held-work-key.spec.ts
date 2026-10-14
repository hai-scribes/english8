/* Security: held work must not be decryptable from values left in browser
   storage after sign-out. This covers the client-not-loaded sign-out path,
   where the page records a deferred Firebase sign-out. */
import { test, expect, TEXT } from "./support/harness";
import * as lesson from "./support/driver";

const FLAG = "en8-test:no-client-for-held-work";
const TASK = "01-1-1.1-1";

test("security_held_work_is_not_decryptable_with_readable_storage_markers", async ({ lab }) => {
  test.setTimeout(120_000);
  const her = lab.account();
  const a = await lab.device();

  await a.open(lesson.LESSON_WITH_INSTANT_TASK);
  await a.signIn(her);
  await a.holdSaves(true);
  await lesson.answerTask(a.page, TASK);
  await a.expectStatus(TEXT.saving);
  expect(await a.stored("en8:tasks:v1")).toContain(TASK);

  await a.page.addInitScript(flag => {
    if (sessionStorage.getItem(flag)) {
      Object.defineProperty(window, "EN8Auth", { configurable: true, get: () => undefined, set: () => {} });
    }
  }, FLAG);
  await a.page.evaluate(flag => sessionStorage.setItem(flag, "1"), FLAG);
  await a.page.reload();
  await expect(a.signOutButton).toBeVisible();

  await a.signOutButton.click();
  await a.expectAuth("signed-out");
  await lesson.expectTaskNotDone(a.page, TASK);

  const decrypted = await a.page.evaluate(async () => {
    const gone = localStorage.getItem("en8-sync:gone");
    const parkedKey = Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i))
      .find(k => k && k.indexOf("en8-sync:parked:") === 0);
    const raw = parkedKey ? localStorage.getItem(parkedKey) : null;
    if (!gone || !raw) return null;

    const enc = new TextEncoder();
    const unb64 = (s: string) => Uint8Array.from(atob(s), c => c.charCodeAt(0));
    const parts = raw.split(".");
    try {
      const material = await crypto.subtle.importKey("raw", enc.encode(gone), "PBKDF2", false, ["deriveKey"]);
      const key = await crypto.subtle.deriveKey(
        { name: "PBKDF2", salt: enc.encode("en8-sync held work"), iterations: 100000, hash: "SHA-256" },
        material,
        { name: "AES-GCM", length: 256 },
        false,
        ["decrypt"],
      );
      const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(parts[0]) }, key, unb64(parts[1]));
      return new TextDecoder().decode(plain);
    } catch (e) {
      return null;
    }
  });

  expect(decrypted).toBeNull();
});
