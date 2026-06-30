<template>
  <div class="landing-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-bg-wrapper">
        <img 
          class="hero-image" 
          alt="Gritty action shot of a futsal court at night" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4D68Rd5aIBjKImYAiB3Onxdr7UWo6GaXWavF1F5vGZYBGSO_XQkoY67Aaf1h7SDBl7nQUAfkh-5AtqzWjEqKS9P6fhti7uHXpg2cWs_BWSs2-drc5eLhn6Ld0SOLDVfy_WU0YjVkL_Wx-w__GwmVZKtgT_lyGSzKaeV6ZP_ITObyq6yFMG5jEq9_us-rDkMQjqHFsxWkqG06ZLXXnpDpVLseXhHGsZMEmOTe_8aO-jUhucivNl55bLZUm4n-3882dOccr44JqKDw"
        />
        <div class="hero-overlay"></div>
        <div class="grainy-overlay absolute inset-0"></div>
      </div>
      <div class="hero-content">
        <h1 class="hero-title">
          RESPEITA A NOSSA HISTÓRIA
        </h1>
        <p class="hero-subtitle">O mais tradicional da região</p>
      </div>
    </section>

    <!-- Main Content Grid -->
    <div class="main-grid">
      <!-- Side Column: Next Match Widget -->
      <div class="side-column">
        <div class="sticky-widget">
          <h2 class="column-title">
            <span class="material-symbols-outlined">event</span>
            Próximo Confronto
          </h2>
          
          <div v-if="nextMatch" class="next-match-card">
            <div class="match-header">
              <span class="match-date-badge">{{ formatMatchDate(nextMatch.date) }}</span>
              <span class="match-type">{{ nextMatch.championship }}</span>
            </div>
            
            <div class="match-vs-row">
              <div class="team-box">
                <div class="team-icon-wrapper team-home">
                  <img v-if="getTeamLogo('La Resenha')" :src="getTeamLogo('La Resenha')" alt="La Resenha" class="team-logo-img" />
                  <span v-else class="material-symbols-outlined">shield</span>
                </div>
                <span class="team-title">La Resenha</span>
              </div>
              
              <div class="vs-divider">VS</div>
              
              <div class="team-box">
                <div class="team-icon-wrapper team-away">
                  <img v-if="getTeamLogo(nextMatch.opponent)" :src="getTeamLogo(nextMatch.opponent)" :alt="nextMatch.opponent" class="team-logo-img" />
                  <span v-else class="material-symbols-outlined">sports_soccer</span>
                </div>
                <span class="team-title">{{ nextMatch.opponent }}</span>
              </div>
            </div>
            
            <div class="match-location-row">
              <span class="material-symbols-outlined text-asphalt">location_on</span>
              <span class="location-text">{{ nextMatch.location }}</span>
            </div>
            
            <button class="location-btn" @click="handleVerLocalizacao">
              Ver Localização
            </button>
          </div>
          <div v-else class="no-match-card">
            <span class="material-symbols-outlined no-match-icon">sports_soccer</span>
            <h3 class="no-match-title">Nenhum Jogo Agendado</h3>
            <p class="no-match-desc">Acompanhe nossas redes para saber as próximas datas de amistosos!</p>
          </div>
        </div>
      </div>

      <!-- News Grid Section -->
      <div class="news-column">
        <h2 class="column-title">
          <span class="material-symbols-outlined">newspaper</span>
          Últimas Notícias
        </h2>
        
        <div class="news-list-container">
          <!-- Empty State for News -->
          <div v-if="newsList.length === 0" class="no-news-card">
            <span class="material-symbols-outlined no-news-icon">newspaper</span>
            <h3 class="no-news-title">Nenhuma Notícia</h3>
            <p class="no-news-desc">Fique ligado! Em breve traremos as últimas novidades e bastidores do La Resenha FC.</p>
          </div>

          <template v-else>
            <!-- News Item 1 (Large Horizontal Card) -->
            <div v-if="newsList[0]" class="news-large-card">
              <div class="news-large-image-wrapper">
                <img 
                  class="news-large-image" 
                  alt="Futsal shoes on court floor" 
                  :src="getImageUrl(newsList[0].imageUrl) || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDdAqTLGCOvKqUWgsFk_ssnOVImKofzs6MXVNV-XdhIlQYh2u6whLgM7mK6PeOEzmTk3A1r3olmNES7TZXgan4QZQt8cQrw3lGkq9vhict1xtvbdqN05g3IVP7qTJL2z6SQZyhiUMjYOFy1n9IsBnPQdrbi2ZgiURyfEQekXXPut5s64vpta-YEZkA22mIQ2ilHj02IjysyZ3NgngBNrrh7CvJgcX6CrKXFkoUS7yGi3boX3Hym_Q4O6D4XNZus6nYBFs9_7-7p5-k'"
                />
              </div>
              <div class="news-large-content">
                <div>
                  <div class="news-meta">
                    <span class="news-category-badge">Destaque</span>
                    <span class="news-time">{{ formatRelativeTime(newsList[0].publishedAt) }}</span>
                  </div>
                  <h3 class="news-large-title">{{ newsList[0].title }}</h3>
                  <p class="news-large-excerpt">{{ truncateText(newsList[0].content, 140) }}</p>
                </div>
                <NuxtLink :to="'/noticias/' + newsList[0].id" class="news-readmore-link">
                  Ler Mais <span class="material-symbols-outlined">trending_flat</span>
                </NuxtLink>
              </div>
            </div>

            <!-- News Items 2 & 3 Grid -->
            <div v-if="newsList.length > 1" class="news-subgrid">
              <!-- News Item 2 -->
              <NuxtLink v-if="newsList[1]" :to="'/noticias/' + newsList[1].id" class="news-small-card">
                <div class="news-small-image-wrapper">
                  <img 
                    class="news-small-image" 
                    alt="Futsal court play close up" 
                    :src="getImageUrl(newsList[1].imageUrl) || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCS77fmCK80jT9sxMhBjEojeH5HRdsHv11RTU525zbHoKckINqoxkUkDWFpIlptQPRjbcpqdb_-opgSCKYotqrJ01M0OwzKighTermNMoyNR2RdqWibcEEzsvP0eE30gEQ_4S355CXGaijlACI8bCex_XxyfG-l7TA5Ufr6KfdapOEteym6LV4gWKgI9BROXKhv30ExVQ19IXg0zItAj8EFmotIUmWz09SMhHexrBknaiy7tqoEFZ49U5SC4W5_GZ7bEoZjkNg_p7w'"
                  />
                </div>
                <div class="news-small-content">
                  <div class="news-meta">
                    <span class="news-small-category-badge">Novidades</span>
                    <span class="news-time">{{ formatRelativeTime(newsList[1].publishedAt) }}</span>
                  </div>
                  <h3 class="news-small-title">{{ newsList[1].title }}</h3>
                  <p class="news-small-excerpt">{{ truncateText(newsList[1].content, 90) }}</p>
                </div>
              </NuxtLink>

              <!-- News Item 3 -->
              <NuxtLink v-if="newsList[2]" :to="'/noticias/' + newsList[2].id" class="news-small-card">
                <div class="news-small-image-wrapper">
                  <img 
                    class="news-small-image" 
                    alt="Vintage coach profile portrait" 
                    :src="getImageUrl(newsList[2].imageUrl) || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBr42OmetF_wU1vNZq8r9ERc6d1jSPl4ZkcKFF08CnTuXaqt71C4qiCCI6xGkZ2nBvcK5GsocaHZ6FrMnbFI1qGcxjwWs7qprtJTzc-21cm5aE0yHz1rwaOniHHvHNbtFHWcNqpnHaj0JoFwMLGgV3pi61Ku9HzZq62pRm-O89tN0KgvzWANPAjOSpBD3h6tBtAY7wpf1S1Zrn20SW2JwIODeUox-4m2qb4Qbm7fGBXGOTwJWwXxqJWGaYKvndi-9s4dZTe8zqyMVE'"
                  />
                </div>
                <div class="news-small-content">
                  <div class="news-meta">
                    <span class="news-small-category-badge badge-history">História</span>
                    <span class="news-time">{{ formatRelativeTime(newsList[2].publishedAt) }}</span>
                  </div>
                  <h3 class="news-small-title">{{ newsList[2].title }}</h3>
                  <p class="news-small-excerpt">{{ truncateText(newsList[2].content, 90) }}</p>
                </div>
              </NuxtLink>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Social Banner Section -->
    <section class="social-banner">
      <div class="social-container">
        <div class="social-text">
          <h2 class="social-title">FAÇA PARTE DA NOSSA QUADRA</h2>
          <p class="social-subtitle">
            Apoie o futsal local. Siga nossas redes para acompanhar os dribles em tempo real e os bastidores do ginásio.
          </p>
        </div>
        <div class="social-buttons">
          <button class="social-btn social-btn-instagram" @click="handleInstagram">Instagram</button>
          <button class="social-btn social-btn-whatsapp" @click="handleWhatsApp">WhatsApp</button>
        </div>
      </div>
    </section>

    <!-- FAB for Quick Actions -->
    <button class="fab-button" title="Marcar Amistoso" @click="handleMarcarAmistoso">
      <span class="material-symbols-outlined text-3xl">add</span>
      <span class="fab-tooltip">Marcar Amistoso</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useHead, useApi } from '#imports';

