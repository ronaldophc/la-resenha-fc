<template>
  <div class="container matches-page">
    <div class="page-header">
      <h1 class="page-title">{{ t.pageTitle }}</h1>
      <p class="page-subtitle">{{ t.pageSubtitle }}</p>
    </div>

    <!-- Alert in case of error -->
    <div v-if="apiError" class="alert alert-success">
      <span>{{ t.offlineModeAlert }}</span>
    </div>

    <!-- Quick Filters -->
    <div class="filter-bar card">
      <div class="filter-options">
        <button 
          v-for="filter in filters" 
          :key="filter.value" 
          class="btn btn-sm" 
          :class="currentFilter === filter.value ? 'btn-primary' : 'btn-outline'"
          @click="currentFilter = filter.value"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- Matches Listing -->
    <div class="matches-list">
      <div v-if="filteredMatches.length === 0" class="no-matches card">
        <h3>{{ t.noMatchesTitle }}</h3>
        <p>{{ t.noMatchesDesc }}</p>
      </div>

      <div 
        v-for="match in filteredMatches" 
        :key="match.id" 
        class="card match-result-card"
        :class="getOutcomeClass(match)"
      >
        <!-- Top row: date, location, championship -->
        <div class="match-meta">
          <span class="tag-badge">{{ match.championship || t.friendlyLabel }}</span>
          <span class="match-datetime">📅 {{ formatDate(match.date) }}</span>
        </div>

        <!-- Middle row: Scores -->
        <div class="match-main">
          <div class="team-side home-side">
            <div class="team-badge">🛡️</div>
            <span class="team-name">{{ t.ourTeamName }}</span>
          </div>

          <div class="score-display">
            <span class="score-box" :class="{ 'score-win': match.homeScore > match.awayScore }">
              {{ match.homeScore }}
            </span>
            <span class="score-divider">:</span>
            <span class="score-box" :class="{ 'score-win': match.awayScore > match.homeScore }">
              {{ match.awayScore }}
            </span>
          </div>

          <div class="team-side away-side">
            <span class="team-name">{{ match.opponent }}</span>
            <div class="team-badge badge-icon-yellow">☠️</div>
          </div>
        </div>

        <!-- Bottom row: status, goals/notes -->
        <div class="match-details">
          <div class="location-details">
            📍 {{ t.pitchLabel }}: <strong>{{ match.location }}</strong>
          </div>
          <div class="outcome-label" :class="getOutcomeClass(match)">
            {{ getOutcomeLabel(match) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useHead, useRuntimeConfig, useFetch } from '#imports';

// Translation dictionary
const translations = {
  pt: {
    pageTitle: 'Partidas e Resultados',
    pageSubtitle: 'A trajetória do La Resenha FC nos campeonatos locais. Nosso histórico de peleias.',
    offlineModeAlert: '⚠️ Modo offline: Exibindo histórico oficial de partidas do clube.',
    allFilter: 'Todos os Jogos',
    winsFilter: 'Vitórias',
    drawsFilter: 'Empates',
    lossesFilter: 'Derrotas',
    noMatchesTitle: 'Nenhuma partida encontrada',
    noMatchesDesc: 'Ainda não há registros no sistema para esse filtro.',
    friendlyLabel: 'Amistoso',
    ourTeamName: 'La Resenha FC',
    pitchLabel: 'Campo',
    outcomeWin: 'VITÓRIA',
    outcomeDraw: 'EMPATE',
    outcomeLoss: 'DERROTA'
  }
};

const t = translations.pt;

useHead({
  title: 'Resultados - La Resenha FC',
  meta: [
    { name: 'description', content: 'Resultados e histórico de partidas do La Resenha FC. Confira placares, locais e adversários das competições.' }
  ]
});

// Match interface definition
interface Match {
  id: string;
  date: string;
  opponent: string;
  location: string;
  homeScore: number;
  awayScore: number;
  championship?: string | null;
}

// Current active filter
const currentFilter = ref('all');

const filters = [
  { label: t.allFilter, value: 'all' },
  { label: t.winsFilter, value: 'win' },
  { label: t.drawsFilter, value: 'draw' },
  { label: t.lossesFilter, value: 'loss' }
];

// Fallback historical matches
const mockMatches: Match[] = [
  {
    id: '1',
    date: '2026-06-15T15:30:00.000Z',
    opponent: 'Boca da Noite',
    location: 'Terrão do Capão Raso',
    homeScore: 3,
    awayScore: 1,
    championship: 'Copa do Terrão'
  },
  {
    id: '2',
    date: '2026-06-08T14:00:00.000Z',
    opponent: 'Galáticos do Boqueirão',
    location: 'Arena Barro Preto',
    homeScore: 2,
    awayScore: 2,
    championship: 'Copa do Terrão'
  },
  {
    id: '3',
    date: '2026-06-01T16:00:00.000Z',
    opponent: 'Real Boleiros',
    location: 'Campo da Associação',
    homeScore: 0,
    awayScore: 2,
    championship: 'Copa do Terrão'
  },
  {
    id: '4',
    date: '2026-05-25T15:00:00.000Z',
    opponent: 'Tiradentes FC',
    location: 'Parque Peladeiro',
    homeScore: 4,
    awayScore: 1,
    championship: 'Amistoso'
  },
  {
    id: '5',
    date: '2026-05-18T10:00:00.000Z',
    opponent: 'Tabajara FC',
    location: 'Terrão do Capão Raso',
    homeScore: 1,
    awayScore: 0,
    championship: 'Amistoso'
  }
];

const config = useRuntimeConfig();
const apiBase = config.public.apiBase;

// Fetch real matches from the backend API
const { data: apiResponse, error } = await useFetch<{ data: Match[] }>(`${apiBase}/matches`).catch(() => ({ data: null }));

const apiError = computed(() => {
  return error.value || !apiResponse.value || !apiResponse.value.data || apiResponse.value.data.length === 0;
});

// Final array of matches
const matches = computed<Match[]>(() => {
  if (apiError.value) {
    return mockMatches;
  }
  return apiResponse.value?.data || mockMatches;
});

// Computed list of filtered matches
const filteredMatches = computed(() => {
  // Sort by date descending (most recent first)
  const sorted = [...matches.value].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (currentFilter.value === 'all') return sorted;
  
  return sorted.filter(m => {
    if (currentFilter.value === 'win') return m.homeScore > m.awayScore;
    if (currentFilter.value === 'draw') return m.homeScore === m.awayScore;
    if (currentFilter.value === 'loss') return m.homeScore < m.awayScore;
    return true;
  });
});

// Formatting helper functions
const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getOutcomeClass = (match: Match) => {
  if (match.homeScore > match.awayScore) return 'outcome-win';
  if (match.homeScore === match.awayScore) return 'outcome-draw';
  return 'outcome-loss';
};

const getOutcomeLabel = (match: Match) => {
  if (match.homeScore > match.awayScore) return t.outcomeWin;
  if (match.homeScore === match.awayScore) return t.outcomeDraw;
  return t.outcomeLoss;
};
</script>

<style scoped>
.matches-page {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.page-header {
  border-bottom: var(--border-width-thick) solid var(--color-asphalt);
  padding-bottom: 16px;
  margin-bottom: 8px;
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

/* Filter Bar */
.filter-bar {
  padding: 16px;
  background-color: var(--color-surface-container);
}

.filter-options {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* Match Cards */
.matches-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.match-result-card {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.match-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1rem;
  color: #a3a3a3;
}

.match-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 8px 0;
}

.team-side {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.home-side {
  justify-content: flex-end;
  text-align: right;
}

.away-side {
  justify-content: flex-start;
  text-align: left;
}

.team-badge {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background-color: var(--color-surface-container-high);
  border: var(--border-width-regular) solid var(--color-asphalt);
  border-radius: var(--radius-full);
}

.team-name {
  font-family: 'Oswald', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  text-transform: uppercase;
}

.score-display {
  display: flex;
  align-items: center;
  gap: 12px;
}

.score-box {
  background-color: var(--color-asphalt);
  color: var(--color-goal-white);
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 2.25rem;
  font-weight: 700;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  border: 2px solid var(--color-surface-bright);
}

.score-divider {
  font-family: 'Oswald', sans-serif;
  font-size: 1.5rem;
  color: var(--color-primary);
  font-weight: 700;
}

.score-box.score-win {
  color: var(--color-tertiary);
  border-color: var(--color-tertiary);
}

.match-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 16px;
}

.location-details {
  font-size: 0.95rem;
  color: #c2c9bb;
}

.outcome-label {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 1.125rem;
  padding: 4px 12px;
  border-radius: var(--radius-sm);
  border: var(--border-width-regular) solid var(--color-asphalt);
  box-shadow: 2px 2px 0px var(--color-asphalt);
}

/* Outcome classes mapped to brutalist outcomes */
.outcome-win {
  border-color: var(--color-vibrant-turf);
  box-shadow: 4px 4px 0px var(--color-primary-container);
}
.outcome-win:hover {
  box-shadow: 6px 6px 0px var(--color-primary-container);
}
.outcome-label.outcome-win {
  background-color: var(--color-primary-container);
  color: var(--color-primary);
  border-color: var(--color-primary);
  box-shadow: 2px 2px 0px var(--color-primary);
}

.outcome-draw {
  border-color: var(--color-tertiary);
  box-shadow: 4px 4px 0px var(--color-tertiary-container);
}
.outcome-draw:hover {
  box-shadow: 6px 6px 0px var(--color-tertiary-container);
}
.outcome-label.outcome-draw {
  background-color: var(--color-tertiary-container);
  color: var(--color-tertiary);
  border-color: var(--color-tertiary);
  box-shadow: 2px 2px 0px var(--color-tertiary);
}

.outcome-loss {
  border-color: #ef4444;
  box-shadow: 4px 4px 0px rgba(220, 38, 38, 0.4);
}
.outcome-loss:hover {
  box-shadow: 6px 6px 0px rgba(220, 38, 38, 0.4);
}
.outcome-label.outcome-loss {
  background-color: rgba(220, 38, 38, 0.2);
  color: #f87171;
  border-color: #ef4444;
  box-shadow: 2px 2px 0px #ef4444;
}

@media (max-width: 768px) {
  .match-main {
    flex-direction: column;
    gap: 16px;
  }
  .team-side {
    width: 100%;
    justify-content: center !important;
    text-align: center !important;
  }
  .home-side {
    flex-direction: column-reverse;
  }
  .away-side {
    flex-direction: column;
  }
  .match-details {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
}
</style>
