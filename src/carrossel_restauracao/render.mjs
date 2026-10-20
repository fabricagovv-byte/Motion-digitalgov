// Exporta os 8 slides do carrossel em PNG (servidor HTTP na porta PORT servindo esta pasta).
import { createRequire } from 'node:module'; import { mkdirSync } from 'node:fs';
const require=createRequire(import.meta.url); let pw; try{pw=require('playwright');}catch{pw=require('/opt/node22/lib/node_modules/playwright');}
const PORT=process.env.PORT||8840, OUT='../../deliverables/carrossel_restauracao'; mkdirSync(OUT,{recursive:true});
const N=['01_capa','02_como_funciona','03_o_que_corrige','04_duas_versoes','05_preco','06_exemplo_20mil_paginas','07_plataforma','08_contato'];
const b=await pw.chromium.launch();
for(let s=1;s<=8;s++){const p=await b.newPage({viewport:{width:1080,height:1350}}); await p.goto(`http://127.0.0.1:${PORT}/carrossel.html?s=${s}`); await p.waitForFunction(()=>window.ready); await p.waitForTimeout(200);
  await p.screenshot({path:`${OUT}/V4_Restauracao_carrossel_${N[s-1]}.png`}); await p.close(); console.log(N[s-1]);}
await b.close();
