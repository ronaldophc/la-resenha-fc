import { _ as __nuxt_component_0 } from './nuxt-link-BE3vbSW3.mjs';
import { defineComponent, mergeProps, withCtx, createVNode, createTextVNode, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderSlot } from 'vue/server-renderer';
import { V as VButton } from './VButton-DMCkO_FL.mjs';
import { _ as _export_sfc, u as useAuth } from './server.mjs';
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
  __name: "admin",
  __ssrInlineRender: true,
  setup(__props) {
    const { user, logout } = useAuth();
    const handleLogout = async () => {
      await logout();
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "admin-layout" }, _attrs))} data-v-67fb4f78><header class="admin-topbar" data-v-67fb4f78><div class="admin-topbar-container" data-v-67fb4f78>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "brand-link"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="badge" data-v-67fb4f78${_scopeId}>LR</span><span class="title" data-v-67fb4f78${_scopeId}>La Resenha FC <span class="subtitle" data-v-67fb4f78${_scopeId}>Painel do Diretor</span></span>`);
          } else {
            return [
              createVNode("span", { class: "badge" }, "LR"),
              createVNode("span", { class: "title" }, [
                createTextVNode("La Resenha FC "),
                createVNode("span", { class: "subtitle" }, "Painel do Diretor")
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(user)) {
        _push(`<div class="user-info" data-v-67fb4f78><span class="user-name" data-v-67fb4f78>📋 ${ssrInterpolate(unref(user).name || unref(user).email)}</span>`);
        _push(ssrRenderComponent(VButton, {
          size: "sm",
          variant: "danger",
          onClick: handleLogout
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Sair`);
            } else {
              return [
                createTextVNode("Sair")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></header><div class="admin-body container" data-v-67fb4f78><aside class="admin-sidebar" data-v-67fb4f78><nav class="sidebar-nav" data-v-67fb4f78>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/admin",
        class: "sidebar-item",
        "exact-active-class": "sidebar-active"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` 🏠 Visão Geral `);
          } else {
            return [
              createTextVNode(" 🏠 Visão Geral ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/admin/jogadores",
        class: "sidebar-item",
        "active-class": "sidebar-active"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` 🏃 Gerenciar Elenco `);
          } else {
            return [
              createTextVNode(" 🏃 Gerenciar Elenco ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/admin/partidas",
        class: "sidebar-item",
        "active-class": "sidebar-active"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` ⚽ Gerenciar Partidas `);
          } else {
            return [
              createTextVNode(" ⚽ Gerenciar Partidas ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/admin/noticias",
        class: "sidebar-item",
        "active-class": "sidebar-active"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` 📰 Gerenciar Notícias `);
          } else {
            return [
              createTextVNode(" 📰 Gerenciar Notícias ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/admin/classificacao",
        class: "sidebar-item",
        "active-class": "sidebar-active"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` 🏆 Classificação (Tabela) `);
          } else {
            return [
              createTextVNode(" 🏆 Classificação (Tabela) ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="sidebar-separator" data-v-67fb4f78></div>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "sidebar-item sidebar-back-link"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` ⬅️ Voltar ao Site `);
          } else {
            return [
              createTextVNode(" ⬅️ Voltar ao Site ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</nav></aside><main class="admin-content" data-v-67fb4f78>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/admin.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const admin = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-67fb4f78"]]);

export { admin as default };
//# sourceMappingURL=admin-BcFKJZ8p.mjs.map
