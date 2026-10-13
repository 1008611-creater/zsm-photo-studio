#!/usr/bin/env bash
set -euo pipefail
name=${1:?Release name required}
[[ "$name" =~ ^qjb-[a-z0-9-]+$ ]] || exit 1
[ "${2:-}" = --authorized-preview ] || { echo 'Explicit preview publication authorization required'; exit 1; }
release=/var/www/zsm-photo-shoot/releases/$name
archive=/tmp/$name.tar.gz
backup=/var/backups/zsm-photo-shoot/$name
site=$(readlink -f /etc/nginx/sites-enabled/zsm.cauai.fun)
current=/var/www/zsm-photo-shoot/current
[ ! -e "$release" ] && [ ! -e "$backup" ]
test -L "$current"
grep -q 'location \^~ /studio-next/' "$site"
grep -q 'proxy_pass http://127.0.0.1:4196;' "$site"
mkdir -p "$release" "$backup"
chmod 700 "$backup"
readlink -f "$current" > "$backup/preview-release.before"
readlink -f /var/www/zsm-photo-studio/current > "$backup/production-release.before"
cp -a "$site" "$backup/nginx.before"
for mode in web worker; do cp "/etc/systemd/system/zsm-shoot-$mode.service" "$backup/$mode.before"; done
oldenv=$(sed -n 's/^EnvironmentFile=//p' "$backup/web.before")
test -f "$oldenv"
cp "$oldenv" "$backup/runtime.env"
chmod 600 "$backup/runtime.env"
# Source/build files get independent inodes. Immutable dependencies share space.
tar -C "$current" --exclude=./node_modules --exclude=./.next -cf - . | tar -C "$release" -xf -
cp -al "$current/node_modules" "$release/node_modules"
tar -xzf "$archive" -C "$release"
cd "$release"
test "$(node -p 'require("next/package.json").version')" = "16.3.7"
NEXT_TELEMETRY_DISABLED=1 NEXT_PUBLIC_BASE_PATH=/studio-next nice -n 10 npm run build
NEXT_PUBLIC_BASE_PATH=/studio-next STUDIO_GENERATION_ENABLED=false node scripts/check-character-artwork.mjs --authorized-preview
node --check runtime/store.mjs
node --check runtime/provider.mjs
node --input-type=module - "$backup/preview-data" <<'JS'
import { mkdirSync } from 'node:fs';import { DatabaseSync } from 'node:sqlite';
const dir=process.argv[2];mkdirSync(dir,{recursive:true,mode:0o700});
const db=new DatabaseSync('/var/lib/zsm-photo-shoot/studio.sqlite');db.exec('PRAGMA busy_timeout=10000');
db.exec("VACUUM INTO '"+dir+"/studio.sqlite'");db.close();
JS
NEXT_PUBLIC_BASE_PATH=/studio-next STUDIO_GENERATION_ENABLED=false STUDIO_ACCESS_REQUIRED=true STUDIO_DATA_DIR="$backup/preview-data" STUDIO_RELEASE="$name" node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 4197 > "$backup/preview.log" 2>&1 &
preview_pid=$!
trap 'kill "$preview_pid" 2>/dev/null || true' EXIT
for attempt in $(seq 1 30); do
if curl -fsS http://127.0.0.1:4197/studio-next/api/shoot/health > "$backup/preview-health.json"; then break; fi
sleep 1
done
python3 - "$backup/preview-health.json" "$name" <<'PY'
import json,sys
h=json.load(open(sys.argv[1]));assert h['version']==sys.argv[2] and h['database']=='ok' and h['schemaVersion']==2 and not h['generation']
PY
curl -fsS http://127.0.0.1:4197/studio-next/studio > "$backup/preview-page.html"
grep -q vibephoto "$backup/preview-page.html"
kill "$preview_pid"
wait "$preview_pid" || true
trap - EXIT
cmp -s "$site" "$backup/nginx.before" || { echo 'Nginx changed concurrently; stopped before switch'; exit 1; }
python3 - "$backup/runtime.env" "$name" <<'PY'
import pathlib,sys
p=pathlib.Path(sys.argv[1]); lines=p.read_text().splitlines()
updates={'STUDIO_RELEASE':sys.argv[2],'STUDIO_GENERATION_ENABLED':'false','STUDIO_ACCESS_REQUIRED':'true','STUDIO_DAILY_REQUEST_LIMIT':'0','STUDIO_REFERENCE_CONTRACT_VERIFIED':'false','STUDIO_MULTI_REFERENCE_VERIFIED':'false'}
lines=[l for l in lines if l.split('=',1)[0] not in updates]
p.write_text('\n'.join(lines+[k+'='+v for k,v in updates.items()])+'\n')
PY
node --input-type=module - "$backup/studio.sqlite.before" <<'JS'
import { DatabaseSync } from 'node:sqlite';
const db=new DatabaseSync('/var/lib/zsm-photo-shoot/studio.sqlite');
db.exec('PRAGMA busy_timeout=10000');
db.exec("VACUUM INTO '"+process.argv[2].replaceAll("'","''")+"'");db.close();
JS
chmod 600 "$backup/studio.sqlite.before"
mkdir -p "$release/.next/cache"
chown -R zsm-shoot:zsm-shoot "$release/.next/cache"
cat > "$backup/rollback.sh" <<'ROLLBACK'
#!/usr/bin/env bash
set -euo pipefail
backup=$(cd -- "$(dirname -- "$0")" && pwd)
old=$(cat "$backup/preview-release.before")
test -f "$old/.next/BUILD_ID"
ln -sfn "$old" /var/www/zsm-photo-shoot/current
for mode in web worker; do cp "$backup/$mode.before" "/etc/systemd/system/zsm-shoot-$mode.service"; done
systemctl daemon-reload
systemctl restart zsm-shoot-web zsm-shoot-worker
# Keep all project data; no destructive database rollback.
ROLLBACK
chmod 700 "$backup/rollback.sh"
switched=false
trap 'code=$?; if [ "$switched" = true ]; then "$backup/rollback.sh"; fi; exit "$code"' ERR
switched=true
for mode in web worker; do
python3 - "$backup/$mode.before" "/etc/systemd/system/zsm-shoot-$mode.service" "$backup/runtime.env" "$release" <<'PY'
import pathlib,sys
src,dst,env,release=sys.argv[1:]
lines=pathlib.Path(src).read_text().splitlines()
lines=[('EnvironmentFile='+env if l.startswith('EnvironmentFile=') else 'ReadWritePaths=/var/lib/zsm-photo-shoot '+release+'/.next/cache' if l.startswith('ReadWritePaths=') else l) for l in lines]
pathlib.Path(dst).write_text('\n'.join(lines)+'\n')
PY
done
switched=true
ln -sfn "$release" "$current"
systemctl daemon-reload
systemctl restart zsm-shoot-web zsm-shoot-worker
for attempt in $(seq 1 30); do
if curl -fsS http://127.0.0.1:4196/studio-next/api/shoot/health > "$backup/health.local.json"; then break; fi
sleep 1
done
python3 - "$backup/health.local.json" "$name" <<'PY'
import json,sys
h=json.load(open(sys.argv[1]));assert h['version']==sys.argv[2] and h['database']=='ok' and not h['generation'];print(h)
PY
curl --retry 3 --retry-delay 1 --retry-all-errors -fsS https://zsm.cauai.fun/studio-next/api/shoot/health > "$backup/health.public.json"
python3 - "$backup/health.public.json" "$name" <<'PY'
import json,sys
h=json.load(open(sys.argv[1]));assert h['version']==sys.argv[2] and h['database']=='ok' and not h['generation'];print(h)
PY
systemctl is-active zsm-photo-studio zsm-shoot-web zsm-shoot-worker
cmp -s "$site" "$backup/nginx.before"
test "$(readlink -f /var/www/zsm-photo-studio/current)" = "$(cat "$backup/production-release.before")"
nginx -t
trap - ERR
printf 'Released %s; rollback: %s/rollback.sh\n' "$name" "$backup"