useHead({
  title: 'La Resenha FC - Várzea Raiz',
  meta: [
    { name: 'description', content: 'O Futsal de Raiz mais tradicional da região. Acompanhe nossos confrontos, elenco de jogadores e notícias do La Resenha FC.' }
  ]
});

const { request, apiBase } = useApi();

// --- STATE VARIABLES ---

const nextMatch = ref<{
  opponent: string;
  location: string;
  date: string;
  championship: string;
} | null>(null);

const teams = ref<any[]>([]);

const newsList = ref<Array<{
  id: number | string;
  title: string;
  content: string;
  imageUrl: string;
  publishedAt: string;
}>>([]);

// --- HELPER UTILS ---

const formatMatchDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' }).toUpperCase();
    const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${weekday}, ${time}`;
  } catch (e) {
    return 'DOMINGO, 10:00';
  }
};

const formatRelativeTime = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHrs < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `HÁ ${diffMins || 1} MINUTOS`;
    } else if (diffHrs < 24) {
      return `HÁ ${diffHrs} HORAS`;
    } else {
      const diffDays = Math.floor(diffHrs / 24);
      return `HÁ ${diffDays} DIAS`;
    }
  } catch (e) {
    return 'HÁ 2 HORAS';
  }
};

const getImageUrl = (url: string | undefined | null) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const base = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${base}${path}`;
};

