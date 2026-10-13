// Metadata discovery only. Never installs upstream code or downloads character images.
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { CHARACTERS, DISCOVERY_PROJECT } from '../runtime/characters.mjs';
const input=process.argv.indexOf('--input');
let raw;
if(input>=0){if(!process.argv[input+1])throw Error('Missing --input file');raw=await readFile(process.argv[input+1],'utf8');}
else {const r=await fetch(DISCOVERY_PROJECT.data,{signal:AbortSignal.timeout(25000)});if(!r.ok)throw Error('Source HTTP '+r.status);raw=await r.text();}
if(Buffer.byteLength(raw)>2*1024*1024)throw Error('Source exceeds 2MB');
const data=JSON.parse(raw);if(!Array.isArray(data.memes))throw Error('Unexpected source schema');
const safeText=x=>typeof x==='string'&&x.length<100?x:null;
const safeUrl=x=>{try{const u=new URL(x);return u.protocol==='https:'?u.href:null;}catch{return null;}};
const candidates=[],seen=new Set();
for(const m of data.memes){const name=safeText(m.name),id=safeText(m.id);if(!name||!id||seen.has(id))continue;
 const match=CHARACTERS.find(c=>[c.name,...c.aliases].some(n=>name.toLowerCase().includes(n.toLowerCase())));
 if(!match&&m.category!=='kawaii'&&!(Array.isArray(m.tags)&&m.tags.some(t=>['品牌IP','吉祥物','表情包'].includes(t))))continue;
 seen.add(id);candidates.push({sourceId:id,name,aliases:(Array.isArray(m.aliases)?m.aliases:[]).map(safeText).filter(Boolean).slice(0,12),source:safeUrl(m.source),catalogId:match?.id||null,review:'needs-review',assetStatus:'not-imported'});
}
const output=resolve('.scratch/character-candidates.json');await mkdir(resolve('.scratch'),{recursive:true});
await writeFile(output,JSON.stringify({collectedAt:new Date().toISOString(),project:DISCOVERY_PROJECT.url,license:DISCOVERY_PROJECT.license,sourceSha256:createHash('sha256').update(raw).digest('hex'),sourceCount:data.memes.length,candidateCount:candidates.length,candidates},null,2)+'\n');
console.log(JSON.stringify({output,sourceCount:data.memes.length,candidates:candidates.length,note:'Names and source links only. Human review required; no production catalog changes or asset downloads.'}));
