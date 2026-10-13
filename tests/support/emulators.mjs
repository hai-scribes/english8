/* Starts the Firebase Auth and Firestore emulators for the tests, and stays in
   the foreground until it is stopped.

   The config is written here and not committed: the rules file is part of the
   feature, so before it exists the store runs open and the test that asks for
   the rules fails, as it should. */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { AUTH_PORT, STORE_PORT, HOST, PROJECT } from "./ports.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const WORK = join(ROOT, "node_modules", ".cache", "en8-emulators");
mkdirSync(WORK, { recursive: true });

const rules = join(ROOT, "firestore.rules");
const config = {
  emulators: {
    auth: { host: HOST, port: AUTH_PORT },
    firestore: { host: HOST, port: STORE_PORT },
    ui: { enabled: false },
    singleProjectMode: true,
  },
};
if (existsSync(rules)) config.firestore = { rules };
const file = join(WORK, "firebase.json");
writeFileSync(file, JSON.stringify(config, null, 2));

/* The emulators are Java programs. Homebrew's JDK is installed but not linked
   into the system, so it is named here when nothing else has. */
const env = { ...process.env };
const brewJdk = "/opt/homebrew/opt/openjdk";
if (!env.JAVA_HOME && existsSync(brewJdk)) {
  env.JAVA_HOME = brewJdk;
  env.PATH = `${brewJdk}/bin:${env.PATH}`;
}

const bin = join(ROOT, "node_modules", ".bin", "firebase");
const child = spawn(bin, ["emulators:start", "--only", "auth,firestore", "--project", PROJECT, "--config", file],
  { cwd: WORK, env, stdio: "inherit" });
const stop = () => { try { child.kill("SIGINT"); } catch (e) {} };
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
child.on("exit", code => process.exit(code ?? 0));
