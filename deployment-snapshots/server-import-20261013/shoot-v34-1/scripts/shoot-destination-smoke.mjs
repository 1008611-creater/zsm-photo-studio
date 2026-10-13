import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { destinationSettings } from '../runtime/recipe.mjs';
const origin=process.env.SMOKE_ORIGIN||'http://localhost:4206';
const base=origin+(process.env.NEXT_PUBLIC_BASE_PATH||'/studio-next')+'/api/shoot/';
let cookie='',id;
async function request(path,method='GET',body,session=cookie){const r=await fetch(base+path,{method,headers:{Origin:origin,...(session?{Cookie:session}:{}),...(body instanceof FormData?{}:{'Content-Type':'application/json'})},body:body===undefined?undefined:body instanceof FormData?body:JSON.stringify(body)});cookie||=r.headers.get('set-cookie')?.split(';')[0]||'';return r;}
const bootstrap=await request('bootstrap');assert.equal(bootstrap.status,200);
const bytes=await sharp({create:{width:128,height:128,channels:3,background:'#aaaacc'}}).png().toBuffer();
try{
 const created=await request('projects','POST',{settings:destinationSettings('mercato','frog')});assert.equal(created.status,201);let p=(await created.json()).project;id=p.id;
 for(const role of ['identity','companion','location','composition']){const f=new FormData();f.set('role',role);f.set('consent','true');f.set('revision',String((await (await request('projects/'+id)).json()).project.revision));f.set('file',new Blob([bytes],{type:'image/png'}),'synthetic-role-test.png');const r=await request('projects/'+id+'/references','POST',f);assert.equal(r.status,201);p=(await r.json()).project;assert.ok(p[role+'Id']);const asset=await request('projects/'+id+'/assets/'+p[role+'Id']);assert.deepEqual(Buffer.from(await asset.arrayBuffer()),bytes);assert.equal((await request('projects/'+id+'/assets/'+p[role+'Id'],'GET',undefined,'qjb_session_v2='+Buffer.alloc(32,4).toString('base64url'))).status,404);}
 const restored=(await (await request('projects/'+id)).json()).project;assert.equal(restored.settings.placeId,'mercato');assert.equal(restored.settings.play,'frog');assert.equal(restored.references.length,4);
 const rename=await request('projects/'+id,'PATCH',{settings:{...p.settings,title:'地点角色接口验收临时项目'},revision:p.revision});assert.equal(rename.status,200);p=(await rename.json()).project;assert.equal(p.planRevision,restored.planRevision);
 const invalidCharacter=await request('projects/'+id,'PATCH',{settings:{...p.settings,characterId:'unknown-ip'},revision:p.revision});assert.equal(invalidCharacter.status,400);
 const oldCharacter=p.companionId;const selected=await request('projects/'+id,'PATCH',{settings:{...p.settings,play:'companion',characterId:'nailong'},revision:p.revision});assert.equal(selected.status,200);p=(await selected.json()).project;assert.equal(p.settings.characterId,'nailong');assert.equal(p.companionId,null);assert.equal((await request('projects/'+id+'/assets/'+oldCharacter)).status,404);const afterSwitch=(await (await request('projects/'+id)).json()).project;assert.equal(afterSwitch.settings.characterId,'nailong');assert.equal(afterSwitch.locationId,restored.locationId);
 const previousLocation=p.locationId;const change=await request('projects/'+id,'PATCH',{settings:{...p.settings,placeId:'celavi'},revision:p.revision});assert.equal(change.status,200);p=(await change.json()).project;assert.equal(p.locationId,null);assert.equal(p.companionId,null);assert.equal((await request('projects/'+id+'/assets/'+previousLocation)).status,404);
 assert.equal((await request('projects/'+id+'/references/companion','DELETE',{revision:restored.revision})).status,409);
 const remove=await request('projects/'+id+'/references/companion','DELETE',{revision:p.revision});assert.equal(remove.status,200);p=(await remove.json()).project;assert.equal(p.companionId,null);
 const invalid=await request('projects/'+id,'PATCH',{settings:{...p.settings,placeId:'fictional'},revision:p.revision});assert.equal(invalid.status,400);
 const gate=await request('projects/'+id+'/jobs','POST',{kind:'set',revision:p.revision,key:randomUUID()});assert.equal(gate.status,503);assert.equal((await gate.json()).error,'GENERATION_DISABLED');
 console.log('PASS: real place/play persistence, four private reference roles, byte preservation, isolation, title-only revision, role selection/reload, character switch detaches old asset, place switch detaches old location, stale removal, validation, disabled provider. Synthetic input only; zero provider calls.');
}finally{if(id){assert.equal((await request('projects/'+id,'DELETE')).status,200);assert.equal((await request('projects/'+id)).status,404);}}
