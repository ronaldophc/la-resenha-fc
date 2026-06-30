<template>
  <footer class="app-footer">
    <div class="footer-brand">La Resenha FC</div>
    <div class="footer-links">
      <NuxtLink :to="isAuthenticated ? '/admin' : '/admin/login'" class="footer-link">
        {{ isAuthenticated ? 'Painel' : 'Admin' }}
      </NuxtLink>
    </div>
    <div class="footer-copyright">
      © {{ currentYear }} La Resenha FC
    </div>
    <div class="footer-icons">
      <span class="material-symbols-outlined text-tertiary" title="Futebol de Salão">sports_soccer</span>
      <span class="material-symbols-outlined text-tertiary" title="Quadra">door_front</span>
      <span class="material-symbols-outlined text-tertiary" title="Comunidade">groups</span>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuth } from '#imports';

const { isAuthenticated } = useAuth();
const currentYear = computed(() => new Date().getFullYear());
</script>

<style scoped>
.app-footer {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px; /* gap-4 = 16px */
  padding: 48px var(--space-margin-mobile); /* py-12 = 48px */
  background-color: var(--color-surface-container-lowest);
  border-top: 4px solid var(--color-outline-variant);
  margin-top: auto;
}

@media (min-width: 768px) {
  .app-footer {
    padding: 48px var(--space-margin-desktop);
  }
}

.footer-brand {
  font-family: 'Oswald', sans-serif;
  font-size: 1.5rem; /* text-headline-md = 24px */
  font-weight: 800;
  font-style: italic;
  text-transform: uppercase;
  color: var(--color-goal-white);
  letter-spacing: -0.05em; /* tracking-tighter */
  margin-bottom: 16px; /* mb-4 = 16px */
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 32px; /* gap-8 = 32px */
  margin-bottom: 32px; /* mb-8 = 32px */
}

.footer-link {
  color: var(--color-on-surface-variant);
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1rem; /* font-label-lg = 16px */
  font-weight: 600;
  text-transform: uppercase;
  text-decoration: none;
  opacity: 0.8;
  transition: all 0.15s ease;
}

.footer-link:hover {
  opacity: 1;
  color: var(--color-goal-white);
  text-decoration: underline;
}

.footer-copyright {
  font-family: 'Public Sans', sans-serif;
  font-size: 1rem; /* font-body-md = 16px */
  color: var(--color-goal-white);
  opacity: 0.6;
  text-align: center;
}

.footer-icons {
  margin-top: 16px; /* mt-4 = 16px */
  display: flex;
  gap: 16px; /* gap-4 = 16px */
}

.footer-icons .material-symbols-outlined {
  color: var(--color-tertiary);
  font-size: 24px;
}
</style>
