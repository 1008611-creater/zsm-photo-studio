/** Reproducible product build overlay. Never writes to the upstream checkout. */
export function integrateCozyClay(source, file) {
  source = source.replaceAll('\r\n', '\n');
  function replaceOnce(before, after) {
    if (source.split(before).length !== 2) throw new Error(`CozyClay integration anchor changed: ${file}`);
    source = source.replace(before, after);
  }
  if (file.endsWith('/src/App.jsx')) {
    replaceOnce('const playgroundMode = isPlaygroundEmbed', 'const productDirector = new URLSearchParams(globalThis.location?.search || "").get("director") === "1";\n\tconst playgroundMode = isPlaygroundEmbed');
    replaceOnce('if (!embedMode) return undefined;\n\t\t// The Workflow', 'if (!embedMode && !productDirector) return undefined;\n\t\t// The Workflow');
    replaceOnce('\n\t\tenterPreview();\n\t\tconst capture = () => {', '\n\t\tif (embedMode) enterPreview();\n\t\tconst capture = (requestId) => {');
    replaceOnce('const references = live.captureShotReferences();', 'const references = productDirector ? undefined : live.captureShotReferences();');
    replaceOnce('dataUrl, width: output.width, height: output.height, meta, references }, "*");', 'dataUrl, width: output.width, height: output.height, meta, references, requestId }, window.location.origin);');
    replaceOnce('error: error.message }, "*"); }', 'error: error.message, requestId }, window.location.origin); }');
    replaceOnce('const onMessage = (event) => {\n\t\t\tif (event.data?.type === "cozyclay:capture-framing") capture();', 'const onMessage = (event) => {\n\t\t\tif (event.source !== window.parent || event.origin !== window.location.origin) return;\n\t\t\tif (event.data?.type === "cozyclay:capture-framing") capture(event.data.requestId);');
    replaceOnce('\n\t}, [embedMode]);\n\t// QA-only render counter', '\n\t}, [embedMode, productDirector]);\n\t// QA-only render counter');
    replaceOnce('if (projectAutoOpenedRef.current) return;', 'if (projectAutoOpenedRef.current || (productDirector && new URLSearchParams(location.search).has("directorRun"))) return;');
    replaceOnce('if (demoSeeded.current) return;', 'if (demoSeeded.current || productDirector) return;');
  }
  if (file.endsWith('/src/planview.jsx')) {
    // Full Chinese names stay in the native hierarchy. The local 3D font only
    // includes Latin glyphs; board markers use a stable ID instead of fetching
    // missing CJK font tables from external services.
    replaceOnce('const objectLabel = displayObjectLabel(object.name).slice(0, 8);', 'const displayLabel = displayObjectLabel(object.name);\n\tconst objectLabel = /[^\\x00-\\x7f]/.test(displayLabel) ? object.id.slice(-6) : displayLabel.slice(0, 8);');
  }
  return source;
}

export function cozyclayProductPlugin() {
  return { name: 'qujingbu-director-integration', enforce: 'pre', transform(source, id) {
    const file = id.replaceAll('\\', '/');
    if (!file.endsWith('/src/App.jsx') && !file.endsWith('/src/planview.jsx')) return null;
    return { code: integrateCozyClay(source, file), map: null };
  } };
}
