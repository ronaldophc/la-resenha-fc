<template>
  <header class="app-header">
    <div class="container header-container">
      <NuxtLink to="/" class="logo-link">
        <span class="logo-badge">LR</span>
        <span class="logo-text">La Resenha FC</span>
      </NuxtLink>
      
      <!-- Desktop and Mobile Nav -->
      <nav class="nav-links" :class="{ 'nav-open': isMobileMenuOpen }">
        <NuxtLink to="/" class="nav-item" active-class="nav-active" @click="closeMobileMenu">
          Home
        </NuxtLink>
        <NuxtLink to="/elenco" class="nav-item" active-class="nav-active" @click="closeMobileMenu">
          Elenco
        </NuxtLink>
        <NuxtLink to="/resultados" class="nav-item" active-class="nav-active" @click="closeMobileMenu">
          Resultados
        </NuxtLink>
        <NuxtLink to="/noticias" class="nav-item" active-class="nav-active" @click="closeMobileMenu">
          Notícias
        </NuxtLink>
        <NuxtLink to="/tabela" class="nav-item" active-class="nav-active" @click="closeMobileMenu">
          Classificação
        </NuxtLink>
        
        <!-- Auth Button -->
        <template v-if="isAuthenticated">
          <NuxtLink to="/admin" class="nav-item nav-admin-link" active-class="nav-active" @click="closeMobileMenu">
            Painel
          </NuxtLink>
          <VButton size="sm" variant="danger" class="admin-btn" @click="handleLogout">
            Sair
          </VButton>
        </template>
        <template v-else>
          <VButton to="/admin/login" size="sm" variant="primary" class="admin-btn" @click="closeMobileMenu">
            Acesso Admin
          </VButton>
        </template>
      </nav>

      <!-- Mobile Menu Toggle -->
      <button class="mobile-menu-toggle" aria-label="Toggle Menu" @click="toggleMobileMenu">
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '#imports';
import VButton from '~/components/ui/VButton.vue';

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
  background-color: var(--color-asphalt);
  border-bottom: var(--border-width-thick) solid var(--color-asphalt);
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 16px 0;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.logo-badge {
  background-color: var(--color-tertiary);
  color: var(--color-on-tertiary);
  font-family: 'Oswald', sans-serif;
  font-weight: 700;
  font-size: 1.25rem;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--color-goal-white);
  border-radius: var(--radius-md);
  box-shadow: 2px 2px 0px var(--color-goal-white);
}

.logo-text {
  font-family: 'Oswald', sans-serif;
  font-size: 1.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-goal-white);
  letter-spacing: 0.05em;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-item {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--color-goal-white);
  padding: 4px 8px;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
  text-decoration: none;
}

.nav-item:hover, .nav-active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.nav-admin-link {
  color: var(--color-tertiary);
}

.nav-admin-link:hover, .nav-admin-link.nav-active {
  color: var(--color-tertiary);
  border-bottom-color: var(--color-tertiary);
}

.admin-btn {
  margin-left: 8px;
}

.mobile-menu-toggle {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 30px;
  height: 21px;
  background: transparent;
  border: none;
  cursor: pointer;
}

.mobile-menu-toggle .bar {
  width: 100%;
  height: 3px;
  background-color: var(--color-goal-white);
  border-radius: 2px;
  transition: all 0.2s ease;
}

/* Responsive styles */
@media (max-width: 900px) {
  .mobile-menu-toggle {
    display: flex;
  }

  .nav-links {
    position: absolute;
    top: 73px;
    left: 0;
    right: 0;
    background-color: var(--color-asphalt);
    flex-direction: column;
    padding: 24px;
    gap: 16px;
    border-bottom: var(--border-width-thick) solid var(--color-asphalt);
    display: none;
  }

  .nav-links.nav-open {
    display: flex;
  }

  .nav-item {
    width: 100%;
    text-align: center;
    padding: 12px 0;
  }

  .admin-btn {
    width: 100%;
    margin-left: 0;
    margin-top: 8px;
  }
}
</style>
