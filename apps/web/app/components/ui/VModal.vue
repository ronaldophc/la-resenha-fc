<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click.self="close">
        <div class="modal-box" role="dialog" aria-modal="true">
          <div class="modal-header">
            <h2 class="modal-title">{{ title }}</h2>
            <button type="button" class="modal-close" aria-label="Fechar" @click="close">×</button>
          </div>
          <div class="modal-body">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { watch, onBeforeUnmount } from 'vue';

const props = defineProps<{
  modelValue: boolean;
  title?: string;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>();

const close = () => emit('update:modelValue', false);

// Fecha com ESC e trava a rolagem do fundo enquanto o modal está aberto
const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') close();
};

watch(
  () => props.modelValue,
  (open) => {
    if (typeof document === 'undefined') return;
    if (open) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', onKeydown);
    } else {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeydown);
    }
  },
);

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = '';
    window.removeEventListener('keydown', onKeydown);
  }
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9990;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 24px 16px;
  overflow-y: auto;
  background-color: rgba(0, 0, 0, 0.7);
}

.modal-box {
  width: 100%;
  max-width: 720px;
  margin: auto;
  background-color: var(--color-surface-container);
  border: 4px solid var(--color-primary);
  border-radius: var(--radius-lg);
  box-shadow: 8px 8px 0px var(--color-asphalt);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 24px;
  border-bottom: 3px solid var(--color-outline-variant);
}

.modal-title {
  font-family: 'Oswald', sans-serif;
  text-transform: uppercase;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 2rem;
  line-height: 1;
  font-weight: 700;
  color: var(--color-goal-white);
  cursor: pointer;
  /* Alvo de toque confortável no mobile (>= 44px) */
  min-width: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal-close:hover {
  color: var(--color-primary);
}

.modal-body {
  padding: 24px;
}

/* Transição de entrada/saída */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .modal-box,
.modal-leave-active .modal-box {
  transition: transform 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-box,
.modal-leave-to .modal-box {
  transform: translateY(-24px);
}
</style>
