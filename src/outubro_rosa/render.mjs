// Exporta as artes do Outubro Rosa em PNG. Uso: node render.mjs (com servidor HTTP na porta PORT servindo esta pasta)
import { createRequire } from 'node:module'; import { mkdirSync } from 'node:fs';
const require=createRequire(import.meta.url); let pw; try{pw=require('playwright');}catch{pw=require('/opt/node22/lib/node_modules/playwright');}
const PORT=process.env.PORT||8820, OUT='../../deliverables/outubro_rosa'; mkdirSync(OUT,{recursive:true});
const NAMES={1:'feed_01_capa',2:'feed_02_diagnostico_precoce',3:'feed_03_tres_cuidados',4:'feed_04_mensagem_v4',5:'story_01_capa',6:'story_02_diagnostico_precoce'};
const b=await pw.chromium.launch();
for(const a of [1,2,3,4,5,6]){const h=a>=5?1920:1350; const p=await b.newPage({viewport:{width:1080,height:h}});
  await p.goto(`http://127.0.0.1:${PORT}/artes.html?a=${a}`); await p.waitForFunction(()=>window.ready); await p.waitForTimeout(150);
  await p.screenshot({path:`${OUT}/V4_OutubroRosa_${NAMES[a]}.png`,clip:{x:0,y:0,width:1080,height:h}}); await p.close(); console.log(NAMES[a]);}
await b.close();
