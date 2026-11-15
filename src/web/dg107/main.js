// Motor do filme DIGITALGOV 10.7: window.renderFrame(t) desenha o quadro do instante t (determinístico).
import { range, smooth, easeInOutCubic, lerp, el } from './util.js';
const params = new URLSearchParams(location.search);
const SC = { s1: () => import('./s1.js'), s2: () => import('./s2.js'), s3: () => import('./s3.js'), s4: () => import('./s4.js'), s5: () => import('./s5.js'), s6: () => import('./s6.js'), s7: () => import('./s7.js') };
const OUT = 0.38, IN = 0.5;   // saída para o escuro / entrada a partir do escuro

async function init() {
  const TL = await (await fetch('/src/dg107/timeline.json')).json();
  for (const f of ['600 40px "Inter Display"', '700 40px "Inter Display"', '400 40px "Inter"', '500 40px "Inter"', '600 40px "Inter"', '700 40px "Inter"', '800 40px "Inter"', '400 12px "DejaVu Sans Mono"', '400 12px "Liberation Serif"', '700 12px "Liberation Serif"']) await document.fonts.load(f);
  const only = params.get('only'); const host = document.getElementById('scenes');
  const list = TL.scenes.filter((s) => !only || only.split(',').includes(s.id));
  for (const s of list) { s.root = el('div', 'scene', host); s.api = (await SC[s.id]()).create(s.root, TL, s); }
  await Promise.all([...document.images].map((i) => i.decode().catch(() => {})));
  const g1 = document.querySelector('.g1'), g2 = document.querySelector('.g2'), grid = document.querySelector('#bg .grid'), sweep = document.getElementById('sweep'), fade = document.getElementById('fade');
  const last = TL.scenes[TL.scenes.length - 1].id, first = TL.scenes[0].id;

  window.renderFrame = (t) => {
    g1.style.transform = `translate(${Math.sin(t * 0.11) * 120}px,${Math.cos(t * 0.09) * 70}px)`;
    g2.style.transform = `translate(${Math.cos(t * 0.08) * 140}px,${Math.sin(t * 0.1) * 60}px)`;
    grid.style.transform = `translate(${-(t * 6) % 64}px,${-(t * 3) % 64}px)`;
    let sw = 0, sx = 0;
    for (const s of list) {
      const lt = t - s.start, dur = s.end - s.start;
      const vis = lt >= 0 && lt < dur; s.root.style.display = vis ? 'block' : 'none'; if (!vis) continue;
      const a = s.id === first ? 1 : smooth(range(lt, 0, IN)), b = s.id === last ? 1 : 1 - smooth(range(lt, dur - OUT, dur));
      s.root.style.opacity = a * b;
      s.root.style.transform = `scale(${lerp(1.035, 1, easeInOutCubic(range(lt, 0, IN + 0.2))) * lerp(1, 1.03, range(lt, dur - OUT, dur))})`;
      s.root.style.filter = a * b < 0.999 ? `blur(${(1 - a * b) * 10}px)` : 'none';
      s.api.update(lt, dur, t);
      if (s.id !== first && lt < 0.6) { sw = Math.sin(Math.PI * range(lt, -0.4, 0.6)); sx = range(lt, -0.4, 0.6); }
      if (s.id !== last && lt > dur - 0.4) { sw = Math.sin(Math.PI * range(lt, dur - 0.4, dur + 0.6)); sx = range(lt, dur - 0.4, dur + 0.6); }
    }
    sweep.style.opacity = sw * 0.9; sweep.style.transform = `translateX(${lerp(-520, 1920, sx)}px) skewX(-14deg)`;
    fade.style.opacity = Math.max(1 - smooth(range(t, 0, 0.7)), smooth(range(t, TL.duration - 0.9, TL.duration - 0.1)));
  };
  window.__ready = true;
}
init().catch((e) => { console.error(e); window.__error = String(e && e.stack || e); });
