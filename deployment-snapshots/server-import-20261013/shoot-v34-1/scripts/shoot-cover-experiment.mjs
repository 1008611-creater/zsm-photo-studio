import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {StudioStore} from '../runtime/store.mjs';
import {MODEL,FORMATS} from '../runtime/recipe.mjs';
import {referencePlan} from '../runtime/destinations.mjs';
import {inspectImage,executeJob} from '../runtime/provider.mjs';
import {COVER_EXPERIMENT,compileCoverExperiment,diagnosticHeaders,diagnosticError} from '../runtime/cover-experiment.mjs';
const [projectId,factor]=process.argv.slice(2);
if(projectId!=='48db9955-574b-434d-8450-4adcdabb7182'||!COVER_EXPERIMENT.factors[factor])throw Error('EXPERIMENT_ARGUMENTS');
const store=new StudioStore(resolve('.scratch/iteration-test-data'));
const evidence=resolve('.scratch/delivery-evidence');mkdirSync(evidence,{recursive:true});
const scope='authorized-caibao-trial-2026-10-07',counterKey='trial:'+scope;
const key=scope+'-'+COVER_EXPERIMENT.id+'-'+factor;
const prefix=resolve(evidence,'controlled-'+factor+'-v1');
try {
 const row=store.db.prepare('SELECT data FROM projects WHERE id=?').get(projectId);if(!row)throw Error('PROJECT_NOT_FOUND');
 const project=JSON.parse(row.data),prior=store.jobs(projectId).find(j=>j.requestKey===key);
 if(prior){console.log(JSON.stringify({status:'already-recorded-no-dispatch',factor,jobId:prior.id,jobStatus:prior.status}));process.exitCode=0;}
 else {
  const parent=project.results.find(r=>r.id===COVER_EXPERIMENT.parentResultId);if(!parent)throw Error('PARENT_REQUIRED');
  if(project.people!==1||project.settings.placeId!=='bund'||project.settings.characterId!=='naiwa'||FORMATS[project.settings.format].size!=='1024x1536')throw Error('EXPERIMENT_SCOPE_CHANGED');
  const prompt=compileCoverExperiment(factor),hash=createHash('sha256').update(prompt).digest('hex');
  const refs=referencePlan(project,'cover',parent.assetId).map(r=>{const a=store.asset(project.owner,projectId,r.id);return {role:r.role,assetId:r.id,sha256:a.sha256,bytes:a.bytes,width:a.width,height:a.height};});
  if(refs.map(r=>r.role).join(',')!=='identity,previous,companion,location')throw Error('REFERENCE_ORDER');
  const count=()=>store.db.prepare('SELECT value FROM counters WHERE key=?').get(counterKey)?.value||0;
  const preview={experiment:COVER_EXPERIMENT.id,factor,label:COVER_EXPERIMENT.factors[factor].label,createdAt:new Date().toISOString(),projectId,parentResultId:parent.id,model:MODEL,quality:'high',size:'1024x1536',n:1,automaticRetries:0,scope,approvedMaxDispatches:100,dispatched:count(),cost:null,references:refs,prompt,promptHash:hash,contract:'Multipart /images/edits image[]: two previous successful samples; channel stability not established',status:'prepared'};
  writeFileSync(prefix+'-request.json',JSON.stringify(preview,null,2),{mode:0o600});
  if(!process.argv.includes('--run'))console.log(JSON.stringify({status:'prepared-no-dispatch',factor,promptHash:hash,dispatched:count(),references:refs.map(r=>r.role)}));
  else {
   const base=new URL(process.env.OPENAI_BASE_URL||'');
   if(base.protocol!=='https:'||!['mcgrox.top','www.mcgrox.top'].includes(base.hostname)||base.pathname!=='/v1'||base.search||base.hash||base.username||base.password||!process.env.OPENAI_API_KEY)throw Error('CHANNEL_CONFIG');
   const job=store.enqueue(project.owner,projectId,key,'revision','cover',COVER_EXPERIMENT.factors[factor].label,true,parent.id);
   job.operatorExperiment={id:COVER_EXPERIMENT.id,factor,parentResultId:parent.id,prompt,promptHash:hash,model:MODEL,quality:'high',size:'1024x1536',references:refs};
   job.status='running';store.writeJob(job);
   const details={experiment:COVER_EXPERIMENT.id,factor,jobId:job.id,startedAt:new Date().toISOString(),modelRequested:MODEL,qualityRequested:'high',sizeRequested:'1024x1536',n:1,referenceCount:refs.length,automaticRetries:0,cost:null,promptHash:hash};
   const persist=()=>writeFileSync(prefix+'-provider.json',JSON.stringify(details,null,2),{mode:0o600});
   async function request({images,onSubmit}) {
    const form=new FormData();for(const [k,v]of Object.entries({model:MODEL,prompt,n:'1',size:'1024x1536',quality:'high',response_format:'b64_json'}))form.set(k,v);
    for(let i=0;i<images.length;i++)form.append('image[]',new Blob([images[i].buffer],{type:images[i].contentType}),`reference-${i+1}.${images[i].contentType.split('/')[1]}`);
    // Counters include all uncertain/failed dispatches. No loop or automatic retries.
    onSubmit();store.budget(counterKey,100,10*365*86400000);details.dispatched=count();details.status='submitted';persist();console.log(JSON.stringify({status:'submitted',factor,jobId:job.id,dispatched:count()}));
    const t=Date.now();
    try {
     const response=await fetch(process.env.OPENAI_BASE_URL+'/images/edits',{method:'POST',headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY},body:form,redirect:'error',signal:AbortSignal.timeout(240000)});
     details.statusCode=response.status;details.elapsedMs=Date.now()-t;details.headers=diagnosticHeaders(response.headers);persist();
     const reader=response.body?.getReader();if(!reader)throw Error('NO_RESULT');const chunks=[];let bytes=0;
     while(true){const r=await reader.read();if(r.done)break;bytes+=r.value.length;if(bytes>32*1024*1024){await reader.cancel();throw Error('RESPONSE_SIZE');}chunks.push(Buffer.from(r.value));}
     let data;try{data=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{details.responseFormat='not-json';throw Error(response.status>=500?'UPSTREAM_UNCERTAIN':'MALFORMED_RESPONSE');}
     Object.assign(details,diagnosticError(data.error));
     if(!response.ok)throw Error(response.status>=500?'UPSTREAM_UNCERTAIN':response.status===429?'UPSTREAM_RATE_LIMIT':'UPSTREAM_REJECTED');
     if(typeof data.data?.[0]?.b64_json!=='string')throw Error('BASE64_CONTRACT_REQUIRED');
     const buffer=Buffer.from(data.data[0].b64_json,'base64');
     // Preserve any returned candidate, including dimension/decoding failures.
     writeFileSync(prefix+'-output.bin',buffer,{flag:'wx',mode:0o600});
     const metadata=await inspectImage(buffer,20*1024*1024);
     details.output={...metadata,bytes:buffer.length,sha256:createHash('sha256').update(buffer).digest('hex')};
     details.usage=data.usage?Object.fromEntries(Object.entries(data.usage).filter(([k,v])=>['input_tokens','output_tokens','total_tokens'].includes(k)&&typeof v==='number')):null;
     if(metadata.width!==1024||metadata.height!==1536)throw Error('OUTPUT_DIMENSIONS');
     details.status='image-received';details.elapsedMs=Date.now()-t;persist();
     return {buffer,metadata,usage:details.usage,promptHash:hash};
    } catch(e) {details.status='failed-or-uncertain';details.elapsedMs=Date.now()-t;details.localError=['UPSTREAM_UNCERTAIN','UPSTREAM_RATE_LIMIT','UPSTREAM_REJECTED','NO_RESULT','RESPONSE_SIZE','BASE64_CONTRACT_REQUIRED','OUTPUT_DIMENSIONS','IMAGE_FORMAT','IMAGE_SIZE','MALFORMED_RESPONSE'].includes(e.message)?e.message:'REQUEST_UNCERTAIN';persist();throw e;}
   }
   await executeJob(store,job,request,{STUDIO_DAILY_REQUEST_LIMIT:'100'},{compile:()=>prompt});
   const final=store.getJob(job.id),result=store.get(project.owner,projectId).results.find(r=>r.jobId===job.id);
   preview.status=final.status;preview.jobId=job.id;preview.resultId=result?.id||null;preview.dispatched=count();writeFileSync(prefix+'-request.json',JSON.stringify(preview,null,2),{mode:0o600});
   console.log(JSON.stringify({status:final.status,error:final.error,factor,resultId:result?.id||null,dispatched:count(),requestId:details.headers?.['x-request-id']||null,elapsedMs:details.elapsedMs,cost:null}));
   if(final.status!=='succeeded')process.exitCode=2;
  }
 }
} finally {store.close();}