// Keep the existing main/root GitHub Pages publishing mode: generate, never hand-edit.
import {readdir,readFile,writeFile,mkdir,copyFile,rm} from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd();const manifest=path.join(root,'.generated-pages.json');
async function walk(dir,prefix=''){let files=[];for(const entry of await readdir(dir,{withFileTypes:true})){const p=path.posix.join(prefix,entry.name);if(entry.isDirectory())files.push(...await walk(path.join(dir,entry.name),p));else files.push(p);}return files;}
const files=(await walk(path.join(root,'dist'))).sort();
let prior=[];try{prior=JSON.parse(await readFile(manifest,'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
const safe=p=>typeof p==='string' && !path.isAbsolute(p) && !p.split('/').includes('..') && !['src','scripts','docs','.github'].includes(p.split('/')[0]);
for(const p of [...files,...prior])if(!safe(p))throw new Error('Unsafe generated path: '+p);
for(const p of prior)if(!files.includes(p))await rm(path.join(root,p),{force:true});
for(const p of files){await mkdir(path.dirname(path.join(root,p)),{recursive:true});await copyFile(path.join(root,'dist',p),path.join(root,p));}
await writeFile(manifest,JSON.stringify(files,null,2)+'\n');
console.log(`Exported ${files.length} generated files for existing GitHub Pages root publishing.`);
