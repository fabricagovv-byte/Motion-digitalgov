/* Forno Alvorada — interações do site (sem dependências) */
(function () {
  'use strict';
  var P = window.Pizzaria, D = P.dados, N = D.negocio;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var pend = function (txt) { return '<span class="pending">' + esc(txt || 'A confirmar') + '</span>'; };
  var ICON_PLUS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>';
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* armazenamento indisponível */ } }
  };

  /* ---------- Textos básicos ---------- */
  var cidadeUf = N.cidade + ' · ' + N.uf;
  var binds = { nome: N.nome, slogan: N.slogan, descricao: N.descricao, cidadeUf: cidadeUf, fundacaoBadge: N.fundacao ? 'Desde ' + N.fundacao : N.uf };
  $$('[data-bind]').forEach(function (el) { var v = binds[el.dataset.bind]; if (v) el.textContent = v; });
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  if (document.title.indexOf('Forno Alvorada') === 0 && N.nome !== 'Forno Alvorada') document.title = document.title.replace('Forno Alvorada', N.nome);

  /* JSON-LD com os dados confirmados */
  (function () {
    var ld = { '@context': 'https://schema.org', '@type': 'Restaurant', name: N.nome, description: N.descricao, servesCuisine: ['Pizza', 'Brasileira'],
      address: { '@type': 'PostalAddress', addressLocality: N.cidade, addressRegion: N.uf, postalCode: N.cep, addressCountry: 'BR' }, hasMenu: location.href.split('#')[0] + '#cardapio' };
    if (N.endereco) ld.address.streetAddress = N.endereco;
    if (N.telefone) ld.telephone = N.telefone;
    var same = [N.instagram, N.facebook, N.googleMaps].filter(Boolean); if (same.length) ld.sameAs = same;
    var dias = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var oh = D.horarios.filter(function (h) { return h.abre && h.fecha && !h.fechado; }).map(function (h) { return { '@type': 'OpeningHoursSpecification', dayOfWeek: dias[h.dia], opens: h.abre, closes: h.fecha }; });
    if (oh.length) ld.openingHoursSpecification = oh;
    $('#ld-json').textContent = JSON.stringify(ld);
  })();

  /* ---------- Faixa de apresentação ---------- */
  if (D.modoApresentacao && !store.get('demo_fechado', false)) $('#demoBar').hidden = false;
  $('[data-close-demo]').addEventListener('click', function () { $('#demoBar').hidden = true; store.set('demo_fechado', true); });
  if (!D.modoApresentacao) $$('[data-demo-only]').forEach(function (el) { el.hidden = true; });

  /* ---------- Toast ---------- */
  var toastT;
  function toast(msg) { var t = $('[data-toast]'); t.textContent = msg; t.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('is-on'); }, 2800); }

  /* ---------- Cabeçalho ---------- */
  var hdr = $('.hdr'), hero = $('.hero');
  function hdrSolid() { hdr.classList.toggle('is-solid', window.scrollY > (hero.offsetHeight - 120) || $('#nav').classList.contains('is-open')); }
  window.addEventListener('scroll', hdrSolid, { passive: true }); hdrSolid();
  var burger = $('[data-burger]');
  function menuMobile(abrir) { $('#nav').classList.toggle('is-open', abrir); burger.setAttribute('aria-expanded', abrir); hdrSolid(); }
  burger.addEventListener('click', function () { menuMobile(burger.getAttribute('aria-expanded') !== 'true'); });
  $$('#nav a').forEach(function (a) { a.addEventListener('click', function () { menuMobile(false); }); });
  /* item ativo do menu */
  if ('IntersectionObserver' in window) {
    var links = {}; $$('#nav a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var ioNav = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting && links[e.target.id]) { $$('#nav a').forEach(function (a) { a.classList.remove('is-active'); }); links[e.target.id].classList.add('is-active'); } });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(links).forEach(function (id) { var s = document.getElementById(id); if (s) ioNav.observe(s); });
  }

  /* ---------- Status aberto/fechado ---------- */
  var st = P.statusAgora();
  if (st.texto) { $('[data-status-text]').textContent = st.texto + ' · ' + N.cidade; }
  $('[data-status-dot]').classList.add(st.estado === 'aberto' ? 'is-open' : st.estado === 'fechado' ? 'is-closed' : 'x');

  /* ---------- Diferenciais ---------- */
  $('[data-perks]').innerHTML = (N.diferenciais || []).map(function (d, i) {
    return '<li class="perk reveal" style="--d:' + (i * 0.07) + 's"><svg aria-hidden="true"><use href="#i-' + esc(d.icone) + '"/></svg><div><b>' + esc(d.titulo) + '</b><span>' + esc(d.texto) + '</span></div></li>';
  }).join('');

  /* ---------- Preços ---------- */
  var pizzas = function () { return D.produtos.filter(function (p) { return p.ativo && (P.categoria(p.categoria) || {}).tipo === 'pizza'; }); };
  function aPartirDe(p) {
    if (p.precos) {
      var vs = D.tamanhos.map(function (t) { return p.precos[t.id]; }).filter(function (v) { return v != null; });
      return vs.length ? Math.min.apply(null, vs) : null;
    }
    return p.preco;
  }
  var algumPrecoFaltando = D.produtos.some(function (p) { return p.ativo && aPartirDe(p) == null; });
  if (algumPrecoFaltando) $('[data-price-note]').hidden = false;

  function imgTag(nome, alt, sizes, cls) {
    if (!nome) return '';
    return '<img ' + (cls ? 'class="' + cls + '" ' : '') + 'src="' + P.foto(nome, 960) + '" srcset="' + P.foto(nome, 480) + ' 480w, ' + P.foto(nome, 960) + ' 960w" sizes="' + (sizes || '(max-width: 720px) 40vw, 360px') + '" alt="' + esc(alt || '') + '" loading="lazy" decoding="async">';
  }

  /* ---------- Destaques ---------- */
  var dest = pizzas().filter(function (p) { return p.destaque && p.foto; });
  var rail = $('[data-featured]');
  rail.innerHTML = dest.map(function (p, i) {
    return '<button type="button" class="feat reveal" style="--d:' + (i * 0.06) + 's" data-open="' + p.id + '" aria-label="Montar pizza ' + esc(p.nome) + '">' +
      imgTag(p.foto, '', '(max-width: 720px) 80vw, 340px') + '<span class="feat__go" aria-hidden="true">' + ICON_PLUS + '</span>' +
      '<span class="feat__txt"><b>' + esc(p.nome) + '</b><span>' + esc(p.descricao) + '</span></span></button>';
  }).join('');
  if (!dest.length) rail.closest('section').hidden = true;
  /* inclinação 3D suave no hover (apenas mouse) */
  if (!reduz && window.matchMedia('(hover: hover)').matches) {
    $$('.feat').forEach(function (el) {
      el.addEventListener('pointermove', function (e) { var r = el.getBoundingClientRect(); el.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 8 + 'deg'); el.style.setProperty('--rx', (.5 - (e.clientY - r.top) / r.height) * 8 + 'deg'); });
      el.addEventListener('pointerleave', function () { el.style.setProperty('--ry', '0deg'); el.style.setProperty('--rx', '0deg'); });
    });
  }

  /* ---------- Cardápio ---------- */
  var tabs = $('[data-tabs]'), ink = $('.tabs__ink'), cat = (D.categorias[0] || {}).id;
  D.categorias.forEach(function (c) {
    if (!D.produtos.some(function (p) { return p.ativo && p.categoria === c.id; })) return;
    var b = document.createElement('button'); b.type = 'button'; b.className = 'tab'; b.setAttribute('role', 'tab'); b.id = 'tab-' + c.id; b.textContent = c.nome; b.dataset.cat = c.id;
    b.setAttribute('aria-controls', 'menu-grid'); tabs.appendChild(b);
  });
  $('[data-menu]').id = 'menu-grid'; $('[data-menu]').setAttribute('role', 'tabpanel');
  function moveInk() { var a = $('.tab[aria-selected="true"]', tabs); if (!a) return; ink.style.width = a.offsetWidth + 'px'; ink.style.transform = 'translateX(' + a.offsetLeft + 'px)'; }
  function renderMenu() {
    $$('.tab', tabs).forEach(function (t) { var on = t.dataset.cat === cat; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; });
    $('[data-menu]').setAttribute('aria-labelledby', 'tab-' + cat);
    moveInk();
    var c = P.categoria(cat), lista = D.produtos.filter(function (p) { return p.ativo && p.categoria === cat; });
    $('[data-menu]').innerHTML = lista.map(function (p, i) {
      var v = aPartirDe(p), isPizza = c.tipo === 'pizza';
      var preco = v != null ? (isPizza ? 'a partir de' : '') + '<b>' + P.dinheiro(v) + '</b>' : '<b class="pending">Preço a confirmar</b>';
      var pic = p.foto ? '<div class="card__pic">' + imgTag(p.foto, 'Pizza ' + p.nome + ' (foto ilustrativa)') + (p.destaque ? '<span class="card__tag">Favorita</span>' : '') + '</div>'
        : (isPizza ? '<div class="card__pic card__pic--none"><span><img src="img/logo.svg" alt="">Foto em breve</span></div>' : '');
      return '<article class="card' + (isPizza ? '' : ' card--drink') + '" style="--i:' + i + '">' + pic +
        '<div class="card__body"><h3 class="card__name">' + esc(p.nome) + '</h3><p class="card__desc">' + esc(p.descricao) + '</p>' +
        '<div class="card__foot"><span class="card__price">' + preco + '</span>' +
        '<button type="button" class="card__add" data-open="' + p.id + '" aria-label="Adicionar ' + esc(p.nome) + '">' + ICON_PLUS + '</button></div></div></article>';
    }).join('');
  }
  tabs.addEventListener('click', function (e) { var t = e.target.closest('.tab'); if (!t) return; cat = t.dataset.cat; renderMenu(); });
  tabs.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    var ts = $$('.tab', tabs), i = ts.findIndex(function (t) { return t.dataset.cat === cat; });
    i = (i + (e.key === 'ArrowRight' ? 1 : ts.length - 1)) % ts.length; cat = ts[i].dataset.cat; renderMenu(); ts[i].focus();
  });
  window.addEventListener('resize', moveInk);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveInk);
  renderMenu();
  $('[data-sizes]').innerHTML = '<span>Tamanhos:</span>' + D.tamanhos.map(function (t) { return '<span><b>' + esc(t.nome) + '</b> · ' + t.fatias + ' fatias</span>'; }).join('');

  /* ---------- Carrinho: estado ---------- */
  var cart = store.get('pizzaria_carrinho', []).filter(function (l) { return l.ids.every(function (id) { return P.produto(id); }); });
  function precoLinha(l) {
    if (l.tam) return P.precoPizza(l.ids, l.tam);
    var p = P.produto(l.ids[0]); return p ? p.preco : null;
  }
  function nomeLinha(l) {
    var ps = l.ids.map(function (id) { return P.produto(id).nome; });
    if (!l.tam) return ps[0];
    var t = D.tamanhos.find(function (x) { return x.id === l.tam; });
    return 'Pizza ' + (t ? t.nome : l.tam) + ' · ' + (ps.length > 1 ? '½ ' + ps[0] + ' + ½ ' + ps[1] : ps[0]);
  }
  function salvarCart() { store.set('pizzaria_carrinho', cart); renderCart(); }
  function totais() {
    var sub = 0, faltando = false;
    cart.forEach(function (l) { var v = precoLinha(l); if (v == null) faltando = true; else sub += v * l.qty; });
    var entrega = modo() === 'entrega';
    var taxa = entrega ? N.entrega.taxa : 0;
    if (entrega && taxa == null) faltando = true;
    return { sub: sub, taxa: taxa, total: sub + (taxa || 0), faltando: faltando, entrega: entrega };
  }
  function modo() { var r = $('input[name="modo"]:checked'); return r ? r.value : 'entrega'; }

  /* ---------- Montador de pizza ---------- */
  var dlg = $('#builder'), bState = null;
  function abrirProduto(id) {
    var p = P.produto(id); if (!p) return;
    var c = P.categoria(p.categoria);
    if (c.tipo !== 'pizza') { addLinha({ ids: [p.id], tam: null, qty: 1, obs: '' }); return; }
    var tamPadrao = (D.tamanhos.find(function (t) { return t.id === 'G'; }) || D.tamanhos[0]).id;
    bState = { ids: [p.id], tam: tamPadrao, qty: 1, half: false };
    $('[data-b-title]').textContent = p.nome;
    $('[data-b-desc]').textContent = p.descricao;
    $('[data-b-sizes]').innerHTML = D.tamanhos.map(function (t) {
      return '<label class="chip"><input type="radio" name="tam" value="' + t.id + '"' + (t.id === tamPadrao ? ' checked' : '') + '><span><b>' + esc(t.nome) + '</b><small data-size-price="' + t.id + '"></small></span></label>';
    }).join('');
    var outros = pizzas().filter(function (x) { return x.id !== p.id; });
    $('[data-b-flavor2]').innerHTML = outros.map(function (x) { return '<option value="' + x.id + '">' + esc(x.nome) + '</option>'; }).join('');
    $('[data-b-half]').checked = false; $('[data-b-second]').hidden = true; $('[data-b-obs]').value = '';
    $('[data-b-rule]').textContent = D.regraMeioAMeio === 'media' ? 'Meio a meio: cobramos a média dos dois sabores.' : 'Meio a meio: vale o preço do sabor de maior valor.';
    atualizarBuilder();
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
  }
  function atualizarBuilder() {
    var t = D.tamanhos.find(function (x) { return x.id === bState.tam; });
    var podeMeio = t && t.maxSabores > 1;
    $('[data-b-half]').disabled = !podeMeio;
    if (!podeMeio) { bState.half = false; $('[data-b-half]').checked = false; $('[data-b-second]').hidden = true; }
    var ids = bState.half ? [bState.ids[0], $('[data-b-flavor2]').value] : [bState.ids[0]];
    bState.cur = ids;
    var pic = $('[data-b-pic]'), fotos = ids.map(function (id) { return P.produto(id).foto; });
    pic.className = 'b__pic' + (ids.length > 1 ? ' b__pic--half' : '');
    pic.innerHTML = fotos.map(function (f) { return f ? imgTag(f, '', '(max-width: 720px) 100vw, 420px') : '<img src="img/logo.svg" alt="" style="object-fit:contain;padding:20%">'; }).join('');
    D.tamanhos.forEach(function (tt) { var v = P.precoPizza(ids, tt.id), el = $('[data-size-price="' + tt.id + '"]'); if (el) el.textContent = v != null ? P.dinheiro(v) : tt.fatias + ' fatias'; });
    var v = P.precoPizza(ids, bState.tam);
    $('[data-b-qty]').textContent = bState.qty;
    $('[data-b-price]').textContent = v != null ? '· ' + P.dinheiro(v * bState.qty) : '';
  }
  dlg.addEventListener('change', function (e) {
    if (e.target.name === 'tam') bState.tam = e.target.value;
    if (e.target.matches('[data-b-half]')) { bState.half = e.target.checked; $('[data-b-second]').hidden = !bState.half; }
    atualizarBuilder();
  });
  $('[data-b-minus]').addEventListener('click', function () { bState.qty = Math.max(1, bState.qty - 1); atualizarBuilder(); });
  $('[data-b-plus]').addEventListener('click', function () { bState.qty = Math.min(20, bState.qty + 1); atualizarBuilder(); });
  $('[data-builder-form]').addEventListener('submit', function (e) {
    if (e.submitter && e.submitter.value === 'cancel') return;
    addLinha({ ids: bState.cur.slice(), tam: bState.tam, qty: bState.qty, obs: $('[data-b-obs]').value.trim() });
  });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  document.addEventListener('click', function (e) { var o = e.target.closest('[data-open]'); if (o) abrirProduto(o.dataset.open); });

  function addLinha(l) {
    var key = l.ids.join('+') + '|' + (l.tam || '') + '|' + (l.obs || '');
    var ex = cart.find(function (x) { return x.key === key; });
    if (ex) ex.qty += l.qty; else { l.key = key; cart.push(l); }
    salvarCart();
    $$('.cart-btn, .fab-cart').forEach(function (b) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); });
    toast('Adicionado: ' + nomeLinha(l));
  }

  /* ---------- Carrinho: interface ---------- */
  var drawer = $('#cart'), lastFocus = null;
  function abrirCart() { lastFocus = document.activeElement; drawer.classList.add('is-open'); drawer.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; setTimeout(function () { $('.drawer__hdr .sheet__x').focus(); }, 60); }
  function fecharCart() { drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
  $$('[data-open-cart]').forEach(function (b) { b.addEventListener('click', abrirCart); });
  $$('[data-close-cart]').forEach(function (b) { b.addEventListener('click', fecharCart); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && drawer.classList.contains('is-open')) fecharCart(); });

  function renderCart() {
    var n = cart.reduce(function (a, l) { return a + l.qty; }, 0);
    $$('[data-cart-count]').forEach(function (el) { el.textContent = n; el.classList.toggle('has', n > 0); });
    $('.fab-cart').hidden = n === 0 || drawer.classList.contains('is-open');
    $('[data-empty]').hidden = n > 0; $('[data-checkout]').hidden = n === 0; $('[data-foot]').hidden = n === 0;
    $('[data-lines]').innerHTML = cart.map(function (l, i) {
      var v = precoLinha(l), fotos = l.ids.map(function (id) { return P.produto(id).foto; }).filter(Boolean);
      return '<li class="line"><div class="line__pic">' + (fotos.length ? fotos.map(function (f) { return '<img src="' + P.foto(f, 480) + '" alt="">'; }).join('') : '<img src="img/logo.svg" alt="" class="line__logo">') + '</div>' +
        '<div><h3>' + esc(nomeLinha(l)) + '</h3>' + (l.obs ? '<p>Obs.: ' + esc(l.obs) + '</p>' : '') + (v == null ? '<p>Preço a confirmar</p>' : '<p>' + P.dinheiro(v) + ' cada</p>') + '</div>' +
        '<div class="line__right"><span class="line__price">' + (v == null ? '—' : P.dinheiro(v * l.qty)) + '</span>' +
        '<div class="qty"><button type="button" data-q="-1" data-i="' + i + '" aria-label="' + (l.qty === 1 ? 'Remover' : 'Diminuir') + '">' + (l.qty === 1 ? '×' : '−') + '</button><output>' + l.qty + '</output><button type="button" data-q="1" data-i="' + i + '" aria-label="Aumentar">+</button></div></div></li>';
    }).join('');
    var t = totais();
    var fmt = function (v) { return v == null ? 'a confirmar' : P.dinheiro(v); };
    $('[data-fee-row]').hidden = !t.entrega;
    $('[data-fee]').textContent = fmt(t.taxa);
    var nada = t.faltando && t.sub === 0;
    $('[data-subtotal]').textContent = nada ? 'a confirmar' : P.dinheiro(t.sub);
    $('[data-total]').textContent = nada ? 'a confirmar' : t.faltando ? P.dinheiro(t.total) + ' + a confirmar' : P.dinheiro(t.total);
    $('[data-total-note]').hidden = !t.faltando;
    $('[data-total-note]').textContent = 'Alguns preços ou a taxa de entrega ainda não foram confirmados. A pizzaria informa o valor final pelo WhatsApp.';
    $('[data-cart-total-short]').textContent = t.faltando && t.sub === 0 ? n + (n > 1 ? ' itens' : ' item') : P.dinheiro(t.total);
  }
  $('[data-lines]').addEventListener('click', function (e) {
    var b = e.target.closest('[data-q]'); if (!b) return;
    var l = cart[+b.dataset.i]; l.qty += +b.dataset.q; if (l.qty <= 0) cart.splice(+b.dataset.i, 1);
    salvarCart();
  });
  var obsDrawer = new MutationObserver(renderCart); obsDrawer.observe(drawer, { attributes: true, attributeFilter: ['class'] });

  /* checkout */
  var pagamentos = (N.pagamentos && N.pagamentos.length) ? N.pagamentos : ['Pix', 'Dinheiro', 'Cartão (na entrega)'];
  $('[data-pay]').innerHTML = pagamentos.map(function (p) { return '<option>' + esc(p) + '</option>'; }).join('');
  var form = $('[data-checkout]');
  var salvo = store.get('pizzaria_cliente', {});
  Object.keys(salvo).forEach(function (k) { var el = form.elements[k]; if (el && el.type !== 'radio') el.value = salvo[k]; });
  if (!N.entrega.retirada) $('input[value="retirada"]').closest('label').hidden = true;
  if (!N.entrega.ativa) { $('input[value="entrega"]').closest('label').hidden = true; $('input[value="retirada"]').checked = true; }
  function syncModo() { $('[data-addr-fields]').hidden = modo() !== 'entrega'; renderCart(); }
  function syncPag() { $('[data-troco-wrap]').hidden = !/dinheiro/i.test(form.elements.pagamento.value); }
  form.addEventListener('change', function (e) { if (e.target.name === 'modo') syncModo(); if (e.target.name === 'pagamento') syncPag(); });
  form.addEventListener('input', function (e) { e.target.classList.remove('is-invalid'); });
  syncModo(); syncPag();

  function waNumero() { return (N.whatsapp || '').replace(/\D/g, ''); }
  function waLink(texto) { var n = waNumero(); return 'https://wa.me/' + n + (texto ? '?text=' + encodeURIComponent(texto) : ''); }

  $('[data-send]').addEventListener('click', function () {
    var f = form.elements, obrig = ['nome'].concat(modo() === 'entrega' ? ['rua', 'numero', 'bairro'] : []), erro = null;
    obrig.forEach(function (k) { if (!f[k].value.trim()) { f[k].classList.add('is-invalid'); erro = erro || f[k]; } });
    if (erro) { erro.focus(); toast('Preencha os campos destacados para enviar.'); return; }
    var dados = {}; ['nome', 'fone', 'rua', 'numero', 'bairro', 'ref'].forEach(function (k) { dados[k] = f[k].value.trim(); }); store.set('pizzaria_cliente', dados);
    var t = totais(), L = [];
    L.push('*Novo pedido pelo site — ' + N.nome + '*', '');
    cart.forEach(function (l) { var v = precoLinha(l); L.push('• ' + l.qty + 'x ' + nomeLinha(l) + ' — ' + (v == null ? 'preço a confirmar' : P.dinheiro(v * l.qty))); if (l.obs) L.push('   _Obs.: ' + l.obs + '_'); });
    var nada = t.faltando && t.sub === 0;
    L.push('', 'Subtotal: ' + (nada ? 'a confirmar' : P.dinheiro(t.sub)));
    if (t.entrega) L.push('Entrega: ' + (t.taxa == null ? 'a confirmar' : P.dinheiro(t.taxa)));
    L.push('*Total: ' + (nada ? 'a confirmar pela pizzaria' : P.dinheiro(t.total) + (t.faltando ? ' + valores a confirmar' : '')) + '*', '');
    L.push('*' + (t.entrega ? 'Entrega' : 'Retirada no local') + '*');
    L.push('Nome: ' + dados.nome); if (dados.fone) L.push('Telefone: ' + dados.fone);
    if (t.entrega) { L.push('Endereço: ' + dados.rua + ', ' + dados.numero + ' — ' + dados.bairro); if (dados.ref) L.push('Referência: ' + dados.ref); }
    L.push('Pagamento: ' + f.pagamento.value + (f.troco.value && /dinheiro/i.test(f.pagamento.value) ? ' (troco para R$ ' + f.troco.value + ')' : ''));
    if (f.obs.value.trim()) L.push('Obs.: ' + f.obs.value.trim());
    L.push('', '_Aguardo a confirmação do pedido e do valor final._');
    if (!waNumero()) toast('O número de WhatsApp da pizzaria ainda não foi configurado. Escolha o contato manualmente.');
    window.open(waLink(L.join('\n')), '_blank', 'noopener');
  });
  renderCart();

  /* ---------- Promoções ---------- */
  var promos = D.promocoes.filter(function (p) { return p.ativo && (!p.exemplo || D.modoApresentacao); });
  $('[data-promos]').innerHTML = promos.length ? promos.map(function (p, i) {
    return '<article class="promo reveal" style="--d:' + (i * 0.1) + 's">' + (p.foto ? imgTag(p.foto, '', '(max-width: 720px) 100vw, 600px') : '') +
      '<div class="promo__in"><span class="promo__seal">' + esc(p.selo || 'Promoção') + '</span>' + (p.exemplo ? '<span class="promo__seal promo__seal--ex">Exemplo</span>' : '') +
      '<h3>' + esc(p.titulo) + '</h3><p>' + esc(p.texto) + '</p></div></article>';
  }).join('') : '<p class="promo-empty">Nenhuma promoção ativa no momento. Fique de olho nas nossas redes sociais.</p>';

  /* ---------- História ---------- */
  $('[data-historia]').innerHTML = (N.historia || []).map(function (t) { return '<p>' + esc(t) + '</p>'; }).join('');

  /* ---------- Galeria + lightbox ---------- */
  var gal = D.galeria || [], lb = $('#lightbox'), lbI = 0;
  $('[data-gallery]').innerHTML = gal.map(function (g, i) {
    return '<button type="button" class="gal reveal" style="--d:' + ((i % 3) * 0.08) + 's" data-gi="' + i + '" aria-label="Ampliar foto ' + (i + 1) + '">' + imgTag(g, 'Foto ilustrativa de pizzaria ' + (i + 1), '(max-width: 720px) 100vw, 400px') + '</button>';
  }).join('');
  function lbShow(i) { lbI = (i + gal.length) % gal.length; var im = $('[data-lb-img]'); im.src = P.foto(gal[lbI], 1600); im.onerror = function () { im.onerror = null; im.src = P.foto(gal[lbI], 960); }; im.alt = 'Foto ilustrativa ' + (lbI + 1) + ' de ' + gal.length; }
  $('[data-gallery]').addEventListener('click', function (e) { var b = e.target.closest('[data-gi]'); if (!b) return; lbShow(+b.dataset.gi); lb.showModal(); });
  $('[data-lb-prev]').addEventListener('click', function () { lbShow(lbI - 1); });
  $('[data-lb-next]').addEventListener('click', function () { lbShow(lbI + 1); });
  $('[data-close-lb]').addEventListener('click', function () { lb.close(); });
  lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
  lb.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') lbShow(lbI - 1); if (e.key === 'ArrowRight') lbShow(lbI + 1); });
  var tx = null;
  lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) { if (tx == null) return; var dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) lbShow(lbI + (dx < 0 ? 1 : -1)); tx = null; });

  /* ---------- Avaliações (somente reais) ---------- */
  var star = '<svg aria-hidden="true"><use href="#i-star"/></svg>';
  var revs = D.avaliacoes || [];
  $('[data-reviews]').innerHTML = revs.length ? revs.map(function (r, i) {
    var n = Math.max(0, Math.min(5, Math.round(r.nota || 5)));
    return '<figure class="rev reveal" style="--d:' + (i * 0.08) + 's"><div class="rev__stars" role="img" aria-label="' + n + ' de 5 estrelas">' + new Array(n + 1).join(star) + '</div>' +
      '<blockquote>“' + esc(r.texto) + '”</blockquote><footer>' + esc(r.autor) + (r.fonte ? ' · ' + esc(r.fonte) : '') + (r.data ? ' · ' + esc(r.data) : '') + '</footer></figure>';
  }).join('') : '<div class="rev-empty reveal"><div class="rev-empty__stars" aria-hidden="true">' + new Array(6).join(star) + '</div>' +
    '<p>As avaliações reais dos clientes aparecem aqui. Já provou nossa pizza? Conte como foi: sua opinião ajuda muito!</p>' +
    (N.googleAvaliar ? '<a class="btn" href="' + esc(N.googleAvaliar) + '" target="_blank" rel="noopener">Avaliar no Google</a>' : '<a class="btn" href="#" data-wa-link target="_blank" rel="noopener">Contar pelo WhatsApp</a>') + '</div>';

  /* ---------- Contato, horários e mapa ---------- */
  $('[data-addr]').innerHTML = N.endereco ? esc(N.endereco) + '<br>' + esc(N.cidade + ' – ' + N.uf + ', ' + N.cep) : pend('Endereço a confirmar') + '<br>' + esc(N.cidade + ' – ' + N.uf);
  var wn = waNumero();
  $('[data-wa-text]').innerHTML = wn ? esc(wn.replace(/^55(\d{2})(\d{4,5})(\d{4})$/, '($1) $2-$3')) : pend();
  $('[data-phone]').innerHTML = N.telefone ? '<a href="tel:' + esc(N.telefone.replace(/\D/g, '')) + '">' + esc(N.telefone) + '</a>' : pend();
  var e = N.entrega, partes = [];
  if (e.ativa) partes.push('Entrega' + (e.area ? ' em ' + e.area : '') + (e.taxa != null ? ' · taxa ' + P.dinheiro(e.taxa) : ''));
  if (e.retirada) partes.push('Retirada no local');
  if (e.tempoEstimado) partes.push('Tempo médio: ' + e.tempoEstimado);
  $('[data-delivery]').innerHTML = esc(partes.join(' · ')) + (e.ativa && e.taxa == null ? ' ' + pend('(taxa a confirmar)') : '');
  $('[data-payments]').innerHTML = N.pagamentos && N.pagamentos.length ? esc(N.pagamentos.join(', ')) : pend();
  var hoje = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' })).getDay();
  var ordem = [1, 2, 3, 4, 5, 6, 0];
  $('[data-hours]').insertAdjacentHTML('beforeend', '<tbody>' + ordem.map(function (d) {
    var h = D.horarios.find(function (x) { return x.dia === d; }); if (!h) return '';
    var txt = h.fechado ? 'Fechado' : (h.abre && h.fecha ? h.abre + ' – ' + h.fecha : null);
    return '<tr' + (d === hoje ? ' class="is-today"' : '') + '><td>' + esc(h.nome) + (d === hoje ? ' (hoje)' : '') + '</td><td>' + (txt ? esc(txt) : pend()) + '</td></tr>';
  }).join('') + '</tbody>');
  var mapsUrl = N.googleMaps || 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(N.endereco ? N.endereco + ', ' + N.cidade + ' - ' + N.uf : N.mapaBusca);
  $$('[data-maps-link]').forEach(function (a) { a.href = mapsUrl; });
  /* o iframe do Google só carrega quando a pessoa pede (ou ao chegar perto), para manter o site leve */
  function carregarMapa() {
    var m = $('[data-map]'); if (m.querySelector('iframe')) return;
    var q = N.endereco ? N.endereco + ', ' + N.cidade + ' - ' + N.uf : N.mapaBusca;
    m.innerHTML = '<iframe title="Mapa: localização da pizzaria" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=' + encodeURIComponent(q) + '&z=15&output=embed"></iframe>';
  }
  $('[data-load-map]').addEventListener('click', carregarMapa);
  if ('IntersectionObserver' in window) {
    var ioMap = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { carregarMapa(); ioMap.disconnect(); } }, { rootMargin: '300px' });
    ioMap.observe($('[data-map]'));
  }
  $$('[data-wa-link]').forEach(function (a) { a.href = waLink('Olá! Vim pelo site da ' + N.nome + ' e gostaria de fazer um pedido.'); });
  var soc = [];
  if (N.instagram) soc.push('<a href="' + esc(N.instagram) + '" target="_blank" rel="noopener" aria-label="Instagram"><svg><use href="#i-ig"/></svg></a>');
  if (N.facebook) soc.push('<a href="' + esc(N.facebook) + '" target="_blank" rel="noopener" aria-label="Facebook"><svg><use href="#i-fb"/></svg></a>');
  soc.push('<a data-wa-link href="' + waLink() + '" target="_blank" rel="noopener" aria-label="WhatsApp"><svg><use href="#i-wa"/></svg></a>');
  $('[data-social]').innerHTML = soc.join('');

  /* ---------- Vídeo promocional ---------- */
  var promoDlg = $('#promo'), pv = $('[data-promo-video]');
  $('[data-play-promo]').addEventListener('click', function () { promoDlg.showModal(); pv.currentTime = 0; var pr = pv.play(); if (pr && pr.catch) pr.catch(function () {}); });
  function fecharPromo() { pv.pause(); promoDlg.close(); }
  $('[data-close-promo]').addEventListener('click', fecharPromo);
  promoDlg.addEventListener('click', function (e) { if (e.target === promoDlg) fecharPromo(); });
  promoDlg.addEventListener('close', function () { pv.pause(); });
  /* respeita "reduzir movimento": o vídeo do topo fica parado no pôster */
  var heroV = $('.hero__video');
  if (reduz) { heroV.removeAttribute('autoplay'); heroV.pause(); }
  else { var hp = heroV.play(); if (hp && hp.catch) hp.catch(function () {}); }

  /* ---------- Revelação ao rolar ---------- */
  if ('IntersectionObserver' in window && !reduz) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } }); }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    $$('.reveal').forEach(function (el) { io.observe(el); });
  } else { $$('.reveal').forEach(function (el) { el.classList.add('is-in'); }); }

  /* ---------- Parallax leve ---------- */
  var par = $$('[data-parallax]');
  if (!reduz && par.length) {
    var tick = false;
    var loop = function () {
      var vh = window.innerHeight;
      par.forEach(function (el) {
        var r = el.getBoundingClientRect(); if (r.bottom < -200 || r.top > vh + 200) return;
        var k = parseFloat(el.dataset.parallax), c = r.top + r.height / 2 - vh / 2;
        el.style.transform = 'translate3d(0,' + (el.closest('.hero') ? window.scrollY * k : -c * k).toFixed(1) + 'px,0)';
      });
      tick = false;
    };
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(loop); } }, { passive: true });
    loop();
  }

  /* ---------- Botão magnético ---------- */
  if (!reduz && window.matchMedia('(hover: hover)').matches) {
    $$('.magnetic').forEach(function (b) {
      b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.12) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.2) + 'px)'; });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }
})();
