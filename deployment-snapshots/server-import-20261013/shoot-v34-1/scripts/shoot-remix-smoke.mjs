import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { storySettings } from '../runtime/recipe.mjs';
const origin=process.env.SMOKE_ORIGIN||'http://localhost:4209',base=origin+(process.env.NEXT_PUBLIC_BASE_PATH||'/studio-next')+'/api/shoot/';
let cookie='';const created=[];
async function request(path,method='GET',body,session=cookie){const response=await fetch(base+path,{method,headers:{Origin:origin,...(session?{Cookie:session}:{}),'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});cookie||=response.headers.get('set-cookie')?.split(';')[0]||'';return response;}
const foreign='qjb_session_v2='+Buffer.alloc(32,25).toString('base64url');
try{
 assert.equal((await request('bootstrap')).status,200);
 const response=await request('projects','POST',{settings:storySettings('tourist-director',{placeId:'west-lake'})});assert.equal(response.status,201);let p=(await response.json()).project;created.push(p.id);
 const originalRevision=p.revision;
 const denied=await request('projects/'+p.id+'/builtin-reference','POST',{role:'companion',consent:false,revision:p.revision});assert.equal(denied.status,400);
 assert.equal((await request('projects/'+p.id+'/prepare-references','POST',{consent:false,revision:p.revision})).status,400);
 assert.equal((await request('projects/'+p.id+'/prepare-references','POST',{consent:true,revision:p.revision},foreign)).status,404);
 const prepared=await request('projects/'+p.id+'/prepare-references','POST',{consent:true,revision:p.revision});assert.equal(prepared.status,200);p=(await prepared.json()).project;
 assert.ok(p.companionId&&p.locationId);assert.equal(p.revision,originalRevision+1);
 const repeat=(await (await request('projects/'+p.id+'/prepare-references','POST',{consent:true,revision:p.revision})).json()).project;assert.equal(repeat.revision,p.revision);assert.equal(repeat.companionId,p.companionId);assert.equal(repeat.references.length,2);
 assert.equal((await request('projects/'+p.id+'/prepare-references','POST',{consent:true,revision:originalRevision})).status,409);
 const bytes=Buffer.from(await (await request('projects/'+p.id+'/assets/'+p.locationId)).arrayBuffer());const hash=createHash('sha256').update(bytes).digest('hex');assert.equal(hash,createHash('sha256').update(readFileSync('public/places/west-lake-v16.jpg')).digest('hex'));
 assert.equal((await request('projects/'+p.id+'/builtin-reference','POST',{role:'location',consent:true,revision:originalRevision})).status,409);
 assert.equal((await request('projects/'+p.id+'/builtin-reference','POST',{role:'location',consent:true,revision:p.revision,url:'https://example.test/private'})).status,400);
 assert.equal((await request('projects/'+p.id+'/remix','POST',{revision:p.revision},foreign)).status,404);
 const remixed=await request('projects/'+p.id+'/remix','POST',{revision:p.revision,planRevision:p.planRevision});assert.equal(remixed.status,201);const copy=(await remixed.json()).project;created.push(copy.id);assert.deepEqual(copy.settings,p.settings);assert.notEqual(copy.locationId,p.locationId);assert.deepEqual(copy.results,[]);assert.deepEqual(copy.jobs,[]);assert.deepEqual((await (await request('projects/'+copy.id+'/costs')).json()).attempts,[]);
 assert.equal((await request('projects/'+copy.id+'/assets/'+copy.locationId,'GET',undefined,foreign)).status,404);
 const download=await request('projects/'+copy.id+'/assets/'+copy.locationId+'?download=1');assert.equal(download.status,200);assert.match(download.headers.get('content-disposition'),/^attachment/);assert.equal(createHash('sha256').update(Buffer.from(await download.arrayBuffer())).digest('hex'),hash);
 const reopened=(await (await request('projects/'+copy.id)).json()).project;assert.equal(reopened.locationId,copy.locationId);assert.equal(reopened.companionId,copy.companionId);
 const generation=await request('projects/'+copy.id+'/jobs','POST',{key:randomUUID(),kind:'cover',revision:copy.revision});assert.equal(generation.status,503);assert.equal((await generation.json()).error,'GENERATION_DISABLED');
 console.log('PASS: atomic builtin preparation, idempotent repeat, explicit consent, original SHA256, stale rejection, no arbitrary URL, private remix/reopen/download, cross-session 404, no generation or charges.');
}finally{for(const id of created)assert.equal((await request('projects/'+id,'DELETE')).status,200);}
