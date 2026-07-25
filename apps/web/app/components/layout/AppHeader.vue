<template>
  <header class="app-header">
    <div class="header-left">
      <NuxtLink to="/" class="logo-link">
        <img v-if="settings.logoUrl" :src="settings.logoUrl" :alt="settings.clubName" class="logo-img" />
        {{ settings.clubName }}
      </NuxtLink>

      <!-- Desktop Nav -->
      <nav class="nav-links">
        <NuxtLink to="/" class="nav-item" active-class="nav-active">Home</NuxtLink>
        <NuxtLink to="/elenco" class="nav-item" active-class="nav-active">Elenco</NuxtLink>
        <NuxtLink to="/resultados" class="nav-item" active-class="nav-active">Campeonatos</NuxtLink>
        <NuxtLink to="/patrocinadores" class="nav-item" active-class="nav-active">Patrocinadores</NuxtLink>
      </nav>
    </div>

    <!-- Mobile Menu Toggle -->
    <div class="action-icons">
      <button class="mobile-menu-toggle material-symbols-outlined" aria-label="Toggle Menu" @click="toggleMobileMenu">
        {{ isMobileMenuOpen ? 'close' : 'menu' }}
      </button>
    </div>

    <!-- Mobile Dropdown Nav -->
    <div v-show="isMobileMenuOpen" class="mobile-nav">
      <NuxtLink to="/" class="mobile-nav-item" active-class="mobile-nav-active" @click="closeMobileMenu">Home</NuxtLink>
      <NuxtLink to="/elenco" class="mobile-nav-item" active-class="mobile-nav-active" @click="closeMobileMenu">Elenco</NuxtLink>
      <NuxtLink to="/resultados" class="mobile-nav-item" active-class="mobile-nav-active" @click="closeMobileMenu">Campeonatos</NuxtLink>
      <NuxtLink to="/patrocinadores" class="mobile-nav-item" active-class="mobile-nav-active" @click="closeMobileMenu">Patrocinadores</NuxtLink>
      <template v-if="isAuthenticated">
        <button class="mobile-nav-item logout-btn" @click="handleLogout">Sair da Conta</button>
      </template>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuth } from '#imports';
import { useSiteSettings } from '~/composables/useSiteSettings';

const { isAuthenticated, logout } = useAuth();
const { settings, load: loadSettings } = useSiteSettings();
const isMobileMenuOpen = ref(false);

onMounted(() => {
  loadSettings();
});

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

const handleLogout = async () => {
  closeMobileMenu();
  await logout();
};
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 var(--space-margin-mobile);
  height: 80px; /* h-20 = 80px */
  background-color: var(--color-background);
  border-bottom: 4px solid var(--color-outline-variant);
  box-shadow: 4px 4px 0px 0px rgba(0, 0, 0, 1);
}

@media (min-width: 768px) {
  .app-header {
    padding: 0 var(--space-margin-desktop);
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: 40px;
  min-width: 0;
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'Oswald', sans-serif;
  font-size: 1.35rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-tertiary);
  text-decoration: none;
  letter-spacing: -0.03em;
  line-height: 1.1;
  transition: transform 0.1s ease;
  white-space: nowrap;
}

@media (min-width: 768px) {
  .logo-link {
    font-size: 1.6rem;
  }
}

.logo-link:active {
  transform: translate(2px, 2px);
}

.logo-img {
  height: 40px;
  width: 40px;
  object-fit: contain;
  border-radius: 50%;
  border: 2px solid var(--color-outline-variant);
  background-color: var(--color-surface-container-low);
}

.nav-links {
  display: none;
  gap: 32px; /* gap-8 = 32px */
  align-items: center;
  height: 100%;
}

@media (min-width: 768px) {
  .nav-links {
    display: flex;
  }
}

.nav-item {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1rem; /* font-label-lg = 16px */
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-goal-white);
  text-decoration: none;
  letter-spacing: 0.05em;
  line-height: 1;
  padding-bottom: 4px;
  border-bottom: 4px solid transparent;
  transition: all 0.1s ease;
}

.nav-item:hover {
  color: var(--color-secondary);
}

.nav-item.nav-active {
  color: var(--color-tertiary);
  border-bottom: 4px solid var(--color-tertiary);
  font-family: 'Oswald', sans-serif;
  font-size: 1.15rem;
  font-weight: 700;
}

.action-icons {
  display: flex;
  align-items: center;
  gap: 16px;
}

.mobile-menu-toggle {
  display: flex;
  background: transparent;
  border: none;
  color: var(--color-primary);
  font-size: 28px;
  cursor: pointer;
  padding: 8px;
  align-items: center;
  justify-content: center;
}

@media (min-width: 768px) {
  .mobile-menu-toggle {
    display: none;
  }
}

.mobile-nav {
  position: absolute;
  top: 80px;
  left: 0;
  right: 0;
  background-color: var(--color-background);
  border-bottom: 4px solid var(--color-outline-variant);
  box-shadow: 4px 4px 0px 0px rgba(0, 0, 0, 1);
  display: flex;
  flex-direction: column;
  padding: 16px var(--space-margin-mobile);
  gap: 16px;
  z-index: 99;
}

.mobile-nav-item {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-goal-white);
  text-decoration: none;
  padding: 10px 16px;
  border-left: 4px solid transparent;
  transition: all 0.1s ease;
}

.mobile-nav-item:hover, .mobile-nav-item.mobile-nav-active {
  color: var(--color-tertiary);
  border-left-color: var(--color-tertiary);
  background-color: var(--color-surface-container);
}

.logout-btn {
  background: transparent;
  border: none;
  text-align: left;
  color: var(--color-error);
  cursor: pointer;
}

.logout-btn:hover {
  color: #ffdad6;
}
</style>