const getTeamLogo = (teamName: string) => {
  if (!teamName) return '';
  const team = teams.value.find(t => t.name.toLowerCase() === teamName.toLowerCase());
  return getImageUrl(team?.logoUrl);
};

const truncateText = (text: string, length: number) => {
  if (!text) return '';
  const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (cleanText.length <= length) return cleanText;
  return cleanText.substring(0, length) + '...';
};

// --- ACTION HANDLERS ---

const handleInstagram = () => {
  window.open('https://instagram.com/la_resenha_fc', '_blank');
};

const handleWhatsApp = () => {
  window.open('https://wa.me/5541999999999?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20o%20La%20Resenha%20FC!', '_blank');
};

const handleMarcarAmistoso = () => {
  window.open('https://wa.me/5541999999999?text=Olá!%20Gostaria%20de%20marcar%20um%20amistoso%20com%20o%20La%20Resenha%20FC.', '_blank');
};

const handleVerLocalizacao = () => {
  if (nextMatch.value) {
    const query = encodeURIComponent(nextMatch.value.location);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  }
};

// --- DATA FETCHING (API INTEGRATION) ---

const loadApiData = async () => {
  try {
    const apiTeams = await request<any>('/teams');
    teams.value = Array.isArray(apiTeams) ? apiTeams : (apiTeams?.data || []);
  } catch (error) {
    console.warn('API /teams falhou ou indisponível.');
  }

  try {
    const matchesResponse = await request<any>('/matches');
    const matchesList = Array.isArray(matchesResponse) ? matchesResponse : (matchesResponse?.data || []);
    
    if (matchesList.length > 0) {
      const sorted = [...matchesList].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const now = new Date();
      const future = sorted.find(m => new Date(m.date) > now);
      if (future) {
        nextMatch.value = {
          opponent: future.opponent,
          location: future.location,
          date: future.date,
          championship: future.championship || 'Amistoso Especial'
        };
      } else {
        nextMatch.value = null;
      }
    } else {
      nextMatch.value = null;
    }
  } catch (error) {
    console.warn('API /matches indisponível.');
    nextMatch.value = null;
  }

  try {
    const newsResponse = await request<any>('/news');
    const newsListFromApi = Array.isArray(newsResponse) ? newsResponse : (newsResponse?.data || []);
    
    if (newsListFromApi.length > 0) {
      newsList.value = newsListFromApi.map((item: any) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        imageUrl: item.imageUrl || '',
        publishedAt: item.publishedAt || item.createdAt
      })).slice(0, 3);
    } else {
      newsList.value = [];
    }
  } catch (error) {
    console.warn('API /news indisponível.');
    newsList.value = [];
  }
};

