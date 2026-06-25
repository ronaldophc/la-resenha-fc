<template>
  <div class="container">
    <!-- Hero Banner section -->
    <section class="hero-section">
      <div class="hero-card card card-featured">
        <div class="hero-badge">{{ t.heroBadge }}</div>
        <h1>{{ t.heroTitle }}</h1>
        <p class="hero-subtitle">{{ t.heroSubtitle }}</p>
        <div class="hero-actions">
          <NuxtLink to="/elenco" class="btn btn-primary">{{ t.actionSquad }}</NuxtLink>
          <NuxtLink to="/resultados" class="btn btn-outline">{{ t.actionResults }}</NuxtLink>
        </div>
      </div>
    </section>

    <!-- Matches Overview Grid -->
    <section class="matches-section">
      <h2 class="section-title">{{ t.matchesTitle }}</h2>
      <div class="grid grid-cols-2">
        <!-- Last Match card -->
        <div class="card match-card">
          <div class="match-badge badge-last">{{ t.lastMatch }}</div>
          <div class="match-teams">
            <div class="team">
              <span class="team-name">{{ t.ourTeam }}</span>
              <span class="team-score score-win">3</span>
            </div>
            <div class="versus">X</div>
            <div class="team">
              <span class="team-name">Bairro Alto FC</span>
              <span class="team-score score-loss">1</span>
            </div>
          </div>
          <div class="match-details">
            <p><strong>{{ t.competitionLabel }}:</strong> Amador - Liga de Curitiba</p>
            <p><strong>{{ t.dateLabel }}:</strong> 14/06/2026</p>
            <p><strong>{{ t.pitchLabel }}:</strong> Arena Terrão La Resenha</p>
          </div>
        </div>

        <!-- Next Match card -->
        <div class="card match-card card-warning">
          <div class="match-badge badge-next">{{ t.nextMatch }}</div>
          <div class="match-teams">
            <div class="team">
              <span class="team-name">{{ t.ourTeam }}</span>
              <span class="team-score score-number">-</span>
            </div>
            <div class="versus">X</div>
            <div class="team">
              <span class="team-name">Vila Sandra EC</span>
              <span class="team-score score-number">-</span>
            </div>
          </div>
          <div class="match-details">
            <p><strong>{{ t.competitionLabel }}:</strong> Amador - Liga de Curitiba</p>
            <p><strong>{{ t.dateLabel }}:</strong> 28/06/2026 - 15:00</p>
            <p><strong>{{ t.pitchLabel }}:</strong> Estádio Vila Sandra (Campo do Estrela)</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Latest News section -->
    <section class="news-section">
      <h2 class="section-title">{{ t.newsTitle }}</h2>
      <div class="grid grid-cols-3">
        <div v-for="item in newsList" :key="item.id" class="card news-card">
          <div class="news-meta">
            <span class="tag-badge tag-badge-yellow">{{ item.category }}</span>
            <span class="news-date">{{ item.date }}</span>
          </div>
          <h3>{{ item.title }}</h3>
          <p>{{ item.excerpt }}</p>
          <NuxtLink :to="`/noticias/${item.id}`" class="btn btn-sm btn-outline">{{ t.readMore }}</NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useHead } from '#imports';

// Head details for SEO
useHead({
  title: 'La Resenha FC - O Terror do Terrão de Curitiba',
  meta: [
    { name: 'description', content: 'Site oficial do La Resenha FC, acompanhe elenco, notícias, resultados e tabela de classificação.' }
  ]
});

// Translation dictionary
const translations = {
  pt: {
    heroBadge: '⚠️ Resenha & Futebol Raiz',
    heroTitle: 'La Resenha FC',
    heroSubtitle: 'Aqui o futebol é jogado na sola do sapato, a poeira sobe e a cerveja desce gelada. Bem-vindo ao portal do clube mais temido da várzea de Curitiba.',
    actionSquad: 'Conheça o Elenco',
    actionResults: 'Últimos Resultados',
    matchesTitle: 'Confrontos',
    lastMatch: 'Última Partida',
    nextMatch: 'Próxima Partida',
    ourTeam: 'La Resenha FC',
    competitionLabel: 'Campeonato',
    dateLabel: 'Data',
    pitchLabel: 'Local',
    newsTitle: 'Últimas da Várzea',
    readMore: 'Ler Notícia'
  }
};

const t = translations.pt;

// Mock news list
interface NewsItem {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  category: string;
}

const newsList = ref<NewsItem[]>([
  {
    id: 1,
    title: 'Virada Épica na Arena Terrão!',
    excerpt: 'Com dois gols no final do segundo tempo, o La Resenha vira a partida contra o Bairro Alto e garante 3 pontos importantes.',
    date: '14/06/2026',
    category: 'Súmula de Jogo'
  },
  {
    id: 2,
    title: 'Preparação Física na AABB',
    excerpt: 'Elenco principal realiza treinos de força e corrida na areia visando o confronto difícil da próxima semana.',
    date: '10/06/2026',
    category: 'Bastidores'
  },
  {
    id: 3,
    title: 'Churrasco da Vitória Confirmado',
    excerpt: 'Diretoria anuncia churrasco oficial de confraternização pós-jogo no sábado. Pagamento da vaquinha até quarta-feira.',
    date: '08/06/2026',
    category: 'Eventos'
  }
]);
</script>

<style scoped>
.hero-section {
  margin-bottom: 48px;
}

.hero-card {
  padding: 48px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-badge {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.125rem;
  font-weight: 700;
  text-transform: uppercase;
  background-color: var(--color-asphalt);
  color: var(--color-goal-white);
  padding: 4px 12px;
  border-radius: var(--radius-sm);
  margin-bottom: 20px;
  border: 1px solid var(--color-primary);
}

.hero-subtitle {
  font-size: 1.25rem;
  max-width: 800px;
  margin-bottom: 32px;
  color: rgba(255, 255, 255, 0.9);
}

.hero-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
}

.section-title {
  border-left: 6px solid var(--color-tertiary);
  padding-left: 16px;
  margin-bottom: 32px;
  font-size: 2.25rem;
}

.matches-section, .news-section {
  margin-bottom: 56px;
}

.match-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.match-badge {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.95rem;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  align-self: flex-start;
  margin-bottom: 16px;
  border: 1px solid var(--border-color);
}

.badge-last {
  background-color: var(--color-primary-container);
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.badge-next {
  background-color: var(--color-tertiary-container);
  color: var(--color-tertiary);
  border-color: var(--color-tertiary);
}

.match-teams {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin: 16px 0;
}

.team {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.team-name {
  font-family: 'Oswald', sans-serif;
  font-size: 1.5rem;
  text-transform: uppercase;
}

.team-score {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  background-color: var(--color-asphalt);
  padding: 4px 20px;
  border-radius: var(--radius-md);
  border: 2px solid var(--color-surface-bright);
}

.score-win {
  color: var(--color-primary);
}

.score-loss {
  color: #ffb4ab;
}

.versus {
  font-family: 'Oswald', sans-serif;
  font-size: 1.25rem;
  color: var(--color-tertiary);
  font-weight: 700;
}

.match-details {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 16px;
  margin-top: 16px;
  font-size: 0.95rem;
}

.match-details p {
  margin-bottom: 4px;
}

.news-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}

.news-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.news-date {
  font-size: 0.85rem;
  color: #a3a3a3;
}

.news-card h3 {
  font-size: 1.35rem;
  line-height: 1.2;
  margin-bottom: 12px;
}

.news-card p {
  font-size: 0.95rem;
  color: #e5e5e5;
  margin-bottom: 24px;
}
</style>
