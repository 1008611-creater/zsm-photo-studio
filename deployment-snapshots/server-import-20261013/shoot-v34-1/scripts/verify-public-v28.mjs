import {StudioStore} from '../runtime/store.mjs';
import {authorizeProject,ownerAccess} from '../runtime/access.mjs';
import {createHash,randomBytes} from 'node:crypto';
import {readFileSync,writeFileSync,statSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {unzipSync} from 'fflate';
const directory='/var/lib/zsm-photo-shoot',backup='/var/backups/zsm-photo-shoot/qjb-vibephoto-v28',db=new StudioStore(directory);
const before=new DatabaseSync(backup+'/studio.sqlite.before',{readOnly:true});
const origin='https://zsm.cauai.fun',base=origin+'/studio-next/api/shoot/';
const provider={channel:'OpenLux',model:'gpt-image-2.5-sunburst-c'},secretPath='/etc/zsm-photo-shoot/openlux.env';
let tempSession;
function fail(code){throw Error(code);}
try{
 const secretText=readFileSync(secretPath,'utf8'),secretStat=statSync(secretPath),key=secretText.match(/^OPENLUX_API_KEY="(.*)"$/m)?.[1]?.replace(/\\([\\"])/g,'$1');
 if(!key||secretStat.uid!==0||(secretStat.mode&0o777)!==0o600||(statSync('/etc/zsm-photo-shoot').mode&0o777)!==0o700)fail('SECRET_PERMISSIONS');
 const files=(path)=>readdirSync(path,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?files(join(path,entry.name)):[join(path,entry.name)]);
 for(const file of files('.next/static'))if(readFileSync(file).includes(Buffer.from(key)))fail('SECRET_IN_FRONTEND');
 const ansText=readFileSync('/etc/zsm-photo-shoot/ans.env','utf8'),ansKey=ansText.match(/^STUDIO_ANS_CLIENT_SECRET=(.*)$/m)?.[1];if(!ansKey||(statSync('/etc/zsm-photo-shoot/ans.env').mode&0o777)!==0o600)fail('ANS_SECRET_PERMISSIONS');for(const file of files('.next/static'))if(readFileSync(file).includes(Buffer.from(ansKey)))fail('ANS_SECRET_IN_FRONTEND');
 const health=await (await fetch(base+'health')).json();
 if(health.version!=='qjb-vibephoto-v28'||!health.generation||health.channel!==provider.channel||health.model!==provider.model||health.worker!=='online')fail('PUBLIC_HEALTH');
 const anonymousResponse=await fetch(base+'bootstrap');const anonymous=await anonymousResponse.json(),anonymousCookie=anonymousResponse.headers.get('set-cookie')?.split(';')[0];
 if(!anonymous.account?.enabled||anonymous.account.signedIn)fail('ANS_ACCOUNT_CONFIGURATION');
 if(anonymous.capability.enabled||anonymous.capability.remaining!==0||anonymous.projects.length)fail('PUBLIC_ACCESS_LEAK');
 const ids=['e0c7c19a-951e-433c-b362-e8a8f0ab739e','380d047b-cddb-40fa-8a8b-4735a4f16d4c','bba938a1-2c2f-44da-81dc-7892c8a50c97'];const projects=[];
 for(const id of ids){
  const current=db.db.prepare('SELECT data FROM projects WHERE id=?').get(id),previous=before.prepare('SELECT data FROM projects WHERE id=?').get(id);
  if(current.data!==previous.data)fail('PRIVATE_PROJECT_CHANGED');const p=JSON.parse(current.data);
  for(const r of p.results){const a=db.asset(p.owner,id,r.assetId);if(createHash('sha256').update(db.readAsset(a)).digest('hex')!==a.sha256)fail('ORIGINAL_CHANGED');}
  const oldJobs=before.prepare('SELECT id,data FROM jobs WHERE project=? ORDER BY id').all(id),jobs=db.db.prepare('SELECT id,data FROM jobs WHERE project=? ORDER BY id').all(id);if(JSON.stringify(oldJobs)!==JSON.stringify(jobs))fail('JOBS_CHANGED');
  projects.push({project:id,results:p.results.length,originalsUnchanged:true});
 }
 const row=db.db.prepare('SELECT data FROM projects WHERE id=?').get(ids[0]),project=JSON.parse(row.data);
 const access=authorizeProject(db,project.owner,project,provider);
 if(ownerAccess(db,project.owner,provider).remaining!==75)fail('QUOTA_CHANGED');
 try{authorizeProject(db,project.owner,{...project,identityId:null},provider);fail('WRONG_SCOPE_ALLOWED');}catch(e){if(e.message!=='SHOOT_REFERENCE_SCOPE')throw e;}
 try{authorizeProject(db,'unrelated-session',project,provider);fail('OTHER_OWNER_ALLOWED');}catch(e){if(e.message!=='SHOOT_ACCESS_REQUIRED')throw e;}
 const privateBlocked=await fetch(base+'projects/'+project.id,{headers:{Cookie:anonymousCookie}});if(privateBlocked.status!==404)fail('PRIVATE_ACCESS_LEAK');
 const blockedProjects=[];
 const zipBytes=13651455;
 const manifest=JSON.parse(readFileSync(backup+'/manifest.json','utf8'));for(const [file,sha] of Object.entries(manifest.files))if(createHash('sha256').update(readFileSync(file)).digest('hex')!==sha)fail('SOURCE_CHANGED');
 const used=db.db.prepare('SELECT value FROM counters WHERE key=?').get('trial:authorized-caibao-trial-2026-10-07').value;
 const queued=db.db.prepare("SELECT COUNT(*) AS n FROM jobs WHERE status IN ('queued','running')").get().n;
 const submissions=db.db.prepare('SELECT COUNT(*) AS n FROM submissions').get().n; if(submissions!==0)fail('UNEXPECTED_SUBMISSION');
 if(used!==25||queued!==0)fail('UNEXPECTED_DISPATCH');
 const gifts=db.db.prepare("SELECT data FROM shoot_access WHERE json_extract(data,'$.scope')='account'").all().map(r=>JSON.parse(r.data));
 for(const g of gifts){if(g.limit!==10||g.channel!==provider.channel||g.model!==provider.model)fail('GIFT_PARAMETERS');}
 const giftUsage=gifts.map(g=>ownerAccess(db,g.owner,provider).gift);
 const allAttempts=db.db.prepare('SELECT COUNT(*) n FROM attempts').get().n,priorAttempts=before.prepare('SELECT COUNT(*) n FROM attempts').get().n;
 if(allAttempts!==priorAttempts)fail('UNEXPECTED_MODEL_ATTEMPT');
 const evidence={version:health.version,buildId:readFileSync('.next/BUILD_ID','utf8').trim(),health,secret:{rootOnly:true,notInStaticBundles:true},publicVisitor:{enabled:anonymous.capability.enabled,remaining:anonymous.capability.remaining,privateProjectStatus:privateBlocked.status,giftOffered:anonymous.account.giftOffered},originalTrial:{remaining:ownerAccess(db,project.owner,provider).remaining,used},gift:{allocations:gifts.length,perAccount:10,usage:giftUsage},wrongSourceBlocked:true,otherOwnerBlocked:true,queued,submissions,modelCallsAdded:0,projects,sourceFilesMatched:Object.keys(manifest.files).length,rollbackScript:backup+'/rollback.sh'};

 writeFileSync(backup+'/verification.json',JSON.stringify(evidence,null,2),{mode:0o600});console.log(JSON.stringify(evidence));
}catch(e){console.error('V28_VERIFICATION_FAILED:'+e.message);process.exitCode=1;}
finally{if(tempSession)db.db.prepare('DELETE FROM sessions WHERE hash=?').run(tempSession);db.close();before.close();}
