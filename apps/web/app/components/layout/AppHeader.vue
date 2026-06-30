<template>
  <header class="app-header">
    <NuxtLink to="/" class="logo-link">
      La Resenha FC
    </NuxtLink>
    
    <!-- Desktop Nav -->
    <nav class="nav-links">
      <NuxtLink to="/" class="nav-item" active-class="nav-active">Home</NuxtLink>
      <NuxtLink to="/elenco" class="nav-item" active-class="nav-active">Elenco</NuxtLink>
      <NuxtLink to="/resultados" class="nav-item" active-class="nav-active">Resultados</NuxtLink>
      <NuxtLink :to="isAuthenticated ? '/admin' : '/admin/login'" class="nav-item" active-class="nav-active">Admin</NuxtLink>
    </nav>
    
    <!-- Action Icons -->
    <div class="action-icons">
      <button class="icon-btn material-symbols-outlined" title="Notificações">notifications</button>
      <NuxtLink :to="isAuthenticated ? '/admin' : '/admin/login'" class="icon-btn material-symbols-outlined" title="Minha Conta">
        account_circle
      </NuxtLink>
      
      <!-- Mobile Menu Toggle -->
      <button class="mobile-menu-toggle material-symbols-outlined" aria-label="Toggle Menu" @click="toggleMobileMenu">
        {{ isMobileMenuOpen ? 'close' : 'menu' }}
      </button>
    </div>

    <!-- Mobile Dropdown Nav -->
    <div v-show="isMobileMenuOpen" class="mobile-nav">
      <NuxtLink to="/" class="mobile-nav-item" active-class="mobile-nav-active" @click="closeMobileMenu">Home</NuxtLink>
      <NuxtLink to="/elenco" class="mobile-nav-item" active-class="mobile-nav-active" @click="closeMobileMenu">Elenco</NuxtLink>
      <NuxtLink to="/resultados" class="mobile-nav-item" active-class="mobile-nav-active" @click="closeMobileMenu">Resultados</NuxtLink>
      <NuxtLink :to="isAuthenticated ? '/admin' : '/admin/login'" class="mobile-nav-item" active-class="mobile-nav-active" @click="closeMobileMenu">Admin</NuxtLink>
      <template v-if="isAuthenticated">
        <button class="mobile-nav-item logout-btn" @click="handleLogout">Sair da Conta</button>
      </template>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '#imports';

const { isAuthenticated, logout } = useAuth();
const isMobileMenuOpen = ref(false);

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

.logo-link {
  font-family: 'Oswald', sans-serif;
  font-size: 2.25rem; /* 36px on mobile */
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-tertiary);
  text-decoration: none;
  letter-spacing: -0.05em; /* tracking-tighter */
  line-height: 1.1;
  transition: transform 0.1s ease;
}

@media (min-width: 768px) {
  .logo-link {
    font-size: 3rem; /* 48px on desktop (headline-xl) */
  }
}

.logo-link:active {
  transform: translate(2px, 2px);
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
  font-size: 1.5rem; /* headline-lg is 32px, but 24px/1.5rem fits better in header height */
  font-weight: 700;
}

.action-icons {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-btn {
  background: transparent;
  border: none;
  color: var(--color-primary); /* text-primary */
  font-size: 24px;
  padding: 8px;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover {
  background-color: var(--color-surface-container-high);
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
