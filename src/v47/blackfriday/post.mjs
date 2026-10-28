import { createRequire } from 'node:module'; const require = createRequire(import.meta.url); let pw; try { pw = require('playwright'); } catch { pw = require('/opt/node22/lib/node_modules/playwright'); }
const OUT = '../../../deliverables/v47/blackfriday', b = await pw.chromium.launch();
for (const [q, h, n] of [['feed', 1350, 'V47_Black_Friday_post_feed_1080x1350.png'], ['story', 1920, 'V47_Black_Friday_story_1080x1920.png']]) {
  const p = await b.newPage({ viewport: { width: 1080, height: h } }); await p.goto(`http://127.0.0.1:${process.env.PORT}/blackfriday/post.html?${q}`); await p.waitForFunction(() => window.ready); await p.waitForTimeout(300);
  await p.screenshot({ path: `${OUT}/${n}` }); await p.close(); }
await b.close();