onMounted(async () => {
  await loadApiData();
});
</script>

<style scoped>
.landing-page {
  display: flex;
  flex-direction: column;
  background-color: var(--color-background);
  color: var(--color-on-background);
}

/* ==========================================
   HERO SECTION
   ========================================== */
.hero-section {
  position: relative;
  height: 480px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-bottom: 4px solid var(--color-asphalt);
}

@media (min-width: 768px) {
  .hero-section {
    height: 819px;
  }
}

.hero-bg-wrapper {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(40%) contrast(1.25);
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.4) 60%, transparent 100%);
}

.hero-content {
  position: relative;
  z-index: 10;
  text-align: center;
  padding: 0 var(--space-margin-mobile);
}

.hero-title {
  font-family: 'Oswald', sans-serif;
  font-size: 2.5rem; /* 40px on mobile */
  font-weight: 700;
  color: var(--color-tertiary);
  text-transform: uppercase;
  line-height: 1.1;
  letter-spacing: -0.05em; /* tracking-tighter */
  text-shadow: 4px 4px 0px rgba(0, 0, 0, 1);
}

@media (min-width: 768px) {
  .hero-title {
    font-size: 5rem; /* 80px on desktop */
  }
}

.hero-subtitle {
  margin-top: 16px;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1rem; /* font-label-lg = 16px */
  font-weight: 600;
  color: var(--color-goal-white);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  background-color: rgba(0, 0, 0, 0.6);
  display: inline-block;
  padding: 8px 16px;
  border: 2px solid var(--color-tertiary);
}

/* ==========================================
   MAIN CONTENT GRID
   ========================================== */
.main-grid {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 48px var(--space-margin-mobile);
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  width: 100%;
}

@media (min-width: 1024px) {
  .main-grid {
    grid-template-columns: repeat(12, 1fr);
    padding: 48px var(--space-margin-desktop);
    gap: 32px;
  }
  .side-column {
    grid-column: span 4;
  }
  .news-column {
    grid-column: span 8;
  }
}

.sticky-widget {
  position: sticky;
  top: 112px; /* Header is 80px, so 80 + 32 = 112px */
}

.column-title {
  font-family: 'Oswald', sans-serif;
  font-size: 2rem; /* headline-lg = 32px */
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 24px;
  color: var(--color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ==========================================
   NEXT MATCH CARD
   ========================================== */
.next-match-card {
  background-color: var(--color-tertiary);
  color: var(--color-asphalt);
  padding: 24px;
  border: 4px solid var(--color-asphalt);
  box-shadow: 8px 8px 0px 0px var(--color-primary);
  border-radius: var(--radius-lg);
}

.match-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.match-date-badge {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1rem; /* font-label-lg = 16px */
  font-weight: 700;
  background-color: var(--color-asphalt);
  color: var(--color-tertiary);
  padding: 4px 8px;
}

.match-type {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
}

.match-vs-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 32px;
}

.team-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  text-align: center;
}

.team-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--color-asphalt);
}

.team-logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 50%;
  background-color: var(--color-surface-container-highest);
  padding: 4px;
}

.team-icon-wrapper.team-home {
  background-color: var(--color-asphalt);
  border-color: var(--color-goal-white);
}

