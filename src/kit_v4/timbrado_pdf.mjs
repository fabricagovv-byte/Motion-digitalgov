import { createRequire } from 'node:module'; const require = createRequire(import.meta.url); let pw; try { pw = require('playwright'); } catch { pw = require('/opt/node22/lib/node_modules/playwright'); }
const b = await pw.chromium.launch(); const p = await b.newPage();
await p.goto(`http://127.0.0.1:${process.env.PORT || 8860}/kit_v4/timbrado_doc.html`); await p.waitForFunction(() => window.ready); await p.waitForTimeout(400);
await p.pdf({ path: '../../deliverables/kit_v4/V4_Papel_timbrado.pdf', format: 'A4', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } }); await b.close();
