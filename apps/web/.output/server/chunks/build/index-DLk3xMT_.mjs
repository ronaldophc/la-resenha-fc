import { defineComponent, ref, mergeProps, withCtx, createTextVNode, createVNode, openBlock, createBlock, toDisplayString, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderClass, ssrInterpolate } from 'vue/server-renderer';
import { V as VCard } from './VCard-B2shx5kR.mjs';
import { V as VButton } from './VButton-DMCkO_FL.mjs';
import { u as useHead } from './composables-ysv7MJZc.mjs';
import { _ as _export_sfc, a as useApi } from './server.mjs';
import './nuxt-link-BE3vbSW3.mjs';
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
      title: "La Resenha FC - Estrutura Base Nuxt 4",
      meta: [
        { name: "description", content: "Estrutura do frontend do projeto La Resenha FC reconstruída com sucesso." }
      ]
    });
    const { request } = useApi();
    const apiStatus = ref("");
    const apiSuccess = ref(false);
    const testApiCall = async () => {
      apiStatus.value = "Conectando à API...";
      apiSuccess.value = false;
      try {
        const response = await request("/");
        apiSuccess.value = true;
        apiStatus.value = "⚡ Conexão com a API NestJS realizada com sucesso!";
      } catch (error) {
        apiSuccess.value = false;
        apiStatus.value = `❌ Falha ao conectar com a API: ${error.message || "Sem resposta do servidor (localhost:3001)"}`;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "welcome-section" }, _attrs))} data-v-ecf816e1>`);
      _push(ssrRenderComponent(VCard, {
        variant: "featured",
        class: "welcome-card"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="status-badge" data-v-ecf816e1${_scopeId}>🟢 ESTRUTURA CONFIGURADA</div><h1 data-v-ecf816e1${_scopeId}>La Resenha FC</h1><p class="subtitle" data-v-ecf816e1${_scopeId}> A estrutura base do **Nuxt 4** foi reconstruída do zero com sucesso! </p><div class="features-list" data-v-ecf816e1${_scopeId}><div class="feature-item" data-v-ecf816e1${_scopeId}><strong data-v-ecf816e1${_scopeId}>📂 Estrutura Limpa:</strong> Diretórios organizados seguindo as diretrizes oficiais do Nuxt 4. </div><div class="feature-item" data-v-ecf816e1${_scopeId}><strong data-v-ecf816e1${_scopeId}>🧱 Componentes Reutilizáveis:</strong> Botões (\`VButton\`) e Cards (\`VCard\`) integrados ao Design System. </div><div class="feature-item" data-v-ecf816e1${_scopeId}><strong data-v-ecf816e1${_scopeId}>🛡️ Autenticação SSR-Safe:</strong> Sessões armazenadas em cookies com guards de rotas (\`auth\` e \`guest\` middlewares). </div><div class="feature-item" data-v-ecf816e1${_scopeId}><strong data-v-ecf816e1${_scopeId}>🌐 Cliente de API Inteligente:</strong> \`useApi\` pronto para se comunicar com o backend NestJS de forma automática. </div></div><div class="welcome-actions" data-v-ecf816e1${_scopeId}>`);
            _push2(ssrRenderComponent(VButton, {
              variant: "primary",
              onClick: testApiCall
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` Testar Conexão com API `);
                } else {
                  return [
                    createTextVNode(" Testar Conexão com API ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(VButton, {
              to: "/admin",
              variant: "outline"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` Acessar Painel Admin (Protegido) `);
                } else {
                  return [
                    createTextVNode(" Acessar Painel Admin (Protegido) ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div>`);
            if (apiStatus.value) {
              _push2(`<div class="${ssrRenderClass(["api-feedback", { "feedback-success": apiSuccess.value, "feedback-error": !apiSuccess.value }])}" data-v-ecf816e1${_scopeId}>${ssrInterpolate(apiStatus.value)}</div>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              createVNode("div", { class: "status-badge" }, "🟢 ESTRUTURA CONFIGURADA"),
              createVNode("h1", null, "La Resenha FC"),
              createVNode("p", { class: "subtitle" }, " A estrutura base do **Nuxt 4** foi reconstruída do zero com sucesso! "),
              createVNode("div", { class: "features-list" }, [
                createVNode("div", { class: "feature-item" }, [
                  createVNode("strong", null, "📂 Estrutura Limpa:"),
                  createTextVNode(" Diretórios organizados seguindo as diretrizes oficiais do Nuxt 4. ")
                ]),
                createVNode("div", { class: "feature-item" }, [
                  createVNode("strong", null, "🧱 Componentes Reutilizáveis:"),
                  createTextVNode(" Botões (`VButton`) e Cards (`VCard`) integrados ao Design System. ")
                ]),
                createVNode("div", { class: "feature-item" }, [
                  createVNode("strong", null, "🛡️ Autenticação SSR-Safe:"),
                  createTextVNode(" Sessões armazenadas em cookies com guards de rotas (`auth` e `guest` middlewares). ")
                ]),
                createVNode("div", { class: "feature-item" }, [
                  createVNode("strong", null, "🌐 Cliente de API Inteligente:"),
                  createTextVNode(" `useApi` pronto para se comunicar com o backend NestJS de forma automática. ")
                ])
              ]),
              createVNode("div", { class: "welcome-actions" }, [
                createVNode(VButton, {
                  variant: "primary",
                  onClick: testApiCall
                }, {
                  default: withCtx(() => [
                    createTextVNode(" Testar Conexão com API ")
                  ]),
                  _: 1
                }),
                createVNode(VButton, {
                  to: "/admin",
                  variant: "outline"
                }, {
                  default: withCtx(() => [
                    createTextVNode(" Acessar Painel Admin (Protegido) ")
                  ]),
                  _: 1
                })
              ]),
              apiStatus.value ? (openBlock(), createBlock("div", {
                key: 0,
                class: ["api-feedback", { "feedback-success": apiSuccess.value, "feedback-error": !apiSuccess.value }]
              }, toDisplayString(apiStatus.value), 3)) : createCommentVNode("", true)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-ecf816e1"]]);

export { index as default };
//# sourceMappingURL=index-DLk3xMT_.mjs.map
