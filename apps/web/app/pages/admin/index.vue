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
          <span class="stat-value">{{ playersCount }}</span>
        </div>
      </VCard>

      <VCard class="stat-card">
        <div class="stat-icon">⚽</div>
        <div class="stat-content">
          <span class="stat-label">Partidas Registradas</span>
          <span class="stat-value">{{ matchesCount }}</span>
        </div>
      </VCard>

      <VCard class="stat-card">
        <div class="stat-icon">🏆</div>
        <div class="stat-content">
          <span class="stat-label">Campeonatos Ativos</span>
          <span class="stat-value">{{ championshipsCount }}</span>
        </div>
      </VCard>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useHead, definePageMeta } from '#imports';
import { useAuth } from '~/composables/useAuth';
import { useApi } from '~/composables/useApi';
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
const { request } = useApi();

const playersCount = ref<number | string>('--');
const matchesCount = ref<number | string>('--');
const championshipsCount = ref<number | string>('--');

const loadStats = async () => {
  try {
    const playersRes = await request<any>('/players');
    const playersList = Array.isArray(playersRes) ? playersRes : (playersRes?.data || []);
    playersCount.value = playersList.length;
  } catch (error) {
    console.error('Erro ao carregar jogadores:', error);
    playersCount.value = 0;
  }

  try {
    const matchesRes = await request<any>('/matches');
    const matchesList = Array.isArray(matchesRes) ? matchesRes : (matchesRes?.data || []);
    matchesCount.value = matchesList.length;
  } catch (error) {
    console.error('Erro ao carregar partidas:', error);
    matchesCount.value = 0;
  }

  try {
    const standingsRes = await request<any>('/standings');
    const standingsList = Array.isArray(standingsRes) ? standingsRes : (standingsRes?.data || []);
    
    // Contar campeonatos únicos
    const uniqueChamps = new Set(standingsList.map((s: any) => s.championship).filter(Boolean));
    championshipsCount.value = uniqueChamps.size || 1;
  } catch (error) {
    console.error('Erro ao carregar classificações:', error);
    championshipsCount.value = 1;
  }
};

onMounted(() => {
  loadStats();
});
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

</style>
