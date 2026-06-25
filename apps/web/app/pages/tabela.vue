<template>
  <div class="container standings-page">
    <div class="page-header">
      <h1 class="page-title">{{ t.pageTitle }}</h1>
      <p class="page-subtitle">{{ t.pageSubtitle }}</p>
    </div>

    <!-- Alert in case of error -->
    <div v-if="apiError" class="alert alert-success">
      <span>{{ t.offlineModeAlert }}</span>
    </div>

    <!-- Standings Table -->
    <div class="table-responsive">
      <table class="varzea-table">
        <thead>
          <tr>
            <th class="col-pos">{{ t.headerPos }}</th>
            <th class="col-team">{{ t.headerTeam }}</th>
            <th class="col-stat">{{ t.headerPoints }}</th>
            <th class="col-stat">{{ t.headerPlayed }}</th>
            <th class="col-stat">{{ t.headerWon }}</th>
            <th class="col-stat">{{ t.headerDrawn }}</th>
            <th class="col-stat">{{ t.headerLost }}</th>
            <th class="col-stat hide-mobile">{{ t.headerGoalsFor }}</th>
            <th class="col-stat hide-mobile">{{ t.headerGoalsAgainst }}</th>
            <th class="col-stat">{{ t.headerGoalDiff }}</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(team, index) in standings" 
            :key="team.id || index"
            :class="{ 'highlight-row': isLaResenha(team.championship) }"
          >
            <td class="col-pos text-center">{{ index + 1 }}</td>
            <td class="col-team">
              <span class="team-badge-mini">🛡️</span>
              <span class="team-name-text">{{ team.championship }}</span>
            </td>
            <td class="col-stat text-bold">{{ team.points }}</td>
            <td class="col-stat">{{ team.played }}</td>
            <td class="col-stat">{{ team.won }}</td>
            <td class="col-stat">{{ team.drawn }}</td>
            <td class="col-stat">{{ team.lost }}</td>
            <td class="col-stat hide-mobile">{{ team.goalsFor }}</td>
            <td class="col-stat hide-mobile">{{ team.goalsAgainst }}</td>
            <td class="col-stat text-bold" :class="getGoalDiffClass(team)">
              {{ getGoalDiff(team) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="standings-legend card">
      <h4>{{ t.legendTitle }}</h4>
      <p>{{ t.legendBody }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useHead, useRuntimeConfig, useFetch } from '#imports';

// Translation dictionary
const translations = {
  pt: {
    pageTitle: 'Classificação do Campeonato',
    pageSubtitle: 'Acompanhe a tabela e a posição do La Resenha FC na Copa do Terrão 2026.',
    offlineModeAlert: '⚠️ Modo offline: Exibindo tabela de classificação oficial simulada.',
    headerPos: 'Pos',
    headerTeam: 'Time',
    headerPoints: 'Pts',
    headerPlayed: 'J',
    headerWon: 'V',
    headerDrawn: 'E',
    headerLost: 'D',
    headerGoalsFor: 'GP',
    headerGoalsAgainst: 'GC',
    headerGoalDiff: 'SG',
    legendTitle: 'Legenda de Critérios',
    legendBody: 'Pos: Posição | Pts: Pontos | J: Jogos | V: Vitórias | E: Empates | D: Derrotas | GP: Gols Pró | GC: Gols Contra | SG: Saldo de Gols'
  }
};

const t = translations.pt;

useHead({
  title: 'Tabela de Classificação - La Resenha FC',
  meta: [
    { name: 'description', content: 'Tabela de classificação completa da Copa do Terrão. Veja a pontuação e saldo de gols do La Resenha FC.' }
  ]
});

// Standing record interface definition
interface Standing {
  id?: string;
  championship: string; // Used to hold team name mapping
  position: number;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
}

// Fallback historical standings
const mockStandings: Standing[] = [
  { championship: 'Boca da Noite', position: 1, points: 12, played: 5, won: 4, drawn: 0, lost: 1, goalsFor: 11, goalsAgainst: 5 },
  { championship: 'Vila Sacode', position: 2, points: 10, played: 5, won: 3, drawn: 1, lost: 1, goalsFor: 9, goalsAgainst: 6 },
  { championship: 'La Resenha FC', position: 3, points: 8, played: 5, won: 2, drawn: 2, lost: 1, goalsFor: 10, goalsAgainst: 7 },
  { championship: 'Galáticos do Boqueirão', position: 4, points: 7, played: 5, won: 2, drawn: 1, lost: 2, goalsFor: 8, goalsAgainst: 8 },
  { championship: 'Real Boleiros', position: 5, points: 6, played: 5, won: 2, drawn: 0, lost: 3, goalsFor: 6, goalsAgainst: 9 },
  { championship: 'Tiradentes FC', position: 6, points: 3, played: 5, won: 1, drawn: 0, lost: 4, goalsFor: 5, goalsAgainst: 12 }
];

const config = useRuntimeConfig();
const apiBase = config.public.apiBase;

// Fetch real standings from backend API
const { data: apiResponse, error } = await useFetch<{ data: Standing[] }>(`${apiBase}/standings`).catch(() => ({ data: null }));

const apiError = computed(() => {
  return error.value || !apiResponse.value || !apiResponse.value.data || apiResponse.value.data.length === 0;
});

// Computed list of standings
const standings = computed<Standing[]>(() => {
  if (apiError.value) {
    return mockStandings;
  }
  // Sort descending by points, and then by goal differential if tied
  return [...apiResponse.value.data].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const sgB = b.goalsFor - b.goalsAgainst;
    const sgA = a.goalsFor - a.goalsAgainst;
    return sgB - sgA;
  });
});

// Check if team is La Resenha FC to apply highlighted styles
const isLaResenha = (name: string) => {
  return name.toLowerCase().includes('la resenha');
};

// Calculate and format goal differential (SG)
const getGoalDiff = (team: Standing) => {
  const diff = team.goalsFor - team.goalsAgainst;
  return diff > 0 ? `+${diff}` : diff;
};

// Return corresponding CSS class for coloring the goal differential
const getGoalDiffClass = (team: Standing) => {
  const diff = team.goalsFor - team.goalsAgainst;
  if (diff > 0) return 'text-success';
  if (diff < 0) return 'text-error';
  return '';
};
</script>

<style scoped>
.standings-page {
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

.col-pos {
  width: 60px;
  text-align: center;
}

.col-team {
  min-width: 200px;
}

.col-stat {
  width: 60px;
  text-align: center;
}

.text-center {
  text-align: center;
}

.text-bold {
  font-weight: 700;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.125rem;
}

.team-badge-mini {
  margin-right: 8px;
}

.team-name-text {
  font-family: 'Oswald', sans-serif;
  font-size: 1.125rem;
  text-transform: uppercase;
}

.text-success {
  color: var(--color-vibrant-turf);
}

.text-error {
  color: #f87171;
}

.standings-legend {
  background-color: var(--color-surface-container);
  padding: 16px 24px;
}

.standings-legend h4 {
  font-size: 1.125rem;
  margin-bottom: 8px;
  color: var(--color-primary);
}

.standings-legend p {
  margin: 0;
  font-size: 0.9rem;
  color: #a3a3a3;
}

@media (max-width: 640px) {
  .hide-mobile {
    display: none;
  }
}
</style>
