import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const upstream = resolve(root, "vendor/CozyClay");
const dist = resolve(upstream, "dist");
const hosted = resolve(root, "public/cozyclay");
const unicodeData = resolve(root, "scripts/cozyclay-unicode-font-resolver");

if (process.platform === "win32") {
  execFileSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/s", "/c", "npx vite build --base /cozyclay/"], {
    cwd: upstream,
    stdio: "inherit",
  });
} else {
  execFileSync("npx", ["vite", "build", "--base", "/cozyclay/"], {
    cwd: upstream,
    stdio: "inherit",
  });
}

await rm(hosted, { recursive: true, force: true });
await mkdir(hosted, { recursive: true });
await cp(dist, hosted, { recursive: true });
await cp(resolve(root, "scripts/cozyclay-zh-overlay.js"), resolve(hosted, "zh-overlay.js"));
await cp(unicodeData, resolve(hosted, "unicode-font-resolver"), { recursive: true });
for (const file of ["LICENSE", "LICENSING.md", "THIRD_PARTY_NOTICES.md", "THIRD_PARTY_NOTICES_VIBE_WORKFLOW.md"]) {
  await cp(resolve(upstream, file), resolve(hosted, file));
}

const appIndex = resolve(hosted, "app/index.html");
let html = await readFile(appIndex, "utf8");
html = html
  .replace(/<html lang="en">/, '<html lang="zh-CN">')
  .replace(/<link rel="canonical" href="https:\/\/cozyclay\.org\/app\/" \/>/, '<link rel="canonical" href="/cozyclay/app/index.html" />')
  .replaceAll("https://cozyclay.org/app/", "/cozyclay/app/index.html")
  .replaceAll("https://cozyclay.org/media/", "/cozyclay/media/")
  .replace(/\s*<script defer src="https:\/\/static\.cloudflareinsights\.com\/beacon\.min\.js"[^>]*><\/script>/, "")
  .replace(/<title>[^<]*<\/title>/, "<title>CozyClay 导演台 · 取景簿</title>");
if (!html.includes("Content-Security-Policy")) {
  html = html.replace(
    "<meta name=\"robots\" content=\"noindex, follow\" />",
    "<meta name=\"robots\" content=\"noindex, follow\" />\n    <meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'self' data: blob:; connect-src 'self'; font-src 'self' data: blob:; img-src 'self' data: blob:; media-src 'self' data: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:; style-src 'self' 'unsafe-inline'; worker-src 'self' blob:\" />",
  );
}
if (!html.includes("/cozyclay/zh-overlay.js")) {
  html = html.replace(/(<script type="module" crossorigin[^>]*><\/script>)/, "$1\n    <script defer src=\"/cozyclay/zh-overlay.js\"></script>");
}
await writeFile(appIndex, html);

// CozyClay's runtime keeps these paths root-relative. Mirror only its static
// runtime folders so the embedded build stays same-origin without a proxy.
for (const name of ["ardy", "demo", "fonts", "media", "models", "scenes"]) {
  const target = resolve(root, "public", name);
  await rm(target, { recursive: true, force: true });
  await cp(resolve(hosted, name), target, { recursive: true });
}

// The upstream app contains optional cloud motion clients. Keep the embedded
// build same-origin: those clients must resolve to our explicit disabled API
// routes instead of contacting CozyClay's hosted service.
const assetDir = resolve(hosted, "assets");
for (const name of await readdir(assetDir)) {
  if (!name.endsWith(".js")) continue;
  const file = resolve(assetDir, name);
  const source = await readFile(file, "utf8");
  const localOnly = source
    .replaceAll("https://api.cozyclay.org", "")
    .replaceAll("http://127.0.0.1:8787", "")
    .replaceAll("https://t.cozyclay.org", "")
    .replaceAll("https://cdn.jsdelivr.net/gh/lojjic/unicode-font-resolver@v1.0.1/packages/data", "${location.origin}/cozyclay/unicode-font-resolver");
  if (localOnly !== source) await writeFile(file, localOnly);
}

console.log("CozyClay embedded build copied to public/cozyclay");
