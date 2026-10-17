// One explicitly authorized private cover. No public generation flag or credential file.
import { readFileSync, writeFileSync, mkdirSync, existsSync, openSync, closeSync, unlinkSync, renameSync, statSync, realpathSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { StudioStore } from '../runtime/store.mjs';
import { compileShot, MODEL, FORMATS } from '../runtime/recipe.mjs';
import { referencePlan } from '../runtime/destinations.mjs';
import { builtinReference } from '../runtime/builtin-references.mjs';
import { inspectImage } from '../runtime/provider.mjs';
import { diagnosticHeaders, diagnosticError } from '../runtime/cover-experiment.mjs';
export const CONTROLLED_COVER = Object.freeze({
 id:'caibao-bund-v20-controlled-cover-v1',sourceProjectId:'bba938a1-2c2f-44da-81dc-7892c8a50c97',
 identitySha256:'be83e54c1b496743d3837adc992dded13bd8db0c27c83423c86e3148a13ef55f',
 companionSha256:'81c6135152d960a1eb65cc23f7179866ec946691081cb43e676ac59175e6113b',
 locationSha256:'a9f7a8a8d13a75407f0fd1fbd009bb47f8f9c295ed3d100d1406a5bf4b0dd8ea',
 counterKey:'trial:authorized-caibao-trial-2026-10-07',limit:100,size:'1024x1536',quality:'high',automaticRetries:0
});
export const CONTROLLED_PLACE = Object.freeze({...CONTROLLED_COVER,id:'caibao-bund-v20-controlled-place-v1',projectId:'e0c7c19a-951e-433c-b362-e8a8f0ab739e',coverResultId:'5bb46501-c16c-4abf-93f4-2d34ed2a8334',continuitySha256:'d3a876d8ba7b6eca9e5e577762634bcb1eac5e5f535733f18834bff2c76bd289',shotId:'place',channel:'OpenLux',model:'gpt-image-2.5-sunburst-c'});
export const CONTROLLED_PORTRAIT = Object.freeze({...CONTROLLED_PLACE,id:'caibao-bund-v20-controlled-portrait-v1',shotId:'portrait',previousResultId:'1212c01a-a935-4871-839e-520089e55c9a',previousSha256:'feafbb2b0596707bad250d549f26167f17eefdc5ba66ef3f3ebfadac66d22cb6'});
export const CONTROLLED_MOTION = Object.freeze({...CONTROLLED_PORTRAIT,id:'caibao-bund-v20-controlled-motion-v1',shotId:'motion',previousShotId:'portrait',previousResultId:'845ff46c-0fad-41b9-a27f-dd1bdaff053b',previousSha256:'9849aa2b5867d8dfdcfc6a8c5d88e720832c8ee9aa45d678df23d47ce39d27af',approvalText:'认可',approvalScope:'user approved portrait identity, character and scene continuity'});
export const CONTROLLED_PAUSE = Object.freeze({...CONTROLLED_MOTION,id:'caibao-bund-v20-controlled-pause-v1',shotId:'pause',previousShotId:'motion',previousResultId:'613e475a-3c53-4eb9-8622-2da69c044904',previousSha256:'44a9617aefe34e1537622d9c5da1bb223450e5881931edee9757dc7e4fcbb738',approvalText:'继续',approvalScope:'user continued after reviewing the motion candidate'});
export const CONTROLLED_DETAIL = Object.freeze({...CONTROLLED_PAUSE,id:'caibao-bund-v20-controlled-detail-v1',shotId:'detail',previousShotId:'pause',previousResultId:'3a4f2920-0422-4a09-97cc-ba934a21517c',previousSha256:'9e78ed6f0bdd4d033f8affc5f3ef96fe68c1be1263f2a49476895ff374fd97f8',approvalText:'确认',approvalScope:'user confirmed the displayed pause candidate, including disclosed gaze and surface-grain limitations'});
export const CONTROLLED_REPEAT = Object.freeze({...CONTROLLED_COVER,id:'caibao-bund-v20-controlled-repeat-v1',mode:'repeat',sourceProjectId:'e0c7c19a-951e-433c-b362-e8a8f0ab739e',channel:'OpenLux',model:'gpt-image-2.5-sunburst-c',title:'蔡宝 × 奶蛙 · 配方独立复现 01',approvalText:'认可 继续',expectedPromptHash:'dd39324f7cc48da544f268bf3fa4eaa0cbe9005ba14fff31cfed8a8f18a6f9ab',acceptedResults:[{"shotId": "cover", "resultId": "5bb46501-c16c-4abf-93f4-2d34ed2a8334", "sha256": "d3a876d8ba7b6eca9e5e577762634bcb1eac5e5f535733f18834bff2c76bd289"}, {"shotId": "place", "resultId": "1212c01a-a935-4871-839e-520089e55c9a", "sha256": "feafbb2b0596707bad250d549f26167f17eefdc5ba66ef3f3ebfadac66d22cb6"}, {"shotId": "portrait", "resultId": "845ff46c-0fad-41b9-a27f-dd1bdaff053b", "sha256": "9849aa2b5867d8dfdcfc6a8c5d88e720832c8ee9aa45d678df23d47ce39d27af"}, {"shotId": "motion", "resultId": "613e475a-3c53-4eb9-8622-2da69c044904", "sha256": "44a9617aefe34e1537622d9c5da1bb223450e5881931edee9757dc7e4fcbb738"}, {"shotId": "pause", "resultId": "3a4f2920-0422-4a09-97cc-ba934a21517c", "sha256": "9e78ed6f0bdd4d033f8affc5f3ef96fe68c1be1263f2a49476895ff374fd97f8"}, {"shotId": "detail", "resultId": "6583c2e9-ab5e-4dee-a2c4-b5486d048e49", "sha256": "61982f754ede4c29b2ebd427b9780d29ad1b34bd03da0c0a53f65c743b7635ae"}]});
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
function fail(code){throw Error(code);}
function saveJournal(path,journal){const temporary=path+'.tmp';writeFileSync(temporary,JSON.stringify(journal,null,2),{mode:0o600});renameSync(temporary,path);}
function sourceProject(db,id){const row=db.db.prepare('SELECT data FROM projects WHERE id=?').get(id);if(!row)fail('SOURCE_NOT_FOUND');return JSON.parse(row.data);}
function checkedReferences(db,p,contract){
 const references=referencePlan(p,contract.shotId||'cover');if(references.map(r=>r.role).join(',')!==(contract.shotId?'identity,continuity,companion,location':'identity,companion,location'))fail('REFERENCE_ROLES');
 return references.map(ref=>{const a=db.asset(p.owner,p.id,ref.id),buffer=db.readAsset(a),hash=sha(buffer);
  if(a.sha256!==hash||hash!==contract[ref.role+'Sha256'])fail('REFERENCE_CHANGED');
  return {...a,role:ref.role,buffer};
 });
}
export async function prepareControlledCover(db,directory,contract=CONTROLLED_COVER){
 mkdirSync(directory,{recursive:true,mode:0o700});const path=join(directory,'request.json');
 if(existsSync(path)){const saved=JSON.parse(readFileSync(path,'utf8'));if(saved.id!==contract.id)fail('SCOPE_CHANGED');return saved;}
 const source=sourceProject(db,contract.sourceProjectId);
 if(source.settings.placeId!=='bund'||source.settings.characterId!=='naiwa'||source.settings.format!=='portrait'||!source.consent)fail('SOURCE_SCOPE');
 const refs=checkedReferences(db,source,contract);for(const ref of refs)await inspectImage(ref.buffer);
 let p=db.remix(source.owner,source.id,source.revision,source.planRevision);
 p=db.update(source.owner,p.id,{...p.settings,title:contract.title||'蔡宝 × 奶蛙 · 受控封面验证'},p.revision);
 const builtin=builtinReference(p.settings,'companion');
 p=db.addBuiltinReference(source.owner,p.id,'companion',builtin.buffer,{...await inspectImage(builtin.buffer),...builtin.metadata},true,p.revision);
 const actual=db.get(source.owner,p.id),images=checkedReferences(db,actual,contract);
 const facts=images.map(a=>({id:a.id,role:a.role,sha256:a.sha256,builtin:a.builtin===true}));
 const snapshot={...actual,referenceFacts:facts};const prompt=compileShot(snapshot,'cover');if(contract.expectedPromptHash&&sha(prompt)!==contract.expectedPromptHash)fail('PROMPT_CHANGED');
 const journal={id:contract.id,createdAt:new Date().toISOString(),sourceProjectId:source.id,projectId:p.id,revision:p.revision,planRevision:p.planRevision,recipe:p.recipe,phase:'prepared-no-dispatch',prompt,promptHash:sha(prompt),references:facts,settings:p.settings,quality:'high',size:contract.size,n:1,automaticRetries:0,approvedDispatchLimit:contract.limit,requests:[],humanReview:null};
 writeFileSync(path,JSON.stringify(journal,null,2),{flag:'wx',mode:0o600});return journal;
}
export async function prepareControlledContinuation(db,directory,approval,contract=CONTROLLED_PLACE){
 if(!approval||approval.text!=='没问题的'||approval.source!=='user-chat')fail('USER_APPROVAL_REQUIRED');
 mkdirSync(directory,{recursive:true,mode:0o700});const path=join(directory,'request.json');
 if(existsSync(path)){const saved=JSON.parse(readFileSync(path,'utf8'));if(saved.id!==contract.id)fail('SCOPE_CHANGED');return saved;}
 const p=sourceProject(db,contract.projectId),cover=p.results.find(r=>r.id===contract.coverResultId);
 if(!cover||cover.shotId!=='cover'||cover.planRevision!==p.planRevision)fail('COVER_CHANGED');
 const asset=db.asset(p.owner,p.id,cover.assetId),generation=asset.generation;
 if(sha(db.readAsset(asset))!==contract.continuitySha256||generation?.channel!==contract.channel||generation?.model!==contract.model||generation.quality!=='high'||generation.size!==contract.size)fail('COVER_CHANGED');
 checkedReferences(db,{...p,continuity:{assetId:asset.id}},contract);
 // This review records the user's approval of this exact cover, not of future images.
 db.review(p.owner,p.id,cover.id,{identity:true,character:true,composition:true,setConsistency:false,accepted:true,wouldShare:true});
 db.approveCover(p.owner,p.id,cover.id,p.revision);
 // Store the user's exact approval evidence alongside the inherited saved provenance.
 db.transaction(()=>{const fresh=db.get(p.owner,p.id);Object.assign(fresh.continuity,{approvalEvidence:{...approval,at:new Date().toISOString(),resultId:cover.id,meaning:'cover approved for saved master; no endorsement of future shots'}});db.write(fresh);});
 const actual=db.get(p.owner,p.id);db.verifyContinuity(actual);const images=checkedReferences(db,actual,contract);
 const facts=images.map(a=>({id:a.id,role:a.role,sha256:a.sha256,builtin:a.builtin===true}));
 const prompt=compileShot({...actual,referenceFacts:facts},contract.shotId);
 const journal={id:contract.id,createdAt:new Date().toISOString(),projectId:p.id,coverResultId:cover.id,shotId:contract.shotId,revision:actual.revision,planRevision:actual.planRevision,recipe:actual.recipe,phase:'prepared-no-dispatch',prompt,promptHash:sha(prompt),references:facts,settings:actual.settings,quality:'high',size:contract.size,n:1,automaticRetries:0,approvedDispatchLimit:contract.limit,requests:[],coverApproval:approval,humanReview:null};
 writeFileSync(path,JSON.stringify(journal,null,2),{flag:'wx',mode:0o600});return journal;
}
export async function prepareControlledNextShot(db,directory,approval,contract=CONTROLLED_PORTRAIT){
 if(approval?.text!==(contract.approvalText||'没问题')||approval?.source!=='user-chat')fail('USER_APPROVAL_REQUIRED');
 mkdirSync(directory,{recursive:true,mode:0o700});const path=join(directory,'request.json');
 if(existsSync(path)){const saved=JSON.parse(readFileSync(path,'utf8'));if(saved.id!==contract.id)fail('SCOPE_CHANGED');return saved;}
 const p=sourceProject(db,contract.projectId);db.verifyContinuity(p);
 if(p.continuity.resultId!==contract.coverResultId||p.continuity.channel!==contract.channel||p.continuity.model!==contract.model)fail('COVER_CHANGED');
 const previous=p.results.find(r=>r.id===contract.previousResultId&&r.shotId===(contract.previousShotId||'place')&&r.planRevision===p.planRevision&&r.continuityResultId===contract.coverResultId);
 if(!previous||sha(db.readAsset(db.asset(p.owner,p.id,previous.assetId)))!==contract.previousSha256)fail('PREVIOUS_CHANGED');
 if(db.active(p.id))fail('ACTIVE_JOB');
 const images=checkedReferences(db,p,contract),facts=images.map(a=>({id:a.id,role:a.role,sha256:a.sha256,builtin:a.builtin===true}));
 const prompt=compileShot({...p,referenceFacts:facts},contract.shotId);
 db.review(p.owner,p.id,previous.id,{identity:true,character:true,composition:true,setConsistency:true,accepted:true});
 db.transaction(()=>{const fresh=db.get(p.owner,p.id);fresh.results.find(r=>r.id===previous.id).review.evidence={...approval,scope:contract.approvalScope||'user accepted this candidate despite operator noting limited environmental framing',at:new Date().toISOString()};db.write(fresh);});
 const journal={id:contract.id,createdAt:new Date().toISOString(),projectId:p.id,coverResultId:contract.coverResultId,previousResultId:previous.id,shotId:contract.shotId,revision:p.revision,planRevision:p.planRevision,recipe:p.recipe,phase:'prepared-no-dispatch',prompt,promptHash:sha(prompt),references:facts,settings:p.settings,quality:'high',size:contract.size,n:1,automaticRetries:0,approvedDispatchLimit:contract.limit,requests:[],previousApproval:approval,humanReview:null};
 writeFileSync(path,JSON.stringify(journal,null,2),{flag:'wx',mode:0o600});return journal;
}
export async function prepareControlledRepeat(db,directory,approval,contract=CONTROLLED_REPEAT){
 if(approval?.text!==contract.approvalText||approval?.source!=='user-chat'||contract.mode!=='repeat')fail('USER_APPROVAL_REQUIRED');
 const path=join(directory,'request.json');if(existsSync(path)){const j=JSON.parse(readFileSync(path,'utf8'));if(j.id!==contract.id)fail('SCOPE_CHANGED');return j;}
 const source=sourceProject(db,contract.sourceProjectId);if(db.active(source.id))fail('ACTIVE_JOB');db.verifyContinuity(source);
 if(contract.acceptedResults.length!==6||contract.acceptedResults.map(r=>r.shotId).join(',')!=='cover,place,portrait,motion,pause,detail')fail('SET_CHANGED');
 for(const expected of contract.acceptedResults){const r=source.results.find(r=>r.id===expected.resultId&&r.shotId===expected.shotId&&r.planRevision===source.planRevision);if(!r||sha(db.readAsset(db.asset(source.owner,source.id,r.assetId)))!==expected.sha256)fail('SET_CHANGED');if(r.shotId!=='detail'&&!r.review?.accepted)fail('SET_REVIEW_REQUIRED');}
 const refs=checkedReferences(db,source,contract),facts=refs.map(a=>({id:a.id,role:a.role,sha256:a.sha256,builtin:a.builtin===true}));
 if(sha(compileShot({...source,referenceFacts:facts},'cover'))!==contract.expectedPromptHash)fail('PROMPT_CHANGED');
 const last=contract.acceptedResults.at(-1);db.review(source.owner,source.id,last.resultId,{identity:true,character:true,composition:true,setConsistency:true,accepted:true});
 db.transaction(()=>{const fresh=db.get(source.owner,source.id);const evidence={...approval,at:new Date().toISOString(),scope:'user accepted final shot and entire six-shot continuity',resultIds:contract.acceptedResults.map(r=>r.resultId)};fresh.results.find(r=>r.id===last.resultId).review.evidence=evidence;fresh.setReview={accepted:true,evidence};db.write(fresh);});
 const journal=await prepareControlledCover(db,directory,contract);journal.repeatApproval=approval;journal.repeatOf={projectId:source.id,resultIds:contract.acceptedResults.map(r=>r.resultId)};saveJournal(path,journal);return journal;
}
async function readBody(response,max=32*1024*1024){let total=0;const chunks=[];for await(const part of response.body||[]){total+=part.length;if(total>max)fail('RESPONSE_SIZE');chunks.push(Buffer.from(part));}return Buffer.concat(chunks);}
export async function dispatchControlledCover(db,directory,credentials,{fetcher=fetch,contract=CONTROLLED_COVER}={}){
 const path=join(directory,'request.json'),journal=JSON.parse(readFileSync(path,'utf8'));
 if(journal.id!==contract.id)fail('SCOPE_CHANGED');
 const {channel,apiKey,baseUrl,ledgerBefore,dispatchTotal,acknowledgeUncertain=false}=credentials;
 if(!['McGrox','OpenLux'].includes(channel)||typeof apiKey!=='string'||!apiKey)fail('CHANNEL_CONFIG');
 const prior=journal.requests.find(r=>r.channel===channel);
 if(prior)return {status:'already-recorded-no-dispatch',projectId:journal.projectId,request:prior};
 if(journal.phase==='candidate-awaiting-user-review')fail('USER_REVIEW_REQUIRED');
 if(contract.shotId&&(channel!==contract.channel||!acknowledgeUncertain))fail('CONTINUATION_CHANNEL_REQUIRED');
 const explicitRepeat=contract.mode==='repeat'&&contract.channel==='OpenLux'&&contract.model==='gpt-image-2.5-sunburst-c'&&journal.repeatApproval?.text===contract.approvalText&&journal.repeatApproval?.source==='user-chat'&&journal.repeatOf?.projectId===contract.sourceProjectId&&journal.promptHash===contract.expectedPromptHash;
 if(contract.mode==='repeat'&&(!explicitRepeat||channel!==contract.channel||!acknowledgeUncertain))fail('REPEAT_AUTHORIZATION_REQUIRED');
 if(channel==='OpenLux'&&!contract.shotId&&!explicitRepeat&&(!acknowledgeUncertain||!journal.requests.some(r=>r.channel==='McGrox'&&r.status==='recoverable'&&r.httpStatus>=500)))fail('EXPLICIT_FALLBACK_REQUIRED');
 if(channel==='McGrox'&&journal.requests.length)fail('NO_AUTOMATIC_RETRY');
 const base=new URL(baseUrl);if(base.protocol!=='https:'||!(channel==='McGrox'?['mcgrox.top','www.mcgrox.top']:['api.openlux.ai']).includes(base.hostname)||base.pathname!=='/v1'||base.search||base.hash||base.username||base.password)fail('CHANNEL_CONFIG');
 const model=channel==='McGrox'?MODEL:'gpt-image-2.5-sunburst-c';
 if(!Number.isInteger(ledgerBefore)||!Number.isInteger(dispatchTotal)||dispatchTotal!==ledgerBefore+1||dispatchTotal>contract.limit)fail('AUTHORIZATION_BUDGET');
 const p=sourceProject(db,journal.projectId);if(p.revision!==journal.revision||p.planRevision!==journal.planRevision)fail('STALE_PLAN');
 const images=checkedReferences(db,p,contract);const facts=images.map(a=>({id:a.id,role:a.role,sha256:a.sha256,builtin:a.builtin===true}));
 const shotId=contract.shotId||'cover';
 if(contract.shotId){db.verifyContinuity(p);if(p.continuity.resultId!==contract.coverResultId||p.continuity.channel!==channel||p.continuity.model!==model)fail('COVER_CHANGED');}
 const prompt=compileShot({...p,referenceFacts:facts},shotId);if(sha(prompt)!==journal.promptHash)fail('PROMPT_CHANGED');
 const current=db.db.prepare('SELECT value FROM counters WHERE key=?').get(contract.counterKey)?.value||0;
 if(current>ledgerBefore)fail('LEDGER_CHANGED');
 db.transaction(()=>db.db.prepare('INSERT INTO counters VALUES(?,?,?) ON CONFLICT(key) DO UPDATE SET value=max(value,excluded.value),expires=max(expires,excluded.expires)').run(contract.counterKey,ledgerBefore,Date.now()+10*365*86400000));
 const key=contract.id+'-'+channel.toLowerCase();
 const old=db.jobs(p.id).find(j=>j.requestKey===key);if(old)fail('RECORDED_JOB_NO_REDISPATCH');
 // Public worker is disabled throughout. The SSH operator explicitly runs this single held job.
 const job=db.enqueue(p.owner,p.id,key,contract.shotId?'continuation':'cover',contract.shotId||null,'',acknowledgeUncertain,null,contract.coverResultId||null,p.revision);
 job.status='running';job.operatorGeneration={channel,model,quality:'high',size:contract.size,scope:contract.id,automaticRetries:0};db.writeJob(job);
 const attempt=db.attempt(job.id,shotId,journal.promptHash);
 Object.assign(attempt,{channel,model,quality:'high',size:contract.size,references:facts});db.writeAttempt(attempt);
 const record={channel,model,quality:'high',size:contract.size,jobId:job.id,attemptId:attempt.id,status:'prepared',startedAt:new Date().toISOString(),dispatchTotal,automaticRetries:0,promptHash:journal.promptHash,cost:null,costSource:'unknown',acknowledgeUncertain};
 journal.requests.push(record);journal.phase='running';saveJournal(path,journal);
 let submitted=false;
 try{
  const form=new FormData();for(const [k,v]of Object.entries({model,prompt,n:'1',quality:'high',size:contract.size,response_format:'b64_json'}))form.set(k,v);
  for(const image of images)form.append('image[]',new Blob([image.buffer],{type:image.contentType}),'reference.'+image.contentType.split('/')[1]);
  db.budget(contract.counterKey,contract.limit,10*365*86400000);
  const count=db.db.prepare('SELECT value FROM counters WHERE key=?').get(contract.counterKey)?.value;
  if(count!==dispatchTotal)fail('LEDGER_CHANGED');
  submitted=true;attempt.status='submitted';db.writeAttempt(attempt);record.status='submitted';saveJournal(path,journal);
  const started=Date.now();const response=await fetcher(baseUrl+'/images/edits',{method:'POST',headers:{Authorization:'Bearer '+apiKey},body:form,signal:AbortSignal.timeout(240000),redirect:'error'});
  record.httpStatus=response.status;record.elapsedMs=Date.now()-started;record.headers=diagnosticHeaders(response.headers);saveJournal(path,journal);
  let data;try{data=JSON.parse((await readBody(response)).toString('utf8'));}catch(e){if(e.message==='RESPONSE_SIZE')throw e;fail(response.status>=500?'UPSTREAM_UNCERTAIN':'MALFORMED_RESPONSE');}
  Object.assign(record,diagnosticError(data.error));
  if(!response.ok)fail(response.status>=500?'UPSTREAM_UNCERTAIN':response.status===429?'UPSTREAM_RATE_LIMIT':'UPSTREAM_REJECTED');
  if(typeof data.data?.[0]?.b64_json!=='string')fail('BASE64_CONTRACT_REQUIRED');
  const output=Buffer.from(data.data[0].b64_json,'base64');
  // Retain every returned candidate before validation, including malformed/wrong-size images.
  const candidate=channel.toLowerCase()+'-output.bin';writeFileSync(join(directory,candidate),output,{flag:'wx',mode:0o600});
  record.candidateFile=candidate;record.outputSha256=sha(output);record.outputBytes=output.length;saveJournal(path,journal);
  const metadata=await inspectImage(output,20*1024*1024);if(metadata.width!==FORMATS[p.settings.format].width||metadata.height!==FORMATS[p.settings.format].height)fail('OUTPUT_DIMENSIONS');
  attempt.status='received';attempt.usage=data.usage?Object.fromEntries(Object.entries(data.usage).filter(([k,v])=>['input_tokens','output_tokens','total_tokens'].includes(k)&&typeof v==='number')):null;db.writeAttempt(attempt);
  const generation={channel,model,quality:'high',size:contract.size,promptHash:journal.promptHash,referenceHashes:facts.map(r=>({role:r.role,sha256:r.sha256}))};
  const result=db.finishShot(job,shotId,output,{...metadata,generation},attempt.id);
  db.transaction(()=>{const fresh=db.get(p.owner,p.id);fresh.results.find(r=>r.id===result.id).generation=generation;db.write(fresh);});
  attempt.status='saved';attempt.elapsedMs=Date.now()-attempt.startedAt;db.writeAttempt(attempt);
  const finished=db.getJob(job.id);finished.status='succeeded';db.writeJob(finished);
  Object.assign(record,{status:'succeeded',resultId:result.id,assetId:result.assetId,width:metadata.width,height:metadata.height,elapsedMs:attempt.elapsedMs});journal.phase='candidate-awaiting-user-review';
 }catch(e){
  const allowed=['AUTHORIZATION_BUDGET','LEDGER_CHANGED','UPSTREAM_UNCERTAIN','UPSTREAM_RATE_LIMIT','UPSTREAM_REJECTED','BASE64_CONTRACT_REQUIRED','MALFORMED_RESPONSE','RESPONSE_SIZE','OUTPUT_DIMENSIONS','IMAGE_SIZE','IMAGE_FORMAT'];
  const code=allowed.includes(e.message)?e.message:submitted?'REQUEST_UNCERTAIN':'PREPARATION_FAILED';
  attempt.status=submitted?'unknown':'failed';attempt.error=code;attempt.elapsedMs=Date.now()-attempt.startedAt;db.writeAttempt(attempt);
  const failed=db.getJob(job.id);failed.status=submitted?'recoverable':'failed';failed.error=code;db.writeJob(failed);record.status=failed.status;record.error=code;record.elapsedMs=attempt.elapsedMs;journal.phase='failed-awaiting-operator-inspection';
 }
 saveJournal(path,journal);return {status:record.status,projectId:p.id,request:record,phase:journal.phase};
}
async function main(){
 const [command]=process.argv.slice(2),match=/^(prepare|dispatch|status)(?:-(place|portrait|motion|pause|detail|repeat))?$/.exec(command||'');if(!match)fail('ACTION_REQUIRED');
 const action=match[1],stage=match[2],contract=stage==='repeat'?CONTROLLED_REPEAT:stage==='detail'?CONTROLLED_DETAIL:stage==='pause'?CONTROLLED_PAUSE:stage==='motion'?CONTROLLED_MOTION:stage==='portrait'?CONTROLLED_PORTRAIT:stage==='place'?CONTROLLED_PLACE:CONTROLLED_COVER;
 const dataDirectory='/var/lib/zsm-photo-shoot';
 // Private assets are mode 0600: use the web service identity, never root.
 if(process.getuid&&process.getuid()!==statSync(dataDirectory).uid)fail('SERVICE_USER_REQUIRED');
 const directory=resolve(dataDirectory,'operator',contract.id);
 mkdirSync(directory,{recursive:true,mode:0o700});const lock=join(directory,'operator.lock');let handle;
 try{handle=openSync(lock,'wx',0o600);}catch{fail('OPERATOR_LOCKED_NO_RETRY');}
 const db=new StudioStore('/var/lib/zsm-photo-shoot');
 try{
  const health=await (await fetch('http://127.0.0.1:4196/studio-next/api/shoot/health')).json();if(health.generation!==false)fail('PUBLIC_GENERATION_MUST_REMAIN_CLOSED');
  if(action==='prepare'){const j=stage==='repeat'?await prepareControlledRepeat(db,directory,{text:contract.approvalText,source:'user-chat'},contract):['portrait','motion','pause','detail'].includes(stage)?await prepareControlledNextShot(db,directory,{text:contract.approvalText||'没问题',source:'user-chat'},contract):stage==='place'?await prepareControlledContinuation(db,directory,{text:'没问题的',source:'user-chat'},contract):await prepareControlledCover(db,directory);console.log(JSON.stringify({status:j.phase,projectId:j.projectId,promptHash:j.promptHash,references:j.references.map(r=>({role:r.role,sha256:r.sha256})),requests:j.requests.length}));}
  if(action==='status'){const j=JSON.parse(readFileSync(join(directory,'request.json'),'utf8'));console.log(JSON.stringify({status:j.phase,projectId:j.projectId,requests:j.requests,humanReview:j.humanReview}));}
  if(action==='dispatch'){let input='';for await(const chunk of process.stdin){input+=chunk;if(input.length>16000)fail('INPUT_SIZE');}const credentials=JSON.parse(input);const result=await dispatchControlledCover(db,directory,credentials,{contract});console.log(JSON.stringify(result));if(!['succeeded','already-recorded-no-dispatch'].includes(result.status))process.exitCode=2;}
 }finally{db.close();closeSync(handle);unlinkSync(lock);}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(realpathSync(process.argv[1])).href)main().catch(()=>{console.error('CONTROLLED_COVER_STOPPED; inspect private journal before any further dispatch');process.exitCode=1;});