.team-icon-wrapper.team-home .material-symbols-outlined {
  color: var(--color-goal-white);
  font-size: 36px;
}

.team-icon-wrapper.team-away {
  background-color: var(--color-surface-variant);
  border-color: var(--color-asphalt);
}

.team-icon-wrapper.team-away .material-symbols-outlined {
  color: var(--color-asphalt);
  font-size: 36px;
}

.team-title {
  font-family: 'Oswald', sans-serif;
  font-size: 1.5rem; /* headline-md = 24px */
  font-weight: 600;
  text-transform: uppercase;
  line-height: 1.2;
}

.vs-divider {
  font-family: 'Oswald', sans-serif;
  font-size: 3rem; /* headline-xl = 48px */
  font-weight: 700;
  font-style: italic;
  color: var(--color-primary-container);
}

.match-location-row {
  border-top: 2px solid var(--color-asphalt);
  padding-top: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.location-text {
  font-family: 'Public Sans', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
}

.location-btn {
  width: 100%;
  margin-top: 24px;
  background-color: var(--color-asphalt);
  color: var(--color-tertiary);
  font-family: 'Oswald', sans-serif;
  font-size: 1.5rem; /* headline-md = 24px */
  font-weight: 600;
  text-transform: uppercase;
  padding: 12px 0;
  border: 2px solid var(--color-asphalt);
  cursor: pointer;
  transition: all 0.15s ease;
}

.location-btn:hover {
  background-color: var(--color-surface-container-highest);
}

.location-btn:active {
  transform: translate(2px, 2px);
}

/* ==========================================
   NEWS SECTION
   ========================================== */
.news-list-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.news-large-card {
  background-color: var(--color-surface-container-low);
  border: 4px solid var(--color-outline-variant);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.15s ease;
}

@media (min-width: 768px) {
  .news-large-card {
    flex-direction: row;
  }
}

.news-large-card:hover {
  border-color: var(--color-tertiary);
}

.news-large-image-wrapper {
  height: 240px;
  overflow: hidden;
  position: relative;
}

@media (min-width: 768px) {
  .news-large-image-wrapper {
    width: 33.33%;
    height: auto;
  }
}

.news-large-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.news-large-card:hover .news-large-image {
  transform: scale(1.1);
}

.news-large-content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex: 1;
}

.news-meta {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
}

.news-category-badge {
  background-color: var(--color-secondary);
  color: var(--color-on-secondary);
  padding: 2px 8px;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
}

.news-time {
  color: var(--color-on-surface-variant);
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
}

.news-large-title {
  font-family: 'Oswald', sans-serif;
  font-size: 1.5rem; /* headline-md = 24px */
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 8px;
  transition: color 0.15s ease;
  color: var(--color-goal-white);
}

.news-large-card:hover .news-large-title {
  color: var(--color-tertiary);
}

.news-large-excerpt {
  color: var(--color-on-surface-variant);
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 16px;
}

.news-readmore-link {
  font-family: 'Oswald', sans-serif;
  font-size: 1.5rem;
  color: var(--color-tertiary);
  text-transform: uppercase;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  transition: transform 0.15s ease;
}

.news-readmore-link:hover {
  transform: translateX(4px);
}

/* News Small Cards Subgrid */
.news-subgrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
}

