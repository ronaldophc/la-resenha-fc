<template>
  <Transition name="loading-fade">
    <div v-if="visible" class="loading-overlay" role="status" aria-label="Carregando">
      <div class="loading-box">
        <img v-if="settings.logoUrl" :src="settings.logoUrl" :alt="settings.clubName" class="loading-logo" />
        <span v-else class="loading-ball">⚽</span>
        <span class="loading-text">Carregando...</span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue';
import { useApiPending } from '~/composables/useApi';
import { useSiteSettings } from '~/composables/useSiteSettings';

const pending = useApiPending();
const { settings } = useSiteSettings();

// Pequeno atraso para esconder evita "piscadas" entre requisições encadeadas
const visible = ref(false);
let hideTimer: ReturnType<typeof setTimeout> | null = null;

watch(pending, (count) => {
  if (count > 0) {
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
    visible.value = true;
  } else {
    hideTimer = setTimeout(() => { visible.value = false; }, 200);
  }
}, { immediate: true });

onBeforeUnmount(() => {
  if (hideTimer) clearTimeout(hideTimer);
});
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  inset: 0;
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-background);
}

.loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-logo {
  width: 84px;
  height: 84px;
  object-fit: contain;
  border-radius: 50%;
  border: 3px solid var(--color-outline-variant);
  background-color: var(--color-surface-container-low);
  animation: loading-pulse 1.2s ease-in-out infinite;
}

.loading-ball {
  font-size: 3.5rem;
  animation: loading-spin 1.5s linear infinite;
  display: inline-block;
}

.loading-text {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-on-surface-variant);
}

@keyframes loading-pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(0.92); opacity: 0.75; }
}

@keyframes loading-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-fade-leave-active {
  transition: opacity 0.25s ease;
}

.loading-fade-leave-to {
  opacity: 0;
}
</style>
