/* Product-owned local transport; upstream CozyClay remains unchanged. No server storage. */
(() => {
  const params = new URLSearchParams(location.search);
  const run = params.get("directorRun");
  const path = "/cozyclay/director-project.cclayproject";
  if (!run || !/^[a-zA-Z0-9-]{1,80}$/.test(run) || params.get("scene") !== path || parent === window) return;
  const nativeFetch = window.fetch.bind(window);
  let finish;
  let settled = false;
  const pending = new Promise((resolve) => { finish = resolve; });
  const send = (type) => parent.postMessage({ type, run }, location.origin);
  let interval;
  let timeout;
  function close(serialized) {
    if (settled) return;
    settled = true;
    clearInterval(interval);
    clearTimeout(timeout);
    window.removeEventListener("message", receive);
    finish(serialized);
  }
  function receive(event) {
    if (event.origin !== location.origin || event.source !== parent || event.data?.type !== "qujingbu:director-project" || event.data.run !== run) return;
    const serialized = event.data.serialized;
    try {
      if (typeof serialized !== "string" || new TextEncoder().encode(serialized).length > 131072) throw new Error();
      const value = JSON.parse(serialized);
      if (value.app !== "cozyclay" || value.kind !== "project" || value.version !== 4) throw new Error();
      close(serialized);
    } catch { close(null); send("qujingbu:director-rejected"); }
  }
  window.fetch = async (input, init) => {
    const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url, location.href);
    if (url.origin !== location.origin || url.pathname !== path) return nativeFetch(input, init);
    const serialized = await pending;
    send(serialized ? "qujingbu:director-delivered" : "qujingbu:director-rejected");
    return new Response(serialized ?? "Project unavailable", { status: serialized ? 200 : 410,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
  };
  window.addEventListener("message", receive);
  interval = setInterval(() => send("qujingbu:director-ready"), 750);
  timeout = setTimeout(() => { close(null); send("qujingbu:director-rejected"); }, 30000);
  send("qujingbu:director-ready");
})();
