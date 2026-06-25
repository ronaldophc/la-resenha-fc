import { defineComponent, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderSlot } from 'vue/server-renderer';
import { _ as _export_sfc } from './server.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "VCard",
  __ssrInlineRender: true,
  props: {
    variant: { default: "default" },
    hoverable: { type: Boolean, default: true }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: [
          "card",
          {
            "card-featured": __props.variant === "featured",
            "card-warning": __props.variant === "warning",
            "card-mud": __props.variant === "mud",
            "no-hover": !__props.hoverable
          }
        ]
      }, _attrs))} data-v-8f672823>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/VCard.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const VCard = /* @__PURE__ */ Object.assign(_export_sfc(_sfc_main, [["__scopeId", "data-v-8f672823"]]), { __name: "UiVCard" });

export { VCard as V };
//# sourceMappingURL=VCard-B2shx5kR.mjs.map
