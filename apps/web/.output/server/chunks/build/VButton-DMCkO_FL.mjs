import { _ as __nuxt_component_0 } from './nuxt-link-BE3vbSW3.mjs';
import { defineComponent, computed, createVNode, resolveDynamicComponent, mergeProps, withCtx, openBlock, createBlock, createCommentVNode, renderSlot, useSSRContext } from 'vue';
import { ssrRenderVNode, ssrRenderSlot } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "VButton",
  __ssrInlineRender: true,
  props: {
    to: {},
    type: { default: "button" },
    variant: { default: "primary" },
    size: { default: "md" },
    disabled: { type: Boolean, default: false },
    loading: { type: Boolean, default: false }
  },
  emits: ["click"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const NuxtLink = __nuxt_component_0;
    const componentType = computed(() => {
      return props.to ? NuxtLink : "button";
    });
    const handleClick = (event) => {
      if (props.disabled || props.loading) {
        event.preventDefault();
        return;
      }
      emit("click", event);
    };
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderVNode(_push, createVNode(resolveDynamicComponent(componentType.value), mergeProps({
        to: __props.to,
        type: __props.to ? void 0 : __props.type,
        disabled: __props.disabled || __props.loading,
        class: [
          "btn",
          `btn-${__props.variant}`,
          {
            "btn-sm": __props.size === "sm",
            "opacity-50 cursor-not-allowed": __props.disabled || __props.loading
          }
        ],
        onClick: handleClick
      }, _attrs), {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            if (__props.loading) {
              _push2(`<span class="mr-2 animate-spin"${_scopeId}>🌀</span>`);
            } else {
              _push2(`<!---->`);
            }
            ssrRenderSlot(_ctx.$slots, "default", {}, null, _push2, _parent2, _scopeId);
          } else {
            return [
              __props.loading ? (openBlock(), createBlock("span", {
                key: 0,
                class: "mr-2 animate-spin"
              }, "🌀")) : createCommentVNode("", true),
              renderSlot(_ctx.$slots, "default")
            ];
          }
        }),
        _: 3
      }), _parent);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/VButton.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const VButton = Object.assign(_sfc_main, { __name: "UiVButton" });

export { VButton as V };
//# sourceMappingURL=VButton-DMCkO_FL.mjs.map
