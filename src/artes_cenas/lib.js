// Biblioteca de ilustração: pessoas e objetos em SVG (estilo flat moderno).
const SKIN = ['#F2C9A4', '#E0AC85', '#C28660', '#8A5536', '#5E3824'];
const HAIR = ['#1E1A17', '#3B2A20', '#6B4A2E', '#B8894A', '#9A9A9A'];
const shade = (c, k) => { const n = parseInt(c.slice(1), 16); let r = n >> 16, g = n >> 8 & 255, b = n & 255; const f = v => Math.max(0, Math.min(255, Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k))); return '#' + [f(r), f(g), f(b)].map(v => v.toString(16).padStart(2, '0')).join(''); };
const ln = (pts, c, w) => `<path d="M${pts.map(p => p.join(' ')).join(' L')}" stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
const ARMS = {
  down: [[[-56, -455], [-72, -360], [-76, -268]], [[56, -455], [72, -360], [76, -268]]],
  tablet: [[[-56, -455], [-64, -352], [-6, -338]], [[56, -455], [72, -356], [42, -346]]],
  doc: [[[-56, -455], [-64, -352], [-6, -338]], [[56, -455], [72, -356], [42, -346]]],
  phone: [[[-56, -455], [-72, -360], [-76, -268]], [[56, -455], [84, -366], [52, -432]]],
  point: [[[-56, -455], [-72, -360], [-76, -268]], [[56, -455], [120, -420], [188, -446]]],
  wave: [[[-56, -455], [-72, -360], [-76, -268]], [[56, -455], [104, -540], [112, -628]]],
  box: [[[-56, -455], [-66, -365], [-30, -335]], [[56, -455], [84, -365], [92, -335]]],
  give: [[[-56, -455], [-72, -360], [-76, -268]], [[56, -455], [112, -400], [172, -392]]],
  sittype: [[[-50, -455], [10, -362], [104, -372]], [[56, -455], [96, -360], [150, -374]]],
  sitphone: [[[-50, -455], [-40, -350], [20, -320]], [[56, -455], [94, -372], [64, -432]]],
  sitdown: [[[-50, -455], [-20, -350], [40, -322]], [[56, -455], [80, -350], [100, -322]]],
};
function person(o) {
  const { x, y, s = 1, flip = false, skin = SKIN[1], hair = HAIR[0], hs = 'short', top = '#2E7DF6', bot = '#1F2A44', shoe = '#16131F', pose = 'down', coat = false, skirt = false, beard = false, glasses = false, short = false, prop = '' } = o;
  const sit = pose.startsWith('sit'), dy = sit ? 42 : 0, hy = -548 + dy;
  const A = ARMS[pose].map(a => a.map(([px, py]) => [px, py + dy]));
  let g = '';
  if (hs === 'long' || hs === 'longc') g += `<path d="M-47 ${hy - 6} Q-58 ${hy + 80} -44 ${hy + 104} L44 ${hy + 104} Q58 ${hy + 80} 47 ${hy - 6} Z" fill="${hair}"/>`;
  if (sit) {
    g += ln([[-14, -236], [104, -236], [108, -22]], bot, 44) + ln([[16, -244], [128, -244], [138, -24]], shade(bot, -.15), 44);
    g += `<ellipse cx="124" cy="-10" rx="32" ry="13" fill="${shoe}"/><ellipse cx="156" cy="-12" rx="32" ry="13" fill="${shoe}"/>`;
  } else if (skirt) {
    g += ln([[-22, -230], [-26, -24]], skin, 26) + ln([[22, -230], [26, -24]], shade(skin, -.08), 26);
    g += `<path d="M-50 -282 L50 -282 L66 -196 L-66 -196 Z" fill="${bot}"/>`;
    g += `<ellipse cx="-34" cy="-10" rx="26" ry="11" fill="${shoe}"/><ellipse cx="38" cy="-10" rx="26" ry="11" fill="${shoe}"/>`;
  } else {
    g += ln([[-24, -280], [-30, -140], [-34, -24]], bot, 44) + ln([[24, -280], [30, -140], [34, -24]], shade(bot, -.12), 44);
    g += `<ellipse cx="-38" cy="-10" rx="32" ry="13" fill="${shoe}"/><ellipse cx="42" cy="-10" rx="32" ry="13" fill="${shoe}"/>`;
  }
  // braço de trás
  const arm = (a, back) => { const c = back ? shade(top, -.15) : top, sk = back ? shade(skin, -.1) : skin;
    return ln([a[0], a[1]], c, 32) + ln([a[1], a[2]], short ? sk : c, short ? 24 : 28) + `<circle cx="${a[2][0]}" cy="${a[2][1]}" r="15" fill="${sk}"/>`; };
  g += arm(A[0], true);
  g += `<rect x="-13" y="${-508 + dy}" width="26" height="34" fill="${shade(skin, -.12)}"/>`;
  g += `<path d="M-62 ${-438 + dy} Q-62 ${-480 + dy} -28 ${-482 + dy} L28 ${-482 + dy} Q62 ${-480 + dy} 62 ${-438 + dy} L52 ${-262 + dy} L-52 ${-262 + dy} Z" fill="${top}"/>`;
  g += `<path d="M-14 ${-482 + dy} L0 ${-462 + dy} L14 ${-482 + dy} Z" fill="${shade(skin, -.12)}"/>`;
  if (coat) g += `<path d="M-66 ${-436 + dy} Q-66 ${-482 + dy} -26 ${-484 + dy} L-6 ${-440 + dy} L-8 ${-200 + dy * 0.2} L-70 ${-200 + dy * 0.2} Z" fill="#FFFFFF"/><path d="M66 ${-436 + dy} Q66 ${-482 + dy} 26 ${-484 + dy} L6 ${-440 + dy} L8 ${-200 + dy * 0.2} L70 ${-200 + dy * 0.2} Z" fill="#F1F3F7"/>`;
  g += `<ellipse cx="0" cy="${hy}" rx="40" ry="46" fill="${skin}"/><ellipse cx="-38" cy="${hy + 6}" rx="9" ry="12" fill="${shade(skin, -.1)}"/>`;
  // cabelo
  const cap = `M-43 ${hy - 2} Q-47 ${hy - 58} 2 ${hy - 58} Q47 ${hy - 56} 44 ${hy - 8} Q34 ${hy - 34} -6 ${hy - 32} Q-30 ${hy - 28} -36 ${hy + 4} Z`;
  if (hs === 'short' || hs === 'long') g += `<path d="${cap}" fill="${hair}"/>`;
  if (hs === 'long') g += `<path d="M-43 ${hy - 6} Q-50 ${hy + 40} -40 ${hy + 60} L-34 ${hy + 6} Z" fill="${hair}"/>`;
  if (hs === 'bun') g += `<path d="${cap}" fill="${hair}"/><circle cx="-14" cy="${hy - 64}" r="22" fill="${hair}"/>`;
  if (hs === 'curly' || hs === 'longc') for (let i = 0; i < 9; i++) { const a = Math.PI * (1.05 + i * .11); g += `<circle cx="${Math.cos(a) * 40}" cy="${hy - 8 + Math.sin(a) * 44}" r="${hs === 'longc' ? 17 : 15}" fill="${hair}"/>`; }
  if (hs === 'buzz') g += `<path d="M-41 ${hy - 6} Q-44 ${hy - 50} 2 ${hy - 50} Q44 ${hy - 50} 42 ${hy - 6} Q30 ${hy - 26} 0 ${hy - 26} Q-30 ${hy - 26} -41 ${hy - 6}Z" fill="${hair}"/>`;
  if (beard) g += `<path d="M-36 ${hy + 6} Q-34 ${hy + 52} 4 ${hy + 52} Q38 ${hy + 50} 40 ${hy + 6} Q30 ${hy + 30} 4 ${hy + 30} Q-22 ${hy + 30} -36 ${hy + 6}Z" fill="${hair}"/>`;
  g += `<circle cx="-4" cy="${hy - 2}" r="4.5" fill="#1B1820"/><circle cx="22" cy="${hy - 2}" r="4.5" fill="#1B1820"/>`;
  g += `<path d="M2 ${hy + 20} Q11 ${hy + 28} 20 ${hy + 20}" stroke="${beard ? '#F4F1EA' : '#7A3B2E'}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  if (glasses) g += `<g stroke="#1B1820" stroke-width="3" fill="none"><circle cx="-4" cy="${hy - 2}" r="12"/><circle cx="22" cy="${hy - 2}" r="12"/><path d="M8 ${hy - 2} L10 ${hy - 2}"/></g>`;
  // objeto na mão
  const h = A[1][2];
  if (prop === 'tablet') g += `<g transform="translate(${h[0] - 18} ${h[1] - 6}) rotate(-8)"><rect x="-62" y="-46" width="124" height="88" rx="10" fill="#22202B"/><rect x="-55" y="-39" width="110" height="74" rx="5" fill="${o.screen || '#8FD3FF'}"/><rect x="-46" y="-30" width="54" height="8" rx="4" fill="#fff"/><rect x="-46" y="-16" width="80" height="6" rx="3" fill="#ffffffaa"/><rect x="-46" y="-4" width="64" height="6" rx="3" fill="#ffffffaa"/><rect x="-46" y="10" width="40" height="16" rx="5" fill="#fff"/></g>`;
  if (prop === 'doc') g += `<g transform="translate(${h[0] - 18} ${h[1] - 10}) rotate(-6)"><rect x="-50" y="-66" width="100" height="128" rx="6" fill="#fff" stroke="#D9DBE3" stroke-width="2"/>${[0, 1, 2, 3, 4].map(i => `<rect x="-36" y="${-48 + i * 20}" width="${i % 2 ? 50 : 72}" height="7" rx="3" fill="#C9CCD8"/>`).join('')}</g>`;
  if (prop === 'phone' || pose === 'sitphone') g += `<g transform="translate(${h[0] - 4} ${h[1] - 14}) rotate(-10)"><rect x="-17" y="-32" width="34" height="62" rx="7" fill="#22202B"/><rect x="-13" y="-27" width="26" height="50" rx="3" fill="${o.screen || '#8FD3FF'}"/></g>`;
  if (prop === 'paper') g += `<g transform="translate(${h[0] + 22} ${h[1] - 10}) rotate(8)"><rect x="-34" y="-44" width="68" height="88" rx="4" fill="#fff" stroke="#D9DBE3" stroke-width="2"/>${[0, 1, 2].map(i => `<rect x="-22" y="${-30 + i * 18}" width="44" height="6" rx="3" fill="#C9CCD8"/>`).join('')}</g>`;
  if (pose === 'box') g += box(-48, -440 + dy, 150, 118);
  g += arm(A[1], false);
  if (pose === 'tablet' || pose === 'doc' || pose === 'box') g += `<circle cx="${A[0][2][0]}" cy="${A[0][2][1]}" r="15" fill="${shade(skin, -.06)}"/>`;
  return `<g transform="translate(${x} ${y}) scale(${flip ? -s : s} ${s})">${g}</g>`;
}
function box(x, y, w, h, c = '#C9935A') { return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${c}"/><rect x="${x}" y="${y}" width="${w}" height="16" rx="6" fill="${shade(c, -.15)}"/><rect x="${x + w / 2 - 14}" y="${y}" width="28" height="${h * .45}" fill="${shade(c, .25)}"/></g>`; }
function plant(x, y, s = 1, c = '#2FA36B') { return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 -60 Q-60 -130 -40 -200 Q-10 -140 0 -60Z" fill="${c}"/><path d="M0 -60 Q50 -150 30 -220 Q-2 -150 0 -60Z" fill="${shade(c, -.15)}"/><path d="M0 -60 Q-20 -170 6 -250 Q24 -170 0 -60Z" fill="${shade(c, .15)}"/><path d="M-38 -66 L38 -66 L28 0 L-28 0Z" fill="#E7E2D8"/></g>`; }
function tree(x, y, s = 1, c = '#3DBB7A') { return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-10" y="-120" width="20" height="120" fill="#8A6044"/><circle cx="0" cy="-170" r="70" fill="${c}"/><circle cx="-40" cy="-140" r="46" fill="${shade(c, -.12)}"/><circle cx="40" cy="-138" r="50" fill="${shade(c, .1)}"/></g>`; }
function house(x, y, w, h, wall = '#FFE6C7', roof = '#E0644A') { return `<g><rect x="${x}" y="${y - h}" width="${w}" height="${h}" fill="${wall}"/><path d="M${x - 20} ${y - h} L${x + w / 2} ${y - h - w * .42} L${x + w + 20} ${y - h}Z" fill="${roof}"/><rect x="${x + w * .58}" y="${y - h * .62}" width="${w * .24}" height="${h * .62}" rx="4" fill="${shade(wall, -.35)}"/><rect x="${x + w * .14}" y="${y - h * .7}" width="${w * .28}" height="${h * .3}" rx="4" fill="#9ED3F5"/></g>`; }
function hospital(x, y, w, h, label = 'HOSPITAL MUNICIPAL', c = '#FFFFFF') { let win = ''; for (let r = 0; r < 3; r++) for (let k = 0; k < 5; k++) win += `<rect x="${x + 30 + k * (w - 60) / 5 + 6}" y="${y - h + 110 + r * (h - 170) / 3}" width="${(w - 60) / 5 - 12}" height="${(h - 170) / 3 - 22}" rx="4" fill="#BFE4FA"/>`;
  return `<g><rect x="${x}" y="${y - h}" width="${w}" height="${h}" rx="8" fill="${c}"/><rect x="${x}" y="${y - h}" width="${w}" height="80" rx="8" fill="#E9EEF5"/><text x="${x + w / 2 + 30}" y="${y - h + 52}" text-anchor="middle" font-size="26" font-weight="700" fill="#1F2A44" font-family="Inter">${label}</text><g transform="translate(${x + 40} ${y - h + 40})"><rect x="-8" y="-24" width="16" height="48" fill="#E5484D"/><rect x="-24" y="-8" width="48" height="16" fill="#E5484D"/></g>${win}<rect x="${x + w / 2 - 50}" y="${y - 90}" width="100" height="90" fill="#9ED3F5"/><rect x="${x + w / 2 - 2}" y="${y - 90}" width="4" height="90" fill="#fff"/></g>`; }
function desk(x, y, w) { return `<g><rect x="${x}" y="${y}" width="${w}" height="20" rx="6" fill="#B9845A"/><rect x="${x + 20}" y="${y + 20}" width="16" height="${210}" fill="#8F6342"/><rect x="${x + w - 36}" y="${y + 20}" width="16" height="210" fill="#8F6342"/></g>`; }
function chair(x, y, s = 1, c = '#2B2D3A') { return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-40" y="-250" width="170" height="26" rx="12" fill="${c}"/><rect x="-52" y="-470" width="30" height="240" rx="14" fill="${c}"/><rect x="40" y="-228" width="14" height="200" fill="${shade(c, .25)}"/><rect x="-20" y="-30" width="134" height="12" rx="6" fill="${shade(c, .25)}"/></g>`; }
function laptop(x, y, s = 1, scr = '#E8F1FF', inner = '') { return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-20 0 L-150 0 L-128 -150 L22 -150 Z" fill="#2A2C36"/><path d="M-26 -8 L-141 -8 L-122 -142 L14 -142 Z" fill="${scr}"/>${inner}<rect x="-170" y="0" width="230" height="12" rx="6" fill="#3A3D4A"/></g>`; }
function monitor(x, y, w, h, inner = '', scr = '#fff') { return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="#22242E"/><rect x="${x + 12}" y="${y + 12}" width="${w - 24}" height="${h - 24}" rx="6" fill="${scr}"/><rect x="${x + w / 2 - 14}" y="${y + h}" width="28" height="50" fill="#3A3D4A"/><rect x="${x + w / 2 - 70}" y="${y + h + 46}" width="140" height="12" rx="6" fill="#3A3D4A"/>${inner}</g>`; }
function scanner(x, y, s = 1, c = '#2E7DF6') { return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-120" y="-90" width="240" height="90" rx="16" fill="#E9ECF3"/><rect x="-120" y="-30" width="240" height="30" rx="10" fill="#C9CEDB"/><rect x="-100" y="-120" width="200" height="40" rx="8" fill="#D7DBE6"/><rect x="-70" y="-190" width="140" height="90" fill="#fff" stroke="#D9DBE3" stroke-width="2" transform="rotate(-12 0 -150)"/><rect x="-90" y="-62" width="180" height="8" rx="4" fill="${c}"/><circle cx="90" cy="-60" r="8" fill="#2FBF8F"/></g>`; }
function cloud(x, y, s = 1, c = '#2E7DF6') { return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-110 40 Q-160 40 -160 -5 Q-160 -50 -112 -52 Q-100 -120 -30 -118 Q30 -150 80 -100 Q150 -100 155 -30 Q190 -10 170 30 Q160 42 130 40 Z" fill="${c}"/><rect x="-46" y="-50" width="92" height="64" rx="8" fill="#fff"/><path d="M-46 -42 L-46 -58 L-12 -58 L-4 -50 Z" fill="#fff"/><path d="M-18 -18 L-4 -4 L22 -32" stroke="${c}" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`; }
function papers(x, y, n = 6, chaos = false) { let g = ''; for (let i = 0; i < n; i++) g += `<rect x="${x + (chaos ? (i * 37 % 40) - 20 : i * 2)}" y="${y - i * 14}" width="150" height="20" rx="3" fill="${i % 2 ? '#fff' : '#F3EFE4'}" stroke="#D9D3C4" stroke-width="2" transform="rotate(${chaos ? (i * 53 % 24) - 12 : 0} ${x + 75} ${y - i * 14})"/>`; return g; }
function shelves(x, y, w, h) { let g = `<rect x="${x}" y="${y - h}" width="${w}" height="${h}" fill="#E7DCCB"/>`; const cs = ['#5B6CFF', '#1FC48A', '#F0578E', '#FFB020', '#FF8A3D', '#8B3DFF'];
  for (let r = 0; r < 4; r++) { const yy = y - h + 20 + r * (h - 20) / 4; g += `<rect x="${x}" y="${yy + (h - 20) / 4 - 14}" width="${w}" height="12" fill="#B9845A"/>`; for (let k = 0; k < 6; k++) { const bh = 40 + (r * 7 + k * 13) % 30; g += `<rect x="${x + 14 + k * (w - 20) / 6}" y="${yy + (h - 20) / 4 - 14 - bh}" width="${(w - 20) / 6 - 10}" height="${bh}" rx="4" fill="${cs[(r + k) % 6]}"/><rect x="${x + 20 + k * (w - 20) / 6}" y="${yy + (h - 20) / 4 - bh}" width="${(w - 20) / 6 - 22}" height="10" rx="3" fill="#ffffffcc"/>`; } }
  return g; }
function ambulance(x, y, s = 1) { return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-160 -20 L-160 -150 Q-160 -160 -150 -160 L60 -160 L60 -20Z" fill="#fff"/><path d="M60 -130 L120 -130 L160 -80 L160 -20 L60 -20Z" fill="#F4F6FA"/><path d="M72 -120 L114 -120 L144 -82 L72 -82Z" fill="#9ED3F5"/><rect x="-160" y="-70" width="320" height="18" fill="#E5484D"/><g transform="translate(-50 -112)"><rect x="-8" y="-26" width="16" height="52" fill="#E5484D"/><rect x="-26" y="-8" width="52" height="16" fill="#E5484D"/></g><rect x="-20" y="-178" width="40" height="18" rx="6" fill="#5B6CFF"/><circle cx="-90" cy="-14" r="30" fill="#22242E"/><circle cx="-90" cy="-14" r="12" fill="#C9CEDB"/><circle cx="100" cy="-14" r="30" fill="#22242E"/><circle cx="100" cy="-14" r="12" fill="#C9CEDB"/></g>`; }
function qr(x, y, s) { let g = `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="10" fill="#fff"/>`; const c = s / 11; for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) if ((i * 7 + j * 3 + i * j) % 3 === 0 || ((i < 3 || i > 5) && (j < 3 || j > 5) && !(i === 1 || i === 7 || j === 1 || j === 7))) g += `<rect x="${x + c + i * c}" y="${y + c + j * c}" width="${c}" height="${c}" fill="#16131F"/>`; return g; }
function door(x, y, w, h, c = '#7A5A44') { return `<g><rect x="${x - 14}" y="${y - h - 14}" width="${w + 28}" height="${h + 14}" fill="#F4F1EA"/><rect x="${x}" y="${y - h}" width="${w}" height="${h}" fill="${c}"/><circle cx="${x + w - 20}" cy="${y - h / 2}" r="7" fill="#E8B65A"/></g>`; }
