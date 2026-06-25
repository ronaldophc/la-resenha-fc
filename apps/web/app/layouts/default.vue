<template>
  <div class="app-layout">
    <AppHeader />
    
    <main class="app-content container">
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
  padding: 40px var(--space-margin-mobile);
}

@media (min-width: 1024px) {
  .app-content {
    padding: 40px var(--space-margin-desktop);
  }
}
</style>