@media (min-width: 768px) {
  .news-subgrid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.news-small-card {
  background-color: var(--color-surface-container-low);
  border: 4px solid var(--color-outline-variant);
  transition: all 0.15s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  text-decoration: none;
}

.news-small-card:hover {
  border-color: var(--color-tertiary);
}

.news-small-image-wrapper {
  height: 192px;
  overflow: hidden;
  position: relative;
}

.news-small-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.news-small-card:hover .news-small-image {
  transform: scale(1.1);
}

.news-small-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.news-small-category-badge {
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  padding: 2px 8px;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 8px;
  display: inline-block;
  align-self: flex-start;
}

.news-small-category-badge.badge-history {
  background-color: var(--color-tertiary);
  color: var(--color-on-tertiary);
}

.news-small-title {
  font-family: 'Oswald', sans-serif;
  font-size: 1.5rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 8px;
  transition: color 0.15s ease;
  color: var(--color-goal-white);
}

.news-small-card:hover .news-small-title {
  color: var(--color-tertiary);
}

.news-small-excerpt {
  color: var(--color-on-surface-variant);
  font-size: 1rem;
  line-height: 1.5;
}

/* ==========================================
   SOCIAL BANNER
   ========================================== */
.social-banner {
  background-color: var(--color-primary-container);
  border-top: 4px solid var(--color-asphalt);
  border-bottom: 4px solid var(--color-asphalt);
  padding: 64px var(--space-margin-mobile);
  width: 100%;
}

.social-container {
  max-width: var(--max-width);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  gap: 32px;
}

@media (min-width: 1024px) {
  .social-container {
    flex-direction: row;
    padding: 0 var(--space-margin-desktop);
  }
}

.social-text {
  max-width: 600px;
  text-align: center;
}

@media (min-width: 1024px) {
  .social-text {
    text-align: left;
  }
}

.social-title {
  font-family: 'Oswald', sans-serif;
  font-size: 2.25rem; /* headline-xl = 48px, 36px on mobile */
  font-weight: 700;
  color: var(--color-secondary);
  text-transform: uppercase;
  line-height: 1.1;
  margin-bottom: 16px;
}

@media (min-width: 768px) {
  .social-title {
    font-size: 3rem; /* 48px */
  }
}

.social-subtitle {
  color: var(--color-on-primary-container);
  font-size: 1.125rem; /* body-lg = 18px */
  font-weight: 700;
  line-height: 1.6;
}

.social-buttons {
  display: flex;
  gap: 16px;
}

.social-btn {
  padding: 16px 32px;
  border: 4px solid var(--color-asphalt);
  font-family: 'Oswald', sans-serif;
  font-size: 1.5rem; /* headline-md = 24px */
  font-weight: 600;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.social-btn-instagram {
  background-color: var(--color-tertiary);
  color: var(--color-asphalt);
  box-shadow: 4px 4px 0px 0px rgba(0, 0, 0, 1);
}

.social-btn-whatsapp {
  background-color: var(--color-secondary);
  color: var(--color-asphalt);
  box-shadow: 4px 4px 0px 0px rgba(0, 0, 0, 1);
}

.social-btn:hover {
  box-shadow: none;
  transform: translate(4px, 4px);
}

/* ==========================================
   FAB BUTTON
   ========================================== */
.fab-button {
  position: fixed;
  bottom: 32px;
  right: 32px;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: var(--color-tertiary);
  color: var(--color-asphalt);
  border: 4px solid var(--color-asphalt);
  box-shadow: 4px 4px 0px 0px rgba(0, 0, 0, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 99;
  transition: all 0.15s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.fab-button:hover {
  box-shadow: none;
  transform: translate(4px, 4px);
}

.fab-tooltip {
  position: absolute;
  right: 80px;
  background-color: var(--color-asphalt);
  color: var(--color-tertiary);
  padding: 4px 12px;
  font-family: 'Oswald', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
  border: 2px solid var(--color-tertiary);
}

.fab-button:hover .fab-tooltip {
  opacity: 1;
}
/* ==========================================
   EMPTY STATES
   ========================================== */
.no-match-card {
  background-color: var(--color-surface-container-low);
  color: var(--color-on-surface-variant);
  padding: 32px 24px;
  border: 4px solid var(--color-outline-variant);
  box-shadow: 8px 8px 0px 0px var(--color-primary-container);
  border-radius: var(--radius-lg);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.no-match-icon {
  font-size: 48px;
  color: var(--color-tertiary);
  margin-bottom: 12px;
}

.no-match-title {
  font-family: 'Oswald', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-goal-white);
  margin-bottom: 8px;
}

.no-match-desc {
  font-family: 'Public Sans', sans-serif;
  font-size: 0.875rem;
  line-height: 1.4;
}

.no-news-card {
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
}

.no-news-icon {
  font-size: 64px;
  color: var(--color-primary);
  margin-bottom: 16px;
}

.no-news-title {
  font-family: 'Oswald', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-goal-white);
  margin-bottom: 8px;
}

.no-news-desc {
  font-family: 'Public Sans', sans-serif;
  font-size: 1rem;
  max-width: 480px;
  line-height: 1.5;
}
</style>
