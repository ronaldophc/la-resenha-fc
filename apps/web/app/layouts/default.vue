<template>
  <div class="app-layout">
    <AppHeader />
    
    <main class="app-content">
      <slot />
    </main>
    
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import AppHeader from '~/components/layout/AppHeader.vue';
import AppFooter from '~/components/layout/AppFooter.vue';
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-content {
  flex-grow: 1;
  padding-top: 80px; /* Offset for fixed header (h-20) */
}
</style>

