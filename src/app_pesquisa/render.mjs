// Carrossel (PNG) e post animado (quadros). Uso: node render.mjs slides | node render.mjs frames <fps> <a> <b> <dir> | node render.mjs probe t1 t2 ...
import { createRequire } from 'node:module'; import { mkdirSync } from 'node:fs'; import { execFileSync } from 'node:child_process';
const require=createRequire(import.meta.url); let pw; try{pw=require('playwright');}catch{pw=require('/opt/node22/lib/node_modules/playwright');}
const PORT=process.env.PORT||8830, BASE=`http://127.0.0.1:${PORT}/app.html`, OUT='../../deliverables/app_pesquisa';
const [mode,...args]=process.argv.slice(2); mkdirSync(OUT,{recursive:true});
const b=await pw.chromium.launch();
const NAMES=['01_capa','02_modulos','03_formas_de_acesso','04_busca_por_local','05_resultados','06_seguranca','07_contato'];
if(mode==='slides'){ for(let s=1;s<=7;s++){const p=await b.newPage({viewport:{width:1080,height:1350}}); await p.goto(`${BASE}?s=${s}`); await p.waitForFunction(()=>window.ready); await p.waitForTimeout(150);
  await p.screenshot({path:`${OUT}/V4_App_Pesquisas_carrossel_${NAMES[s-1]}.png`}); await p.close(); console.log(NAMES[s-1]);} }
else { const p=await b.newPage({viewport:{width:1080,height:1350}}); await p.goto(BASE); await p.waitForFunction(()=>window.ready);
  const shot=async(t,path)=>{await p.evaluate(async t=>{window.seek(t);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));},t); await p.screenshot({path,type:path.endsWith('png')?'png':'jpeg',quality:path.endsWith('png')?undefined:94});};
  if(mode==='probe'){ const d='../../build/app_pesquisa'; mkdirSync(d,{recursive:true}); const fs=[]; for(const t of args.map(Number)){const f=`${d}/t${t}.png`; await shot(t,f); fs.push(f);}
    execFileSync('ffmpeg',['-loglevel','error','-y',...fs.flatMap(f=>['-i',f]),'-filter_complex',fs.map((_,i)=>`[${i}]scale=360:450[s${i}]`).join(';')+';'+fs.map((_,i)=>`[s${i}]`).join('')+`hstack=${fs.length}[o]`,'-map','[o]',`${d}/sheet.png`]); }
  else { const [fps,a,bb,dir]=[+args[0],+args[1],+args[2],args[3]]; mkdirSync(dir,{recursive:true}); for(let f=a;f<bb;f++) await shot(f/fps,`${dir}/f${String(f).padStart(5,'0')}.jpg`); } }
await b.close();
