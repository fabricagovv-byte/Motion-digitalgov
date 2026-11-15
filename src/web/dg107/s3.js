// Cena 3 — DIGITALGOV RESTORE AI: restauração digital, verificação de legibilidade, comparação ANTES/DEPOIS e validação humana.
import { el, box, shell, cam, ic, fmt, range, lerp, clamp, smooth, easeOutCubic, easeInOutCubic, appear } from './util.js';

const PAGE = `<div style="position:absolute;inset:0;padding:44px 48px;font-family:'Liberation Serif',serif;color:#1c1f24;font-size:13.2px;line-height:1.5">
  <div style="text-align:center;font-weight:700;font-size:15px;letter-spacing:.04em">SECRETARIA DE ADMINISTRAÇÃO</div>
  <div style="text-align:center;font-size:12px;margin-top:2px">Departamento de Gestão de Contratos</div>
  <div style="height:1px;background:#333;margin:12px 0 18px"></div>
  <div style="display:flex;justify-content:space-between"><b>OFÍCIO Nº 118/1998</b><span>14 de março de 1998</span></div>
  <div style="margin-top:14px"><b>Assunto:</b> Encaminhamento de documentação contratual.</div>
  <p style="text-align:justify;text-indent:28px;margin:14px 0 0">Senhor Diretor, encaminhamos a Vossa Senhoria a documentação referente ao contrato de prestação de serviços firmado no exercício anterior, composta pelo termo original, seus aditivos e os respectivos comprovantes de publicação, para fins de arquivamento e consulta.</p>
  <p style="text-align:justify;text-indent:28px;margin:10px 0 0">Informamos que os documentos foram conferidos página a página e se encontram numerados em ordem cronológica, acompanhados da relação de anexos e da ficha de controle de tramitação entre os setores envolvidos.</p>
  <p style="text-align:justify;text-indent:28px;margin:10px 0 0">Solicitamos que eventuais divergências sejam comunicadas a este Departamento no prazo de dez dias úteis, contados do recebimento deste expediente.</p>
  <p style="text-indent:28px;margin:10px 0 0">Atenciosamente,</p>
  <svg width="190" height="54" viewBox="0 0 190 54" style="margin:8px 0 0 40px"><path d="M4 38c14-22 22-30 27-22s-12 30-4 26 16-30 24-26-6 22 2 20 12-18 20-16-2 14 6 12 14-12 24-10 8 8 20 4 22-8 40-6" fill="none" stroke="#1b2a5c" stroke-width="1.6" stroke-linecap="round"/></svg>
  <div style="margin-left:40px;font-size:12px">Chefe do Departamento</div>
  <div style="position:absolute;right:54px;bottom:70px;width:104px;height:104px;border-radius:50%;border:2px solid #3b4f9c;color:#3b4f9c;display:grid;place-items:center;text-align:center;font-family:'Inter';font-size:9.5px;font-weight:700;letter-spacing:.08em;transform:rotate(-12deg);opacity:.85"><div>PROTOCOLO<br><span style="font-size:15px">00742</span><br>RECEBIDO</div></div>
</div>`;
const ISSUES = [['Manchas', 'removidas'], ['Baixa nitidez', 'aprimorada'], ['Sombras', 'corrigidas'], ['Desalinhamento', 'corrigido']];

