import {StudioStore} from '../runtime/store.mjs';
import {DatabaseSync} from 'node:sqlite';
import {createHash} from 'node:crypto';
import {statSync,readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
const directory='/var/lib/zsm-photo-shoot',db=new StudioStore(directory),backup=new DatabaseSync('/var/backups/zsm-photo-shoot/qjb-vibephoto-v22/studio.sqlite.before',{readOnly:true});
try{
 const results=[];
 for(const id of ['e0c7c19a-951e-433c-b362-e8a8f0ab739e','380d047b-cddb-40fa-8a8b-4735a4f16d4c','bba938a1-2c2f-44da-81dc-7892c8a50c97']){
  const current=JSON.parse(db.db.prepare('SELECT data FROM projects WHERE id=?').get(id).data),previous=JSON.parse(backup.prepare('SELECT data FROM projects WHERE id=?').get(id).data);
  if(JSON.stringify(current)!==JSON.stringify(previous))throw Error('PROJECT_CHANGED');
  for(const r of current.results){const a=db.asset(current.owner,id,r.assetId),bytes=db.readAsset(a),hash=createHash('sha256').update(bytes).digest('hex'),permissions=statSync(join(directory,'assets',a.file));if(hash!==a.sha256||permissions.uid!==997||(permissions.mode&0o777)!==0o600)throw Error('ASSET_CHANGED');}
  const oldJobs=backup.prepare('SELECT id,data FROM jobs WHERE project=? ORDER BY id').all(id),currentJobs=db.db.prepare('SELECT id,data FROM jobs WHERE project=? ORDER BY id').all(id);if(JSON.stringify(oldJobs)!==JSON.stringify(currentJobs))throw Error('JOB_CHANGED');
  const oldAttempts=backup.prepare('SELECT attempts.id,attempts.data FROM attempts JOIN jobs ON attempts.job=jobs.id WHERE jobs.project=? ORDER BY attempts.id').all(id),currentAttempts=db.db.prepare('SELECT attempts.id,attempts.data FROM attempts JOIN jobs ON attempts.job=jobs.id WHERE jobs.project=? ORDER BY attempts.id').all(id);if(JSON.stringify(oldAttempts)!==JSON.stringify(currentAttempts))throw Error('ATTEMPTS_CHANGED');
  results.push({project:id,resultCount:current.results.length,unchanged:true,private:true});
 }
 const counter=db.db.prepare('SELECT value FROM counters WHERE key=?').get('trial:authorized-caibao-trial-2026-10-07').value;if(counter!==25)throw Error('MODEL_CALL_COUNT_CHANGED');
 const manifest=JSON.parse(readFileSync('/tmp/v22-manifest.json','utf8'));for(const [file,expected] of Object.entries(manifest)){const actual=createHash('sha256').update(readFileSync(file)).digest('hex');if(actual!==expected)throw Error('SOURCE_MISMATCH:'+file);}
 const evidence={version:'qjb-vibephoto-v22',buildId:readFileSync('.next/BUILD_ID','utf8').trim(),health:db.health(),projects:results,modelRequestsAdded:0,authorizedUsed:counter,remaining:100-counter,publicGrants:db.db.prepare('SELECT COUNT(*) AS n FROM shoot_access').get().n,sourceFilesVerified:Object.keys(manifest).length};
 writeFileSync('/var/backups/zsm-photo-shoot/qjb-vibephoto-v22/verification.json',JSON.stringify(evidence,null,2),{mode:0o600});console.log(JSON.stringify(evidence));
}finally{db.close();backup.close();}
