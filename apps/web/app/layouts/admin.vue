<template>
  <div class="admin-layout">
    <!-- Top Admin Bar -->
    <header class="admin-topbar">
      <div class="admin-topbar-container">
        <NuxtLink to="/" class="brand-link">
          <span class="badge">LR</span>
          <span class="title">La Resenha FC <span class="subtitle">Painel do Diretor</span></span>
        </NuxtLink>
        
        <div class="user-info" v-if="user">
          <span class="user-name">📋 {{ user.name || user.email }}</span>
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
          <NuxtLink to="/admin/classificacao" class="sidebar-item" active-class="sidebar-active">
            🏆 Classificação (Tabela)
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
import { useAuth } from '#imports';
import VButton from '~/components/ui/VButton.vue';

const { user, logout } = useAuth();

const handleLogout = async () => {
  await logout();
};
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

.badge {
  background-color: var(--color-tertiary);
  color: var(--color-on-tertiary);
  font-family: 'Oswald', sans-serif;
  font-weight: 700;
  font-size: 1.1rem;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--color-goal-white);
  border-radius: var(--radius-sm);
  box-shadow: 1.5px 1.5px 0px var(--color-goal-white);
}

.title {
  font-family: 'Oswald', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-goal-white);
  letter-spacing: 0.03em;
}

.subtitle {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.95rem;
  color: var(--color-primary);
  margin-left: 8px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-name {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 600;
  font-size: 1.125rem;
  color: var(--color-goal-white);
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
