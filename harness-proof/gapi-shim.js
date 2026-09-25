/* A LOCAL STAND-IN for https://apis.google.com/js/api.js — proof environment only.
 *
 * Firebase's signInWithPopup loads Google's gapi loader and its gapi.iframes
 * module even against the Auth emulator: the SDK opens a hidden helper iframe
 * (served by the emulator) and the two talk over gapi.iframes. A sandbox whose
 * network policy denies apis.google.com therefore cannot complete a popup
 * sign-in at all, and every browser gate dies at "signing in" for a reason
 * that has nothing to do with the build under test.
 *
 * This implements exactly the slice of gapi.iframes the SDK and the emulator's
 * helper page use — context.open, getParentIframe, register/send with
 * callback replies, ping, restyle — over plain postMessage. It is installed
 * only when run-ref.sh is started with GAPI_SHIM=1, by gapi-offline.mjs
 * routing the URL; the harness under test and the app are unchanged, and a
 * machine that can reach apis.google.com never loads this file.
 */
(() => {
  if (window.gapi && window.gapi.iframes) return;
  const TAG = "__en8GapiShim";
  const FILTER = function crossOriginIframesFilter() { return true; };

  function channel(target) {
    const handlers = {}, queued = {}, pending = {}, readyCbs = [];
    let seq = 0, ready = false;
    const post = m => target().postMessage(Object.assign({ [TAG]: 1 }, m), "*");
    const deliver = m => {
      const h = handlers[m.name];
      if (!h) { (queued[m.name] = queued[m.name] || []).push(m); return; }
      Promise.resolve(h(m.data)).then(res => post({ k: "reply", id: m.id, res: res === undefined ? [] : [res] }));
    };
    window.addEventListener("message", e => {
      const m = e.data;
      if (!m || !m[TAG] || e.source !== target()) return;
      if (m.k === "ready") { if (!ready) { ready = true; post({ k: "ready" }); readyCbs.splice(0).forEach(f => f()); } }
      else if (m.k === "send") deliver(m);
      else if (m.k === "reply") { const cb = pending[m.id]; delete pending[m.id]; try { if (cb) cb(m.res); } catch (err) { /* gapi swallows a throwing callback */ } }
    });
    return {
      announce() { post({ k: "ready" }); },
      api: {
        restyle: () => Promise.resolve(),
        ping(cb) {
          return new Promise(res => {
            const done = () => { if (cb) cb(); res(); };
            if (ready) done(); else readyCbs.push(done);
          });
        },
        register(name, h) {
          handlers[name] = h;
          (queued[name] || []).splice(0).forEach(deliver);
        },
        send(name, data, cb) {
          const id = ++seq;
          if (cb) pending[id] = cb;
          post({ k: "send", name, data, id });
        },
        getOrigin: () => "*",
      },
    };
  }

  function Iframe() {}
  const context = {
    open(opts, cb) {
      const el = document.createElement("iframe");
      for (const [k, v] of Object.entries(opts.attributes || {})) {
        if (k === "style") Object.assign(el.style, v); else el.setAttribute(k, v);
      }
      const ch = channel(() => el.contentWindow);
      el.src = opts.url;
      (opts.where || document.body).appendChild(el);
      const iframe = Object.assign(new Iframe(), ch.api, { getIframeEl: () => el });
      return cb ? cb(iframe) : iframe;
    },
    getParentIframe() {
      const ch = channel(() => window.parent);
      ch.announce();
      return Object.assign(new Iframe(), ch.api);
    },
  };

  window.gapi = window.gapi || {};
  window.gapi.iframes = { getContext: () => context, CROSS_ORIGIN_IFRAMES_FILTER: FILTER, Iframe };
  window.gapi.load = (name, opts) => {
    const cb = typeof opts === "function" ? opts : opts && opts.callback;
    setTimeout(() => cb && cb(), 0);
  };

  const src = document.currentScript && document.currentScript.src;
  const onload = src && new URL(src).searchParams.get("onload");
  setTimeout(() => {
    if (onload && typeof window[onload] === "function") window[onload]();
    else if (typeof window.gapi_onload === "function") window.gapi_onload();
  }, 0);
})();
