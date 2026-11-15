// Cena 5 — DIGITALGOV DELIVERY CENTER: pacote de entrega montado, validado, exportado, registrado e protegido.
import { el, box, shell, cam, ic, fmt, range, lerp, clamp, smooth, easeOutCubic, easeInOutCubic, appear } from './util.js';

const TREE = [[0, 'folder', 'Lote_2024-018'], [1, 'folder', '01_Contratos', '412 arquivos'], [1, 'folder', '02_Oficios', '388 arquivos'], [1, 'folder', '03_Processos', '297 arquivos'], [1, 'folder', '04_Notas_Fiscais', '151 arquivos'],
  [1, 'doc', 'Indice_Geral.pdf', 'índice'], [1, 'doc', 'Metadados.xml', 'metadados'], [1, 'chart', 'Relatorio_Producao.pdf', 'relatório'], [1, 'eye', 'Relatorio_Qualidade.pdf', 'relatório']];
const FEAT = [['Validação dos documentos antes da entrega', 'check'], ['Conferência de arquivos e metadados', 'search'], ['Exportação em PDF pesquisável e outros formatos', 'file'], ['Relatórios de produção e qualidade', 'chart'],
  ['Registro de lotes entregues', 'box'], ['Histórico de versões e auditoria', 'history'], ['Backup automático e proteção dos arquivos', 'db']];

