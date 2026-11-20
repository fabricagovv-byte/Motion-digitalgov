/* Camada de dados compartilhada pelo site e pelo painel.
   Ordem: data/config.js (publicado)  →  rascunho salvo pelo painel neste navegador (pré-visualização). */
(function () {
  'use strict';
  var CHAVE = 'pizzaria_rascunho_v1';
  var base = window.PIZZARIA_DADOS;

  function clonar(o) { return JSON.parse(JSON.stringify(o)); }
  function lerRascunho() {
    try { var t = localStorage.getItem(CHAVE); return t ? JSON.parse(t) : null; } catch (e) { return null; }
  }

  var rascunho = lerRascunho();
  var dados = rascunho && rascunho.versao === base.versao ? rascunho : clonar(base);

  window.Pizzaria = {
    CHAVE: CHAVE,
    dados: dados,
    usandoRascunho: !!(rascunho && rascunho.versao === base.versao),
    publicado: function () { return clonar(base); },
    salvarRascunho: function (d) {
      try { localStorage.setItem(CHAVE, JSON.stringify(d)); return true; } catch (e) { return false; }
    },
    descartarRascunho: function () { try { localStorage.removeItem(CHAVE); } catch (e) { /* sem acesso */ } },

    /* utilidades comuns */
    dinheiro: function (v) {
      return v == null || isNaN(v) ? null : v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    },
    foto: function (nome, largura) {
      return nome ? 'img/' + nome + '-' + (largura || 960) + '.webp' : null;
    },
    produto: function (id) {
      return dados.produtos.find(function (p) { return p.id === id; }) || null;
    },
    categoria: function (id) {
      return dados.categorias.find(function (c) { return c.id === id; }) || null;
    },
    /* preço de uma pizza (1 ou 2 sabores) num tamanho; null se algum preço não estiver definido */
    precoPizza: function (ids, tam) {
      var precos = ids.map(function (id) {
        var p = window.Pizzaria.produto(id); return p && p.precos ? p.precos[tam] : null;
      });
      if (precos.some(function (v) { return v == null; })) return null;
      if (precos.length === 1) return precos[0];
      return dados.regraMeioAMeio === 'media'
        ? Math.round((precos.reduce(function (a, b) { return a + b; }, 0) / precos.length) * 100) / 100
        : Math.max.apply(null, precos);
    },
    /* status de funcionamento agora (fuso de Brasília) */
    statusAgora: function () {
      var agora = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
      var hoje = dados.horarios.find(function (h) { return h.dia === agora.getDay(); });
      if (!hoje || hoje.abre == null || hoje.fecha == null) {
        return hoje && hoje.fechado ? { estado: 'fechado', texto: 'Fechado hoje' } : { estado: 'indef', texto: null };
      }
      if (hoje.fechado) return { estado: 'fechado', texto: 'Fechado hoje' };
      function min(s) { var p = s.split(':'); return +p[0] * 60 + +p[1]; }
      var m = agora.getHours() * 60 + agora.getMinutes(), a = min(hoje.abre), f = min(hoje.fecha);
      var aberto = f > a ? (m >= a && m < f) : (m >= a || m < f); /* suporta fechar após meia-noite */
      return aberto
        ? { estado: 'aberto', texto: 'Aberto agora · até ' + hoje.fecha }
        : { estado: 'fechado', texto: m < a ? 'Abre hoje às ' + hoje.abre : 'Fechado agora' };
    }
  };
})();
