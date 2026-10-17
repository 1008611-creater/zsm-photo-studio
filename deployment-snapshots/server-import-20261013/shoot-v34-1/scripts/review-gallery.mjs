#!/usr/bin/env node
import {StudioStore} from '../runtime/store.mjs';
import {reviewWork} from '../runtime/gallery.mjs';
const args=process.argv.slice(2),db=new StudioStore(process.env.STUDIO_DATA_DIR||'/var/lib/zsm-photo-shoot');
try {
 if(args[0]==='list')for(const row of db.db.prepare("SELECT data FROM gallery WHERE json_extract(data,'$.status')='pending' AND expires>? ORDER BY rowid").all(Date.now())){const w=JSON.parse(row.data);console.log(JSON.stringify({id:w.id,title:w.title,author:w.author,createdAt:w.createdAt}));}
 else if(['approve','reject'].includes(args[0])&&/^[a-f0-9-]{36}$/.test(args[1]||'')&&args[2]==='--confirmed-review') {const w=reviewWork(db,args[1],args[0]==='approve',args[3]);console.log(JSON.stringify({id:w.id,status:w.status}));}
 else {console.error('Use list, or approve/reject UUID --confirmed-review [reason]. Review original image and public rights before approval.');process.exitCode=1;}
} catch(e){console.error(e.code||'REVIEW_FAILED');process.exitCode=1;}finally{db.close();}
