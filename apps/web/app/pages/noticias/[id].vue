<template>
  <div class="container news-detail-page">
    <div v-if="newsItem" class="detail-container">
      <div class="back-navigation">
        <NuxtLink to="/noticias" class="btn btn-sm btn-outline">
          &larr; Voltar para Notícias
        </NuxtLink>
      </div>

      <!-- Main News Article -->
      <article class="card news-article-card">
        <header class="article-header">
          <div class="article-meta">
            <span class="tag-badge tag-badge-green">COMUNICADO OFICIAL</span>
            <span class="article-date">Publicado em {{ formatDate(newsItem.publishedAt) }}</span>
          </div>
          <h1 class="article-title">{{ newsItem.title }}</h1>
        </header>

        <!-- Big Image or Placeholder -->
        <div class="article-media">
          <img v-if="newsItem.imageUrl" :src="newsItem.imageUrl" :alt="newsItem.title" class="article-image" />
          <div v-else class="article-image-placeholder">
            <span>⚽ LA RESENHA FC ⚽</span>
          </div>
        </div>

        <section class="article-content">
          <p v-for="(paragraph, index) in splitParagraphs(newsItem.content)" :key="index">
            {{ paragraph }}
          </p>
        </section>

        <footer class="article-footer">
          <div class="article-share">
            <span>Compartilhe com a galera no bar ou no zap!</span>
          </div>
        </footer>
      </article>
    </div>

    <!-- Error/Not Found screen -->
    <div v-else class="card not-found-card">
      <h2>Notícia não encontrada</h2>
      <p>O comunicado solicitado não existe ou foi removido do terrão.</p>
      <NuxtLink to="/noticias" class="btn btn-primary">Voltar para Notícias</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const newsId = route.params.id as string;

// Interface de Notícia
interface News {
  id: string;
  title: string;
  content: string;
  imageUrl?: string | null;
  publishedAt: string;
}

// Mock de Notícias como Fallback
const mockNews: Record<string, News> = {
  '1': {
    id: '1',
    title: 'Novo Uniforme Apresentado para 2026',
    content: 'O La Resenha FC apresentou oficialmente o novo manto sagrado para a disputa da temporada 2026. Com a tradicional combinação de listras verdes e detalhes dourados nas mangas, o uniforme faz alusão ao primeiro título conquistado pelo clube no terrão da UTFPR.\n\nA pré-venda já está liberada com a diretoria do time no WhatsApp. O preço especial de sócio-torcedor inclui personalização do nome e número de preferência.\n\nVista as cores do time que faz tremer os corações no final de semana!',
    imageUrl: null,
    publishedAt: '2026-06-22T12:00:00.000Z'
  },
  '2': {
    id: '2',
    title: 'Mutirão no Sábado para Manutenção do Campo',
    content: 'A diretoria convoca todos os atletas da categoria principal, veteranos e torcedores voluntários para participar do grande mutirão de pintura e nivelamento do campo do Capão Raso. O início das atividades está agendado para sábado às 08:30.\n\nA diretoria avisa que a resenha com churrasco e cerveja gelada está garantida após o encerramento do trabalho. Traga sua enxada, disposição e bom humor para mantermos nossa praça de esportes sempre impecável!',
    imageUrl: null,
    publishedAt: '2026-06-19T09:00:00.000Z'
  },
  '3': {
    id: '3',
    title: 'Preparação Intensa para o Clássico Contra o Vila Sacode',
    content: 'O clássico contra o Vila Sacode promete mexer com as estruturas do bairro no próximo domingo. O técnico Mandioca comandou um treino tático puxado focado em jogadas aéreas e cobranças de bola parada.\n\nA expectativa é de casa cheia no terrão. Nossos atletas estão motivados após a última vitória marcante de 3 a 1. Venha fazer barulho e apoiar o time do começo ao fim!',
    imageUrl: null,
    publishedAt: '2026-06-17T15:30:00.000Z'
  }
};

const config = useRuntimeConfig();
const apiBase = config.public.apiBase;

// Carregar notícia real da API
const { data: apiResponse } = await useFetch<{ data: News }>(`${apiBase}/news/${newsId}`).catch(() => ({ data: null }));

// Notícia final resolvida
const newsItem = computed<News | null>(() => {
  if (apiResponse.value && apiResponse.value.data) {
    return apiResponse.value.data;
  }
  // Fallback para mock local
  return mockNews[newsId] || null;
});

// Atualiza o título da aba dinamicamente com base no título da notícia!
useHead({
  title: computed(() => newsItem.value ? `${newsItem.value.title} - La Resenha FC` : 'Notícia Não Encontrada - La Resenha FC'),
  meta: [
    {
      name: 'description',
      content: computed(() => newsItem.value ? newsItem.value.content.substring(0, 150) : 'Comunicado do La Resenha FC')
    }
  ]
});

// Divide o texto em parágrafos usando \n
const splitParagraphs = (content: string) => {
  if (!content) return [];
  return content.split('\n').filter(p => p.trim().length > 0);
};

// Formatar data
const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>

<style scoped>
.news-detail-page {
  max-width: 800px !important;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.back-navigation {
  margin-bottom: 16px;
}

.news-article-card {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.article-date {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1rem;
  color: #a3a3a3;
}

.article-title {
  font-size: 2.75rem;
  line-height: 1.1;
  text-shadow: 2px 2px 0px var(--color-asphalt);
}

.article-media {
  width: 100%;
  height: 350px;
  background-color: var(--color-asphalt);
  border: var(--border-width-regular) solid var(--color-asphalt);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.article-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.article-image-placeholder {
  font-family: 'Oswald', sans-serif;
  font-size: 2rem;
  color: #3f3f3f;
  letter-spacing: 0.1em;
}

.article-content {
  font-size: 1.125rem;
  line-height: 1.7;
  color: var(--color-goal-white);
}

.article-content p {
  margin-bottom: 20px;
}

.article-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 24px;
  margin-top: 16px;
}

.article-share {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.125rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-tertiary);
  text-align: center;
}

.not-found-card {
  padding: 48px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}
</style>
