import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { storySettings } from '../runtime/recipe.mjs';
import { storyLink, readStoryLink } from '../runtime/stories.mjs';
const origin=process.env.SMOKE_ORIGIN||'http://localhost:4206';
const base=origin+(process.env.NEXT_PUBLIC_BASE_PATH||'/studio-next')+'/api/shoot/';
let cookie='';const ids=[];
async function request(path,method='GET',body,session=cookie){const r=await fetch(base+path,{method,headers:{Origin:origin,...(session?{Cookie:session}:{}),'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});cookie||=r.headers.get('set-cookie')?.split(';')[0]||'';return r;}
try{
 assert.equal((await request('bootstrap')).status,200);
 const created=await request('projects','POST',{settings:storySettings('slow-travel')});assert.equal(created.status,201);let p=(await created.json()).project;ids.push(p.id);
 const options={...p.settings,story:{...p.settings.story,energy:'wild',camera:'flash',relationship:'i-care'},idea:'private idea, excluded from remix'};
 const changed=await request('projects/'+p.id,'PATCH',{settings:options,revision:p.revision});assert.equal(changed.status,200);p=(await changed.json()).project;
 const restored=(await (await request('projects/'+p.id)).json()).project;assert.equal(restored.settings.story.camera,'flash');assert.equal(restored.recipe.id,'story-six');
 for(const settings of [{...options,story:{...options.story,version:9}},{...options,placeId:'mercato'},{...options,placeId:'paris'},{...options,story:{...options.story,energy:'random'}}])assert.equal((await request('projects/'+p.id,'PATCH',{settings,revision:p.revision})).status,400);
 assert.equal((await request('projects/'+p.id,'GET',undefined,'qjb_session_v2='+Buffer.alloc(32,19).toString('base64url'))).status,404);
 const same=storyLink(options,origin+'/studio-next/studio?project='+p.id);assert.ok(!same.includes(p.id));assert.ok(!same.includes('private'));assert.equal(readStoryLink(same).status,'valid');
 const next=await request('projects/'+p.id+'/sequel','POST',{placeId:'mercato',revision:p.revision,reuseReferences:true});assert.equal(next.status,201);const sequel=(await next.json()).project;ids.push(sequel.id);assert.equal(sequel.settings.story.id,'dinner-crasher');assert.equal(sequel.settings.idea,'');assert.equal(sequel.identityId,null);assert.equal(sequel.consent,false);
 assert.equal((await request('projects/'+p.id+'/sequel','POST',{placeId:'mercato',revision:p.revision,reuseReferences:false})).status,400);
 for(const kind of ['cover','set']){const r=await request('projects/'+p.id+'/jobs','POST',{kind,revision:p.revision,key:randomUUID()});assert.equal(r.status,503);assert.equal((await r.json()).error,'GENERATION_DISABLED');}
 assert.equal((await request('projects/'+p.id+'/featured-result','POST',{resultId:randomUUID()})).status,404);
 console.log('PASS: story create/save/reload, strict option/version/place/daylight validation, private session isolation, recipe-only remix, explicit sequel reuse contract, generation disabled for cover and set. Zero provider calls.');
}finally{for(const id of ids){assert.equal((await request('projects/'+id,'DELETE')).status,200);assert.equal((await request('projects/'+id)).status,404);}}
