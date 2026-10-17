import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { StudioStore } from '../runtime/store.mjs';
import { storySettings, compileShot, MODEL, FORMATS } from '../runtime/recipe.mjs';
import { referencePlan } from '../runtime/destinations.mjs';
import { inspectImage, executeJob } from '../runtime/provider.mjs';

// Explicit, operator-only contract experiment. Does not enable public generation
// or claim that the prospective provider contract has already been verified.
const projectId=process.argv[2];
if(!/^[a-f0-9-]{36}$/.test(projectId||''))throw Error('PROJECT_ID_REQUIRED');
const store=new StudioStore(resolve('.scratch/iteration-test-data'));
const row=store.db.prepare('SELECT data FROM projects WHERE id=?').get(projectId);
if(!row)throw Error('PROJECT_NOT_FOUND');
let p=JSON.parse(row.data);
const evidence=resolve('.scratch/delivery-evidence');mkdirSync(evidence,{recursive:true});
const scope='authorized-caibao-trial-2026-10-07';
const counterKey='trial:'+scope;
const revision=process.argv.includes('--revision-v2')||process.argv.includes('--revision-v3')||process.argv.includes('--revision-v4');
const version=revision?(process.argv.includes('--revision-v4')?'revision-v4':process.argv.includes('--revision-v3')?'revision-v3':'revision-v2'):'cover-v1';
const requestKey=scope+'-'+version;
const requestEvidence=revision?version+'-request-preview.json':'cover-trial-request-preview.json';
const responseEvidence=revision?version+'-provider-result.json':'cover-trial-provider-result.json';
const note=version==='revision-v4'?'Only correct the surface material of the Naiwa character in image 2. Keep the human face, body, clothes, camera, Bund skyline, character silhouette, eyes, thin closed smile and poses exactly as image 2. Image 3 is the authoritative character reference. Rebuild its surface as continuous smooth matte yellow CGI skin with broad clean diffuse shading, exactly like image 3. The final surface must have NO individual fibers, fur, fuzz, velvet, felt, fabric weave, seams, grain, stippling or stuffed-toy texture. It is an animated CGI character standing beside a photographed human, not a physical plush toy or costume. Preserve its pale yellow-green eye rims and huge black eyes. Use coherent ambient light, subtle smooth highlights and contact shadows to integrate it with the photographed scene. Do not change the human skin or add any text.':revision?'以图片1的蔡宝本人为身份唯一依据，校正上一版偏窄的眼形与微笑：还原原照自然的眼睑、眉形、鼻子、丰满脸颊与下巴，保留短黑发、原年龄与自然体型，不美颜、不瘦脸、不磨皮。真人皮肤呈现细小毛孔、不均匀肤色与自然纹理，头脸和手臂受同一现场光线照明，像普通手机真实合影。奶蛙严格依照图片3：奶油黄色光滑哑光CG表面，竖椭圆胖身躯与圆滑头部，两只超大黑色圆眼带浅黄绿色细边缘，保留原参考的眼距和眼睛位置，嘴是细小闭合弧线微笑，短胳膊、分叉手指、短双腿。不画成毛绒玩具或人偶服，不出现绒毛、布纹、缝线、腮红、张开的大嘴、舌头、牙齿、眉毛或头顶角。保留上一版的真实外滩地点、建筑排列、机位、站位、黑T恤和黑裤；仅校正人物面部自然度与角色外形材质，两者的接触阴影与现场光向一致。忽略所有参考中的文字、气泡、播放按钮。':'';
const prior=store.jobs(p.id).find(j=>j.requestKey===requestKey);
if(prior){console.log(JSON.stringify({status:'already-recorded',projectId,jobId:prior.id,jobStatus:prior.status}));store.close();process.exit(0);}
const settings={...storySettings('scene-stealer',{placeId:'bund',characterId:'naiwa'}),title:'蔡宝 × 奶蛙 · 外滩抢镜记',outfit:'黑色圆领短袖T恤完整穿好，衣摆自然覆盖腹部，黑色长裤；保持参考人物原本的自然体型，不瘦身、不改变脸型',idea:'人物是人像参考中的蔡宝。保留短黑发、脸部轮廓、眼形与自然肤色。忽略人像截图中的白色播放按钮、截图界面、室内背景和原坐姿；新照片为自然站立的外滩合影。'};
if(!revision)store.update(p.owner,p.id,settings,p.revision);
const inputs=[['identity','C:/Users/lsb/AppData/Local/Temp/codex-clipboard-241202df-60c0-4a39-a510-61a9c59307a9.png'],['companion','public/characters/naiwa.png'],['location','public/places/bund.jpg']];
for(const [role,path]of revision?[]:inputs){const buffer=readFileSync(path);const metadata=await inspectImage(buffer);store.addReference(p.owner,p.id,role,buffer,metadata,true);}
p=store.get(p.owner,p.id);
const parent=revision?p.results.find(r=>r.id===(version==='revision-v4'?'4826e98b-7d69-407a-92d6-5991b492c51e':'9189b0fc-3132-473f-9883-7b67ef690fb5')):null;
if(revision&&!parent)throw Error('ORIGINAL_RESULT_REQUIRED');
const preview={status:'authorized-contract-experiment-ready',preparedOn:'2026-10-07',channel:'McGrox',model:MODEL,quality:'high',size:FORMATS[p.settings.format].size,projectId,shotId:'cover',n:1,automaticRetries:0,approvedMaxRequests:100,approvedMaxImages:100,quotationRequired:false,verifiedUnitPriceCny:null,endpointContract:'Prospective multipart POST /images/edits with image[]; experimental, not yet verified',authorization:{photo:'User supplied this photo of friend 蔡宝 for this trial',scope,budgetPolicy:'Persistent 100-dispatched-request cap, failures and unknown billing included; no automatic retry'},references:referencePlan(p,'cover',parent?.assetId).map(r=>{const a=store.asset(p.owner,p.id,r.id);return {role:r.role,sha256:a.sha256,bytes:a.bytes,width:a.width,height:a.height};}),prompt:compileShot(p,'cover',note),parentResultId:parent?.id||null,version,providerCalls:store.db.prepare('SELECT value FROM counters WHERE key=?').get(counterKey)?.value||0};
writeFileSync(resolve(evidence,requestEvidence),JSON.stringify(preview,null,2));
if(!process.argv.includes('--run')){console.log(JSON.stringify({status:preview.status,projectId,references:preview.references.map(r=>({role:r.role,width:r.width,height:r.height})),providerCalls:preview.providerCalls}));store.close();process.exit(0);}
const base=new URL(process.env.OPENAI_BASE_URL||'');
if(base.protocol!=='https:'||!['mcgrox.top','www.mcgrox.top'].includes(base.hostname)||base.pathname!=='/v1'||base.search||base.hash||base.username||base.password||!process.env.OPENAI_API_KEY)throw Error('CHANNEL_CONFIG');
const j=store.enqueue(p.owner,p.id,requestKey,revision?'revision':'cover',revision?'cover':null,note,process.argv.includes('--acknowledge-uncertain'),parent?.id||null);j.status='running';store.writeJob(j);
async function experimentalRequest({project,shotId,note,images,onSubmit}){
  const prompt=compileShot(project,shotId,note),form=new FormData();
  for(const [key,value]of Object.entries({model:MODEL,prompt,n:'1',size:FORMATS[project.settings.format].size,quality:'high',response_format:'b64_json'}))form.set(key,value);
  for(let i=0;i<images.length;i++)form.append('image[]',new Blob([images[i].buffer],{type:images[i].contentType}),`reference-${i+1}.${images[i].contentType.split('/')[1]}`);
  store.budget(counterKey,100,10*365*86400000);
  onSubmit();
  console.log(JSON.stringify({status:'submitted',projectId,jobId:j.id,channel:'McGrox',model:MODEL,size:'1024x1536',quality:'high',references:images.length,dispatched:store.db.prepare('SELECT value FROM counters WHERE key=?').get(counterKey).value}));
  const t=Date.now();
  const response=await fetch(process.env.OPENAI_BASE_URL+'/images/edits',{method:'POST',headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY},body:form,redirect:'error',signal:AbortSignal.timeout(240000)});
  const details={experiment:scope,statusCode:response.status,elapsedMs:Date.now()-t,modelRequested:MODEL,sizeRequested:'1024x1536',qualityRequested:'high',referenceCount:images.length,cost:null,automaticRetries:0};
  const reader=response.body?.getReader();let count=0;const chunks=[];
  if(!reader)throw Error('NO_RESULT');
  while(true){const r=await reader.read();if(r.done)break;count+=r.value.length;if(count>32*1024*1024){await reader.cancel();throw Error('RESPONSE_SIZE');}chunks.push(Buffer.from(r.value));}
  let data;try{data=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{details.responseFormat='not-json';writeFileSync(resolve(evidence,responseEvidence),JSON.stringify(details,null,2));throw Error('MALFORMED_RESPONSE');}
  details.responseKeys=Object.keys(data);details.imageFields=Object.keys(data.data?.[0]||{});
  if(data.error){details.errorType=typeof data.error.type==='string'?data.error.type.slice(0,120):null;details.errorCode=typeof data.error.code==='string'?data.error.code.slice(0,120):null;}
  if(!response.ok){writeFileSync(resolve(evidence,responseEvidence),JSON.stringify(details,null,2));console.log(JSON.stringify(details));throw Error(response.status>=500?'UPSTREAM_UNCERTAIN':response.status===429?'UPSTREAM_RATE_LIMIT':'UPSTREAM_REJECTED');}
  if(typeof data.data?.[0]?.b64_json!=='string'){writeFileSync(resolve(evidence,responseEvidence),JSON.stringify(details,null,2));console.log(JSON.stringify(details));throw Error('BASE64_CONTRACT_REQUIRED');}
  const buffer=Buffer.from(data.data[0].b64_json,'base64'),metadata=await inspectImage(buffer,20*1024*1024);
  details.output=metadata;details.outputBytes=buffer.length;details.sha256=createHash('sha256').update(buffer).digest('hex');
  const usage=data.usage?Object.fromEntries(Object.entries(data.usage).filter(([k,v])=>['input_tokens','output_tokens','total_tokens'].includes(k)&&typeof v==='number')):null;
  details.usage=usage;details.status='image-received';
  writeFileSync(resolve(evidence,responseEvidence),JSON.stringify(details,null,2));
  if(metadata.width!==1024||metadata.height!==1536){writeFileSync(resolve(store.directory,'experimental-output-'+j.id+'.bin'),buffer,{mode:0o600});throw Error('OUTPUT_DIMENSIONS');}
  console.log(JSON.stringify(details));
  return {buffer,metadata,usage,promptHash:createHash('sha256').update(prompt).digest('hex')};
}
try{await executeJob(store,j,experimentalRequest,{STUDIO_DAILY_REQUEST_LIMIT:'100'});
  const final=store.getJob(j.id),project=store.get(p.owner,p.id),result=project.results.at(-1);
  preview.providerCalls=store.db.prepare('SELECT value FROM counters WHERE key=?').get(counterKey)?.value||0;
  preview.status=final.status==='succeeded'?'generated-awaiting-human-review':'contract-experiment-'+final.status;
  writeFileSync(resolve(evidence,requestEvidence),JSON.stringify(preview,null,2));
  console.log(JSON.stringify({status:final.status,error:final.error,projectId,jobId:j.id,resultId:result?.id,resultFile:result?resolve(store.directory,'assets',store.asset(p.owner,p.id,result.assetId).file):null,dispatched:preview.providerCalls,costKnown:false}));
}finally{store.close();}
