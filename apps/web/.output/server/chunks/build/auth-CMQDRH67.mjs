import { _ as __nuxt_component_0 } from './nuxt-link-BE3vbSW3.mjs';
import { defineComponent, mergeProps, withCtx, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderSlot } from 'vue/server-renderer';
import { _ as _export_sfc } from './server.mjs';
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
  __name: "auth",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "auth-layout" }, _attrs))} data-v-40d8ef1f><div class="auth-container" data-v-40d8ef1f><div class="auth-logo-wrapper" data-v-40d8ef1f>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "auth-logo-link"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="logo-badge" data-v-40d8ef1f${_scopeId}>LR</span><span class="logo-text" data-v-40d8ef1f${_scopeId}>La Resenha FC</span>`);
          } else {
            return [
              createVNode("span", { class: "logo-badge" }, "LR"),
              createVNode("span", { class: "logo-text" }, "La Resenha FC")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/auth.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const auth = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-40d8ef1f"]]);

export { auth as default };
//# sourceMappingURL=auth-CMQDRH67.mjs.map
