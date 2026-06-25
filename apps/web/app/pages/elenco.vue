<template>
  <div class="container players-page">
    <div class="page-header">
      <h1 class="page-title">{{ t.pageTitle }}</h1>
      <p class="page-subtitle">{{ t.pageSubtitle }}</p>
    </div>

    <!-- Alert in case of error -->
    <div v-if="apiError" class="alert alert-success">
      <span>{{ t.offlineModeAlert }}</span>
    </div>

    <!-- Players Grid -->
    <div class="players-sections">
      <div v-for="positionGroup in groupedPlayers" :key="positionGroup.name" class="position-group">
        <h2 class="position-title">{{ positionGroup.emoji }} {{ positionGroup.name }}</h2>
        <div class="grid grid-cols-4">
          <div v-for="player in positionGroup.players" :key="player.id" class="card card-mud player-card">
            <div class="player-photo-container">
              <img v-if="player.photoUrl" :src="player.photoUrl" :alt="player.name" class="player-photo" />
              <div v-else class="player-photo-placeholder">
                <span class="placeholder-icon">⚽</span>
              </div>
              <span class="player-number">#{{ player.number }}</span>
            </div>
            <div class="player-info">
              <h3 class="player-name">{{ player.name }}</h3>
              <span class="tag-badge tag-badge-yellow">{{ translatePosition(player.position) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useHead, useRuntimeConfig, useFetch } from '#imports';

// Translation dictionary
const translations = {
  pt: {
    pageTitle: 'Nosso Elenco',
    pageSubtitle: 'Os guerreiros que defendem o manto do La Resenha FC em cada palmo de poeira e lama do terrão.',
    offlineModeAlert: '⚠️ Modo offline: Exibindo elenco oficial histórico do clube.',
    goalkeepers: 'Goleiros',
    defenders: 'Defensores',
    midfielders: 'Meio-Campistas',
    attackers: 'Atacantes',
    positions: {
      'GOLEIRO': 'Goleiro',
      'ZAGUEIRO': 'Zagueiro',
      'LATERAL': 'Lateral',
      'VOLANTE': 'Volante',
      'MEIO-CAMPO': 'Meio-Campo',
      'ATACANTE': 'Atacante'
    }
  }
};

const t = translations.pt;

useHead({
  title: 'Elenco - La Resenha FC',
  meta: [
    { name: 'description', content: 'Conheça os jogadores do La Resenha FC, divididos por posições com seus respectivos números de camisa.' }
  ]
});

// Player interface definition
interface Player {
  id: string;
  name: string;
  number: number;
  position: string;
  photoUrl?: string | null;
}

// Fallback historical mock players
const mockPlayers: Player[] = [
  { id: '1', name: 'Zé do Paredão', number: 1, position: 'GOLEIRO', photoUrl: null },
  { id: '2', name: 'Chicão Bicuda', number: 3, position: 'ZAGUEIRO', photoUrl: null },
  { id: '3', name: 'Valdir Canteiro', number: 4, position: 'ZAGUEIRO', photoUrl: null },
  { id: '4', name: 'Ronaldo Avenida', number: 2, position: 'LATERAL', photoUrl: null },
  { id: '5', name: 'Betinho Avenida', number: 6, position: 'LATERAL', photoUrl: null },
  { id: '6', name: 'Marcos Pitbull', number: 5, position: 'VOLANTE', photoUrl: null },
  { id: '7', name: 'Feijão Maestro', number: 10, position: 'MEIO-CAMPO', photoUrl: null },
  { id: '8', name: 'Cleiton Tanque', number: 9, position: 'ATACANTE', photoUrl: null },
  { id: '9', name: 'Dudu Rabiscador', number: 7, position: 'ATACANTE', photoUrl: null },
  { id: '10', name: 'Nelsinho Ligeiro', number: 11, position: 'ATACANTE', photoUrl: null }
];

const config = useRuntimeConfig();
const apiBase = config.public.apiBase;

// Fetch real players from the backend API
const { data: apiResponse, error } = await useFetch<{ data: Player[] }>(`${apiBase}/players`).catch(() => ({ data: null }));

const apiError = computed(() => {
  return error.value || !apiResponse.value || !apiResponse.value.data || apiResponse.value.data.length === 0;
});

// Final array of players
const players = computed<Player[]>(() => {
  if (apiError.value) {
    return mockPlayers;
  }
  return apiResponse.value?.data || mockPlayers;
});

// Group players by positional category
const groupedPlayers = computed(() => {
  const categories = [
    { name: t.goalkeepers, emoji: '🧤', key: 'GOLEIRO' },
    { name: t.defenders, emoji: '🛡️', keys: ['ZAGUEIRO', 'LATERAL'] },
    { name: t.midfielders, emoji: '🧠', keys: ['VOLANTE', 'MEIO-CAMPO'] },
    { name: t.attackers, emoji: '⚡', key: 'ATACANTE' }
  ];

  return categories.map(cat => {
    let filtered: Player[] = [];
    if (Array.isArray(cat.keys)) {
      filtered = players.value.filter(p => cat.keys.includes(p.position));
    } else if (cat.key) {
      filtered = players.value.filter(p => p.position === cat.key);
    }
    
    // Sort by jersey number
    filtered.sort((a, b) => a.number - b.number);

    return {
      name: cat.name,
      emoji: cat.emoji,
      players: filtered
    };
  }).filter(group => group.players.length > 0);
});

// Translate position key into readable UI label
const translatePosition = (pos: string) => {
  return t.positions[pos as keyof typeof t.positions] || pos;
};
</script>

<style scoped>
.players-page {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.page-header {
  border-bottom: var(--border-width-thick) solid var(--color-asphalt);
  padding-bottom: 16px;
  margin-bottom: 16px;
}

.page-title {
  font-size: 3rem;
  color: var(--color-goal-white);
  margin: 0;
}

.page-subtitle {
  font-size: 1.125rem;
  color: #a3a3a3;
  margin-top: 8px;
}

.position-group {
  margin-bottom: 40px;
}

.position-title {
  font-size: 1.75rem;
  border-bottom: 2px solid var(--color-surface-bright);
  padding-bottom: 8px;
  margin-bottom: 24px;
  color: var(--color-primary);
}

.player-card {
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 16px;
}

.player-photo-container {
  width: 100%;
  aspect-ratio: 1;
  background-color: var(--color-asphalt);
  border: var(--border-width-regular) solid var(--color-asphalt);
  border-radius: var(--radius-md);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.player-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.player-photo-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-icon {
  font-size: 3rem;
  opacity: 0.3;
}

.player-number {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background-color: var(--color-tertiary);
  color: var(--color-on-tertiary);
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 1.25rem;
  padding: 2px 8px;
  border: var(--border-width-regular) solid var(--color-asphalt);
  border-radius: var(--radius-sm);
  box-shadow: 2px 2px 0px var(--color-asphalt);
}

.player-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.player-name {
  font-size: 1.35rem;
  margin: 0;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
</style>
