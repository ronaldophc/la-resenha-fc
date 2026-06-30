<template>
  <div class="resultados-page container">
    <!-- Cabeçalho Principal -->
    <div class="page-header">
      <h1 class="page-title">Calendário & Classificação</h1>
      <p class="page-subtitle">Acompanhe as batalhas na quadra e a nossa jornada rumo ao topo da liga.</p>
    </div>

    <!-- Grid de Conteúdo Central -->
    <div class="results-layout">
      
      <!-- COLUNA DA ESQUERDA: PARTIDAS (8 colunas no desktop) -->
      <section class="matches-column">
        <div class="column-header">
          <h2 class="column-title">
            <span class="material-symbols-outlined">sports_soccer</span>
            Nossos Confrontos
          </h2>
          
          <!-- Filtro de Partidas (Estilo Neobrutalista) -->
          <div class="filter-bar">
            <button 
              class="filter-btn" 
              :class="{ 'filter-btn--active': selectedFilter === 'all' }"
              @click="selectedFilter = 'all'"
            >
              Todos
            </button>
            <button 
              class="filter-btn" 
              :class="{ 'filter-btn--active': selectedFilter === 'completed' }"
              @click="selectedFilter = 'completed'"
            >
              Últimos Jogos
            </button>
            <button 
              class="filter-btn" 
              :class="{ 'filter-btn--active': selectedFilter === 'upcoming' }"
              @click="selectedFilter = 'upcoming'"
            >
              Próximos Jogos
            </button>
          </div>
        </div>

        <!-- Lista de Partidas -->
        <div v-if="filteredMatches.length > 0" class="matches-list">
          <div 
            v-for="match in filteredMatches" 
            :key="match.id" 
            class="match-card"
            :class="{ 
              'match-card--upcoming': isUpcoming(match.date),
              'match-card--won': !isUpcoming(match.date) && match.homeScore > match.awayScore,
              'match-card--lost': !isUpcoming(match.date) && match.homeScore < match.awayScore,
              'match-card--drawn': !isUpcoming(match.date) && match.homeScore === match.awayScore
            }"
          >
            <!-- Detalhes do Topo -->
            <div class="match-card__header">
              <span class="match-card__championship">
                {{ match.championship || 'Amistoso Especial' }}
              </span>
              <span class="match-card__date">
                {{ formatMatchDate(match.date) }}
              </span>
            </div>

            <!-- Placar / Confronto -->
            <div class="match-card__body">
              <!-- Time da Casa: La Resenha FC -->
              <div class="match-card__team match-card__team--home">
                <div class="match-card__logo-wrapper match-card__logo-wrapper--home">
                  <span class="material-symbols-outlined">shield</span>
                </div>
                <span class="match-card__team-name">La Resenha</span>
              </div>

              <!-- Placar Central -->
              <div class="match-card__score-box">
                <template v-if="!isUpcoming(match.date)">
                  <div class="match-card__scores">
                    <span class="match-card__score-num">{{ match.homeScore }}</span>
                    <span class="match-card__score-divider">-</span>
                    <span class="match-card__score-num">{{ match.awayScore }}</span>
                  </div>
                  <span class="match-card__result-badge">
                    {{ getResultLabel(match.homeScore, match.awayScore) }}
                  </span>
                </template>
                <template v-else>
                  <span class="match-card__vs">VS</span>
                  <span class="match-card__upcoming-badge">AGENDADO</span>
                </template>
              </div>

              <!-- Time Visitante -->
              <div class="match-card__team match-card__team--away">
                <div class="match-card__logo-wrapper match-card__logo-wrapper--away">
                  <span class="material-symbols-outlined">sports_soccer</span>
                </div>
                <span class="match-card__team-name">{{ match.opponent }}</span>
              </div>
            </div>

            <!-- Localização e Detalhes do Rodapé -->
            <div class="match-card__footer">
              <div class="match-card__location">
                <span class="material-symbols-outlined">location_on</span>
                <span class="match-card__location-text">{{ match.location }}</span>
              </div>
              <button 
                class="match-card__maps-btn"
                @click="handleVerLocalizacao(match.location)"
              >
                Ver Localização
              </button>
            </div>
          </div>
        </div>
        
        <!-- Estado Vazio -->
        <div v-else class="empty-state">
          <span class="material-symbols-outlined empty-state__icon">sports_soccer</span>
          <p class="empty-state__text">Nenhuma partida encontrada para este filtro.</p>
        </div>
      </section>

      <!-- COLUNA DA DIREITA: CLASSIFICAÇÃO (4 colunas no desktop) -->
      <aside class="standings-column">
        <div class="column-header">
          <h2 class="column-title">
            <span class="material-symbols-outlined">leaderboard</span>
            Classificação
          </h2>
          
          <!-- Filtro de Campeonato -->
          <div class="select-wrapper">
            <select v-model="selectedChampionship" class="championship-select">
              <option value="all">Todos os Torneios</option>
              <option v-for="champ in championshipsList" :key="champ" :value="champ">
                {{ champ }}
              </option>
            </select>
          </div>
        </div>

        <!-- Tabela Neobrutalista -->
        <div v-if="filteredStandings.length > 0" class="table-container">
          <table class="standings-table">
            <thead>
              <tr>
                <th class="text-center">Pos</th>
                <th>Time</th>
                <th class="text-center" title="Pontos">PTS</th>
                <th class="text-center" title="Jogos">J</th>
                <th class="text-center" title="Vitórias">V</th>
                <th class="text-center" title="Empates">E</th>
                <th class="text-center" title="Derrotas">D</th>
                <th class="text-center" title="Saldo de Gols">SG</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="row in filteredStandings" 
                :key="row.id"
                :class="{ 'row-highlight': row.teamName === 'La Resenha' }"
              >
                <!-- Posição com indicador de cor neobrutalista -->
                <td class="text-center font-bold">
                  <div class="pos-badge" :class="getPosClass(row.position)">
                    {{ row.position }}
                  </div>
                </td>
                <td class="team-cell">
                  <span class="material-symbols-outlined team-cell__icon">
                    {{ row.teamName === 'La Resenha' ? 'shield' : 'sports_soccer' }}
                  </span>
                  <span class="team-cell__name">{{ row.teamName }}</span>
                </td>
                <td class="text-center font-bold">{{ row.points }}</td>
                <td class="text-center">{{ row.played }}</td>
                <td class="text-center">{{ row.won }}</td>
                <td class="text-center">{{ row.drawn }}</td>
                <td class="text-center">{{ row.lost }}</td>
                <td class="text-center font-semibold" :class="getGoalDiffClass(row.goalsFor - row.goalsAgainst)">
                  {{ (row.goalsFor - row.goalsAgainst) > 0 ? '+' : '' }}{{ row.goalsFor - row.goalsAgainst }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Estado Vazamento da Tabela -->
        <div v-else class="empty-state">
          <span class="material-symbols-outlined empty-state__icon">leaderboard</span>
          <p class="empty-state__text">Nenhuma classificação disponível.</p>
        </div>

        <!-- Legenda da Classificação -->
        <div class="table-legend">
          <div class="legend-item">
            <span class="legend-dot legend-dot--g4"></span>
            <span class="legend-text">Zona de Classificação (G4)</span>
          </div>
          <div class="legend-item">
            <span class="legend-dot legend-dot--highlight"></span>
            <span class="legend-text">La Resenha FC (Destaque)</span>
          </div>
        </div>
      </aside>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useHead, useApi } from '#imports';

