<template>
  <div class="admin-dashboard">
    <div class="dashboard-header">
      <h1>Painel Administrativo</h1>
      <p class="welcome-message">
        Olá, <strong>{{ user?.name || user?.email || 'Administrador' }}</strong>! Bem-vindo de volta.
      </p>
    </div>

    <!-- Quick statistics / dashboard status cards -->
    <div class="dashboard-grid">
      <VCard class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <span class="stat-label">Jogadores Cadastrados</span>
          <span class="stat-value">--</span>
        </div>
      </VCard>

      <VCard class="stat-card">
        <div class="stat-icon">⚽</div>
        <div class="stat-content">
          <span class="stat-label">Partidas Registradas</span>
          <span class="stat-value">--</span>
        </div>
      </VCard>

      <VCard class="stat-card">
        <div class="stat-icon">🏆</div>
        <div class="stat-content">
          <span class="stat-label">Campeonatos Ativos</span>
          <span class="stat-value">--</span>
        </div>
      </VCard>
    </div>

    <VCard variant="featured" class="info-card">
      <h2>Pronto para Desenvolvimento</h2>
      <p>
        Esta área administrativa está totalmente protegida por rotas do lado do servidor (SSR-safe middleware) e do lado do cliente. Os dados do usuário logado foram carregados com sucesso a partir da API NestJS.
      </p>
      <p class="architecture-note">
        Configure novas rotas dentro do diretório <code>app/pages/admin/</code> para expandir o gerenciamento do elenco, resultados, tabela e notícias.
      </p>
    </VCard>
  </div>
</template>

<script setup lang="ts">
import { useHead, definePageMeta } from '#imports';
import { useAuth } from '~/composables/useAuth';
import VCard from '~/components/ui/VCard.vue';

// Define o layout administrativo e o middleware de autenticação obrigatória
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
});

useHead({
  title: 'Painel Admin - La Resenha FC',
});

const { user } = useAuth();
</script>

<style scoped>
.admin-dashboard {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.dashboard-header h1 {
  font-size: 2.5rem;
  margin-bottom: 8px;
}

.welcome-message {
  font-size: 1.1rem;
  color: var(--color-goal-white);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
}

.stat-icon {
  font-size: 2.5rem;
  background-color: var(--color-asphalt);
  padding: 12px;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.9rem;
  text-transform: uppercase;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  color: var(--color-goal-white);
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  color: var(--color-primary);
}

.info-card h2 {
  font-size: 1.75rem;
  margin-bottom: 12px;
  color: var(--color-primary);
}

.info-card p {
  font-size: 1.05rem;
  line-height: 1.6;
  margin-bottom: 16px;
  color: var(--color-goal-white);
}

.architecture-note {
  font-style: italic;
  font-size: 0.95rem;
  border-left: 3px solid var(--color-primary);
  padding-left: 12px;
}
</style>
