<template>
  <Teleport to="body">
    <div class="toast-stack" aria-live="polite" aria-atomic="false">
      <TransitionGroup name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          :class="['toast', `toast--${t.type}`]"
          role="status"
          @click="remove(t.id)"
        >
          <span class="toast__icon">{{ icon(t.type) }}</span>
          <span class="toast__msg">{{ t.message }}</span>
          <button class="toast__close" aria-label="Fechar" @click.stop="remove(t.id)">×</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast, type ToastType } from '~/composables/useToast';

const { toasts, remove } = useToast();

const icon = (type: ToastType) => {
  if (type === 'success') return '✅';
  if (type === 'error') return '⚠️';
  return 'ℹ️';
};
</script>

<style scoped>
.toast-stack {
  position: fixed;
  top: 96px; /* abaixo do header fixo (80px) */
  right: 16px;
  z-index: 9999; /* acima do overlay de loading (9998) */
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: min(380px, calc(100vw - 32px));
  pointer-events: none; /* só os toasts capturam clique */
}

.toast {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 3px solid var(--color-asphalt);
  border-radius: var(--radius-sm);
  box-shadow: 4px 4px 0px var(--color-asphalt);
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
}

.toast--success {
  background-color: var(--color-primary-container);
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.toast--error {
  background-color: #fdd8d8;
  color: var(--color-error-red);
  border-color: var(--color-error-red);
}

.toast--info {
  background-color: var(--color-surface-container-low);
  color: var(--color-goal-white);
  border-color: var(--color-outline-variant);
}

.toast__icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.toast__msg {
  flex-grow: 1;
  line-height: 1.35;
}

.toast__close {
  background: none;
  border: none;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  color: inherit;
  flex-shrink: 0;
}

/* Animação de entrada/saída deslizando pela direita */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(110%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(110%);
}

.toast-leave-active {
  position: absolute;
  right: 0;
  width: 100%;
}
</style>
