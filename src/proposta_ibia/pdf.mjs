// Gera o PDF A4 da proposta com cabeçalho e rodapé no padrão DigitalGov.
// Uso: node pdf.mjs <saida.pdf>
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const require = createRequire(import.meta.url);
let pw; try { pw = require('playwright'); } catch { pw = require('/opt/node22/lib/node_modules/playwright'); }
const here = path.dirname(fileURLToPath(import.meta.url));
const out = process.argv[2] || path.join(here, 'proposta.pdf');
const src = process.argv[3] || 'proposta.html';
const TITLE = process.argv[4] || 'PROPOSTA COMERCIAL — RESTAURAÇÃO DE DOCUMENTOS · IBIÁ/MG';
const AREA = process.argv[5] || 'ÁREA<br>COMERCIAL';
const SUBL = process.argv[6] || 'Documento comercial — Prefeitura Municipal de Ibiá';
const logo = 'data:image/png;base64,' + readFileSync(path.join(here, 'logo_small.png')).toString('base64');
const S = 'font-family:Arial,Helvetica,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact;';
const header = `<div style="${S}width:100%;margin:0;padding:0;position:relative;height:34mm">
 <div style="position:absolute;left:0;right:0;top:0;height:2.2mm;background:#1BA3DD"></div>
 <div style="position:absolute;left:16mm;top:8mm;display:flex;align-items:center;gap:4mm">
  <img src="${logo}" style="height:13mm">
  <div style="border-left:1px solid #26305E;height:12mm;padding-left:3.5mm;display:flex;align-items:center;font-size:7pt;font-weight:700;color:#26305E;line-height:1.5">${AREA}</div></div>
 <div style="position:absolute;right:16mm;top:8.5mm;text-align:right;line-height:1.6">
  <div style="font-size:7.6pt;font-weight:700;color:#26305E">${TITLE}</div>
  <div style="font-size:7.2pt;color:#1BA3DD">20 de outubro de 2026</div>
  <div style="font-size:7pt;color:#444;font-style:italic">${SUBL}</div></div>
 <div style="position:absolute;left:16mm;right:16mm;top:26mm;border-top:1px solid #CBD3DF"></div>
</div>`;
const footer = `<div style="${S}width:100%;height:12mm;display:flex;margin:0">
 <div style="flex:1;background:#26305E;color:#fff;font-size:7pt;display:flex;align-items:center;padding-left:16mm">DigitalGov &nbsp;|&nbsp; CNPJ 24.361.188/0001-61 &nbsp;|&nbsp; Tecnologia a serviço da sua empresa &nbsp;|&nbsp; digitalgovadm@gmail.com &nbsp;|&nbsp; (31) 99827-7323</div>
 <div style="width:34mm;background:#1BA3DD;color:#fff;font-size:8pt;font-weight:700;display:flex;align-items:center;justify-content:center">Página&nbsp;<span class="pageNumber"></span></div>
</div>`;
const b = await pw.chromium.launch();
const p = await b.newPage();
await p.goto('file://' + path.join(here, src), { waitUntil: 'load' });
await p.pdf({ path: out, format: 'A4', printBackground: true, displayHeaderFooter: true, headerTemplate: header, footerTemplate: footer, preferCSSPageSize: true });
await b.close();
console.log('ok', out);
