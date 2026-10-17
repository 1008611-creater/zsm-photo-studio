// Default blocks unreviewed artwork. An explicitly authorized noindex preview
// can preserve pending status without claiming third-party licensing clearance.
import { CHARACTER_ARTWORK } from '../runtime/character-artwork.mjs';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
for(const [id,a] of Object.entries(CHARACTER_ARTWORK)) {
  if(!a.src.startsWith('/characters/')||a.src.includes('..')||!a.source.startsWith('https://'))throw Error('INVALID_ARTWORK_SOURCE:'+id);
  const hash=createHash('sha256').update(readFileSync(new URL('../public'+a.src,import.meta.url))).digest('hex');
  if(hash!==a.sha256)throw Error('ARTWORK_BYTES_CHANGED:'+id);
}
const pending=Object.entries(CHARACTER_ARTWORK).filter(([,a])=>a.rights!=='cleared');
const authorizedPreview=process.argv.includes('--authorized-preview')&&process.env.NEXT_PUBLIC_BASE_PATH==='/studio-next'&&process.env.STUDIO_GENERATION_ENABLED==='false';
if(pending.length&&!authorizedPreview){console.error('Artwork permission remains unverified: '+pending.map(([id])=>id).join(', '));process.exitCode=1;}
else console.log(pending.length?'User-authorized isolated preview; original bytes verified; third-party licensing remains pending.':'Character artwork redistribution review passed.');