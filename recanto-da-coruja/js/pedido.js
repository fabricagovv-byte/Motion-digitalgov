/* Recanto da Coruja — conteúdo dinâmico, cardápio, montador e pedido pelo WhatsApp.
   Funciona sem as bibliotecas de animação (motion.js só acrescenta movimento). */
(function () {
  'use strict';
  var P = window.Pizzaria, D = P.dados, N = D.negocio;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var pend = function (t) { return '<span class="pend">' + esc(t || 'a confirmar') + '</span>'; };
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sem armazenamento */ } }
  };
  var PLUS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
  var OWL = '<svg viewBox="0 0 120 120" aria-hidden="true"><use href="#owl"/></svg>';

  /* ---------- Avisos ---------- */
  var toastT;
  function toast(m) { var t = $('[data-toast]'); t.textContent = m; t.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('is-on'); }, 2800); }
  window.RecantoToast = toast;
  if (D.modoApresentacao && !store.get('rc_demo_fechado', false)) $('#demo').hidden = false;
  $('[data-close-demo]').addEventListener('click', function () { $('#demo').hidden = true; store.set('rc_demo_fechado', true); });

  /* ---------- Textos ---------- */
  $$('[data-bind]').forEach(function (el) { var v = N[el.dataset.bind]; if (v) el.textContent = v; });
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- WhatsApp ---------- */
  function waNum() { return (N.whatsapp || '').replace(/\D/g, ''); }
  function waLink(t) { return 'https://wa.me/' + waNum() + (t ? '?text=' + encodeURIComponent(t) : ''); }
  $$('[data-wa-link]').forEach(function (a) { a.href = waLink(a.dataset.waMsg || 'Olá! Vim pelo site do ' + N.nome + '.'); });
  $$('[data-maps-link]').forEach(function (a) { a.href = N.googleMaps || 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(N.mapaBusca); });
  $$('[data-fb-link]').forEach(function (a) { if (N.facebook) a.href = N.facebook; else a.hidden = true; });
  $$('[data-review-link]').forEach(function (a) { if (N.googleAvaliar) a.href = N.googleAvaliar; else a.hidden = true; });

  /* ---------- Contato e horários ---------- */
  $('[data-addr]').innerHTML = N.endereco ? esc(N.endereco) + '<br>' + esc(N.cidade + ' – ' + N.uf + ' · ' + N.cep) : pend();
  $('[data-ref]').innerHTML = N.referencia ? esc(N.referencia) : pend();
  $('[data-phone]').innerHTML = N.telefone ? '<a href="tel:+55' + esc(N.telefone.replace(/\D/g, '')) + '">' + esc(N.telefone) + '</a>' : pend();
  $('[data-payments]').innerHTML = N.pagamentos && N.pagamentos.length ? esc(N.pagamentos.join(', ')) + ' ' + pend('(Pix a confirmar)') : pend();
  var hoje = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' })).getDay();
  $('[data-hours]').insertAdjacentHTML('beforeend', '<tbody>' + [1, 2, 3, 4, 5, 6, 0].map(function (d) {
    var h = D.horarios.find(function (x) { return x.dia === d; }); if (!h) return '';
    var t = h.fechado ? 'Fechado' : (h.abre && h.fecha ? h.abre + ' – ' + h.fecha : null);
    return '<tr' + (d === hoje ? ' class="is-today"' : '') + '><td>' + esc(h.nome) + (d === hoje ? ' · hoje' : '') + '</td><td>' + (t ? esc(t) : pend()) + '</td></tr>';
  }).join('') + '</tbody>');

  /* ---------- Estrutura da pousada ---------- */
  $('[data-amen]').innerHTML = (N.estrutura || []).map(function (e) {
    return '<li data-amen-item><svg aria-hidden="true"><use href="#i-' + esc(e.icone) + '"/></svg>' + esc(e.titulo) + '</li>';
  }).join('');

  /* ---------- Avaliações reais (se houver) ---------- */
  var revs = D.avaliacoes || [];
  if (revs.length) {
    $('[data-reviews]').innerHTML = revs.map(function (r) {
      return '<figure class="review"><blockquote>“' + esc(r.texto) + '”</blockquote><figcaption>' + esc(r.autor) + (r.fonte ? ' · ' + esc(r.fonte) : '') + '</figcaption></figure>';
    }).join('');
  }

  /* ---------- Galeria ---------- */
  var gal = D.galeria || [], lb = $('#lightbox'), lbI = 0;
  var rotulos = { 'forno-fogo': 'Forno a lenha', 'churrasco-espetos': 'Espetos', 'queijo-puxa': 'Queijo derretendo', serra: 'Serras da região', pizzaiolo: 'Pizzaiolo', 'churrasco-grelha': 'Na grelha', rustica: 'Margherita', 'campo-por-do-sol': 'Fim de tarde', 'forno-pa': 'Saindo do forno', 'fatia-mao': 'Primeira fatia' };
  $('[data-gal-track]').innerHTML = gal.map(function (g, i) {
    return '<button type="button" class="gal__item" data-gi="' + i + '" aria-label="Ampliar foto: ' + esc(rotulos[g] || 'foto ' + (i + 1)) + '">' +
      '<img src="' + P.foto(g, 960) + '" srcset="' + P.foto(g, 480) + ' 480w, ' + P.foto(g, 960) + ' 960w" sizes="(max-width: 680px) 80vw, 40vw" alt="' + esc(rotulos[g] || '') + ' (foto ilustrativa)" loading="lazy">' +
      (rotulos[g] ? '<span>' + esc(rotulos[g]) + '</span>' : '') + '</button>';
  }).join('');
  function lbShow(i) { lbI = (i + gal.length) % gal.length; var im = $('[data-lb-img]'); im.src = P.foto(gal[lbI], 1600); im.alt = (rotulos[gal[lbI]] || 'Foto') + ' (ilustrativa)'; }
  $('[data-gal-track]').addEventListener('click', function (e) { var b = e.target.closest('[data-gi]'); if (b) { lbShow(+b.dataset.gi); lb.showModal(); } });
  $('[data-lb-prev]').addEventListener('click', function () { lbShow(lbI - 1); });
  $('[data-lb-next]').addEventListener('click', function () { lbShow(lbI + 1); });
  $('[data-close-lb]').addEventListener('click', function () { lb.close(); });
  lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
  lb.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') lbShow(lbI - 1); if (e.key === 'ArrowRight') lbShow(lbI + 1); });

  /* ---------- Vídeo com som ---------- */
  var pd = $('#promo'), pv = $('[data-promo-video]');
  $('[data-play-promo]').addEventListener('click', function () { pd.showModal(); pv.currentTime = 0; var p = pv.play(); if (p && p.catch) p.catch(function () {}); });
  $('[data-close-promo]').addEventListener('click', function () { pd.close(); });
  pd.addEventListener('close', function () { pv.pause(); });
  pd.addEventListener('click', function (e) { if (e.target === pd) pd.close(); });

  /* ---------- Cardápio ---------- */
  function ehPizza(p) { return (P.categoria(p.categoria) || {}).tipo === 'pizza'; }
  var pizzas = function () { return D.produtos.filter(function (p) { return p.ativo && ehPizza(p); }); };
  function aPartir(p) {
    if (p.precos) { var v = D.tamanhos.map(function (t) { return p.precos[t.id]; }).filter(function (x) { return x != null; }); return v.length ? Math.min.apply(null, v) : null; }
    return p.preco;
  }
  if (D.produtos.some(function (p) { return p.ativo && aPartir(p) == null; })) $('[data-price-note]').hidden = false;
  function img(nome, alt, sizes) {
    return nome ? '<img src="' + P.foto(nome, 960) + '" srcset="' + P.foto(nome, 480) + ' 480w, ' + P.foto(nome, 960) + ' 960w" sizes="' + (sizes || '(max-width: 680px) 40vw, 380px') + '" alt="' + esc(alt || '') + '" loading="lazy" decoding="async">' : '';
  }
  var tabs = $('[data-tabs]'), ink = $('.tabs__ink'), cat = null;
  D.categorias.forEach(function (c) {
    if (!D.produtos.some(function (p) { return p.ativo && p.categoria === c.id; })) return;
    if (!cat) cat = c.id;
    var b = document.createElement('button'); b.type = 'button'; b.className = 'tab'; b.setAttribute('role', 'tab'); b.id = 'tab-' + c.id; b.dataset.cat = c.id; b.textContent = c.nome; b.setAttribute('aria-controls', 'menu-grid');
    tabs.appendChild(b);
  });
  function moveInk() { var a = $('.tab[aria-selected="true"]', tabs); if (a) { ink.style.width = a.offsetWidth + 'px'; ink.style.transform = 'translateX(' + a.offsetLeft + 'px)'; } }
  function renderMenu() {
    $$('.tab', tabs).forEach(function (t) { var on = t.dataset.cat === cat; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; });
    $('[data-menu]').setAttribute('aria-labelledby', 'tab-' + cat);
    moveInk();
    var c = P.categoria(cat);
    $('[data-menu]').innerHTML = D.produtos.filter(function (p) { return p.ativo && p.categoria === cat; }).map(function (p) {
      var v = aPartir(p), pz = c.tipo === 'pizza';
      var preco = v != null ? (pz ? 'a partir de' : '') + '<b>' + P.dinheiro(v) + '</b>' : '<span class="pend">preço a confirmar</span>';
      var pic = p.foto ? '<div class="card__pic">' + img(p.foto, 'Pizza ' + p.nome + ' (foto ilustrativa)') + (p.destaque ? '<span class="card__tag">Favorita</span>' : '') + '</div>'
        : (pz ? '<div class="card__pic card__pic--none"><span>' + OWL.replace('<svg ', '<svg width="56" height="56" ') + 'foto em breve</span></div>' : '');
      return '<article class="card' + (pz ? '' : ' card--drink') + '" data-card>' + pic + '<div class="card__body"><h3 class="card__name">' + esc(p.nome) + '</h3><p class="card__desc">' + esc(p.descricao) + '</p>' +
        '<div class="card__foot"><span class="card__price">' + preco + '</span><button type="button" class="card__add" data-open="' + p.id + '" aria-label="Adicionar ' + esc(p.nome) + '">' + PLUS + '</button></div></div></article>';
    }).join('');
    document.dispatchEvent(new CustomEvent('recanto:menu'));
  }
  tabs.addEventListener('click', function (e) { var t = e.target.closest('.tab'); if (t) { cat = t.dataset.cat; renderMenu(); } });
  tabs.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    var ts = $$('.tab', tabs), i = ts.findIndex(function (t) { return t.dataset.cat === cat; });
    i = (i + (e.key === 'ArrowRight' ? 1 : ts.length - 1)) % ts.length; cat = ts[i].dataset.cat; renderMenu(); ts[i].focus();
  });
  window.addEventListener('resize', moveInk);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveInk);
  renderMenu();
  $('[data-sizes]').innerHTML = '<span>Tamanhos:</span>' + D.tamanhos.map(function (t) { return '<span><b>' + esc(t.nome) + '</b> · ' + t.fatias + ' fatias</span>'; }).join('');

  /* ---------- Carrinho ---------- */
  var cart = store.get('rc_carrinho', []).filter(function (l) { return l.ids.every(function (id) { return P.produto(id); }); });
  function preco(l) { if (l.tam) return P.precoPizza(l.ids, l.tam); var p = P.produto(l.ids[0]); return p ? p.preco : null; }
  function nome(l) {
    var ns = l.ids.map(function (id) { return P.produto(id).nome; });
    if (!l.tam) return ns[0];
    var t = D.tamanhos.find(function (x) { return x.id === l.tam; });
    return 'Pizza ' + (t ? t.nome : l.tam) + ' · ' + (ns.length > 1 ? '½ ' + ns[0] + ' + ½ ' + ns[1] : ns[0]);
  }

  /* modos de receber, conforme a configuração */
  var modos = [];
  if (N.entrega.ativa) modos.push(['entrega', 'Entrega']);
  if (N.entrega.retirada) modos.push(['retirada', 'Retirar']);
  modos.push(['local', 'Comer no Recanto']);
  $('[data-modes]').insertAdjacentHTML('beforeend', modos.map(function (m, i) {
    return '<label><input type="radio" name="modo" value="' + m[0] + '"' + (i === 0 ? ' checked' : '') + '><span>' + m[1] + '</span></label>';
  }).join(''));
  var form = $('[data-checkout]');
  function modo() { var r = $('input[name="modo"]:checked', form); return r ? r.value : modos[0][0]; }
  function totais() {
    var sub = 0, falta = false;
    cart.forEach(function (l) { var v = preco(l); if (v == null) falta = true; else sub += v * l.qty; });
    var ent = modo() === 'entrega', taxa = ent ? N.entrega.taxa : 0;
    if (ent && taxa == null) falta = true;
    return { sub: sub, taxa: taxa, total: sub + (taxa || 0), falta: falta, ent: ent };
  }

  /* montador */
  var dlg = $('#builder'), st = null;
  function abrir(id) {
    var p = P.produto(id); if (!p) return;
    if (!ehPizza(p)) { add({ ids: [p.id], tam: null, qty: 1, obs: '' }); return; }
    var padrao = (D.tamanhos.find(function (t) { return t.id === 'G'; }) || D.tamanhos[0]).id;
    st = { ids: [p.id], tam: padrao, qty: 1, half: false };
    $('[data-b-title]').textContent = p.nome; $('[data-b-desc]').textContent = p.descricao;
    $('[data-b-sizes]').innerHTML = D.tamanhos.map(function (t) {
      return '<label class="chip-o"><input type="radio" name="tam" value="' + t.id + '"' + (t.id === padrao ? ' checked' : '') + '><span><b>' + esc(t.nome) + '</b><small data-sp="' + t.id + '"></small></span></label>';
    }).join('');
    var outros = pizzas().filter(function (x) { return x.id !== p.id; });
    $('[data-b-flavor2]').innerHTML = outros.map(function (x) { return '<option value="' + x.id + '">' + esc(x.nome) + '</option>'; }).join('');
    $('[data-b-half]').checked = false; $('[data-b-second]').hidden = true; $('[data-b-obs]').value = '';
    $('[data-b-rule]').textContent = D.regraMeioAMeio === 'media' ? 'Meio a meio: cobra-se a média dos dois sabores.' : 'Meio a meio: vale o preço do sabor de maior valor.';
    upd(); dlg.showModal();
  }
  function upd() {
    var t = D.tamanhos.find(function (x) { return x.id === st.tam; }), pode = t && t.maxSabores > 1;
    $('[data-b-half]').disabled = !pode;
    if (!pode) { st.half = false; $('[data-b-half]').checked = false; $('[data-b-second]').hidden = true; }
    var ids = st.half ? [st.ids[0], $('[data-b-flavor2]').value] : [st.ids[0]]; st.cur = ids;
    var pic = $('[data-b-pic]');
    pic.className = 'b__pic' + (ids.length > 1 ? ' b__pic--half' : '');
    pic.innerHTML = ids.map(function (id) { var f = P.produto(id).foto; return f ? img(f, '', '(max-width: 680px) 100vw, 440px') : '<img src="img/coruja.svg" alt="" style="object-fit:contain;padding:22%">'; }).join('');
    D.tamanhos.forEach(function (tt) { var v = P.precoPizza(ids, tt.id), el = $('[data-sp="' + tt.id + '"]'); if (el) el.textContent = v != null ? P.dinheiro(v) : tt.fatias + ' fatias'; });
    var v = P.precoPizza(ids, st.tam);
    $('[data-b-qty]').textContent = st.qty;
    $('[data-b-price]').textContent = v != null ? '· ' + P.dinheiro(v * st.qty) : '';
  }
  dlg.addEventListener('change', function (e) {
    if (e.target.name === 'tam') st.tam = e.target.value;
    if (e.target.matches('[data-b-half]')) { st.half = e.target.checked; $('[data-b-second]').hidden = !st.half; }
    upd();
  });
  $('[data-b-minus]').addEventListener('click', function () { st.qty = Math.max(1, st.qty - 1); upd(); });
  $('[data-b-plus]').addEventListener('click', function () { st.qty = Math.min(20, st.qty + 1); upd(); });
  $('[data-builder-form]').addEventListener('submit', function (e) {
    if (e.submitter && e.submitter.value === 'cancel') return;
    add({ ids: st.cur.slice(), tam: st.tam, qty: st.qty, obs: $('[data-b-obs]').value.trim() });
  });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  document.addEventListener('click', function (e) { var o = e.target.closest('[data-open]'); if (o) abrir(o.dataset.open); });

  function add(l) {
    var key = l.ids.join('+') + '|' + (l.tam || '') + '|' + (l.obs || ''), ex = cart.find(function (x) { return x.key === key; });
    if (ex) ex.qty += l.qty; else { l.key = key; cart.push(l); }
    salvar();
    $$('.ico-btn, .fab-cart').forEach(function (b) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); });
    toast('Adicionado: ' + nome(l));
  }
  function salvar() { store.set('rc_carrinho', cart); render(); }

  var drawer = $('#cart'), lastF = null;
  function abrirCart() { lastF = document.activeElement; drawer.classList.add('is-open'); drawer.setAttribute('aria-hidden', 'false'); document.documentElement.classList.add('is-locked'); if (window.RecantoLenis) window.RecantoLenis.stop(); render(); setTimeout(function () { $('.drawer__hdr .x').focus(); }, 80); }
  function fecharCart() { drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden', 'true'); document.documentElement.classList.remove('is-locked'); if (window.RecantoLenis) window.RecantoLenis.start(); render(); if (lastF) lastF.focus(); }
  $$('[data-open-cart]').forEach(function (b) { b.addEventListener('click', abrirCart); });
  $$('[data-close-cart]').forEach(function (b) { b.addEventListener('click', fecharCart); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && drawer.classList.contains('is-open')) fecharCart(); });

  function render() {
    var n = cart.reduce(function (a, l) { return a + l.qty; }, 0);
    $$('[data-cart-count]').forEach(function (el) { el.textContent = n; el.classList.toggle('has', n > 0); });
    $('.fab-cart').hidden = n === 0 || drawer.classList.contains('is-open');
    $('[data-empty]').hidden = n > 0; form.hidden = n === 0; $('[data-foot]').hidden = n === 0;
    $('[data-lines]').innerHTML = cart.map(function (l, i) {
      var v = preco(l), fs = l.ids.map(function (id) { return P.produto(id).foto; }).filter(Boolean);
      return '<li class="line"><div class="line__pic">' + (fs.length ? fs.map(function (f) { return '<img src="' + P.foto(f, 480) + '" alt="">'; }).join('') : OWL) + '</div>' +
        '<div><h3>' + esc(nome(l)) + '</h3>' + (l.obs ? '<p>Obs.: ' + esc(l.obs) + '</p>' : '') + '<p>' + (v == null ? 'preço a confirmar' : P.dinheiro(v) + ' cada') + '</p></div>' +
        '<div class="line__r"><span class="line__price">' + (v == null ? '—' : P.dinheiro(v * l.qty)) + '</span><div class="qty"><button type="button" data-q="-1" data-i="' + i + '" aria-label="' + (l.qty === 1 ? 'Remover' : 'Diminuir') + '">' + (l.qty === 1 ? '×' : '−') + '</button><output>' + l.qty + '</output><button type="button" data-q="1" data-i="' + i + '" aria-label="Aumentar">+</button></div></div></li>';
    }).join('');
    var t = totais(), nada = t.falta && t.sub === 0;
    $('[data-subtotal]').textContent = nada ? 'a confirmar' : P.dinheiro(t.sub);
    $('[data-fee-row]').hidden = !t.ent; $('[data-fee]').textContent = t.taxa == null ? 'a confirmar' : P.dinheiro(t.taxa);
    $('[data-total]').textContent = nada ? 'a confirmar' : t.falta ? P.dinheiro(t.total) + ' + a confirmar' : P.dinheiro(t.total);
    $('[data-total-note]').hidden = !t.falta;
    $('[data-cart-short]').textContent = nada ? n + (n > 1 ? ' itens' : ' item') : P.dinheiro(t.total);
    atualizarEnvio();
  }
  $('[data-lines]').addEventListener('click', function (e) {
    var b = e.target.closest('[data-q]'); if (!b) return;
    var l = cart[+b.dataset.i]; l.qty += +b.dataset.q; if (l.qty <= 0) cart.splice(+b.dataset.i, 1); salvar();
  });

  /* checkout */
  var pags = (N.pagamentos && N.pagamentos.length ? N.pagamentos.slice() : []).concat(['Pix (a confirmar)']);
  pags = pags.filter(function (p, i) { return pags.indexOf(p) === i; });
  $('[data-pay]').innerHTML = pags.map(function (p) { return '<option>' + esc(p) + '</option>'; }).join('');
  var salvo = store.get('rc_cliente', {});
  Object.keys(salvo).forEach(function (k) { var el = form.elements[k]; if (el && el.type !== 'radio') el.value = salvo[k]; });
  function syncModo() { $('[data-addr-fields]').hidden = modo() !== 'entrega'; render(); }
  function syncPag() { $('[data-troco-wrap]').hidden = !/dinheiro/i.test(form.elements.pagamento.value); }
  form.addEventListener('change', function (e) { if (e.target.name === 'modo') syncModo(); if (e.target.name === 'pagamento') syncPag(); atualizarEnvio(); });
  form.addEventListener('input', function (e) { e.target.classList.remove('is-invalid'); atualizarEnvio(); });

  function invalidos() {
    var f = form.elements, ob = ['nome'].concat(modo() === 'entrega' ? ['rua', 'numero', 'bairro'] : []);
    return ob.map(function (k) { return f[k]; }).filter(function (el) { return !el.value.trim(); });
  }
  function mensagem() {
    var f = form.elements, t = totais(), L = [], d = {}, nada = t.falta && t.sub === 0;
    ['nome', 'fone', 'rua', 'numero', 'bairro', 'ref', 'hora'].forEach(function (k) { d[k] = f[k].value.trim(); });
    var mm = modos.find(function (m) { return m[0] === modo(); });
    L.push('*Pedido pelo site — ' + N.nome + '* 🦉', '');
    cart.forEach(function (l) { var v = preco(l); L.push('• ' + l.qty + 'x ' + nome(l) + ' — ' + (v == null ? 'preço a confirmar' : P.dinheiro(v * l.qty))); if (l.obs) L.push('   _Obs.: ' + l.obs + '_'); });
    L.push('', 'Subtotal: ' + (nada ? 'a confirmar' : P.dinheiro(t.sub)));
    if (t.ent) L.push('Entrega: ' + (t.taxa == null ? 'a confirmar' : P.dinheiro(t.taxa)));
    L.push('*Total: ' + (nada ? 'a confirmar pelo Recanto' : P.dinheiro(t.total) + (t.falta ? ' + valores a confirmar' : '')) + '*', '');
    L.push('*' + (mm ? mm[1] : modo()) + '*' + (d.hora ? ' · ' + d.hora : ''));
    L.push('Nome: ' + d.nome); if (d.fone) L.push('Telefone: ' + d.fone);
    if (t.ent) { L.push('Endereço: ' + d.rua + ', ' + d.numero + ' — ' + d.bairro); if (d.ref) L.push('Referência: ' + d.ref); }
    L.push('Pagamento: ' + f.pagamento.value + (f.troco.value && /dinheiro/i.test(f.pagamento.value) ? ' (troco para R$ ' + f.troco.value + ')' : ''));
    if (f.obs.value.trim()) L.push('Obs.: ' + f.obs.value.trim());
    L.push('', '_Aguardo a confirmação do pedido e do valor._');
    return { texto: L.join('\n'), cliente: d };
  }
  var send = $('[data-send]');
  function atualizarEnvio() { if (cart.length && send) send.href = waLink(mensagem().texto); }
  send.addEventListener('click', function (e) {
    var inv = invalidos();
    if (inv.length) { e.preventDefault(); inv.forEach(function (el) { el.classList.add('is-invalid'); }); inv[0].focus(); toast('Preencha os campos destacados.'); return; }
    atualizarEnvio(); store.set('rc_cliente', mensagem().cliente);
  });
  syncModo(); syncPag(); render();
})();
