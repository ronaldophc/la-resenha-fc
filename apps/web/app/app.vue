<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <LoadingOverlay />
  <ToastContainer />
</template>

<script setup lang="ts">
import LoadingOverlay from '~/components/ui/LoadingOverlay.vue';
import ToastContainer from '~/components/ui/ToastContainer.vue';

// Favicon é estático (definido em nuxt.config.ts -> app.head), não vem mais das configurações.
</script>
