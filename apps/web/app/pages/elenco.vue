<template>
  <main class="elenco-page grass-pattern">
    <div class="container">
      <!-- Hero Title -->
      <section class="hero-section">
        <h1 class="elenco-title">
          Nossos Craques
        </h1>
        <p class="elenco-subtitle">
          A união do talento com a intensidade do ginásio. Conheça os guerreiros que dominam o tablado vestindo o manto do La Resenha FC.
        </p>
      </section>

      <!-- Filter Bar -->
      <div class="filter-bar scrollbar-hide">
        <button 
          v-for="filter in filterOptions" 
          :key="filter.value"
          class="filter-btn"
          :class="{ 'filter-active': selectedFilter === filter.value }"
          @click="selectedFilter = filter.value"
        >
          {{ filter.label }}
        </button>
      </div>

      <!-- Squad Grid -->
      <div v-if="filteredPlayers.length > 0" class="squad-grid">
        <!-- Player Card -->
        <div 
          v-for="(player, index) in filteredPlayers" 
          :key="player.id || player.number" 
          class="player-card"
        >
          <div class="player-image-wrapper" :class="index % 2 === 0 ? 'bg-primary-container' : 'bg-secondary-container'">
            <img 
              class="player-image" 
              :alt="`Foto do jogador ${player.name}`" 
              :src="player.photoUrl || getDefaultPhoto(player.position)"
              @error="handleImageError($event, player.position)"
            />
            <div class="player-number-badge">{{ player.number }}</div>
          </div>
          <div class="player-info">
            <span class="player-position">{{ translatePosition(player.position) }}</span>
            <h3 class="player-name">{{ player.name }}</h3>
          </div>
        </div>
      </div>
      <div v-else class="no-players-card">
        <span class="material-symbols-outlined no-players-icon">groups</span>
        <h3 class="no-players-title">
          {{ playersList.length === 0 ? 'Nenhum Craque Cadastrado' : 'Nenhum Craque Encontrado' }}
        </h3>
        <p class="no-players-desc">
          {{ playersList.length === 0 
            ? 'O time está se preparando! Em breve os jogadores do La Resenha FC serão anunciados aqui.' 
            : 'Nenhum jogador foi encontrado com o filtro selecionado.' }}
        </p>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useHead, useApi } from '#imports';

useHead({
  title: 'Elenco - La Resenha FC',
  meta: [
    { name: 'description', content: 'Conheça os jogadores e craques do La Resenha FC, os guerreiros que dominam a quadra e o terrão.' }
  ]
});

const { request } = useApi();

// --- POSITION TYPES & FILTER OPTIONS ---

interface Player {
  id?: number;
  name: string;
  number: number;
  position: 'GOALKEEPER' | 'DEFENDER' | 'MIDFIELDER' | 'FORWARD' | string;
  photoUrl?: string | null;
}

const filterOptions = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Goleiros', value: 'GOALKEEPER' },
  { label: 'Fixos', value: 'DEFENDER' },
  { label: 'Alas', value: 'MIDFIELDER' },
  { label: 'Pivôs', value: 'FORWARD' }
];

const selectedFilter = ref('ALL');

const playersList = ref<Player[]>([]);

// --- COMPUTES & FILTERS ---

const filteredPlayers = computed(() => {
  if (selectedFilter.value === 'ALL') {
    return playersList.value;
  }
  return playersList.value.filter(p => p.position === selectedFilter.value);
});

// --- HELPER UTILS ---

const translatePosition = (position: string) => {
  switch (position) {
    case 'GOALKEEPER': return 'Goleiro';
    case 'DEFENDER': return 'Fixo';
    case 'MIDFIELDER': return 'Ala';
    case 'FORWARD': return 'Pivô';
    default: return position;
  }
};

