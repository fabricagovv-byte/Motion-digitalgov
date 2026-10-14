// Utilidades determinísticas: todo o filme é função pura do tempo t (permite render paralelo).
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const range = (t, a, b) => clamp((t - a) / (b - a));
export const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
export const smoother = (x) => { x = clamp(x); return x * x * x * (x * (x * 6 - 15) + 10); };
export const easeOutCubic = (x) => 1 - Math.pow(1 - clamp(x), 3);
export const easeOutExpo = (x) => (x = clamp(x)) >= 1 ? 1 : 1 - Math.pow(2, -10 * x);
export const easeInOutCubic = (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
export const easeInOutSine = (x) => -(Math.cos(Math.PI * clamp(x)) - 1) / 2;
export function rng(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export const FONT = '"Inter", sans-serif';
export const FONT_D = '"Inter Display", "Inter", sans-serif';
export function roundRect(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}

// Trajetória de câmera por keyframes [{t, p:[x,y,z], l:[x,y,z]}] com Catmull-Rom + easing por trecho.
function cr(p0, p1, p2, p3, s) { const s2 = s * s, s3 = s2 * s;
  return 0.5 * ((2 * p1) + (-p0 + p2) * s + (2 * p0 - 5 * p1 + 4 * p2 - p3) * s2 + (-p0 + 3 * p1 - 3 * p2 + p3) * s3); }
export function camPath(camera, t, keys, ease = (x) => x) {
  let i = 0; while (i < keys.length - 2 && t > keys[i + 1].t) i++;
  const k0 = keys[Math.max(0, i - 1)], k1 = keys[i], k2 = keys[i + 1], k3 = keys[Math.min(keys.length - 1, i + 2)];
  const s = ease(clamp((t - k1.t) / (k2.t - k1.t)));
  const P = [0, 1, 2].map((j) => cr(k0.p[j], k1.p[j], k2.p[j], k3.p[j], s));
  const L = [0, 1, 2].map((j) => cr(k0.l[j], k1.l[j], k2.l[j], k3.l[j], s));
  camera.position.set(P[0], P[1], P[2]); camera.lookAt(L[0], L[1], L[2]);
}
