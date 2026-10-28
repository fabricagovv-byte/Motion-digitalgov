// Apresentadora ilustrada (SVG) da DigitalGov. Tudo controlado por setPresenter(state) a cada quadro.
// viewBox 0 0 600 800 (busto). Estado: {open, wide, t, look, wave, point, nod}
function presenterSVG(id){
  const skin='#c98d6b', skinS='#b4775a', hair='#2b1a14', hairH='#4a2c20', shirt='#263050', shirtS='#1d2645', collar='#33407a';
  return `<svg id="${id}" viewBox="0 0 600 800" width="600" height="800" style="overflow:visible">
  <defs>
    <radialGradient id="${id}fg" cx="45%" cy="40%" r="65%"><stop offset="0" stop-color="#d79a77"/><stop offset="1" stop-color="${skin}"/></radialGradient>
    <linearGradient id="${id}sh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2d3a6b"/><stop offset="1" stop-color="${shirtS}"/></linearGradient>
    <clipPath id="${id}mc"><ellipse id="${id}mclip" cx="300" cy="402" rx="34" ry="4"/></clipPath>
  </defs>
  <g id="${id}body">
    <!-- cabelo atrás -->
    <path d="M168 292 C150 440 150 570 190 640 L410 640 C450 570 450 440 432 292 C420 182 180 182 168 292Z" fill="${hair}"/>
    <!-- pescoço -->
    <path d="M262 440 L262 520 C280 540 320 540 338 520 L338 440Z" fill="${skinS}"/>
    <!-- camisa polo -->
    <path d="M90 800 C90 640 140 560 230 530 C260 545 340 545 370 530 C460 560 510 640 510 800Z" fill="url(#${id}sh)"/>
    <path d="M230 530 L300 600 L370 530 L352 520 L300 572 L248 520Z" fill="${collar}"/>
    <path d="M300 572 L300 660" stroke="${shirtS}" stroke-width="5"/>
    <circle cx="300" cy="610" r="5" fill="#cfd6ea"/><circle cx="300" cy="640" r="5" fill="#cfd6ea"/>
    <image href="assets/mark_d.png" x="372" y="600" width="66" height="85" preserveAspectRatio="xMidYMid meet"/>
    <text x="405" y="705" text-anchor="middle" font-family="Mont,sans-serif" font-weight="800" font-size="15" fill="#e8eefc">DIGITALGOV</text>
    <!-- braço/mão que acena -->
    <g id="${id}arm" style="transform-origin:150px 690px">
      <path d="M120 800 L150 690 L200 700 L190 800Z" fill="${shirt}"/>
      <g id="${id}hand" style="transform-origin:160px 640px">
        <path d="M150 700 L148 610" stroke="${skinS}" stroke-width="40" stroke-linecap="round"/>
        <rect x="122" y="520" width="58" height="80" rx="26" fill="${skin}"/>
        <rect x="120" y="478" width="13" height="60" rx="6.5" fill="${skin}"/><rect x="136" y="468" width="13" height="66" rx="6.5" fill="${skin}"/>
        <rect x="152" y="470" width="13" height="64" rx="6.5" fill="${skin}"/><rect x="168" y="482" width="12" height="54" rx="6" fill="${skin}"/>
        <rect x="178" y="540" width="12" height="42" rx="6" fill="${skin}" transform="rotate(35 184 560)"/>
      </g>
    </g>
  </g>
  <g id="${id}head" style="transform-origin:300px 450px">
    <!-- orelhas e brincos -->
    <ellipse cx="208" cy="345" rx="18" ry="28" fill="${skinS}"/><ellipse cx="392" cy="345" rx="18" ry="28" fill="${skinS}"/>
    <circle cx="208" cy="378" r="6" fill="#FDB913"/><circle cx="392" cy="378" r="6" fill="#FDB913"/>
    <!-- rosto -->
    <path d="M212 300 C212 200 388 200 388 300 C388 400 350 460 300 462 C250 460 212 400 212 300Z" fill="url(#${id}fg)"/>
    <ellipse cx="248" cy="372" rx="20" ry="11" fill="#e08a7a" opacity=".35"/><ellipse cx="352" cy="372" rx="20" ry="11" fill="#e08a7a" opacity=".35"/>
    <!-- olhos -->
    <g id="${id}eyes">
      <ellipse cx="258" cy="320" rx="19" ry="12" fill="#fff"/><ellipse cx="342" cy="320" rx="19" ry="12" fill="#fff"/>
      <g id="${id}iris"><circle cx="258" cy="321" r="9" fill="#3a2418"/><circle cx="342" cy="321" r="9" fill="#3a2418"/>
        <circle cx="261" cy="318" r="3" fill="#fff"/><circle cx="345" cy="318" r="3" fill="#fff"/></g>
      <rect id="${id}lidL" x="236" y="305" width="44" height="0" fill="${skin}"/><rect id="${id}lidR" x="320" y="305" width="44" height="0" fill="${skin}"/>
      <path d="M238 314 Q258 300 280 314" stroke="#2b1a14" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M320 314 Q342 300 362 314" stroke="#2b1a14" stroke-width="4" fill="none" stroke-linecap="round"/>
    </g>
    <g id="${id}brows"><path d="M236 290 Q258 278 282 288" stroke="${hair}" stroke-width="7" fill="none" stroke-linecap="round"/>
      <path d="M318 288 Q342 278 364 290" stroke="${hair}" stroke-width="7" fill="none" stroke-linecap="round"/></g>
    <!-- nariz -->
    <path d="M300 330 Q294 362 288 372 Q300 380 312 372" stroke="${skinS}" stroke-width="4" fill="none" stroke-linecap="round"/>
    <!-- boca -->
    <g id="${id}mouth">
      <ellipse id="${id}mo" cx="300" cy="402" rx="34" ry="4" fill="#5a1f22"/>
      <g clip-path="url(#${id}mc)"><rect x="262" y="392" width="76" height="12" fill="#fff"/><ellipse cx="300" cy="420" rx="22" ry="10" fill="#c24a55"/></g>
      <path id="${id}lipU" d="M264 400 Q282 392 300 397 Q318 392 336 400" stroke="#b5485a" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path id="${id}lipL" d="M266 404 Q300 418 334 404" stroke="#b5485a" stroke-width="7" fill="none" stroke-linecap="round"/>
    </g>
    <!-- cabelo da frente -->
    <path d="M206 300 C200 190 300 160 360 190 C400 210 404 260 396 300 C380 240 330 220 300 232 C270 210 236 240 214 330Z" fill="${hair}"/>
    <path d="M300 232 C330 215 372 230 392 280" stroke="${hairH}" stroke-width="6" fill="none" stroke-linecap="round"/>
  </g>
</svg>`;
}
function setPresenter(id,s){
  const g=n=>document.getElementById(id+n);
  const o=s.open||0, w=s.wide||0;
  const ry=3+o*24, rx=30+w*8-o*4;
  g('mo').setAttribute('ry',ry); g('mo').setAttribute('rx',rx); g('mo').setAttribute('cy',400+ry*0.45);
  g('mclip').setAttribute('ry',ry); g('mclip').setAttribute('rx',rx); g('mclip').setAttribute('cy',400+ry*0.45);
  g('lipU').setAttribute('d',`M${300-rx-2} 400 Q${300-rx/2} ${392-o*2} 300 397 Q${300+rx/2} ${392-o*2} ${300+rx+2} 400`);
  g('lipL').setAttribute('d',`M${300-rx} ${402+o*4} Q300 ${416+ry*1.1} ${300+rx} ${402+o*4}`);
  // piscar a cada ~3,4 s (determinístico)
  const ph=(s.t*1.0+0.37)%3.4, bl=ph<0.14?Math.sin(ph/0.14*Math.PI):0;
  g('lidL').setAttribute('height',bl*28); g('lidR').setAttribute('height',bl*28);
  const lx=(s.look||0)*5; g('iris').setAttribute('transform',`translate(${lx} 0)`);
  g('brows').setAttribute('transform',`translate(0 ${-o*4 - (s.brow||0)*8})`);
  const tilt=Math.sin(s.t*0.9)*2.2 + (s.nod||0)*1.5, by=Math.sin(s.t*1.7)*2 - o*3;
  g('head').style.transform=`translateY(${22+by}px) rotate(${tilt}deg)`;
  g('body').style.transform=`translateY(${Math.sin(s.t*0.9+1)*2}px)`;
  const wv=s.wave||0, pt=s.point||0;
  const armUp=Math.max(wv,pt);
  g('arm').style.transform=`translateY(${(1-armUp)*420}px) rotate(${pt*-18}deg)`; g('arm').style.opacity=armUp>0.02?1:0;
  g('hand').style.transform=`rotate(${wv*Math.sin(s.t*9)*14 + pt*-30}deg)`;
}
