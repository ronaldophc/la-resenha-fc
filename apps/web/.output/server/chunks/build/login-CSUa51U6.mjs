import { _ as __nuxt_component_0 } from './nuxt-link-BE3vbSW3.mjs';
import { defineComponent, reactive, ref, mergeProps, withCtx, createTextVNode, toDisplayString, createVNode, withModifiers, withDirectives, vModelText, openBlock, createBlock, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrInterpolate } from 'vue/server-renderer';
import { _ as _export_sfc, u as useAuth } from './server.mjs';
import { V as VCard } from './VCard-B2shx5kR.mjs';
import { V as VButton } from './VButton-DMCkO_FL.mjs';
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
  __name: "login",
  __ssrInlineRender: true,
  setup(__props) {
    useHead({
      title: "Entrar - Painel La Resenha FC"
    });
    const { login: login2 } = useAuth();
    const form = reactive({
      email: "",
      password: ""
    });
    const loading = ref(false);
    const errorMessage = ref("");
    const handleLogin = async () => {
      loading.value = true;
      errorMessage.value = "";
      const result = await login2({
        email: form.email,
        password: form.password
      });
      loading.value = false;
      if (!result.success) {
        errorMessage.value = result.error || "Erro inesperado ao realizar login.";
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "login-container" }, _attrs))} data-v-13e2c240>`);
      _push(ssrRenderComponent(VCard, {
        variant: "featured",
        class: "login-card"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="login-header" data-v-13e2c240${_scopeId}><h1 data-v-13e2c240${_scopeId}>ÁREA RESTRITA</h1><p data-v-13e2c240${_scopeId}>Identifique-se para acessar o painel administrativo.</p></div><form class="login-form" data-v-13e2c240${_scopeId}><div class="form-group" data-v-13e2c240${_scopeId}><label for="email" data-v-13e2c240${_scopeId}>E-mail</label><input id="email"${ssrRenderAttr("value", form.email)} type="email" placeholder="seu.email@exemplo.com" required class="form-input" data-v-13e2c240${_scopeId}></div><div class="form-group" data-v-13e2c240${_scopeId}><label for="password" data-v-13e2c240${_scopeId}>Senha</label><input id="password"${ssrRenderAttr("value", form.password)} type="password" placeholder="••••••••" required class="form-input" data-v-13e2c240${_scopeId}></div>`);
            if (errorMessage.value) {
              _push2(`<div class="error-banner" data-v-13e2c240${_scopeId}>${ssrInterpolate(errorMessage.value)}</div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(ssrRenderComponent(VButton, {
              type: "submit",
              variant: "primary",
              disabled: loading.value,
              class: "submit-button"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`${ssrInterpolate(loading.value ? "Entrando..." : "Acessar Painel")}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(loading.value ? "Entrando..." : "Acessar Painel"), 1)
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</form><div class="login-footer" data-v-13e2c240${_scopeId}>`);
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/",
              class: "back-link"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`← Voltar para o início`);
                } else {
                  return [
                    createTextVNode("← Voltar para o início")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "login-header" }, [
                createVNode("h1", null, "ÁREA RESTRITA"),
                createVNode("p", null, "Identifique-se para acessar o painel administrativo.")
              ]),
              createVNode("form", {
                onSubmit: withModifiers(handleLogin, ["prevent"]),
                class: "login-form"
              }, [
                createVNode("div", { class: "form-group" }, [
                  createVNode("label", { for: "email" }, "E-mail"),
                  withDirectives(createVNode("input", {
                    id: "email",
                    "onUpdate:modelValue": ($event) => form.email = $event,
                    type: "email",
                    placeholder: "seu.email@exemplo.com",
                    required: "",
                    class: "form-input"
                  }, null, 8, ["onUpdate:modelValue"]), [
                    [vModelText, form.email]
                  ])
                ]),
                createVNode("div", { class: "form-group" }, [
                  createVNode("label", { for: "password" }, "Senha"),
                  withDirectives(createVNode("input", {
                    id: "password",
                    "onUpdate:modelValue": ($event) => form.password = $event,
                    type: "password",
                    placeholder: "••••••••",
                    required: "",
                    class: "form-input"
                  }, null, 8, ["onUpdate:modelValue"]), [
                    [vModelText, form.password]
                  ])
                ]),
                errorMessage.value ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "error-banner"
                }, toDisplayString(errorMessage.value), 1)) : createCommentVNode("", true),
                createVNode(VButton, {
                  type: "submit",
                  variant: "primary",
                  disabled: loading.value,
                  class: "submit-button"
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(loading.value ? "Entrando..." : "Acessar Painel"), 1)
                  ]),
                  _: 1
                }, 8, ["disabled"])
              ], 32),
              createVNode("div", { class: "login-footer" }, [
                createVNode(_component_NuxtLink, {
                  to: "/",
                  class: "back-link"
                }, {
                  default: withCtx(() => [
                    createTextVNode("← Voltar para o início")
                  ]),
                  _: 1
                })
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/login.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const login = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-13e2c240"]]);

export { login as default };
//# sourceMappingURL=login-CSUa51U6.mjs.map