const getDefaultPhoto = (position: string) => {
  switch (position) {
    case 'GOALKEEPER':
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzeE8TnkSJdsrSgCQXqkQEwbR32qugRiCpzAqB8wuknHmmza8KSaJyipwFXBZQZTYA2S5WALgKx-4_I--A0BQlCAzaz4t8qefTG1c6Emx5QnnYvZ8X99hqEP4Jb84LR1frrBpIKSrAIYMIwV2HPdjMF6w_9o8SjLPfkzRGw0hPkwFiNytTKl3UDR32zWXqVfTkAv4hj7D6ZmU1amQ_nRD2kCtUijdBx278ZEcTHlWm0PTK8Vb2jtT4SL4sYcM1CRpveBCE4Th64xM';
    case 'DEFENDER':
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4IyJXVBqmxEDx1RMwlnCBpgrIJJ6YtnSaqYtvs9_fkT4cJ_c_1m9Lj-8J9BY9Wido7XBGboOzCbkABlBWfdPuPVqRuwP3CLYulqz3TgoOEWtkI6yAn0b9YrTCyqdnmUBm4rvHrPCHEPXBWtqBr4HPK3RHo9zUa-2Her7AYEPBKfwkAJQiSOb9vBwnG7kFwwQQLsvA6e5KJkmjTR1r2yy-N1iU_rraSe3JYir9aKRq2EzHK7aCO6pB1jjB-FU2OwpadujQfT9wFt4';
    case 'MIDFIELDER':
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuCAZ61PncYaCnc0buIC1_tG5RFUWrJFVmg14VlKyA2Dqn1YEXH5xpNicpeVkVAfowWIfNsRL53YqSCg2SyjOS0UKBj5tPvvjVBUnfujq8OkEsgkNtW8M5agKj9hmvBStxtWB54YqcyPe-O1H5GC0HzczcAqUgxP8o-xv22gVjcjHiZmIfDjwYtneXbB4yqrAuNdZHo6sUOXrTkQxboeMwnCyfvsExWszwQp2TK2pq5HtjAvb6BX5bX52xB3zwr0w8cSJio2zfz-4kA';
    case 'FORWARD':
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuAEiGXyKVHDS-NPTN33J4sz5JbAK7BffH63kr0La-mQ2cj_PbUu3PUGTL_7wofbT7dSXg7iccEkwejadK_wmMrD3Quxa3wPA4vhUh3ixPwSbGlrrR4mYl_A6-SIyTXRQz8lqzQbFMMhmTj_9sQBBXyttBCGvW4DepLye-o0_5Wrl0-zN6scBMtBqIrsmWZgYu-WzZwDXWkf1Z_E43GRcXboKU5SyuQ6H80p883mImXhdm_6ByiDnz7UZV0Y99H3gk6MDFKnC1y6Ico';
    default:
      return 'https://lh3.googleusercontent.com/aida-public/AB6AXuCAZ61PncYaCnc0buIC1_tG5RFUWrJFVmg14VlKyA2Dqn1YEXH5xpNicpeVkVAfowWIfNsRL53YqSCg2SyjOS0UKBj5tPvvjVBUnfujq8OkEsgkNtW8M5agKj9hmvBStxtWB54YqcyPe-O1H5GC0HzczcAqUgxP8o-xv22gVjcjHiZmIfDjwYtneXbB4yqrAuNdZHo6sUOXrTkQxboeMwnCyfvsExWszwQp2TK2pq5HtjAvb6BX5bX52xB3zwr0w8cSJio2zfz-4kA';
  }
};

const handleImageError = (event: Event, position: string) => {
  const imgElement = event.target as HTMLImageElement;
  if (imgElement) {
    imgElement.src = getDefaultPhoto(position);
  }
};

// --- DATA FETCHING (API INTEGRATION) ---

const loadApiData = async () => {
  try {
    const response = await request<any>('/players');
    const apiPlayers = Array.isArray(response) ? response : (response?.data || []);
    
    playersList.value = apiPlayers.map((apiPlayer: any) => ({
      id: apiPlayer.id,
      name: apiPlayer.name,
      number: apiPlayer.number,
      position: apiPlayer.position,
      photoUrl: apiPlayer.photoUrl
    })).sort((a: Player, b: Player) => a.number - b.number);
  } catch (error) {
    console.warn('API /players indisponível.');
    playersList.value = [];
  }
};

onMounted(async () => {
  await loadApiData();
});
</script>

<style scoped>
.elenco-page {
  width: 100%;
  padding-top: 96px; /* pt-24 = 96px */
  padding-bottom: 80px; /* pb-20 = 80px */
  min-height: 100vh;
}

/* ==========================================
   GRASS PATTERN & BACKGROUNDS
   ========================================== */
