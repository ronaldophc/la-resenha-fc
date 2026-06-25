import { defineComponent, mergeProps, ref, withCtx, createVNode, createTextVNode, unref, computed, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSlot, ssrRenderClass, ssrInterpolate } from 'vue/server-renderer';
import { _ as __nuxt_component_0 } from './nuxt-link-BE3vbSW3.mjs';
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

const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "AppHeader",
  __ssrInlineRender: true,
  setup(__props) {
    const { isAuthenticated, logout } = useAuth();
    const isMobileMenuOpen = ref(false);
    const closeMobileMenu = () => {
      isMobileMenuOpen.value = false;
    };
    const handleLogout = async () => {
      closeMobileMenu();
      await logout();
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<header${ssrRenderAttrs(mergeProps({ class: "app-header" }, _attrs))} data-v-b41d4c4e><div class="container header-container" data-v-b41d4c4e>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "logo-link"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="logo-badge" data-v-b41d4c4e${_scopeId}>LR</span><span class="logo-text" data-v-b41d4c4e${_scopeId}>La Resenha FC</span>`);
          } else {
            return [
              createVNode("span", { class: "logo-badge" }, "LR"),
              createVNode("span", { class: "logo-text" }, "La Resenha FC")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<nav class="${ssrRenderClass([{ "nav-open": isMobileMenuOpen.value }, "nav-links"])}" data-v-b41d4c4e>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "nav-item",
        "active-class": "nav-active",
        onClick: closeMobileMenu
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Home `);
          } else {
            return [
              createTextVNode(" Home ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/elenco",
        class: "nav-item",
        "active-class": "nav-active",
        onClick: closeMobileMenu
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Elenco `);
          } else {
            return [
              createTextVNode(" Elenco ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/resultados",
        class: "nav-item",
        "active-class": "nav-active",
        onClick: closeMobileMenu
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Resultados `);
          } else {
            return [
              createTextVNode(" Resultados ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/noticias",
        class: "nav-item",
        "active-class": "nav-active",
        onClick: closeMobileMenu
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Notícias `);
          } else {
            return [
              createTextVNode(" Notícias ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/tabela",
        class: "nav-item",
        "active-class": "nav-active",
        onClick: closeMobileMenu
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` Classificação `);
          } else {
            return [
              createTextVNode(" Classificação ")
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(isAuthenticated)) {
        _push(`<!--[-->`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/admin",
          class: "nav-item nav-admin-link",
          "active-class": "nav-active",
          onClick: closeMobileMenu
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Painel `);
            } else {
              return [
                createTextVNode(" Painel ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(VButton, {
          size: "sm",
          variant: "danger",
          class: "admin-btn",
          onClick: handleLogout
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Sair `);
            } else {
              return [
                createTextVNode(" Sair ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<!--]-->`);
      } else {
        _push(ssrRenderComponent(VButton, {
          to: "/admin/login",
          size: "sm",
          variant: "primary",
          class: "admin-btn",
          onClick: closeMobileMenu
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Acesso Admin `);
            } else {
              return [
                createTextVNode(" Acesso Admin ")
              ];
            }
          }),
          _: 1
        }, _parent));
      }
      _push(`</nav><button class="mobile-menu-toggle" aria-label="Toggle Menu" data-v-b41d4c4e><span class="bar" data-v-b41d4c4e></span><span class="bar" data-v-b41d4c4e></span><span class="bar" data-v-b41d4c4e></span></button></div></header>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/layout/AppHeader.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const AppHeader = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$2, [["__scopeId", "data-v-b41d4c4e"]]), { __name: "LayoutAppHeader" });
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "AppFooter",
  __ssrInlineRender: true,
  setup(__props) {
    const { isAuthenticated } = useAuth();
    const currentYear = computed(() => (/* @__PURE__ */ new Date()).getFullYear());
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<footer${ssrRenderAttrs(mergeProps({ class: "app-footer" }, _attrs))} data-v-bf2e3437><div class="container footer-container" data-v-bf2e3437><div class="footer-grid" data-v-bf2e3437><div class="footer-brand" data-v-bf2e3437><h4 data-v-bf2e3437>La Resenha FC</h4><p data-v-bf2e3437>O clube mais temido da várzea curitibana. Futebol jogado na raça, poeira no pulmão e resenha garantida com cerveja gelada.</p></div><div class="footer-links" data-v-bf2e3437><h5 data-v-bf2e3437>Navegação</h5><ul data-v-bf2e3437><li data-v-bf2e3437>`);
      _push(ssrRenderComponent(_component_NuxtLink, { to: "/" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Home`);
          } else {
            return [
              createTextVNode("Home")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><li data-v-bf2e3437>`);
      _push(ssrRenderComponent(_component_NuxtLink, { to: "/elenco" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Elenco`);
          } else {
            return [
              createTextVNode("Elenco")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><li data-v-bf2e3437>`);
      _push(ssrRenderComponent(_component_NuxtLink, { to: "/resultados" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Resultados`);
          } else {
            return [
              createTextVNode("Resultados")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><li data-v-bf2e3437>`);
      _push(ssrRenderComponent(_component_NuxtLink, { to: "/tabela" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Classificação`);
          } else {
            return [
              createTextVNode("Classificação")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li></ul></div><div class="footer-admin" data-v-bf2e3437><h5 data-v-bf2e3437>Administração</h5><p data-v-bf2e3437>Área restrita para a comissão técnica e diretoria do La Resenha FC.</p>`);
      _push(ssrRenderComponent(VButton, {
        to: unref(isAuthenticated) ? "/admin" : "/admin/login",
        variant: "outline",
        size: "sm"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(isAuthenticated) ? "Acessar Painel" : "Área do Diretor")}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(isAuthenticated) ? "Acessar Painel" : "Área do Diretor"), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></div><div class="footer-bottom" data-v-bf2e3437><div class="container" data-v-bf2e3437><p data-v-bf2e3437>© ${ssrInterpolate(currentYear.value)} La Resenha FC. Todos os direitos reservados. UTFPR - Tópicos Especiais em Programação.</p></div></div></footer>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/layout/AppFooter.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const AppFooter = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main$1, [["__scopeId", "data-v-bf2e3437"]]), { __name: "LayoutAppFooter" });
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "default",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "app-layout" }, _attrs))} data-v-62718fe6>`);
      _push(ssrRenderComponent(AppHeader, null, null, _parent));
      _push(`<main class="app-content container" data-v-62718fe6>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main>`);
      _push(ssrRenderComponent(AppFooter, null, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _default = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-62718fe6"]]);

export { _default as default };
//# sourceMappingURL=default-DMhoE1Bj.mjs.map
