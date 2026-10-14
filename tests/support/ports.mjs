/* One place for every address the tests use. The site is not on 8788: another
   project on this machine listens there. */
export const SITE_PORT = Number(process.env.EN8_TEST_SITE_PORT || 8793);
export const AUTH_PORT = Number(process.env.EN8_TEST_AUTH_PORT || 9199);
export const STORE_PORT = Number(process.env.EN8_TEST_STORE_PORT || 8188);
export const HOST = "127.0.0.1";
export const SITE = `http://${HOST}:${SITE_PORT}`;
export const AUTH = `http://${HOST}:${AUTH_PORT}`;
export const STORE = `http://${HOST}:${STORE_PORT}`;
/* A demo- project never reaches Google: the emulators answer everything. */
export const PROJECT = "demo-english8";
