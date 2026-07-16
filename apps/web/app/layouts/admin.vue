<template>
  <div class="admin-layout">
    <!-- Top Admin Bar -->
    <header class="admin-topbar">
      <div class="admin-topbar-container">
        <NuxtLink to="/" class="brand-link">
          <img v-if="settings.logoUrl" :src="settings.logoUrl" :alt="settings.clubName" class="brand-logo" />
          <span class="title">{{ settings.clubName }}</span>
        </NuxtLink>

        <div class="user-info" v-if="user">
          <VButton size="sm" variant="danger" @click="handleLogout">Sair</VButton>
        </div>
      </div>
    </header>
    
    <div class="admin-body container">
      <!-- Admin Navigation Sidebar -->
      <aside class="admin-sidebar">
        <nav class="sidebar-nav">
          <NuxtLink to="/admin" class="sidebar-item" exact-active-class="sidebar-active">
            🏠 Visão Geral
          </NuxtLink>
          <NuxtLink to="/admin/jogadores" class="sidebar-item" active-class="sidebar-active">
            🏃 Gerenciar Elenco
          </NuxtLink>
          <NuxtLink to="/admin/partidas" class="sidebar-item" active-class="sidebar-active">
            ⚽ Gerenciar Partidas
          </NuxtLink>
          <NuxtLink to="/admin/noticias" class="sidebar-item" active-class="sidebar-active">
            📰 Gerenciar Notícias
          </NuxtLink>
          <NuxtLink to="/admin/campeonatos" class="sidebar-item" active-class="sidebar-active">
            🏆 Campeonatos
          </NuxtLink>
          <NuxtLink to="/admin/times" class="sidebar-item" active-class="sidebar-active">
            🛡️ Gerenciar Times
          </NuxtLink>
          <NuxtLink to="/admin/configuracoes" class="sidebar-item" active-class="sidebar-active">
            ⚙️ Configurações
          </NuxtLink>
          <div class="sidebar-separator"></div>
          <NuxtLink to="/" class="sidebar-item sidebar-back-link">
            ⬅️ Voltar ao Site
          </NuxtLink>
        </nav>
      </aside>
      
      <!-- Admin Content Area -->
      <main class="admin-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuth } from '#imports';
import { useSiteSettings } from '~/composables/useSiteSettings';
import VButton from '~/components/ui/VButton.vue';

const { user, logout } = useAuth();
const { settings, load: loadSettings } = useSiteSettings();

const handleLogout = async () => {
  await logout();
};

onMounted(() => {
  loadSettings();
});
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background-color: var(--color-background);
  display: flex;
  flex-direction: column;
}

.admin-topbar {
  background-color: var(--color-asphalt);
  border-bottom: var(--border-width-thick) solid var(--color-asphalt);
  padding: 14px 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.admin-topbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 var(--space-margin-mobile);
}

@media (min-width: 1024px) {
  .admin-topbar-container {
    padding: 0 var(--space-margin-desktop);
  }
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.brand-logo {
  width: 34px;
  height: 34px;
  object-fit: contain;
  border-radius: 50%;
  border: 2px solid var(--color-outline-variant);
  background-color: var(--color-surface-container-low);
}

.title {
  font-family: 'Oswald', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-goal-white);
  letter-spacing: 0.03em;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.admin-body {
  flex-grow: 1;
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  padding: 32px var(--space-margin-mobile);
}

@media (min-width: 1024px) {
  .admin-body {
    grid-template-columns: 240px 1fr;
    padding: 32px var(--space-margin-desktop);
  }
}

.admin-sidebar {
  background-color: var(--color-surface-container);
  border: var(--border-width-regular) solid var(--color-asphalt);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-hard-md);
  padding: 20px;
  height: fit-content;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidebar-item {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.15rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: var(--color-goal-white);
  padding: 10px 14px;
  border-radius: var(--radius-default);
  text-decoration: none;
  border: var(--border-width-regular) solid transparent;
  transition: all 0.15s ease;
}

.sidebar-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
  border-color: var(--color-asphalt);
}

.sidebar-active {
  background-color: var(--color-primary-container) !important;
  color: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
  box-shadow: 2px 2px 0px var(--color-asphalt);
}

.sidebar-separator {
  height: 2px;
  background-color: var(--color-asphalt);
  margin: 12px 0;
}

.sidebar-back-link {
  color: #a3a3a3;
}

.admin-content {
  min-width: 0; /* Prevents flex items from overflowing */
}
</style>