export function create(root) {
  const { win, content } = shell(root, { active: 'restore', crumb: 'DIGITALGOV RESTORE AI', title: 'Restauração e controle de qualidade' });
  const V = box(content, 'panel', 0, 0, 930, 790, `<div class="ph">${ic('wand')}Restauração digital<span class="r">comparação visual</span></div>`);
  const stage = box(V, 'abs', 20, 50, 890, 720, ''); stage.style.cssText += 'border-radius:12px;background:radial-gradient(ellipse at 50% 40%,#1a222d,#0b0f14);overflow:hidden;';
  const PW = 500, PH = 680, PX = 195, PY = 20;
  // DEPOIS (base) e ANTES (recortado pelo divisor)
  const aft = box(stage, 'abs', PX, PY, PW, PH, PAGE); aft.style.cssText += 'background:#fdfdfb;box-shadow:0 20px 60px rgba(0,0,0,.6);';
  const clipB = box(stage, 'abs', 0, 0, 890, 720, ''); clipB.style.overflow = 'hidden';
  const inner = box(clipB, 'abs', 0, 0, 890, 720, ''); inner.style.background = 'radial-gradient(ellipse at 50% 40%,#1a222d,#0b0f14)';
  const bef = box(inner, 'abs', PX, PY, PW, PH, PAGE + `
    <div style="position:absolute;inset:0;background:radial-gradient(ellipse 120px 90px at 22% 30%,rgba(120,80,20,.42),transparent 70%),radial-gradient(ellipse 150px 120px at 72% 62%,rgba(110,70,20,.34),transparent 70%),radial-gradient(ellipse 70px 60px at 58% 16%,rgba(90,60,20,.38),transparent 70%),radial-gradient(ellipse 60px 80px at 12% 82%,rgba(100,70,30,.4),transparent 70%)"></div>
    <div style="position:absolute;inset:0;background:linear-gradient(100deg,rgba(0,0,0,.58),rgba(0,0,0,.18) 22%,transparent 42%),linear-gradient(200deg,rgba(0,0,0,.4),transparent 30%)"></div>`);
  bef.style.cssText += 'background:#d9cfb4;transform:rotate(-3.2deg);filter:blur(1.25px) contrast(.74) brightness(.9) sepia(.3);box-shadow:0 20px 60px rgba(0,0,0,.6);';
  // marcadores de diagnóstico sobre o ANTES
  const marks = [[250, 170, 150, 120, 'Mancha'], [470, 380, 180, 150, 'Mancha'], [196, 60, 130, 560, 'Sombra'], [300, 300, 300, 90, 'Baixa nitidez']].map(([x, y, w, h, t]) => box(inner, 'abs', x, y, w, h,
    `<div style="position:absolute;inset:0;border:1.5px dashed var(--amber);border-radius:8px;background:rgba(245,184,61,.06)"></div><div class="tag a" style="position:absolute;left:0;top:-26px">${t}</div>`));
  const ang = box(inner, 'abs', 560, 44, 140, 28, `<span class="tag a">Desalinhamento 3,2°</span>`);
  const scan = box(inner, 'abs', 0, 0, 890, 3, ''); scan.style.cssText += 'background:linear-gradient(90deg,transparent,var(--amber),transparent);box-shadow:0 0 24px var(--amber);';
  const div = box(stage, 'abs', 0, 0, 3, 720, `<div style="position:absolute;left:-19px;top:340px;width:41px;height:41px;border-radius:50%;background:#0b1220;border:2px solid var(--cyan);display:grid;place-items:center;color:var(--cyan);font-size:15px;font-weight:700">‹›</div>`);
  div.style.cssText += 'background:var(--cyan);box-shadow:0 0 26px var(--cyan);';
  const lA = box(stage, 'abs', 22, 660, 120, 40, `<div style="font-size:15px;font-weight:700;letter-spacing:.2em;padding:9px 16px;border-radius:9px;background:rgba(10,14,20,.8);border:1px solid rgba(245,184,61,.5);color:#f9d58c;display:inline-block">ANTES</div>`);
  const lD = box(stage, 'abs', 754, 660, 120, 40, `<div style="font-size:15px;font-weight:700;letter-spacing:.2em;padding:9px 16px;border-radius:9px;background:rgba(10,14,20,.8);border:1px solid rgba(34,211,238,.6);color:#8fe9f7;display:inline-block">DEPOIS</div>`);

  // painel direito
  const D = box(content, 'panel', 950, 0, 582, 318, `<div class="ph">${ic('eye')}Diagnóstico de qualidade por IA</div>`);
  const iss = ISSUES.map(([a, b], i) => { const e = box(D, 'abs', 18, 52 + i * 63, 546, 54, `<div style="position:absolute;inset:0;border-radius:11px;border:1px solid var(--line);background:rgba(255,255,255,.02);display:flex;align-items:center;padding:0 16px;gap:12px;font-size:15.5px;font-weight:600">
    <div class="d" style="width:9px;height:9px;border-radius:50%"></div>${a}<span class="s tag" style="margin-left:auto"></span></div>`); return { e, d: e.querySelector('.d'), s: e.querySelector('.s'), b }; });
  const Lg = box(content, 'panel', 950, 336, 582, 190, `<div class="ph">${ic('search')}Verificação de legibilidade<span class="r">índice ilustrativo</span></div>
    <div class="abs" style="left:20px;right:20px;top:58px"><div style="display:flex;justify-content:space-between;font-size:12.5px;color:var(--mut)"><span>Antes</span><span class="v1 h" style="color:#f9d58c;font-weight:600"></span></div><div style="height:9px;border-radius:5px;background:rgba(255,255,255,.06);margin-top:6px;overflow:hidden"><div class="b1" style="height:100%;border-radius:5px;background:var(--amber)"></div></div>
    <div style="display:flex;justify-content:space-between;font-size:12.5px;color:var(--mut);margin-top:14px"><span>Depois</span><span class="v2 h" style="color:#8fe9f7;font-weight:600"></span></div><div style="height:9px;border-radius:5px;background:rgba(255,255,255,.06);margin-top:6px;overflow:hidden"><div class="b2" style="height:100%;border-radius:5px;background:linear-gradient(90deg,var(--blue),var(--cyan))"></div></div>
    <div class="pres" style="margin-top:16px;display:flex;gap:8px"><span class="tag g">${ic('check', 'style="width:12px;height:12px"')}Informações originais preservadas</span><span class="tag m">Original mantido em arquivo</span></div></div>`);
  const T = box(content, 'panel', 950, 544, 582, 246, `<div class="ph">${ic('user')}Triagem de qualidade<span class="r">casos duvidosos → validação humana</span></div>`);
  const th = []; for (let i = 0; i < 6; i++) { const e = box(T, 'abs', 22 + i * 60, 60, 48, 62, `<div style="position:absolute;inset:0;border-radius:6px;background:#e9ecf1;padding:7px 6px">${'<div style="height:2.5px;background:#9aa3b2;margin-bottom:4px;border-radius:2px"></div>'.repeat(7)}</div><div class="b abs" style="right:-7px;top:-7px;width:20px;height:20px;border-radius:50%;display:grid;place-items:center;font-size:12px;font-weight:700"></div>`); th.push({ e, b: e.querySelector('.b') }); }
  const hv = box(T, 'abs', 396, 50, 166, 176, `<div style="position:absolute;inset:0;border-radius:13px;border:1.5px dashed rgba(245,184,61,.6);background:rgba(245,184,61,.05)"></div><div style="position:absolute;left:0;right:0;top:12px;text-align:center;font-size:12.5px;font-weight:600;color:#f9d58c">Validação humana</div><div style="position:absolute;left:0;right:0;bottom:12px;text-align:center;font-size:11px;color:var(--mut)">revisão por operador</div>`);
  const tl = box(T, 'abs', 22, 146, 366, 90, `<div style="display:flex;gap:8px;flex-wrap:wrap"><span class="tag g a1">5 aprovados pela IA</span><span class="tag a a2">1 para revisão</span></div><div style="font-size:12px;color:var(--mut);margin-top:10px;line-height:1.5">A IA sinaliza o que não tem certeza.<br>A decisão final é de uma pessoa.</div>`);

  return { update(lt, dur) {
    cam(win, lt, dur, { dir: 1 });
    // divisor: 0 = tudo ANTES (x=890) … varre para a esquerda revelando DEPOIS, depois volta ao meio
    const sweep = easeInOutCubic(range(lt, 3.6, 7.0)), back = easeInOutCubic(range(lt, 7.6, 9.2));
    const x = lerp(lerp(890, 150, sweep), 445, back);
    clipB.style.width = x + 'px'; div.style.transform = `translateX(${x - 1.5}px)`; div.style.opacity = range(lt, 3.3, 3.7);
    lD.style.opacity = range(lt, 4.6, 5.2); lA.style.opacity = range(lt, 0.8, 1.4);
    const sc = range(lt, 0.9, 2.9); scan.style.transform = `translateY(${sc * 720}px)`; scan.style.opacity = sc > 0 && sc < 1 ? 1 : 0;
    const mOut = 1 - range(lt, 3.3, 3.9);
    marks.forEach((m, i) => { m.style.opacity = easeOutCubic(range(lt, 1.3 + i * 0.35, 1.7 + i * 0.35)) * mOut; });
    ang.style.opacity = easeOutCubic(range(lt, 2.6, 3.0)) * mOut;
    iss.forEach((o, i) => { appear(o.e, lt, 1.2 + i * 0.4, 0.5, 10); const fixed = lt > 4.3 + i * 0.6;
      o.s.textContent = fixed ? o.b : 'detectado'; o.s.className = 's tag ' + (fixed ? 'g' : 'a'); o.d.style.background = fixed ? 'var(--green)' : 'var(--amber)'; o.d.style.boxShadow = `0 0 10px ${fixed ? 'var(--green)' : 'var(--amber)'}`; });
    const b1 = easeOutCubic(range(lt, 2.2, 3.4)) * 54, b2 = easeOutCubic(range(lt, 5.4, 7.4)) * 96;
    Lg.querySelector('.b1').style.width = b1 + '%'; Lg.querySelector('.b2').style.width = b2 + '%'; Lg.querySelector('.v1').textContent = fmt(b1); Lg.querySelector('.v2').textContent = fmt(b2);
    appear(Lg.querySelector('.pres'), lt, 7.2, 0.6, 8);
    // triagem
    th.forEach((o, i) => { const dub = i === 3, at = 8.6 + i * 0.3; appear(o.e, lt, 0.8 + i * 0.08, 0.5, 8);
      const a = easeOutCubic(range(lt, at, at + 0.35)); o.b.style.transform = `scale(${a})`; o.b.textContent = dub ? '?' : '✓'; o.b.style.background = dub ? 'var(--amber)' : 'var(--green)'; o.b.style.color = '#08110c';
      if (dub) { const mv = easeInOutCubic(range(lt, 10.3, 11.5)); o.e.style.transform = `translate(${mv * (455 - 22 - i * 60)}px,${mv * 34}px) scale(${1 + Math.sin(Math.PI * mv) * 0.15})`; o.e.style.opacity = 1; o.e.style.zIndex = 3; } });
    hv.style.boxShadow = `0 0 ${smooth(range(lt, 10.2, 11.4)) * (26 + Math.sin(lt * 7) * 8)}px rgba(245,184,61,.45)`;
    tl.querySelector('.a1').style.opacity = range(lt, 10.0, 10.5); tl.querySelector('.a2').style.opacity = range(lt, 11.3, 11.8);
  } };
}
