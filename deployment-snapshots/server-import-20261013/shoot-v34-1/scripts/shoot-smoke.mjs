import assert from 'node:assert/strict';
import {createHash,randomUUID} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {setTimeout as pause} from 'node:timers/promises';
import sharp from 'sharp';
import {unzipSync} from 'fflate';
import {StudioStore} from '../runtime/store.mjs';
import {executeJob} from '../runtime/provider.mjs';
const origin=process.env.SMOKE_ORIGIN||'http://localhost:4196';
const base=origin+(process.env.NEXT_PUBLIC_BASE_PATH||'/studio-next')+'/api/shoot/';
let cookie='';
const request=async(url,method='GET',body,session=cookie)=>{const r=await fetch(base+url,{method,headers:{Origin:origin,...(session?{Cookie:session}:{}),...(body instanceof FormData?{}:{'Content-Type':'application/json'})},body:body instanceof FormData?body:body===undefined?undefined:JSON.stringify(body)});if(!cookie)cookie=r.headers.get('set-cookie')?.split(';')[0]||'';return r;};
assert.equal((await request('health')).status,200);
assert.match(cookie,/qjb_session_v2=/);
const p=(await (await request('projects','POST',{})).json()).project;assert.ok(p.id);
try {
 assert.equal((await request('projects/'+p.id,'GET',undefined,'qjb_session_v2='+Buffer.alloc(32,8).toString('base64url'))).status,404);
 const wrong=await fetch(base+'projects/'+p.id,{method:'PATCH',headers:{Origin:'https://wrong.invalid',Cookie:cookie,'Content-Type':'application/json'},body:JSON.stringify({})});assert.equal(wrong.status,403);
 const settings={...p.settings,title:'工程验收临时计划',direction:'alpine',format:'landscape'};
 const saved=await request('projects/'+p.id,'PATCH',{settings,revision:p.revision});assert.equal(saved.status,200);
 const current=(await saved.json()).project;
 assert.equal((await request('projects/'+p.id,'PATCH',{settings,revision:p.revision})).status,409);
 assert.equal((await request('projects/'+p.id,'PATCH',{settings:{...settings,idea:'9:16情侣照'},revision:current.revision})).status,400);
 const bad=new FormData();bad.set('file',new Blob(['not an image'],{type:'image/png'}),'bad.png');bad.set('role','identity');bad.set('consent','true');bad.set('revision',String(current.revision));assert.equal((await request('projects/'+p.id+'/references','POST',bad)).status,400);
 const bytes=await sharp({create:{width:1536,height:1024,channels:3,background:'#556677'}}).png().toBuffer();
 const form=new FormData();form.set('file',new Blob([bytes],{type:'image/png'}),'synthetic-test.png');form.set('role','identity');form.set('consent','true');form.set('revision',String(current.revision));const uploaded=await request('projects/'+p.id+'/references','POST',form);assert.equal(uploaded.status,201);
 const withRef=(await uploaded.json()).project;assert.ok(withRef.identityId);
 assert.equal((await request('projects/'+p.id+'/references','POST',form)).status,409);
 assert.equal((await (await request('projects/'+p.id)).json()).project.identityId,withRef.identityId);
 if(process.env.SMOKE_RESTART==='true') {
  assert.equal(origin,'https://zsm.cauai.fun');
  execFileSync('ssh',['cizong-hermes-1802','systemctl restart zsm-shoot-web zsm-shoot-worker'],{stdio:'pipe'});
  let ready=false;for(let i=0;i<15;i++){try{const h=await (await request('health')).json();if(h.database==='ok'&&h.worker==='online'){ready=true;break;}}catch{}await pause(1000);}assert.equal(ready,true);
 }
 const restored=(await (await request('projects/'+p.id)).json()).project;assert.equal(restored.settings.title,settings.title);assert.equal(restored.identityId,withRef.identityId);
 const photo=await request('projects/'+p.id+'/assets/'+withRef.identityId);assert.equal(photo.status,200);assert.deepEqual(Buffer.from(await photo.arrayBuffer()),bytes);
 assert.equal((await request('projects/'+p.id+'/assets/'+withRef.identityId,'GET',undefined,'qjb_session_v2='+Buffer.alloc(32,8).toString('base64url'))).status,404);
 const composition=new FormData();composition.set('file',new Blob([bytes],{type:'image/png'}),'synthetic-composition.png');composition.set('role','composition');composition.set('consent','true');composition.set('revision',String(restored.revision));
 const referenced=(await (await request('projects/'+p.id+'/references','POST',composition)).json()).project;
 assert.equal((await request('projects/'+p.id+'/references/composition','DELETE',{revision:referenced.revision},'qjb_session_v2='+Buffer.alloc(32,8).toString('base64url'))).status,404);
 assert.equal((await request('projects/'+p.id+'/references/composition','DELETE',{revision:referenced.revision-1})).status,409);
 const detached=await request('projects/'+p.id+'/references/composition','DELETE',{revision:referenced.revision});assert.equal(detached.status,200);assert.equal((await detached.json()).project.compositionId,null);
 assert.equal((await request('projects/'+p.id+'/assets/'+referenced.compositionId)).status,404);
 const gate=await request('projects/'+p.id+'/jobs','POST',{key:randomUUID(),kind:'set',revision:(await (await request('projects/'+p.id)).json()).project.revision});assert.equal(gate.status,503);assert.equal((await gate.json()).error,'GENERATION_DISABLED');
 // Only a local test database may be seeded. This is never a production generation path.
 if(process.env.SMOKE_DATA_DIR&&origin.startsWith('http://localhost:')) {
  const db=new StudioStore(process.env.SMOKE_DATA_DIR),owner=createHash('sha256').update(cookie.split('=')[1]).digest('hex');
  try {db.enqueue(owner,p.id,randomUUID());await executeJob(db,db.claim(),async({onSubmit})=>{onSubmit();return {buffer:bytes,metadata:{contentType:'image/png',width:1536,height:1024},usage:null};},{STUDIO_DAILY_REQUEST_LIMIT:'100'});}finally{db.close();}
  const results=(await (await request('projects/'+p.id)).json()).project;assert.equal(results.results.length,6);assert.equal(results.jobs[0].snapshot,undefined);
  const dl=await request('projects/'+p.id+'/download');assert.equal(dl.status,200);const zip=unzipSync(new Uint8Array(await dl.arrayBuffer()));assert.equal(Object.keys(zip).length,7);assert.deepEqual(Buffer.from(zip['cover-v1.png']),bytes);
  const changed=await request('projects/'+p.id,'PATCH',{settings:{...results.settings,direction:'coast'},revision:results.revision});assert.equal(changed.status,200);
  assert.equal((await request('projects/'+p.id+'/download')).status,400);
  const historical=await request('projects/'+p.id+'/download?revision='+results.planRevision);assert.equal(historical.status,200);
  const historicalZip=unzipSync(new Uint8Array(await historical.arrayBuffer()));const manifest=JSON.parse(new TextDecoder().decode(historicalZip['拍摄计划.json']));assert.equal(manifest.settings.direction,'alpine');assert.equal(manifest.planRevision,results.planRevision);assert.deepEqual(Buffer.from(historicalZip['cover-v1.png']),bytes);
  const review=await request('projects/'+p.id+'/results/'+results.results[0].id+'/review','POST',{identity:false,composition:false,setConsistency:false,accepted:false});assert.equal(review.status,200);
 }
 const old=await fetch(origin+(process.env.NEXT_PUBLIC_BASE_PATH||'/studio-next')+'/api/orders');assert.equal(old.status,410);
 console.log('PASS: HTTP persistence, reference upload/removal, stale removal protection, corrupt upload recovery, CSRF, isolation, gating, legacy endpoint closure'+(process.env.SMOKE_DATA_DIR?', six-shot delivery, revision-scoped ZIP/manifest and review (synthetic only)':'')+(process.env.SMOKE_RESTART==='true'?', web/worker restart preserves reference bytes and project':''));
} finally {const deleted=await request('projects/'+p.id,'DELETE');assert.equal(deleted.status,200);assert.equal((await request('projects/'+p.id)).status,404);}
