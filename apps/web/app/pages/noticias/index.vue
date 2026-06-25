<template>
  <div class="container news-page">
    <div class="page-header">
      <h1 class="page-title">{{ t.pageTitle }}</h1>
      <p class="page-subtitle">{{ t.pageSubtitle }}</p>
    </div>

    <!-- Alert in case of error -->
    <div v-if="apiError" class="alert alert-success">
      <span>{{ t.offlineModeAlert }}</span>
    </div>

    <!-- News List -->
    <div class="grid grid-cols-3 news-grid">
      <div v-for="item in newsList" :key="item.id" class="card news-card">
        <div class="news-image-wrapper">
          <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.title" class="news-image" />
          <div v-else class="news-image-placeholder">
            <span>{{ t.imagePlaceholder }}</span>
          </div>
          <span class="tag-badge tag-badge-yellow news-badge">{{ t.badgeLabel }}</span>
        </div>
        
        <div class="news-content-box">
          <span class="news-date">📅 {{ formatDate(item.publishedAt) }}</span>
          <h2 class="news-card-title">{{ item.title }}</h2>
          <p class="news-card-excerpt">{{ getExcerpt(item.content) }}</p>
          
          <NuxtLink :to="`/noticias/${item.id}`" class="btn btn-sm btn-primary read-more-btn">
            {{ t.readMoreBtn }} &rarr;
          </NuxtLink>
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
    pageTitle: 'Notícias e Comunicados',
    pageSubtitle: 'Acompanhe as últimas novidades, resenhas e comunicados oficiais do La Resenha FC.',
    offlineModeAlert: '⚠️ Modo offline: Exibindo notícias oficiais históricas do clube.',
    imagePlaceholder: '📰 La Resenha FC',
    badgeLabel: 'NOVIDADE',
    readMoreBtn: 'Ler Notícia Completa'
  }
};

const t = translations.pt;

useHead({
  title: 'Notícias - La Resenha FC',
  meta: [
    { name: 'description', content: 'Fique por dentro das últimas notícias, comunicados e resenhas do maior time do terrão.' }
  ]
});

// News article interface definition
interface News {
  id: string;
  title: string;
  content: string;
  imageUrl?: string | null;
  publishedAt: string;
}

// Fallback historical news
const mockNews: News[] = [
  {
    id: '1',
    title: 'Novo Uniforme Apresentado para 2026',
    content: 'O La Resenha FC apresentou oficialmente o novo manto sagrado para a disputa da temporada 2026. Com a tradicional combinação de listras verdes e detalhes dourados nas mangas, o uniforme faz alusão ao primeiro título conquistado pelo clube no terrão da UTFPR. A pré-venda já está liberada com a diretoria do time no WhatsApp.',
    imageUrl: null,
    publishedAt: '2026-06-22T12:00:00.000Z'
  },
  {
    id: '2',
    title: 'Mutirão no Sábado para Manutenção do Campo',
    content: 'A diretoria convoca todos os atletas da categoria principal, veteranos e torcedores voluntários para participar do grande mutirão de pintura e nivelamento do campo do Capão Raso. O início das atividades está agendado para sábado às 08:30. A diretoria avisa que a resenha com churrasco e cerveja gelada está garantida após o encerramento do trabalho.',
    imageUrl: null,
    publishedAt: '2026-06-19T09:00:00.000Z'
  },
  {
    id: '3',
    title: 'Preparação Intensa para o Clássico Contra o Vila Sacode',
    content: 'O clássico contra o Vila Sacode promete mexer com as estruturas do bairro no próximo domingo. O técnico Mandioca comandou um treino tático puxado focado em jogadas aéreas e cobranças de bola parada. A expectativa é de casa cheia no terrão. Nossos atletas estão motivados após a última vitória marcante de 3 a 1.',
    imageUrl: null,
    publishedAt: '2026-06-17T15:30:00.000Z'
  }
];

const config = useRuntimeConfig();
const apiBase = config.public.apiBase;

// Fetch real news articles from backend API
const { data: apiResponse, error } = await useFetch<{ data: News[] }>(`${apiBase}/news`).catch(() => ({ data: null }));

const apiError = computed(() => {
  return error.value || !apiResponse.value || !apiResponse.value.data || apiResponse.value.data.length === 0;
});

// Final news list
const newsList = computed<News[]>(() => {
  if (apiError.value) {
    return mockNews;
  }
  // Sort from most recent to oldest
  return [...(apiResponse.value?.data || mockNews)].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
});

// Extract short text summary
const getExcerpt = (text: string) => {
  if (text.length <= 130) return text;
  return text.substring(0, 130) + '...';
};

// Date formatting helper
const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};
</script>

<style scoped>
.news-page {
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

.news-grid {
  margin-bottom: 32px;
}

.news-card {
  padding: 0;
  display: flex;
  flex-direction: column;
}

.news-image-wrapper {
  position: relative;
  width: 100%;
  height: 200px;
  background-color: var(--color-asphalt);
  border-bottom: var(--border-width-regular) solid var(--color-asphalt);
  display: flex;
  align-items: center;
  justify-content: center;
}

.news-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.news-image-placeholder {
  font-family: 'Oswald', sans-serif;
  font-size: 1.5rem;
  color: #525252;
}

.news-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  box-shadow: 2px 2px 0px var(--color-asphalt);
}

.news-content-box {
  padding: 24px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.news-date {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.95rem;
  color: var(--color-primary);
  margin-bottom: 8px;
}

.news-card-title {
  font-size: 1.45rem;
  margin-bottom: 12px;
  line-height: 1.2;
}

.news-card-excerpt {
  font-size: 0.95rem;
  color: #d4d4d4;
  margin-bottom: 24px;
  flex-grow: 1;
}

.read-more-btn {
  align-self: flex-start;
  width: 100%;
}
</style>
