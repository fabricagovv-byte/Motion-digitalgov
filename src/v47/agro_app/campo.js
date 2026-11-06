// Cenário de lavoura em perspectiva (canvas 2D): céu, linha de árvores, fileiras de soja, trator pulverizando, drone e folha em primeiro plano.
// drawCampo(ctx, W, H, {t, hy, vx, trator:{x,y,s}, drone:{x,y,s}, folha:true, avanco})
(function () {
  const rnd = (s => () => (s = (s * 16807) % 2147483647) / 2147483647);
  function ceu(c, W, H, hy) {
    const g = c.createLinearGradient(0, 0, 0, hy); g.addColorStop(0, '#9CC9E8'); g.addColorStop(.6, '#D8E9EE'); g.addColorStop(1, '#F6E6C8');
    c.fillStyle = g; c.fillRect(0, 0, W, hy + 2);
    const s = c.createRadialGradient(W * .78, hy - 40, 10, W * .78, hy - 40, W * .55); s.addColorStop(0, 'rgba(255,236,190,.95)'); s.addColorStop(.25, 'rgba(255,226,170,.45)'); s.addColorStop(1, 'rgba(255,226,170,0)');
    c.fillStyle = s; c.fillRect(0, 0, W, hy + 2);
  }
  function arvores(c, W, hy) {
    const r = rnd(7); c.fillStyle = '#4E6B3A';
    for (let x = -20; x < W + 40; x += 18) { const h = 10 + r() * 26; c.beginPath(); c.ellipse(x, hy - h * .4, 16 + r() * 14, h, 0, 0, Math.PI * 2); c.fill(); }
    c.fillStyle = '#5E7D43'; c.fillRect(0, hy - 4, W, 8);
  }
  function planta(c, x, y, s, k) {
    const cores = ['#3E8A2A', '#4FA033', '#2F7322', '#5DB03B', '#78C24A'];
    for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * .55 + Math.sin(k * 3 + i) * .15, l = s * (.9 + .25 * ((k * 7 + i) % 3) / 2);
      c.fillStyle = cores[(k + i) % cores.length]; c.beginPath(); c.ellipse(x + Math.cos(a) * l * .55, y + Math.sin(a) * l * .45, l * .55, l * .3, a, 0, Math.PI * 2); c.fill(); }
    c.fillStyle = 'rgba(255,255,220,.18)'; c.beginPath(); c.ellipse(x - s * .15, y - s * .45, s * .25, s * .12, -.4, 0, Math.PI * 2); c.fill();
  }
  function lavoura(c, W, H, hy, vx, avanco) {
    const g = c.createLinearGradient(0, hy, 0, H); g.addColorStop(0, '#5F7A3C'); g.addColorStop(.4, '#3D2E22'); g.addColorStop(1, '#2A1F17');
    c.fillStyle = g; c.fillRect(0, hy, W, H - hy);
    const rows = []; for (let i = -26; i <= 26; i++) rows.push(vx + i * W * .16);
    const itens = [];
    rows.forEach((rx, ri) => { for (let d = 1.2; d < 90; d += .55) { const dd = d - (avanco % .55); if (dd < 1) continue; const p = 1 / dd, y = hy + (H - hy) * p * 1.15; if (y > H + 80) continue;
      const x = vx + (rx - vx) * (y - hy) / (H - hy); if (x < -120 || x > W + 120) continue; itens.push([y, x, (y - hy) / (H - hy), ri * 131 + Math.round(d * 10)]); } });
    itens.sort((a, b) => a[0] - b[0]);
    for (const [y, x, f, k] of itens) planta(c, x, y, 6 + f * 150, k);
    const n = c.createLinearGradient(0, hy - 10, 0, hy + 140); n.addColorStop(0, 'rgba(230,236,220,.75)'); n.addColorStop(1, 'rgba(230,236,220,0)');
    c.fillStyle = n; c.fillRect(0, hy - 10, W, 150);
  }
  function trator(c, x, y, s, t) {
    c.save(); c.translate(x, y); c.scale(s, s);
    // névoa da pulverização
    c.save(); c.filter = 'blur(14px)';
    for (let i = 0; i < 24; i++) { const px = -620 + i * 54 + Math.sin(t * 3 + i) * 6, py = 60 + Math.sin(i * 1.7 + t * 2) * 10;
      c.fillStyle = `rgba(245,248,240,${.28 + .12 * Math.sin(i + t * 4)})`; c.beginPath(); c.ellipse(px, py, 80, 40 + 8 * Math.sin(i), 0, 0, Math.PI * 2); c.fill(); }
    c.restore();
    // barra de pulverização
    c.fillStyle = '#B5432C'; c.fillRect(-640, 8, 1280, 12); c.fillRect(-640, -30, 10, 50); c.fillRect(630, -30, 10, 50);
    c.strokeStyle = '#B5432C'; c.lineWidth = 6; c.beginPath(); c.moveTo(-640, -30); c.lineTo(-120, -6); c.moveTo(640, -30); c.lineTo(120, -6); c.stroke();
    for (let i = -620; i <= 620; i += 40) { c.fillStyle = '#7A2B1C'; c.fillRect(i, 20, 6, 10); }
    // rodas traseiras
    c.fillStyle = '#1C1C1E'; c.beginPath(); c.roundRect(-210, -120, 90, 210, 30); c.fill(); c.beginPath(); c.roundRect(120, -120, 90, 210, 30); c.fill();
    c.strokeStyle = '#2E2E31'; c.lineWidth = 6; for (let j = -100; j < 80; j += 22) { c.beginPath(); c.moveTo(-205, j); c.lineTo(-125, j + 10); c.moveTo(125, j); c.lineTo(205, j + 10); c.stroke(); }
    // tanque
    c.fillStyle = '#C9DE8A'; c.beginPath(); c.roundRect(-190, -250, 170, 150, 26); c.fill(); c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(-175, -235, 30, 120);
    // capô e cabine
    c.fillStyle = '#C0412A'; c.beginPath(); c.roundRect(-110, -160, 220, 170, 18); c.fill();
    c.fillStyle = '#23262B'; c.beginPath(); c.roundRect(-120, -360, 240, 210, 16); c.fill();
    c.fillStyle = '#9EC3D6'; c.beginPath(); c.roundRect(-104, -344, 96, 170, 8); c.fill(); c.beginPath(); c.roundRect(8, -344, 96, 170, 8); c.fill();
    c.fillStyle = 'rgba(255,255,255,.45)'; c.beginPath(); c.moveTo(-100, -340); c.lineTo(-60, -340); c.lineTo(-100, -270); c.fill();
    c.fillStyle = '#3B3E44'; c.fillRect(150, -330, 14, 180);
    c.fillStyle = '#FF9F1C'; c.beginPath(); c.arc(-100, -372, 12, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#FFF4C2'; c.beginPath(); c.arc(-70, -40, 14, 0, Math.PI * 2); c.arc(70, -40, 14, 0, Math.PI * 2); c.fill();
    // rodas dianteiras
    c.fillStyle = '#1C1C1E'; c.beginPath(); c.roundRect(-100, 20, 56, 90, 18); c.fill(); c.beginPath(); c.roundRect(44, 20, 56, 90, 18); c.fill();
    c.restore();
  }
  function drone(c, x, y, s, t) {
    c.save(); c.translate(x, y); c.scale(s, s);
    c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(0, 260, 120, 22, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#2A2E35'; c.lineWidth = 14; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-120, -10); c.lineTo(120, -10); c.stroke();
    for (const sx of [-140, 140]) { c.fillStyle = 'rgba(230,236,240,.55)'; c.beginPath(); c.ellipse(sx, -26, 90 * Math.abs(Math.cos(t * 30 + sx)) + 20, 8, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#2A2E35'; c.fillRect(sx - 6, -30, 12, 22); }
    c.fillStyle = '#F2F4F6'; c.beginPath(); c.roundRect(-60, -30, 120, 54, 20); c.fill();
    c.fillStyle = '#2A2E35'; c.beginPath(); c.arc(0, 34, 16, 0, Math.PI * 2); c.fill(); c.fillStyle = '#5FA8FF'; c.beginPath(); c.arc(0, 34, 7, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#2A2E35'; c.lineWidth = 6; c.beginPath(); c.moveTo(-40, 24); c.lineTo(-56, 54); c.moveTo(40, 24); c.lineTo(56, 54); c.stroke();
    c.restore();
  }
  function folha(c, x, y, s, rot) {
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
    const g = c.createLinearGradient(-200, -100, 200, 100); g.addColorStop(0, '#2E8B2A'); g.addColorStop(.6, '#5DBB3A'); g.addColorStop(1, '#9AD45A');
    c.fillStyle = g; c.beginPath(); c.moveTo(-260, 0); c.bezierCurveTo(-120, -170, 140, -170, 280, 0); c.bezierCurveTo(140, 150, -120, 150, -260, 0); c.fill();
    c.strokeStyle = 'rgba(230,255,200,.6)'; c.lineWidth = 6; c.beginPath(); c.moveTo(-250, 0); c.quadraticCurveTo(0, -12, 270, 0); c.stroke();
    c.lineWidth = 3; for (let i = -180; i < 220; i += 60) { c.beginPath(); c.moveTo(i, -4); c.lineTo(i + 50, -70); c.moveTo(i, 2); c.lineTo(i + 50, 66); c.stroke(); }
    c.restore();
  }
  window.drawCampo = function (c, W, H, o = {}) {
    const t = o.t || 0, hy = o.hy ?? H * .34, vx = o.vx ?? W * .55;
    c.clearRect(0, 0, W, H); ceu(c, W, H, hy); arvores(c, W, hy); lavoura(c, W, H, hy, vx, o.avanco || 0);
    if (o.trator) trator(c, o.trator.x, o.trator.y, o.trator.s, t);
    if (o.drone) drone(c, o.drone.x, o.drone.y, o.drone.s, t);
    if (o.folha) folha(c, o.folha.x ?? 40, o.folha.y ?? 60, o.folha.s ?? 1, o.folha.r ?? -.6);
  };
})();
