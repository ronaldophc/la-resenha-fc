<template>
  <div class="app-layout">
    <!-- Header / Navigation Bar -->
    <header class="app-header">
      <div class="container header-container">
        <NuxtLink to="/" class="logo-link">
          <span class="logo-badge">LR</span>
          <span class="logo-text">{{ t.logoText }}</span>
        </NuxtLink>
        
        <nav class="nav-links" :class="{ 'nav-open': isMobileMenuOpen }">
          <NuxtLink to="/" class="nav-item" active-class="nav-active" @click="closeMobileMenu">
            {{ t.menuHome }}
          </NuxtLink>
          <NuxtLink to="/elenco" class="nav-item" active-class="nav-active" @click="closeMobileMenu">
            {{ t.menuSquad }}
          </NuxtLink>
          <NuxtLink to="/resultados" class="nav-item" active-class="nav-active" @click="closeMobileMenu">
            {{ t.menuResults }}
          </NuxtLink>
          <NuxtLink to="/noticias" class="nav-item" active-class="nav-active" @click="closeMobileMenu">
            {{ t.menuNews }}
          </NuxtLink>
          <NuxtLink to="/tabela" class="nav-item" active-class="nav-active" @click="closeMobileMenu">
            {{ t.menuStandings }}
          </NuxtLink>
          
          <NuxtLink to="/admin/login" class="btn btn-sm btn-primary admin-btn" @click="closeMobileMenu">
            {{ t.menuAdmin }}
          </NuxtLink>
        </nav>

        <button class="mobile-menu-toggle" @click="toggleMobileMenu">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="app-content">
      <NuxtPage />
    </main>

    <!-- Footer -->
    <footer class="app-footer">
      <div class="container footer-grid">
        <div class="footer-brand">
          <h4>{{ t.logoText }}</h4>
          <p>{{ t.footerDescription }}</p>
        </div>
        <div class="footer-links">
          <h5>{{ t.footerNavTitle }}</h5>
          <ul>
            <li><NuxtLink to="/">{{ t.menuHome }}</NuxtLink></li>
            <li><NuxtLink to="/elenco">{{ t.menuSquad }}</NuxtLink></li>
            <li><NuxtLink to="/resultados">{{ t.menuResults }}</NuxtLink></li>
            <li><NuxtLink to="/noticias">{{ t.menuNews }}</NuxtLink></li>
            <li><NuxtLink to="/tabela">{{ t.menuStandings }}</NuxtLink></li>
          </ul>
        </div>
        <div class="footer-admin">
          <h5>{{ t.footerAdminTitle }}</h5>
          <p>{{ t.footerAdminDesc }}</p>
          <NuxtLink to="/admin/login" class="btn btn-sm btn-outline">{{ t.footerAdminBtn }}</NuxtLink>
        </div>
      </div>
      <div class="footer-bottom">
        <div class="container">
          <p>{{ t.footerCopyright }}</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Mobile menu visibility state
const isMobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

// Translation dictionary to separate logic and localization
const translations = {
  pt: {
    logoText: 'La Resenha FC',
    menuHome: 'Início',
    menuSquad: 'Elenco',
    menuResults: 'Resultados',
    menuNews: 'Notícias',
    menuStandings: 'Tabela',
    menuAdmin: 'Área do Gestor',
    footerDescription: 'O maior e mais temido time do terrão de Curitiba. Suor, raça e resenha pós-jogo.',
    footerNavTitle: 'Navegação',
    footerAdminTitle: 'Administração',
    footerAdminDesc: 'Exclusivo para a diretoria do La Resenha FC cadastrar elencos, súmulas de partidas e notícias.',
    footerAdminBtn: 'Acessar Painel',
    footerCopyright: '© 2026 La Resenha FC. Todos os direitos reservados do terrão. UTFPR - Tópicos Especiais em Programação.'
  }
};

// Use Portuguese translation dictionary as baseline
const t = translations.pt;
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

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
}

.nav-item:hover, .nav-active {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
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

.app-content {
  flex-grow: 1;
  padding: 40px 0;
}

.app-footer {
  background-color: #0e0e0e;
  border-top: var(--border-width-thick) solid var(--color-asphalt);
  padding: 48px 0 0 0;
  margin-top: auto;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  padding-bottom: 40px;
}

@media (min-width: 768px) {
  .footer-grid {
    grid-template-columns: 2fr 1fr 2fr;
  }
}

.footer-brand h4, .footer-links h5, .footer-admin h5 {
  color: var(--color-goal-white);
  margin-bottom: 16px;
  font-size: 1.25rem;
}

.footer-brand p, .footer-admin p {
  font-size: 0.95rem;
  color: #a3a3a3;
  margin-bottom: 16px;
}

.footer-links ul {
  list-style: none;
}

.footer-links li {
  margin-bottom: 8px;
}

.footer-links a {
  color: #a3a3a3;
  font-size: 0.95rem;
}

.footer-links a:hover {
  color: var(--color-primary);
}

.footer-bottom {
  background-color: var(--color-asphalt);
  padding: 20px 0;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.footer-bottom p {
  margin: 0;
  font-size: 0.85rem;
  color: #737373;
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