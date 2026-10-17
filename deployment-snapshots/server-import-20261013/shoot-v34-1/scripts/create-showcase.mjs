// Operator-only, explicitly authorized public AI examples. No automatic retry.
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {StudioStore} from '../runtime/store.mjs';
import {inspectImage} from '../runtime/provider.mjs';
import {CHARACTER_ARTWORK} from '../runtime/character-artwork.mjs';
import {characterVisualProfile,VISUAL_PROFILE_VERSION} from '../runtime/character-visuals.mjs';
import {PLACES} from '../runtime/destinations.mjs';
const samples=[
 {id:'jackie-naiwa',person:'成龙',personPrompt:'Jackie Chan, the internationally recognizable Hong Kong actor, with his characteristic broad nose, expressive small eyes, familiar smile and short dark hair with subtle gray. A real adult human face with pores and facial lines, wearing an understated navy casual jacket',characterId:'naiwa',placeId:'bund',storyId:'scene-stealer',title:'大哥也被抢镜了',scene:'Shanghai Bund riverside promenade at blue hour, recognizable Oriental Pearl and Pudong skyline across the river, warm promenade lamps',gesture:'Jackie Chan on the left laughing as the yellow Naiwa character on his right confidently leans slightly toward the camera and poses. His open hand gestures toward the character without touching its face',shape:'Naiwa: the exact yellow frog-like round smooth CGI body from image 1, protruding LARGE dark blue glossy eyes with the same eye placement and muzzle, tiny smiling mouth, stubby limbs. NOT Nailong, not a furry plush toy'},
 {id:'stephen-nailong',person:'周星驰',personPrompt:'Stephen Chow, the recognizable Hong Kong actor in his mature appearance, signature narrow expressive eyes, characteristic smile, natural salt-and-pepper short hair, facial lines, wearing a plain light-gray cotton overshirt',characterId:'nailong',placeId:'victoria-harbour',storyId:'tourist-director',title:'星爷的导演搭子',scene:'Tsim Sha Tsui waterfront beside Victoria Harbour, Hong Kong skyline as in image 2, a slightly overcast bright late afternoon',gesture:'Stephen Chow on the left with an amused restrained smile, Nailong on the right with one stubby arm lifted as if very seriously directing a photo. Both face the lens, a playful contrast without covering either face',shape:'Nailong: EXACT round yellow dinosaur in image 1, large glossy round eyes with bright green irises, black pupils and thin white rims as in image 1; rounded big head with no invented forehead spikes, round body, cream belly, tiny limbs with brown claws and pink palm pads. Preserve the open oval mouth and original proportions. Smooth satin CGI surface, NOT the blue-eyed Naiwa'},
 {id:'keanu-cat',person:'基努·里维斯',personPrompt:'Keanu Reeves, the internationally recognizable Canadian actor, shoulder-length dark hair, familiar long oval face, dark brown eyes and short dark beard with gray strands, real mature skin, wearing a simple black jacket over a dark T-shirt',characterId:'miaocuijiao',placeId:'tower-bridge',storyId:'slow-travel',title:'今天谁也不赶路',scene:'London Thames riverside near Tower Bridge, both tower structures and blue suspension elements recognizable as in image 2, cool diffused daylight after light rain',gesture:'Keanu Reeves sitting relaxed on a low riverside bench at the left, the compact round tabby cat with golden crunchy triangular ears resting beside him on the right; Keanu glances toward the cat with a small amused smile, his face clearly seen at a three-quarter angle. A funny quiet travel snapshot',shape:'Miaocuijiao cat: EXACT compact round gray-brown tabby cat from image 1, white muzzle/chest/paws, very large round dark glossy eyes, pink nose and long white whiskers. Its two ear tips are golden triangular crunchy corn-snack pieces with the exact pebbled texture from image 1. Natural short individual hairs, living cat anatomy, not a cartoon triangular cushion, not a plush toy; do not invent stripe patterns or remove the distinctive golden ears'},
 {id:'taylor-chiikawa',person:'泰勒·斯威夫特',personPrompt:'Taylor Swift, the recognizable American singer, natural blonde fringe and loose shoulder-length blonde hair, characteristic eyes and lips, real skin texture, wearing a casual cream knit sweater with light-blue jeans',characterId:'chiikawa',placeId:'paris',storyId:'postcard',title:'巴黎来了个小旅伴',scene:'Paris Trocadero plaza with Eiffel Tower recognizable behind the pair, soft late-afternoon daylight with an overcast sky',gesture:'Taylor Swift bending slightly toward a knee-high Chiikawa standing at her right, both smiling gently toward the camera, a candid friendly vacation photo. The tower is offset behind them and visible without intersecting their heads',shape:'Chiikawa: EXACT white round tiny character from image 1, stubby ears, little black oval eyes, soft pink cheeks and tiny mouth. Keep the original compact proportions. A smooth matte CGI character with no fur, no redesign'}
];
const id=process.argv[2],sample=samples.find(s=>s.id===id);if(!sample)throw Error('UNKNOWN_SAMPLE');
const attempt=process.argv.find(a=>a.startsWith('--attempt='))?.slice(10);
if(attempt&&!/^[a-z0-9-]{1,50}$/.test(attempt))throw Error('INVALID_ATTEMPT');
const openlux=process.argv.includes('--channel=openlux');
const model=process.argv.find(a=>a.startsWith('--model='))?.slice(8)||'gpt-image-2.5-sunburst';
if(!['gpt-image-2.5-sunburst','gpt-image-2.5-sunburst-c'].includes(model)||(!openlux&&model!=='gpt-image-2.5-sunburst'))throw Error('MODEL_NOT_AUTHORIZED');
const directory=resolve('.scratch/showcase-v17'+(openlux?'-openlux':'')+(attempt?'-'+attempt:''));mkdirSync(directory,{recursive:true});
const journal=resolve(directory,id+'.json');if(existsSync(journal)){console.log(JSON.stringify({id,status:'already-recorded-no-dispatch'}));process.exit(0);}
const character=CHARACTER_ARTWORK[sample.characterId],place=PLACES.find(p=>p.id===sample.placeId);
const paths=[resolve('public'+character.src),resolve('public/places',place.photo)];
const buffers=paths.map(p=>readFileSync(p));
if(createHash('sha256').update(buffers[0]).digest('hex')!==character.sha256)throw Error('REFERENCE_CHANGED');
const metadata=await Promise.all(buffers.map(b=>inspectImage(b)));
const visualProfile=characterVisualProfile(sample.characterId,{builtin:true,sha256:character.sha256});
const naturalCat=sample.characterId==='miaocuijiao';
const prompt=[
 'Intent: Create ONE believable travel photograph for an explicitly AI-generated imaginative fan-art gallery. A playful fictional encounter between a recognizable public figure and a fictional character. No endorsement, no advertisement, no real event claim.',
 `Subject: Exactly ONE real-looking adult human: ${sample.personPrompt}. Exactly ONE character: ${visualProfile||sample.shape}. Reference image 1 ONLY locks the character silhouette, anatomy, face, eye placement and colors; do not copy its background, text, UI or graphic framing. Image 2 ONLY locks the real landmark geometry, not its exact photographic framing.`,
 `Composition: Vertical 2:3 photograph, 1024x1536. ${sample.gesture}. ${sample.scene}. Both subjects present at a plausible physical scale. Faces are unobstructed and recognizable. Eye-level 35mm-equivalent friends' travel photograph, full or three-quarter bodies, natural asymmetry and depth; enough landmark remains to identify the actual place.`,
 'Text: No added typography, captions, signatures, watermarks, graphic panels, logos, chat bubbles, screenshot overlays or reference-image lettering.',
 (naturalCat?'Style: Real casual photograph. Preserve individual natural fur hairs and the crunchy golden ear texture of the reference cat. Match both subjects to the real scene daylight, camera focus, exposure, perspective and subtle physical contact shadows. Real mature human skin, unretouched; living cat, not a plush figurine. ':'Style: Realistic casual photograph, not a poster. Human skin has pores and age-appropriate texture; fabric shows natural folds. The fictional CGI character is convincingly integrated into the photographed space: same illumination direction, exposure, white balance, perspective and focal plane. Subtle ground contact shadow, believable ambient occlusion, environment reflections on glossy eyes. Smooth clean character surfaces matching reference, never furry plush or generic toy. Natural proportions and unforced expressions. No glossy beauty retouching.'),
 'Constraints: Preserve exact distinctive character design from image 1. Keep the public figure recognizably themselves, do not create an anonymous lookalike. No extra limbs, merged fingers, floating feet, collage, duplicated character, plastic human skin, cartoon human or newly invented landmark. Only one finished photograph.'
].join('\n');
const record={...sample,visualProfileVersion:VISUAL_PROFILE_VERSION,createdAt:new Date().toISOString(),channel:openlux?'OpenLux':'McGrox',model,quality:'high',size:'1024x1536',n:1,automaticRetries:0,prompt,promptHash:createHash('sha256').update(prompt).digest('hex'),references:paths.map((p,i)=>({role:i===0?'character':'location',sha256:createHash('sha256').update(buffers[i]).digest('hex'),source:i===0?character.source:place.photoSource})),cost:null,costSource:'unknown',status:'prepared'};
if(!process.argv.includes('--run')){console.log(JSON.stringify({id,status:'prepared-no-dispatch',promptHash:record.promptHash}));process.exit(0);}
const luxVars=openlux?Object.fromEntries(readFileSync('.env.local','utf8').split(/\r?\n/).filter(l=>/^OPENLUX_(API_KEY|BASE_URL)=/.test(l)).map(l=>{const i=l.indexOf('=');return [l.slice(0,i),l.slice(i+1).trim().replace(/^(['"])(.*)\1$/,'$2')]})):{};
const apiKey=openlux?luxVars.OPENLUX_API_KEY:process.env.OPENAI_API_KEY;
const base=new URL(openlux?(luxVars.OPENLUX_BASE_URL||'https://api.openlux.ai/v1'):(process.env.OPENAI_BASE_URL||''));if(base.protocol!=='https:'||!(openlux?['api.openlux.ai']:['mcgrox.top','www.mcgrox.top']).includes(base.hostname)||base.pathname!=='/v1'||base.username||base.password||base.search||base.hash||!apiKey)throw Error('CHANNEL_CONFIG');
const store=new StudioStore(resolve('.scratch/iteration-test-data'));
try{
 const form=new FormData();for(const [k,v]of Object.entries({model:record.model,prompt,size:record.size,quality:'high',n:'1',response_format:'b64_json'}))form.set(k,v);
 buffers.forEach((b,i)=>form.append('image[]',new Blob([b],{type:metadata[i].contentType}),`reference-${i}.${metadata[i].contentType.split('/')[1]}`));
 store.budget('trial:authorized-caibao-trial-2026-10-07',100,10*365*86400000);
 record.dispatchedTotal=store.db.prepare('SELECT value FROM counters WHERE key=?').get('trial:authorized-caibao-trial-2026-10-07').value;
 record.status='submitted';writeFileSync(journal,JSON.stringify(record,null,2),{flag:'wx',mode:0o600});console.log(JSON.stringify({id,status:'submitted',dispatchedTotal:record.dispatchedTotal}));
 const started=Date.now();
 try{
  const response=await fetch(base.href+'/images/edits',{method:'POST',headers:{Authorization:'Bearer '+apiKey},body:form,redirect:'error',signal:AbortSignal.timeout(240000)});
  record.httpStatus=response.status;record.requestId=response.headers.get('x-request-id');record.elapsedMs=Date.now()-started;
  const chunks=[];let size=0;for await(const chunk of response.body){size+=chunk.length;if(size>32*1024*1024)throw Error('RESPONSE_SIZE');chunks.push(Buffer.from(chunk));}
  let data;try{data=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw Error('MALFORMED_RESPONSE');}
  if(!response.ok)throw Error(response.status>=500?'UPSTREAM_UNCERTAIN':'UPSTREAM_REJECTED');
  const item=data.data?.[0];let output;
  if(typeof item?.b64_json==='string')output=Buffer.from(item.b64_json,'base64');
  else if(openlux&&typeof item?.url==='string'){
   const imageUrl=new URL(item.url);if(imageUrl.protocol!=='https:'||imageUrl.username||imageUrl.password)throw Error('RESULT_URL');
   const downloaded=await fetch(imageUrl,{redirect:'error',signal:AbortSignal.timeout(60000)});if(!downloaded.ok)throw Error('RESULT_DOWNLOAD');
   const parts=[];let bytes=0;for await(const chunk of downloaded.body){bytes+=chunk.length;if(bytes>20*1024*1024)throw Error('RESPONSE_SIZE');parts.push(Buffer.from(chunk));}output=Buffer.concat(parts);
  }else throw Error('BASE64_REQUIRED');
  writeFileSync(resolve(directory,id+'.png'),output,{flag:'wx'});
  record.output=await inspectImage(output,20*1024*1024);record.sha256=createHash('sha256').update(output).digest('hex');
  if(record.output.width!==1024||record.output.height!==1536)throw Error('OUTPUT_DIMENSIONS');
  record.usage=data.usage?Object.fromEntries(Object.entries(data.usage).filter(([k,v])=>['input_tokens','output_tokens','total_tokens'].includes(k)&&typeof v==='number')):null;
  record.status='candidate-saved-awaiting-review';
 }catch(e){record.status='failed-or-uncertain';record.error=['UPSTREAM_UNCERTAIN','UPSTREAM_REJECTED','BASE64_REQUIRED','OUTPUT_DIMENSIONS','RESPONSE_SIZE','MALFORMED_RESPONSE'].includes(e.message)?e.message:'REQUEST_UNCERTAIN';process.exitCode=2;}
 writeFileSync(journal,JSON.stringify(record,null,2),{mode:0o600});console.log(JSON.stringify({id,status:record.status,httpStatus:record.httpStatus,elapsedMs:record.elapsedMs,error:record.error,cost:null}));
}finally{store.close();}
