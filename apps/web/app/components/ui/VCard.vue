<template>
  <div
    :class="[
      'card',
      {
        'card-featured': variant === 'featured',
        'card-warning': variant === 'warning',
        'card-mud': variant === 'mud',
        'no-hover': !hoverable
      }
    ]"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'default' | 'featured' | 'warning' | 'mud';
  hoverable?: boolean;
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  hoverable: true
});
</script>

<style scoped>
.no-hover:hover {
  transform: none !important;
  box-shadow: var(--shadow-hard-md) !important;
}

.card-featured.no-hover:hover {
  box-shadow: var(--shadow-hard-primary) !important;
}

.card-warning.no-hover:hover {
  box-shadow: var(--shadow-hard-tertiary) !important;
}
</style>