export function create(root) {
  const { win, content } = shell(root, { active: 'delivery', crumb: 'DIGITALGOV DELIVERY CENTER', title: 'Entrega organizada e segura' });
  // pacote
  const A = box(content, 'panel', 0, 0, 470, 560, `<div class="ph">${ic('box')}Pacote de entrega<span class="r">montagem automática</span></div>`);
  const pb = box(A, 'abs', 20, 50, 430, 34, `<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--mut)"><span class="pt"></span><span class="pv h" style="color:var(--text);font-weight:600"></span></div><div style="height:6px;border-radius:3px;background:rgba(255,255,255,.07);margin-top:7px;overflow:hidden"><div class="pf" style="height:100%;background:linear-gradient(90deg,var(--blue),var(--cyan))"></div></div>`);
  const tree = TREE.map(([lv, icn, name, meta], i) => { const e = box(A, 'abs', 20 + lv * 26, 104 + i * 49, 430 - lv * 26, 42, `<div style="position:absolute;inset:0;border-radius:10px;border:1px solid var(--line);background:${lv ? 'rgba(255,255,255,.02)' : 'rgba(47,107,255,.14)'};display:flex;align-items:center;gap:11px;padding:0 13px;font-size:13.5px;font-weight:${lv ? 500 : 600}">
    <div style="width:17px;height:17px;color:${icn === 'folder' ? 'var(--cyan)' : '#a9c3ff'};flex:none">${ic(icn)}</div><span class="${lv ? 'mono' : ''}" style="font-size:${lv ? 12.5 : 14}px">${name}</span><span style="margin-left:auto;font-size:11.5px;color:var(--dim)">${meta || '1.248 documentos'}</span><div class="chk" style="width:17px;height:17px">${ic('check')}</div></div>`); return { e, c: e.querySelector('.chk') }; });
  // validação + exportação
  const B = box(content, 'panel', 488, 0, 520, 270, `<div class="ph">${ic('shield')}Validação antes da entrega</div>`);
  const VAL = ['Integridade dos arquivos', 'Metadados conferidos', 'Legibilidade verificada', 'Índice e estrutura de pastas'].map((t, i) => { const e = box(B, 'abs', 20, 52 + i * 51, 480, 42, `<div style="position:absolute;inset:0;border-radius:10px;border:1px solid var(--line);background:rgba(255,255,255,.02);display:flex;align-items:center;padding:0 14px;font-size:14px;font-weight:500;gap:10px">${t}
    <div style="margin-left:auto;width:120px;height:5px;border-radius:3px;background:rgba(255,255,255,.07);overflow:hidden"><div class="f" style="height:100%;background:var(--cyan)"></div></div><span class="s tag m" style="width:92px;justify-content:center"></span></div>`); return { e, f: e.querySelector('.f'), s: e.querySelector('.s') }; });
  const X = box(content, 'panel', 488, 288, 520, 272, `<div class="ph">${ic('file')}Exportação<span class="r">PDF pesquisável e formatos compatíveis</span></div>`);
  const fm = ['PDF pesquisável', 'PDF/A', 'TIFF', 'XML', 'CSV'].map((t, i) => { const e = el('span', 'tag ' + (i ? 'm' : 'c'), null, t); return e; });
  const fr = box(X, 'abs', 20, 50, 480, 30, ''); fr.style.cssText += 'display:flex;gap:8px;'; fm.forEach((e) => { e.style.fontSize = '12.5px'; e.style.padding = '6px 11px'; fr.appendChild(e); });
  const sb = box(X, 'abs', 20, 96, 480, 40, `<div style="position:absolute;inset:0;border-radius:10px;border:1px solid rgba(34,211,238,.45);background:rgba(34,211,238,.05);display:flex;align-items:center;gap:10px;padding:0 13px;font-size:14px"><div style="width:16px;height:16px;color:var(--cyan)">${ic('search')}</div><span class="q"></span></div>`);
  const pg = box(X, 'abs', 20, 148, 480, 106, `<div style="position:absolute;inset:0;border-radius:10px;background:#f4f5f7;color:#22262c;padding:12px 16px;font-family:'Liberation Serif',serif;font-size:13.5px;line-height:1.55">
    <b>CONTRATO Nº 2024/0231</b> — <span class="hl">prestação de serviços</span> de manutenção predial, firmado entre as partes, com vigência de doze meses, admitida a prorrogação mediante termo aditivo. O valor global e o cronograma constam do Anexo I.</div><span class="tag g abs r1" style="right:10px;bottom:10px">texto pesquisável · 1 ocorrência</span>`);
  // funcionalidades
  const F = box(content, 'panel', 1026, 0, 506, 560, `<div class="ph">${ic('send')}Recursos de entrega</div>`);
  const feats = FEAT.map(([t, icn], i) => { const e = box(F, 'abs', 18, 50 + i * 71, 470, 62, `<div style="position:absolute;inset:0;border-radius:12px;border:1px solid var(--line2);background:linear-gradient(120deg,rgba(47,107,255,.11),rgba(255,255,255,.015));display:flex;align-items:center;gap:13px;padding:0 15px">
    <div style="width:34px;height:34px;border-radius:10px;flex:none;background:rgba(34,211,238,.1);border:1px solid rgba(34,211,238,.35);display:grid;place-items:center;color:var(--cyan)"><div style="width:18px;height:18px">${ic(icn)}</div></div>
    <div style="font-size:14.5px;font-weight:600;line-height:1.25">${t}</div><div class="chk" style="margin-left:auto">${ic('check')}</div></div>`); return e; });
  // registro de lotes
  const R = box(content, 'panel', 0, 578, 1532, 188, `<div class="ph">${ic('history')}Registro de lotes entregues<span class="r">rastreabilidade · auditoria · dados ilustrativos</span></div>`);
  const cols = 'display:grid;grid-template-columns:190px 150px 250px 220px 190px 1fr;align-items:center;padding:0 16px;';
  box(R, 'abs', 20, 46, 1492, 24, `<div style="${cols}font-size:10.5px;letter-spacing:.1em;color:var(--dim);font-weight:600"><span>LOTE</span><span>DOCUMENTOS</span><span>VERIFICAÇÃO (HASH)</span><span>VERSÃO · AUDITORIA</span><span>BACKUP</span><span>STATUS</span></div>`);
  const ROWS = [['Lote 2024-018', '1.248', 'a3f9…c21e', 'v3 · 14 eventos', 'automático', 1], ['Lote 2024-017', '2.031', '7be0…94ad', 'v2 · 9 eventos', 'automático', 0], ['Lote 2024-016', '1.764', '51cd…08f3', 'v1 · 6 eventos', 'automático', 0]];
  const rws = ROWS.map((r, i) => { const e = box(R, 'abs', 20, 72 + i * 36, 1492, 32, `<div style="position:absolute;inset:0;border-radius:9px;${cols}font-size:13px;background:${r[5] ? 'rgba(47,107,255,.12)' : 'rgba(255,255,255,.02)'};border:1px solid ${r[5] ? 'rgba(91,140,255,.5)' : 'var(--line)'}"><b style="font-weight:600">${r[0]}</b><span>${r[1]}</span><span class="mono" style="font-size:12px;color:#a9c3ff">${r[2]}</span><span>${r[3]}</span><span style="color:var(--green)">✓ ${r[4]}</span><span class="st"></span></div>`); return e; });
  const st0 = rws[0].querySelector('.st'); rws.slice(1).forEach((e) => { e.querySelector('.st').innerHTML = '<span class="tag g">Entregue · comprovante emitido</span>'; });

  return { update(lt, dur) {
    cam(win, lt, dur, { dir: 1, ry: 1.8 });
    const pg1 = easeInOutCubic(range(lt, 0.8, 6.2)); pb.querySelector('.pf').style.width = pg1 * 100 + '%'; pb.querySelector('.pv').textContent = fmt(pg1 * 100) + '%'; pb.querySelector('.pt').textContent = pg1 >= 1 ? 'Pacote pronto para entrega' : 'Organizando documentos em pastas…';
    tree.forEach((o, i) => { const at = 0.7 + i * 0.5; const a = easeOutCubic(range(lt, at, at + 0.5)); o.e.style.opacity = a; o.e.style.transform = `translateX(${(1 - a) * -26}px)`; o.c.style.transform = `scale(${easeOutCubic(range(lt, at + 0.7, at + 1.0))})`; });
    VAL.forEach((o, i) => { const g = smooth(range(lt, 2.2 + i * 0.75, 3.4 + i * 0.75)); o.f.style.width = g * 100 + '%'; const ok = g >= 1; o.s.textContent = ok ? 'validado' : g > 0 ? 'verificando' : 'na fila'; o.s.className = 's tag ' + (ok ? 'g' : g > 0 ? 'c' : 'm'); appear(o.e, lt, 0.6 + i * 0.12, 0.5, 10); });
    fm.forEach((e, i) => { const a = easeOutCubic(range(lt, 4.6 + i * 0.18, 5.1 + i * 0.18)); e.style.opacity = a; e.style.transform = `scale(${lerp(0.8, 1, a)})`; });
    const Q = 'prestação de serviços', n = Math.floor(clamp((lt - 6.0) / 1.5) * Q.length); sb.querySelector('.q').textContent = Q.slice(0, n) + (lt > 6 && lt < 7.8 ? '▍' : ''); appear(sb, lt, 5.4, 0.5, 8); appear(pg, lt, 5.6, 0.6, 10);
    const hl = smooth(range(lt, 7.5, 8.0)); pg.querySelector('.hl').style.cssText = `background:rgba(34,211,238,${hl * 0.5});box-shadow:0 0 0 ${hl * 3}px rgba(34,211,238,${hl * 0.5});border-radius:2px`; pg.querySelector('.r1').style.opacity = hl;
    feats.forEach((e, i) => { const at = 1.6 + i * 0.95; appear(e, lt, at, 0.6, 16); e.querySelector('.chk').style.transform = `scale(${easeOutCubic(range(lt, at + 0.3, at + 0.7))})`; });
    rws.forEach((e, i) => appear(e, lt, i ? 0.9 + i * 0.12 : 8.6, 0.6, i ? 8 : 14));
    const del = lt > 10.2; st0.innerHTML = del ? '<span class="tag g">Entregue · comprovante emitido</span>' : '<span class="tag c">Validado · preparando envio</span>';
    rws[0].firstChild.style.boxShadow = `0 0 ${smooth(range(lt, 10.2, 10.6)) * (1 - smooth(range(lt, 11, 12.4))) * 34}px rgba(52,211,153,.55)`;
  } };
}
