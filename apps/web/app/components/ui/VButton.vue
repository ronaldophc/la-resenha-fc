<template>
  <component
    :is="componentType"
    :to="to"
    :type="to ? undefined : type"
    :disabled="disabled || loading"
    :class="[
      'btn',
      `btn-${variant}`,
      {
        'btn-sm': size === 'sm',
        'opacity-50 cursor-not-allowed': disabled || loading
      }
    ]"
    @click="handleClick"
  >
    <span v-if="loading" class="mr-2 animate-spin">🌀</span>
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { resolveComponent } from '#imports';

interface Props {
  to?: string | object;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md';
  disabled?: boolean;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'button',
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false
});

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void;
}>();

const NuxtLink = resolveComponent('NuxtLink');

const componentType = computed(() => {
  return props.to ? NuxtLink : 'button';
});

const handleClick = (event: MouseEvent) => {
  if (props.disabled || props.loading) {
    event.preventDefault();
    return;
  }
  emit('click', event);
};
</script>
