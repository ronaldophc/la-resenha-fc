<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <LoadingOverlay />
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useHead } from '#imports';
import LoadingOverlay from '~/components/ui/LoadingOverlay.vue';
import { useSiteSettings } from '~/composables/useSiteSettings';

const { settings, load: loadSettings } = useSiteSettings();

// Favicon dinâmico: usa a logo do time configurada no admin
useHead({
  link: computed(() => [
    { rel: 'icon', href: settings.value.logoUrl || '/favicon.ico' },
  ]),
});

onMounted(() => {
  loadSettings();
});
</script>
