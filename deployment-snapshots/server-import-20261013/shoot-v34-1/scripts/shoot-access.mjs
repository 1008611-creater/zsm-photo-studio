import { StudioStore } from '../runtime/store.mjs';
import { grantAccess, ownerAccess } from '../runtime/access.mjs';
import { CONTROLLED_COVER } from './shoot-controlled-cover.mjs';
import { createHash } from 'node:crypto';
const mode=process.argv[2],directory=process.env.STUDIO_DATA_DIR;
if(!directory||!['status','authorize-caibao','revoke-caibao'].includes(mode))throw Error('USAGE: STUDIO_DATA_DIR=... node scripts/shoot-access.mjs status|authorize-caibao|revoke-caibao');
const db=new StudioStore(directory);
try{
 const row=db.db.prepare('SELECT data FROM projects WHERE id=?').get('e0c7c19a-951e-433c-b362-e8a8f0ab739e');if(!row)throw Error('AUTHORIZED_SOURCE_NOT_FOUND');
 const p=JSON.parse(row.data),scope=CONTROLLED_COVER,provider={channel:'OpenLux',model:'gpt-image-2.5-sunburst-c'};
 const referenceHashes=Object.fromEntries(['identity','companion','location'].map(role=>{const a=db.asset(p.owner,p.id,p[role+'Id']);const hash=createHash('sha256').update(db.readAsset(a)).digest('hex');if(hash!==scope[role+'Sha256']||hash!==a.sha256)throw Error('AUTHORIZED_SOURCE_CHANGED');return [role,hash];}));
 if(mode==='authorize-caibao'){
  if(!process.argv.includes('--authorized-existing-scope'))throw Error('EXPLICIT_SCOPE_REQUIRED');
  const ledger=db.db.prepare('SELECT value FROM counters WHERE key=?').get(scope.counterKey);if(!ledger||ledger.value<25||ledger.value>=scope.limit)throw Error('AUTHORIZATION_LEDGER_REQUIRED');
  const active=db.db.prepare('SELECT data FROM shoot_access WHERE owner=?').all(p.owner).map(r=>JSON.parse(r.data)).find(g=>g.budgetKey===scope.counterKey&&!g.revoked&&g.expiresAt>Date.now());
  if(!active)grantAccess(db,{owner:p.owner,label:'蔡宝 × 奶蛙 × 外滩，已授权原图',...provider,limit:scope.limit,budgetKey:scope.counterKey,referenceHashes,expiresAt:p.expiresAt});
 }
 if(mode==='revoke-caibao')for(const row of db.db.prepare('SELECT id,data FROM shoot_access WHERE owner=?').all(p.owner)){const g=JSON.parse(row.data);if(g.budgetKey===scope.counterKey){g.revoked=true;db.db.prepare('UPDATE shoot_access SET data=? WHERE id=?').run(JSON.stringify(g),g.id);}}
 const ledger=db.db.prepare('SELECT value FROM counters WHERE key=?').get(scope.counterKey);
 console.log(JSON.stringify({scope:'existing-caibao-naiwa-bund',used:Number(ledger?.value||0),limit:scope.limit,access:ownerAccess(db,p.owner,provider),queued:db.db.prepare("SELECT COUNT(*) AS n FROM jobs WHERE status IN ('queued','running')").get().n}));
}finally{db.close();}
