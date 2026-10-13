import { randomUUID } from 'node:crypto';
import { setTimeout as pause } from 'node:timers/promises';
import { store } from '../runtime/store.mjs';
import { executeJob, capabilities } from '../runtime/provider.mjs';
const db=store(), token=randomUUID();
if(!db.workerLock(token)) { console.error('Another studio worker holds the lease.');process.exit(1); }
db.recoverInterrupted();
let stopping=false;
const heartbeat=setInterval(()=>{if(!db.heartbeat(token)){console.error('Studio worker lease lost; stopping.');stopping=true;}},5000);
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{stopping=true;});
console.log('Studio worker ready; generation '+(capabilities().enabled?'enabled':'disabled'));
try {
  let lastPurge=0;
  while(!stopping) {
    if(Date.now()-lastPurge>3600000){db.purge();lastPurge=Date.now();}
    if(capabilities().enabled){const job=db.claim();if(job){await executeJob(db,job);continue;}}
    await pause(1500);
  }
} finally {clearInterval(heartbeat);db.releaseWorker(token);db.close();}