.grass-pattern {
  background-color: #131313;
  background-image: radial-gradient(#1a4314 0.5px, transparent 0.5px);
  background-size: 12px 12px;
}

.bg-primary-container {
  background-color: var(--color-primary-container);
}

.bg-secondary-container {
  background-color: var(--color-secondary-container);
}

/* ==========================================
   TITLES & LAYOUT
   ========================================== */
.hero-section {
  margin-bottom: 48px; /* mb-12 = 48px */
  padding-top: 32px; /* py-8 = 32px */
  padding-bottom: 32px;
  padding-left: 24px; /* pl-6 = 24px */
  border-left: 8px solid var(--color-tertiary);
}

.elenco-title {
  font-family: 'Oswald', sans-serif;
  font-weight: 700;
  font-size: 2.5rem; /* 40px on mobile */
  line-height: 1.1;
  text-transform: uppercase;
  color: var(--color-on-background);
  margin-bottom: 8px; /* mb-2 = 8px */
}

@media (min-width: 768px) {
  .elenco-title {
    font-size: 3rem; /* 48px on desktop */
  }
}

.elenco-subtitle {
  font-family: 'Public Sans', sans-serif;
  font-weight: 400;
  font-size: 1.125rem; /* 18px */
  line-height: 1.6;
  color: var(--color-on-surface-variant);
  max-width: 672px; /* max-w-2xl */
}

/* ==========================================
   FILTER BAR
   ========================================== */
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px; /* gap-3 = 12px */
  margin-bottom: 40px; /* mb-10 = 40px */
  overflow-x: auto;
  padding-bottom: 16px; /* pb-4 = 16px */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

.filter-btn {
  padding: 8px 24px;
  background-color: var(--color-surface-container-high);
  color: var(--color-on-surface);
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1rem; /* font-label-lg = 16px */
  font-weight: 600;
  text-transform: uppercase;
  border: 2px solid var(--color-asphalt);
  box-shadow: 4px 4px 0px 0px rgba(0,0,0,1);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.1s ease;
}

.filter-btn:hover {
  background-color: var(--color-primary-container);
  color: var(--color-primary);
}

.filter-btn:active {
  transform: translate(2px, 2px);
  box-shadow: 0px 0px 0px 0px rgba(0,0,0,1);
}

.filter-btn.filter-active {
  background-color: var(--color-tertiary);
  color: var(--color-on-tertiary);
  transform: translate(2px, 2px);
  box-shadow: 0px 0px 0px 0px rgba(0,0,0,1);
}

/* ==========================================
   PLAYER CARDS GRID
   ========================================== */
.squad-grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 32px; /* gap-8 = 32px */
}

@media (min-width: 640px) {
  .squad-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .squad-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 1280px) {
  .squad-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.player-card {
  background-color: var(--color-surface-container-low);
  border: 2px solid var(--color-outline-variant);
  box-shadow: 4px 4px 0px 0px rgba(0,0,0,1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.15s ease;
}

.player-card:hover {
  border-color: var(--color-tertiary);
}

.player-image-wrapper {
  position: relative;
  height: 320px; /* h-80 = 320px */
  overflow: hidden;
}

.player-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.player-card:hover .player-image {
  transform: scale(1.1);
}

.player-number-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  background-color: var(--color-tertiary);
  border: 2px solid var(--color-asphalt);
  width: 56px; /* w-14 = 56px */
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Oswald', sans-serif;
  font-size: 1.5rem; /* text-headline-md = 24px */
  font-weight: 600;
  color: var(--color-on-tertiary);
  z-index: 2;
}

.player-info {
  padding: 24px; /* p-6 = 24px */
  background-color: var(--color-surface-container-high);
}

.player-position {
  color: var(--color-primary);
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1rem; /* font-label-lg = 16px */
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 4px;
  display: block;
  letter-spacing: 0.05em;
}

.player-name {
  font-family: 'Oswald', sans-serif;
  font-size: 2rem; /* text-headline-lg = 32px */
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-on-surface);
  line-height: 1.0;
}

/* ==========================================
   EMPTY STATES
   ========================================== */
.no-players-card {
  background-color: var(--color-surface-container-low);
  color: var(--color-on-surface-variant);
  padding: 48px 32px;
  border: 4px solid var(--color-outline-variant);
  border-radius: var(--radius-lg);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 8px 8px 0px 0px rgba(0,0,0,1);
}

.no-players-icon {
  font-size: 64px;
  color: var(--color-primary);
  margin-bottom: 16px;
}

.no-players-title {
  font-family: 'Oswald', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-goal-white);
  margin-bottom: 8px;
}

.no-players-desc {
  font-family: 'Public Sans', sans-serif;
  font-size: 1rem;
  max-width: 480px;
  line-height: 1.5;
}
</style>
