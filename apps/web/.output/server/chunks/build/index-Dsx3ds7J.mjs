import { defineComponent, mergeProps, unref, withCtx, createVNode, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent } from 'vue/server-renderer';
import { _ as _export_sfc, u as useAuth } from './server.mjs';
import { V as VCard } from './VCard-B2shx5kR.mjs';
import { u as useHead } from './composables-ysv7MJZc.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'vue-router';
import 'perfect-debounce';
import '@vue/shared';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({
      title: "Painel Admin - La Resenha FC"
    });
    const { user } = useAuth();
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "admin-dashboard" }, _attrs))} data-v-b4ec989c><div class="dashboard-header" data-v-b4ec989c><h1 data-v-b4ec989c>Painel Administrativo</h1><p class="welcome-message" data-v-b4ec989c> Olá, <strong data-v-b4ec989c>${ssrInterpolate(unref(user)?.name || unref(user)?.email || "Administrador")}</strong>! Bem-vindo de volta. </p></div><div class="dashboard-grid" data-v-b4ec989c>`);
      _push(ssrRenderComponent(VCard, { class: "stat-card" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="stat-icon" data-v-b4ec989c${_scopeId}>👥</div><div class="stat-content" data-v-b4ec989c${_scopeId}><span class="stat-label" data-v-b4ec989c${_scopeId}>Jogadores Cadastrados</span><span class="stat-value" data-v-b4ec989c${_scopeId}>--</span></div>`);
          } else {
            return [
              createVNode("div", { class: "stat-icon" }, "👥"),
              createVNode("div", { class: "stat-content" }, [
                createVNode("span", { class: "stat-label" }, "Jogadores Cadastrados"),
                createVNode("span", { class: "stat-value" }, "--")
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(VCard, { class: "stat-card" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="stat-icon" data-v-b4ec989c${_scopeId}>⚽</div><div class="stat-content" data-v-b4ec989c${_scopeId}><span class="stat-label" data-v-b4ec989c${_scopeId}>Partidas Registradas</span><span class="stat-value" data-v-b4ec989c${_scopeId}>--</span></div>`);
          } else {
            return [
              createVNode("div", { class: "stat-icon" }, "⚽"),
              createVNode("div", { class: "stat-content" }, [
                createVNode("span", { class: "stat-label" }, "Partidas Registradas"),
                createVNode("span", { class: "stat-value" }, "--")
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(VCard, { class: "stat-card" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="stat-icon" data-v-b4ec989c${_scopeId}>🏆</div><div class="stat-content" data-v-b4ec989c${_scopeId}><span class="stat-label" data-v-b4ec989c${_scopeId}>Campeonatos Ativos</span><span class="stat-value" data-v-b4ec989c${_scopeId}>--</span></div>`);
          } else {
            return [
              createVNode("div", { class: "stat-icon" }, "🏆"),
              createVNode("div", { class: "stat-content" }, [
                createVNode("span", { class: "stat-label" }, "Campeonatos Ativos"),
                createVNode("span", { class: "stat-value" }, "--")
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      _push(ssrRenderComponent(VCard, {
        variant: "featured",
        class: "info-card"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<h2 data-v-b4ec989c${_scopeId}>Pronto para Desenvolvimento</h2><p data-v-b4ec989c${_scopeId}> Esta área administrativa está totalmente protegida por rotas do lado do servidor (SSR-safe middleware) e do lado do cliente. Os dados do usuário logado foram carregados com sucesso a partir da API NestJS. </p><p class="architecture-note" data-v-b4ec989c${_scopeId}> Configure novas rotas dentro do diretório <code data-v-b4ec989c${_scopeId}>app/pages/admin/</code> para expandir o gerenciamento do elenco, resultados, tabela e notícias. </p>`);
          } else {
            return [
              createVNode("h2", null, "Pronto para Desenvolvimento"),
              createVNode("p", null, " Esta área administrativa está totalmente protegida por rotas do lado do servidor (SSR-safe middleware) e do lado do cliente. Os dados do usuário logado foram carregados com sucesso a partir da API NestJS. "),
              createVNode("p", { class: "architecture-note" }, [
                createTextVNode(" Configure novas rotas dentro do diretório "),
                createVNode("code", null, "app/pages/admin/"),
                createTextVNode(" para expandir o gerenciamento do elenco, resultados, tabela e notícias. ")
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-b4ec989c"]]);

export { index as default };
//# sourceMappingURL=index-Dsx3ds7J.mjs.map