// --- TITLES & SEO ---
useHead({
  title: 'Resultados & Classificação - La Resenha FC',
  meta: [
    { name: 'description', content: 'Acompanhe as partidas, pontuações, calendário e a tabela de classificação do La Resenha FC nas competições locais.' }
  ]
});

// --- TYPES ---
interface Match {
  id: number;
  date: string;
  opponent: string;
  location: string;
  homeScore: number;
  awayScore: number;
  championship: string | null;
}

interface Standing {
  id: number;
  championship: string;
  position: number;
  teamName: string;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
}

// --- STATE & FILTER CONSTANTS ---
const selectedFilter = ref<'all' | 'completed' | 'upcoming'>('all');
const selectedChampionship = ref<string>('all');

const matches = ref<Match[]>([]);
const standings = ref<Standing[]>([]);

const { request } = useApi();

// --- LOGIC HELPERS ---
const isUpcoming = (dateString: string) => {
  const matchDate = new Date(dateString);
  const now = new Date();
  return matchDate > now;
};

const formatMatchDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' }).split('-')[0].toUpperCase();
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleDateString('pt-BR', { month: 'short' }).substring(0, 3).toUpperCase();
    const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${weekday}, ${day} ${month} - ${time}`;
  } catch (e) {
    return 'DOMINGO, 10:00';
  }
};

const getResultLabel = (homeScore: number, awayScore: number) => {
  if (homeScore > awayScore) return 'VITÓRIA';
  if (homeScore < awayScore) return 'DERROTA';
  return 'EMPATE';
};

const getPosClass = (pos: number) => {
  if (pos <= 4) return 'pos-badge--g4';
  return 'pos-badge--neutral';
};

const getGoalDiffClass = (diff: number) => {
  if (diff > 0) return 'text-turf-green';
  if (diff < 0) return 'text-error-red';
  return 'text-white-muted';
};

// --- ACTION HANDLERS ---
const handleVerLocalizacao = (location: string) => {
  const query = encodeURIComponent(location);
  window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
};

// --- COMPUTED FILTERED ARRAYS ---
const filteredMatches = computed(() => {
  let list = [...matches.value];
  
  // Ordenar decrescente por data para jogos anteriores e crescente para jogos futuros
  list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (selectedFilter.value === 'completed') {
    return list.filter(m => !isUpcoming(m.date));
  } else if (selectedFilter.value === 'upcoming') {
    // Para próximos confrontos, ordenar crescente
    return list.filter(m => isUpcoming(m.date)).reverse();
  }
  return list;
});

const championshipsList = computed(() => {
  const list = new Set<string>();
  standings.value.forEach(s => {
    if (s.championship) list.add(s.championship);
  });
  return Array.from(list);
});

const filteredStandings = computed(() => {
  if (selectedChampionship.value === 'all') {
    return standings.value;
  }
  return standings.value.filter(s => s.championship === selectedChampionship.value);
});

// --- DATA FETCHING ---
const loadData = async () => {
  // 1. Carregar partidas da API
  try {
    const apiMatches = await request<any>('/matches');
    let dynamicMatches: Match[] = [];
    
    // Tratando envelopes comuns de paginação/resposta
    if (Array.isArray(apiMatches)) {
      dynamicMatches = apiMatches;
    } else if (apiMatches && Array.isArray(apiMatches.data)) {
      dynamicMatches = apiMatches.data;
    }

    matches.value = dynamicMatches;
  } catch (error) {
    console.warn('API /matches falhou ou indisponível.');
    matches.value = [];
  }

  // 2. Carregar classificação da API
  try {
    const apiStandings = await request<any>('/standings');
    let dynamicStandings: Standing[] = [];
    
    if (Array.isArray(apiStandings)) {
      dynamicStandings = apiStandings;
    } else if (apiStandings && Array.isArray(apiStandings.data)) {
      dynamicStandings = apiStandings.data;
    }

    // Mapear campos da API para correspondência ideal com a view
    const mapped: Standing[] = dynamicStandings.map(s => ({
      id: s.id,
      championship: s.championship,
      position: s.position,
      teamName: s.teamName || s.team_name || (s.id === 1 ? 'La Resenha' : `Adversário ${s.id}`),
      points: s.points,
      played: s.played,
      won: s.won,
      drawn: s.drawn,
      lost: s.lost,
      goalsFor: s.goalsFor || s.goals_for || 0,
      goalsAgainst: s.goalsAgainst || s.goals_against || 0
    }));

    mapped.sort((a, b) => a.position - b.position);
    standings.value = mapped;
  } catch (error) {
    console.warn('API /standings falhou ou indisponível.');
    standings.value = [];
  }
};

onMounted(async () => {
  await loadData();
});
</script>

<style scoped>
.resultados-page {
  padding-top: 120px; /* Compensa o Header Fixo (80px) + espaço extra */
  padding-bottom: 80px;
  min-height: 100vh;
}

/* ==========================================
   CABEÇALHO DA PÁGINA
   ========================================== */
.page-header {
  margin-bottom: 48px;
  border-bottom: 4px dashed var(--color-outline-variant);
  padding-bottom: 24px;
}

.page-title {
  font-family: 'Oswald', sans-serif;
  font-size: 2.5rem; /* 40px no mobile */
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-goal-white);
  line-height: 1.1;
  letter-spacing: -0.02em;
}

@media (min-width: 768px) {
  .page-title {
    font-size: 3.5rem; /* 56px no desktop */
  }
}

.page-subtitle {
  font-family: 'Public Sans', sans-serif;
  font-size: 1.125rem; /* 18px */
  color: var(--color-on-surface-variant);
  margin-top: 12px;
  max-width: 700px;
  line-height: 1.5;
}

/* ==========================================
   LAYOUT PRINCIPAL (GRID)
   ========================================== */
.results-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 48px;
  width: 100%;
}

@media (min-width: 1024px) {
  .results-layout {
    grid-template-columns: repeat(12, 1fr);
  }
  .matches-column {
    grid-column: span 7;
  }
  .standings-column {
    grid-column: span 5;
  }
}

@media (min-width: 1200px) {
  .matches-column {
    grid-column: span 8;
  }
  .standings-column {
    grid-column: span 4;
  }
}

/* ==========================================
   CABEÇALHOS DE COLUNAS & COMPONENTES
   ========================================== */
.column-header {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 28px;
  border-bottom: 4px solid var(--color-outline-variant);
  padding-bottom: 16px;
}

@media (min-width: 640px) {
  .column-header {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.column-title {
  font-family: 'Oswald', sans-serif;
  font-size: 1.75rem; /* 28px */
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-primary);
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
}

.column-title .material-symbols-outlined {
  font-size: 2rem;
}

/* ==========================================
   BARRA DE FILTROS RÁPIDOS
   ========================================== */
.filter-bar {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-btn {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.875rem; /* 14px */
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background-color: var(--color-surface-container-low);
  color: var(--color-on-surface-variant);
  border: 2px solid var(--color-outline-variant);
  padding: 6px 16px;
  cursor: pointer;
  border-radius: var(--radius-sm);
  box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 1);
  transition: all 0.1s ease;
}

.filter-btn:hover {
  border-color: var(--color-secondary);
  color: var(--color-secondary);
}

.filter-btn--active {
  background-color: var(--color-tertiary);
  color: var(--color-asphalt);
  border-color: var(--color-asphalt);
  box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 1);
}

.filter-btn--active:hover {
  color: var(--color-asphalt);
  border-color: var(--color-asphalt);
}

.filter-btn:active {
  transform: translate(1px, 1px);
  box-shadow: 1px 1px 0px 0px rgba(0, 0, 0, 1);
}

/* ==========================================
   CARDS DE CONFRONTOS (MATCH CARDS)
   ========================================== */
.matches-list {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.match-card {
  background-color: var(--color-surface-container-low);
  border: 4px solid var(--color-outline-variant);
  box-shadow: 6px 6px 0px 0px rgba(0, 0, 0, 1);
  border-radius: var(--radius-lg);
  padding: 20px;
  transition: all 0.15s ease;
  position: relative;
  overflow: hidden;
}

.match-card:hover {
  border-color: var(--color-primary);
  box-shadow: 6px 6px 0px 0px var(--color-primary-container);
}

/* Indicadores de Resultados nas bordas esquerda */
.match-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 8px;
  background-color: var(--color-outline-variant);
}

.match-card--won::before {
  background-color: var(--color-secondary); /* Turf green */
}

.match-card--lost::before {
  background-color: #ff5252; /* Red */
}

.match-card--drawn::before {
  background-color: #ffb300; /* Amber */
}

.match-card--upcoming::before {
  background-color: var(--color-tertiary); /* Yellow */
}

/* Detalhes do Topo */
.match-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-left: 12px; /* Afasta da borda colorida */
}

.match-card__championship {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-primary);
}

.match-card__date {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-on-surface-variant);
  text-transform: uppercase;
}

/* Corpo do Card (Confronto) */
.match-card__body {
  display: grid;
  grid-template-columns: 1fr;
  align-items: center;
  gap: 16px;
  padding: 8px 12px;
  margin-bottom: 20px;
}

@media (min-width: 576px) {
  .match-card__body {
    grid-template-columns: 1.2fr 1fr 1.2fr;
  }
}

.match-card__team {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
}

@media (min-width: 576px) {
  .match-card__team {
    flex-direction: row;
    align-items: center;
    gap: 16px;
  }
  .match-card__team--home {
    justify-content: flex-end;
  }
  .match-card__team--away {
    justify-content: flex-start;
  }
}

.match-card__logo-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--color-asphalt);
  background-color: var(--color-surface-bright);
}

.match-card__logo-wrapper--home {
  background-color: var(--color-asphalt);
  border-color: var(--color-goal-white);
  color: var(--color-goal-white);
}

.match-card__logo-wrapper--home .material-symbols-outlined {
  font-size: 28px;
}

.match-card__logo-wrapper--away {
  background-color: var(--color-surface-variant);
  color: var(--color-asphalt);
}

.match-card__logo-wrapper--away .material-symbols-outlined {
  font-size: 28px;
}

.match-card__team-name {
  font-family: 'Oswald', sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-goal-white);
}

/* Placar Central */
.match-card__score-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.match-card__scores {
  display: flex;
  align-items: center;
  gap: 12px;
}

.match-card__score-num {
  font-family: 'Oswald', sans-serif;
  font-size: 2.25rem; /* 36px */
  font-weight: 700;
  background-color: var(--color-asphalt);
  color: var(--color-goal-white);
  padding: 2px 14px;
  border-radius: var(--radius-sm);
  border: 2px solid var(--color-outline-variant);
  line-height: 1;
}

.match-card__score-divider {
  font-family: 'Oswald', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary);
}

.match-card__vs {
  font-family: 'Oswald', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  font-style: italic;
  color: var(--color-outline-variant);
}

.match-card__result-badge {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.8rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(0, 0, 0, 0.2);
}

.match-card--won .match-card__result-badge {
  background-color: var(--color-secondary);
  color: var(--color-on-secondary);
}

.match-card--lost .match-card__result-badge {
  background-color: #ff5252;
  color: white;
}

.match-card--drawn .match-card__result-badge {
  background-color: #ffb300;
  color: var(--color-asphalt);
}

.match-card__upcoming-badge {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.8rem;
  font-weight: 800;
  background-color: var(--color-tertiary);
  color: var(--color-asphalt);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
}

/* Rodapé do Card */
.match-card__footer {
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-top: 2px solid var(--color-outline-variant);
  padding-top: 16px;
  padding-left: 12px;
}

@media (min-width: 576px) {
  .match-card__footer {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.match-card__location {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-on-surface-variant);
}

.match-card__location .material-symbols-outlined {
  font-size: 18px;
  color: var(--color-primary);
}

.match-card__location-text {
  font-family: 'Public Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
}

.match-card__maps-btn {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  background-color: var(--color-surface-bright);
  color: var(--color-goal-white);
  border: 2px solid var(--color-outline-variant);
  padding: 6px 14px;
  cursor: pointer;
  box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 1);
  transition: all 0.1s ease;
  align-self: flex-start;
}

.match-card__maps-btn:hover {
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  border-color: var(--color-asphalt);
}

.match-card__maps-btn:active {
  transform: translate(1px, 1px);
  box-shadow: 1px 1px 0px 0px rgba(0, 0, 0, 1);
}

/* ==========================================
   TABELA DE CLASSIFICAÇÃO (STANDINGS)
   ========================================== */
.select-wrapper {
  position: relative;
  width: 100%;
}

@media (min-width: 640px) {
  .select-wrapper {
    width: auto;
  }
}

.championship-select {
  width: 100%;
  background-color: var(--color-surface-container-low);
  color: var(--color-goal-white);
  border: 2px solid var(--color-outline-variant);
  padding: 8px 32px 8px 12px;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  cursor: pointer;
  border-radius: var(--radius-sm);
  box-shadow: 2px 2px 0px 0px rgba(0, 0, 0, 1);
  appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='white'><path d='M7 10l5 5 5-5z'/></svg>");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 18px;
}

.championship-select:focus {
  border-color: var(--color-primary);
  outline: none;
}

.table-container {
  width: 100%;
  overflow-x: auto; /* Garante rolagem horizontal no mobile */
  border: 4px solid var(--color-outline-variant);
  box-shadow: 6px 6px 0px 0px rgba(0, 0, 0, 1);
  border-radius: var(--radius-lg);
  background-color: var(--color-surface-container-low);
}

.standings-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  min-width: 480px; /* Impede aperto excessivo */
}

.standings-table th {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background-color: var(--color-primary-container);
  color: var(--color-on-primary-container);
  padding: 12px 16px;
  border-bottom: 4px solid var(--color-outline-variant);
}

.standings-table td {
  padding: 12px 16px;
  font-family: 'Public Sans', sans-serif;
  font-size: 0.95rem;
  border-bottom: 2px solid var(--color-outline-variant);
  vertical-align: middle;
}

.standings-table tbody tr {
  background-color: var(--color-surface-container-low);
  transition: background-color 0.1s ease;
}

.standings-table tbody tr:nth-child(even) {
  background-color: #191818;
}

/* Destaque para o La Resenha FC */
.row-highlight {
  background-color: var(--color-tertiary) !important;
  color: var(--color-asphalt) !important;
}

.row-highlight td {
  border-bottom: 4px solid var(--color-asphalt);
  border-top: 4px solid var(--color-asphalt);
}

.row-highlight .team-cell__name {
  color: var(--color-asphalt) !important;
  font-weight: 800;
}

.row-highlight .team-cell__icon {
  color: var(--color-asphalt) !important;
}

/* Posição Badges */
.pos-badge {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.95rem;
  font-weight: 800;
}

.pos-badge--g4 {
  background-color: var(--color-primary-container);
  color: var(--color-on-primary-container);
  border: 2px solid var(--color-asphalt);
}

.row-highlight .pos-badge--g4 {
  background-color: var(--color-asphalt);
  color: var(--color-tertiary);
  border-color: var(--color-goal-white);
}

.pos-badge--neutral {
  background-color: transparent;
  color: var(--color-on-surface-variant);
}

.row-highlight .pos-badge--neutral {
  color: var(--color-asphalt);
}

/* Time Cell */
.team-cell {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 100%;
}

.team-cell__icon {
  font-size: 20px;
  color: var(--color-primary);
}

.team-cell__name {
  font-family: 'Oswald', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-goal-white);
}

/* Utilitários de Texto */
.text-center {
  text-align: center;
}

.font-bold {
  font-weight: 800;
}

.font-semibold {
  font-weight: 700;
}

.text-turf-green {
  color: var(--color-secondary) !important;
}

.text-error-red {
  color: #ff5252 !important;
}

.text-white-muted {
  color: var(--color-on-surface-variant) !important;
}

/* Legenda da Tabela */
.table-legend {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 0 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid var(--color-asphalt);
}

.legend-dot--g4 {
  background-color: var(--color-primary-container);
}

.legend-dot--highlight {
  background-color: var(--color-tertiary);
}

.legend-text {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
  letter-spacing: 0.02em;
}

/* ==========================================
   ESTADO VAZIO (EMPTY STATE)
   ========================================== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background-color: var(--color-surface-container-low);
  border: 4px dashed var(--color-outline-variant);
  border-radius: var(--radius-lg);
  text-align: center;
}

.empty-state__icon {
  font-size: 3rem;
  color: var(--color-outline-variant);
  margin-bottom: 16px;
}

.empty-state__text {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-on-surface-variant);
  text-transform: uppercase;
  margin: 0;
}
</style>
