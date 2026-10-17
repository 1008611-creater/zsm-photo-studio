import assert from 'node:assert/strict';
import {createHash,randomUUID} from 'node:crypto';
import sharp from 'sharp';
import {unzipSync} from 'fflate';
import {StudioStore} from '../runtime/store.mjs';
import {storySettings} from '../runtime/recipe.mjs';
import {executeJob} from '../runtime/provider.mjs';
const origin=process.env.SMOKE_ORIGIN||'http://localhost:4207';
assert.ok(/^http:\/\/localhost:\d+$/.test(origin),'Synthetic seeding is local-only');
assert.ok(process.env.SMOKE_DATA_DIR,'An isolated test database is required');
const base=origin+'/studio-next/api/shoot/';let cookie='',id;
const foreign='qjb_session_v2='+Buffer.alloc(32,8).toString('base64url');
async function request(path,method='GET',body,session=cookie){const r=await fetch(base+path,{method,headers:{Origin:origin,...(session?{Cookie:session}:{}),...(body instanceof FormData?{}:{'Content-Type':'application/json'})},body:body===undefined?undefined:body instanceof FormData?body:JSON.stringify(body)});cookie||=r.headers.get('set-cookie')?.split(';')[0]||'';return r;}
await request('bootstrap');const owner=createHash('sha256').update(cookie.split('=')[1]).digest('hex');
const db=new StudioStore(process.env.SMOKE_DATA_DIR);
const bytes=await sharp({create:{width:1024,height:1536,channels:3,background:'#758585'}}).png().toBuffer();
const deliver=async({onSubmit})=>{onSubmit();return {buffer:bytes,metadata:{contentType:'image/png',width:1024,height:1536},usage:null};};
try{
 const created=await request('projects','POST',{settings:storySettings('scene-stealer')});assert.equal(created.status,201);let p=(await created.json()).project;id=p.id;
 for(const role of ['identity','companion','location']){const f=new FormData();f.set('file',new Blob([bytes],{type:'image/png'}),'synthetic.png');f.set('role',role);f.set('consent','true');f.set('revision',String((await (await request('projects/'+id)).json()).project.revision));assert.equal((await request('projects/'+id+'/references','POST',f)).status,201);}
 db.enqueue(owner,id,'cover','cover');await executeJob(db,db.claim(),deliver,{STUDIO_DAILY_REQUEST_LIMIT:'100'});
 for(let v=2;v<=6;v++){const previous=db.get(owner,id).results.at(-1);db.enqueue(owner,id,'v'+v,'revision','cover','仅修改角色材质',false,previous.id);await executeJob(db,db.claim(),deliver,{STUDIO_DAILY_REQUEST_LIMIT:'100'});}
 p=(await (await request('projects/'+id)).json()).project;const third=p.results.find(r=>r.version===3);
 assert.equal((await request('projects/'+id+'/continuity','POST',{resultId:third.id,revision:p.revision})).status,409);
 const review={identity:true,character:true,composition:true,setConsistency:false,accepted:false,wouldShare:true};assert.equal((await request('projects/'+id+'/results/'+third.id+'/review','POST',review)).status,200);
 assert.equal((await request('projects/'+id+'/continuity','POST',{resultId:third.id,revision:p.revision},foreign)).status,404);
 assert.equal((await request('projects/'+id+'/continuity','POST',{resultId:third.id,revision:p.revision-1})).status,409);
 const approved=await request('projects/'+id+'/continuity','POST',{resultId:third.id,revision:p.revision});assert.equal(approved.status,200);p=(await approved.json()).project;assert.equal(p.continuity.resultId,third.id);assert.equal(p.results.at(-1).version,6);
 const restored=(await (await request('projects/'+id)).json()).project;assert.deepEqual(restored.continuity,p.continuity);assert.equal(restored.results.filter(r=>r.review).length,1);
 const dl=await request('projects/'+id+'/download');assert.equal(dl.status,200);const zip=unzipSync(new Uint8Array(await dl.arrayBuffer()));assert.deepEqual(Buffer.from(zip['cover-v3.png']),bytes);assert.ok(!zip['cover-v6.png']);const manifest=JSON.parse(new TextDecoder().decode(zip['拍摄计划.json']));assert.equal(manifest.continuity.resultId,third.id);
 assert.equal((await request('projects/'+id+'/download','GET',undefined,foreign)).status,404);assert.equal((await request('projects/'+id+'/assets/'+third.assetId,'GET',undefined,foreign)).status,404);
 const gate=await request('projects/'+id+'/jobs','POST',{kind:'continuation',revision:p.revision,shotId:'place',coverResultId:third.id,key:randomUUID()});assert.equal(gate.status,503);assert.equal((await gate.json()).error,'GENERATION_DISABLED');
 assert.equal(db.jobs(id).length,6);
 console.log('PASS: explicit v3 approval with latest v6, HTTP persistence, exact master ZIP/manifest, stale revision, owner/project/image/download isolation and generation gate. Synthetic only; zero model calls.');
}finally{db.close();if(id){assert.equal((await request('projects/'+id,'DELETE')).status,200);assert.equal((await request('projects/'+id)).status,404);}}

