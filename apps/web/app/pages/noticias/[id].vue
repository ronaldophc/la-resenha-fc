<template>
  <div class="news-detail-page container mx-auto px-4 py-8">
    <!-- Botão de Voltar -->
    <div class="back-navigation">
      <NuxtLink to="/" class="back-btn">
        ⬅️ Voltar para a Página Inicial
      </NuxtLink>
    </div>

    <!-- Estado de Carregamento -->
    <div v-if="loading" class="loading-state">
      <span class="loading-spinner">⚽</span>
      <p>Carregando notícia...</p>
    </div>

    <!-- Estado de Erro / Não Encontrado -->
    <div v-else-if="error || !article" class="error-state">
      <span class="error-icon">⚠️</span>
      <h2>Notícia não encontrada</h2>
      <p>O artigo que você está procurando não existe ou foi removido.</p>
      <VButton to="/" variant="primary" class="mt-4">Ir para o Início</VButton>
    </div>

    <!-- Conteúdo da Notícia -->
    <article v-else class="news-article">
      <!-- Cabeçalho do Artigo -->
      <header class="article-header">
        <div class="article-meta">
          <span class="category-badge">Novidades</span>
          <span class="publish-date">📅 {{ formatDate(article.publishedAt) }}</span>
        </div>
        <h1 class="article-title">{{ article.title }}</h1>
      </header>

      <!-- Imagem de Destaque -->
      <div class="article-image-wrapper">
        <img 
          :src="getImageUrl(article.imageUrl) || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop'" 
          :alt="article.title"
          class="article-image"
          @error="setDefaultImage"
        />
      </div>

      <!-- Corpo do Artigo -->
      <div class="article-content" v-html="article.content"></div>

      <!-- Rodapé do Artigo / Call to Action -->
      <footer class="article-footer">
        <div class="share-box">
          <h3 class="share-title">Curtiu a notícia? Apoie o Resenha!</h3>
          <p class="share-desc">Compartilhe com a rapaziada no WhatsApp e ajude a fortalecer a várzea local!</p>
          <VButton @click="shareOnWhatsApp" variant="primary" class="share-btn">
            🟢 Compartilhar no WhatsApp
          </VButton>
        </div>
      </footer>
    </article>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useHead } from '#imports';
import { useApi } from '~/composables/useApi';
import VButton from '~/components/ui/VButton.vue';

interface Article {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
  publishedAt: string;
}

const route = useRoute();
const articleId = route.params.id;
const { request, apiBase } = useApi();

const article = ref<Article | null>(null);
const loading = ref(true);
const error = ref(false);

const getImageUrl = (url: string | undefined | null) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const base = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${base}${path}`;
};

// SEO e Metatags dinâmicos
useHead(() => {
  const plainText = article.value?.content ? article.value.content.replace(/<[^>]*>/g, '') : '';
  return {
    title: article.value ? `${article.value.title} - La Resenha FC` : 'Carregando Notícia... - La Resenha FC',
    meta: [
      { 
        name: 'description', 
        content: plainText ? (plainText.substring(0, 150) + '...') : 'Leia a notícia completa no portal oficial do La Resenha FC.' 
      }
    ]
  };
});

const loadArticle = async () => {
  loading.value = true;
  error.value = false;
  try {
    const res = await request<any>(`/news/${articleId}`);
    article.value = res.data || res;
  } catch (err) {
    console.error('Erro ao carregar notícia:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formattedParagraphs = computed(() => {
  if (!article.value?.content) return [];
  // Divide por quebras de linha múltiplas ou parágrafos
  return article.value.content
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
});

const setDefaultImage = (event: any) => {
  event.target.src = 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop';
};

const shareOnWhatsApp = () => {
  if (!article.value) return;
  const text = `Confira essa matéria no portal do La Resenha FC: *${article.value.title}* \n\nLeia completa em: ${window.location.href}`;
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
};

onMounted(() => {
  loadArticle();
});
</script>

<style scoped>
.news-detail-page {
  max-width: 900px;
  margin: 0 auto;
}

.back-navigation {
  margin-bottom: 24px;
}

.back-btn {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-primary);
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  display: inline-block;
  transition: transform 0.15s ease;
}

.back-btn:hover {
  text-decoration: underline;
  transform: translateX(-4px);
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  text-align: center;
  background-color: var(--color-surface-container);
  border: 4px solid var(--color-asphalt);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-hard-md);
  font-family: 'Barlow Condensed', sans-serif;
  color: #a3a3a3;
}

.loading-spinner {
  font-size: 4rem;
  animation: spin 1.5s linear infinite;
  margin-bottom: 16px;
  display: inline-block;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.error-state h2 {
  font-family: 'Oswald', sans-serif;
  font-size: 2rem;
  text-transform: uppercase;
  color: var(--color-goal-white);
  margin: 0 0 8px 0;
}

.error-state p {
  font-size: 1.2rem;
  margin: 0 0 24px 0;
}

/* Notícia */
.news-article {
  background-color: var(--color-surface-container-low);
  border: var(--border-width-thick) solid var(--color-asphalt);
  box-shadow: 8px 8px 0px var(--color-asphalt);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.article-header {
  padding: 32px 32px 24px 32px;
  border-bottom: 4px solid var(--color-asphalt);
  background-color: rgba(255, 255, 255, 0.01);
}

.article-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.category-badge {
  background-color: var(--color-primary);
  color: #000;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 4px 10px;
  border: 2px solid var(--color-asphalt);
  box-shadow: 2px 2px 0px var(--color-asphalt);
  border-radius: var(--radius-xs);
}

.publish-date {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.1rem;
  color: #a3a3a3;
  font-weight: 600;
}

.article-title {
  font-family: 'Oswald', sans-serif;
  font-size: 2.5rem;
  line-height: 1.2;
  text-transform: uppercase;
  color: var(--color-goal-white);
  margin: 0;
}

@media (max-width: 768px) {
  .article-title {
    font-size: 2rem;
  }
}

.article-image-wrapper {
  width: 100%;
  max-height: 480px;
  overflow: hidden;
  border-bottom: 4px solid var(--color-asphalt);
  background-color: rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
}

.article-image {
  max-width: 100%;
  max-height: 480px;
  height: auto;
  object-fit: contain;
}

.article-content {
  padding: 32px;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.3rem;
  line-height: 1.6;
  color: #dddddd;
  letter-spacing: 0.01em;
}

@media (max-width: 768px) {
  .article-content {
    padding: 24px;
    font-size: 1.2rem;
  }
}

.article-paragraph {
  margin-top: 0;
  margin-bottom: 24px;
}

.article-paragraph:last-child {
  margin-bottom: 0;
}

/* Rodapé / Share */
.article-footer {
  padding: 32px;
  border-top: 4px solid var(--color-asphalt);
  background-color: rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px) {
  .article-footer {
    padding: 24px;
  }
}

.share-box {
  border: 3px dashed var(--color-primary);
  padding: 24px;
  border-radius: var(--radius-sm);
  text-align: center;
  background-color: rgba(181, 237, 0, 0.03);
}

.share-title {
  font-family: 'Oswald', sans-serif;
  font-size: 1.75rem;
  text-transform: uppercase;
  color: var(--color-primary);
  margin: 0 0 8px 0;
}

.share-desc {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.15rem;
  color: #b3b3b3;
  margin: 0 0 20px 0;
}

.share-btn {
  font-size: 1.15rem;
  font-weight: 700;
}
</style>
