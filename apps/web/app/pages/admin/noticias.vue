<template>
  <div class="admin-news">
    <div class="page-header">
      <div>
        <h1>Gerenciar Notícias</h1>
        <p class="page-subtitle">Publique novidades, comunicados e artigos sobre o La Resenha FC.</p>
      </div>
      <VButton @click="toggleForm" variant="primary" class="new-news-btn">
        {{ showForm ? 'Fechar Formulário ✖' : 'Nova Notícia ✍️' }}
      </VButton>
    </div>

    <!-- Alertas de Feedback -->
    <div v-if="feedback" :class="['feedback-alert', `feedback-alert--${feedback.type}`]">
      <span class="feedback-icon">{{ feedback.type === 'success' ? '✅' : '⚠️' }}</span>
      <span class="feedback-message">{{ feedback.message }}</span>
      <button @click="feedback = null" class="feedback-close">×</button>
    </div>

    <!-- Formulário de Notícia -->
    <transition name="slide-fade">
      <VCard v-if="showForm" class="news-form-card" variant="featured">
        <h2 class="form-title">{{ isEditing ? 'Editar Notícia' : 'Escrever Nova Notícia' }}</h2>
        <form @submit.prevent="handleSubmit" class="news-form">
          <div class="form-grid">
            <div class="form-group form-group--full">
              <label for="title">Título da Notícia *</label>
              <input 
                v-model="form.title" 
                type="text" 
                id="title" 
                placeholder="Ex: La Resenha FC conquista a Taça das Comunidades 2026!" 
                maxlength="200"
                required
                class="form-input"
              />
              <span class="char-counter" :class="{ 'char-counter--limit': form.title.length >= 180 }">
                {{ form.title.length }}/200 caracteres
              </span>
            </div>

            <div class="form-group">
              <label for="imageUrl">URL da Imagem de Destaque (Opcional)</label>
              <input 
                v-model="form.imageUrl" 
                type="url" 
                id="imageUrl" 
                placeholder="Ex: https://imagens.com/noticia-destaque.jpg" 
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="publishedAt">Data de Publicação</label>
              <input 
                v-model="form.publishedAt" 
                type="datetime-local" 
                id="publishedAt" 
                class="form-input"
              />
              <span class="input-tip">Se não preenchido, será publicada imediatamente com o horário atual.</span>
            </div>

            <div class="form-group form-group--full">
              <label for="content">Conteúdo da Notícia *</label>
              <ClientOnly>
                <Editor 
                  v-model="form.content" 
                  tinymce-script-src="/tinymce/tinymce.min.js"
                  :init="{
                    height: 400,
                    menubar: false,
                    plugins: 'advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table code help wordcount',
                    toolbar: 'undo redo | blocks | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
                    skin: 'oxide-dark',
                    content_css: 'dark',
                    branding: false,
                    license_key: 'gpl'
                  }"
                />
                <template #fallback>
                  <textarea 
                    v-model="form.content" 
                    id="content" 
                    placeholder="Carregando editor..." 
                    rows="10"
                    readonly
                    class="form-input form-textarea"
                  ></textarea>
                </template>
              </ClientOnly>
              <span class="char-counter">
                Mínimo de 10 caracteres (Atual: {{ form.content.length }})
              </span>
            </div>

            <!-- Preview da Imagem de Destaque -->
            <div v-if="form.imageUrl" class="image-preview-wrapper form-group--full">
              <span class="preview-label">Pré-visualização da Imagem:</span>
              <img :src="form.imageUrl" alt="Preview da imagem de destaque" class="image-preview" @error="handleImageError"/>
            </div>
          </div>

          <div class="form-actions">
            <VButton type="button" @click="cancelEdit" variant="default">Cancelar</VButton>
            <VButton type="submit" variant="primary" :disabled="submitting">
              {{ submitting ? 'Publicando...' : (isEditing ? 'Salvar Alterações' : 'Publicar Notícia 🚀') }}
            </VButton>
          </div>
        </form>
      </VCard>
    </transition>

    <!-- Lista de Notícias -->
    <div class="news-list-container">
      <div v-if="loading" class="loading-state">
        <span class="loading-spinner">⚽</span>
        <p>Carregando notícias...</p>
      </div>

      <div v-else-if="newsItems.length === 0" class="empty-state">
        <span class="empty-icon">📰</span>
        <p>Nenhuma notícia publicada. Seja o primeiro a escrever um artigo!</p>
      </div>

      <div v-else class="news-grid">
        <VCard v-for="news in newsItems" :key="news.id" class="news-card">
          <div class="news-image-container">
            <img 
              :src="news.imageUrl || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop'" 
              :alt="news.title"
              class="news-image"
            />
          </div>
          <div class="news-content">
            <div class="news-meta">
              <span class="news-date">📅 {{ formatDate(news.publishedAt || news.createdAt) }}</span>
              <span class="news-author">✍️ {{ news.author?.name || 'Admin' }}</span>
            </div>
            <h3 class="news-card-title">{{ news.title }}</h3>
            <p class="news-excerpt">{{ getExcerpt(news.content) }}</p>
            <div class="news-actions">
              <VButton size="sm" @click="startEdit(news)" class="action-btn edit-btn">
                ✏️ Editar
              </VButton>
              <VButton size="sm" variant="danger" @click="confirmDelete(news)" class="action-btn delete-btn">
                🗑️ Excluir
              </VButton>
            </div>
          </div>
        </VCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useHead, definePageMeta } from '#imports';
import Editor from '@tinymce/tinymce-vue';
import { useApi } from '~/composables/useApi';
import VCard from '~/components/ui/VCard.vue';
import VButton from '~/components/ui/VButton.vue';

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
});

useHead({
  title: 'Gerenciar Notícias - La Resenha FC',
});

interface User {
  id: number;
  name: string;
  email: string;
}

interface News {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
  publishedAt?: string;
  createdAt: string;
  author?: User;
}

const { request } = useApi();

const newsItems = ref<News[]>([]);
const loading = ref(true);
const submitting = ref(false);
const showForm = ref(false);
const isEditing = ref(false);
const editingId = ref<number | null>(null);

const form = ref({
  title: '',
  content: '',
  imageUrl: '',
  publishedAt: ''
});

const feedback = ref<{ type: 'success' | 'error'; message: string } | null>(null);

const showFeedback = (type: 'success' | 'error', message: string) => {
  feedback.value = { type, message };
  if (type === 'success') {
    setTimeout(() => {
      if (feedback.value?.message === message) {
        feedback.value = null;
      }
    }, 5000);
  }
};

const loadNews = async () => {
  loading.value = true;
  try {
    const res = await request<any>('/news');
    newsItems.value = Array.isArray(res) ? res : (res?.data || []);
    // Ordena por data decrescente (mais recentes primeiro)
    newsItems.value.sort((a, b) => {
      const dateA = new Date(a.publishedAt || a.createdAt).getTime();
      const dateB = new Date(b.publishedAt || b.createdAt).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Erro ao carregar notícias:', error);
    showFeedback('error', 'Não foi possível carregar as notícias. Tente novamente mais tarde.');
  } finally {
    loading.value = false;
  }
};

const toggleForm = () => {
  showForm.value = !showForm.value;
  if (!showForm.value) {
    resetForm();
  }
};

const resetForm = () => {
  form.value = {
    title: '',
    content: '',
    imageUrl: '',
    publishedAt: ''
  };
  isEditing.value = false;
  editingId.value = null;
};

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

const getExcerpt = (text: string, length = 120) => {
  const plainText = text ? text.replace(/<[^>]*>/g, '') : '';
  if (plainText.length <= length) return plainText;
  return plainText.slice(0, length) + '...';
};

const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement;
  img.src = 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop';
};

const startEdit = (news: News) => {
  let localISOTime = '';
  if (news.publishedAt) {
    const d = new Date(news.publishedAt);
    const tzOffset = d.getTimezoneOffset() * 60000;
    localISOTime = (new Date(d.getTime() - tzOffset)).toISOString().slice(0, 16);
  }

  form.value = {
    title: news.title,
    content: news.content,
    imageUrl: news.imageUrl || '',
    publishedAt: localISOTime
  };
  editingId.value = news.id;
  isEditing.value = true;
  showForm.value = true;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const cancelEdit = () => {
  resetForm();
  showForm.value = false;
};

const handleSubmit = async () => {
  if (form.value.content.length < 10) {
    showFeedback('error', 'O conteúdo da notícia deve ter no mínimo 10 caracteres.');
    return;
  }

  submitting.value = true;
  feedback.value = null;

  try {
    const payload = {
      title: form.value.title,
      content: form.value.content,
      imageUrl: form.value.imageUrl || null,
      publishedAt: form.value.publishedAt ? new Date(form.value.publishedAt).toISOString() : null
    };

    if (isEditing.value && editingId.value !== null) {
      await request(`/news/${editingId.value}`, {
        method: 'PATCH',
        body: payload
      });
      showFeedback('success', `Notícia "${payload.title}" atualizada com sucesso!`);
    } else {
      await request('/news', {
        method: 'POST',
        body: payload
      });
      showFeedback('success', `Notícia "${payload.title}" publicada com sucesso!`);
    }

    resetForm();
    showForm.value = false;
    await loadNews();
  } catch (error: any) {
    console.error('Erro ao salvar notícia:', error);
    const apiErrorMsg = error.data?.message;
    const errorMsg = Array.isArray(apiErrorMsg) ? apiErrorMsg[0] : apiErrorMsg;
    showFeedback('error', errorMsg || 'Erro ao salvar notícia. Verifique os dados inseridos.');
  } finally {
    submitting.value = false;
  }
};

const confirmDelete = async (news: News) => {
  if (confirm(`Tem certeza que deseja deletar a notícia "${news.title}"?`)) {
    try {
      await request(`/news/${news.id}`, {
        method: 'DELETE'
      });
      showFeedback('success', 'Notícia removida com sucesso.');
      await loadNews();
    } catch (error) {
      console.error('Erro ao deletar notícia:', error);
      showFeedback('error', 'Não foi possível remover a notícia.');
    }
  }
};

onMounted(() => {
  loadNews();
});
</script>

<style scoped>
.admin-news {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  border-bottom: 4px solid var(--color-asphalt);
  padding-bottom: 16px;
}

@media (min-width: 768px) {
  .page-header {
    flex-direction: row;
    align-items: center;
  }
}

.page-header h1 {
  font-family: 'Oswald', sans-serif;
  font-size: 2.5rem;
  text-transform: uppercase;
  color: var(--color-goal-white);
  margin: 0;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #a3a3a3;
  margin: 4px 0 0 0;
}

.new-news-btn {
  font-size: 1.1rem;
  font-weight: 700;
}

/* Alertas */
.feedback-alert {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 3px solid var(--color-asphalt);
  border-radius: var(--radius-sm);
  box-shadow: 4px 4px 0px var(--color-asphalt);
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.15rem;
  font-weight: 600;
  position: relative;
}

.feedback-alert--success {
  background-color: var(--color-primary-container);
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.feedback-alert--error {
  background-color: #fdd8d8;
  color: var(--color-error-red);
  border-color: var(--color-error-red);
}

.feedback-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  font-weight: 700;
  cursor: pointer;
  margin-left: auto;
  color: inherit;
}

/* Formulário */
.news-form-card {
  border: 4px solid var(--color-primary) !important;
  box-shadow: 6px 6px 0px var(--color-asphalt) !important;
}

.form-title {
  font-family: 'Oswald', sans-serif;
  text-transform: uppercase;
  font-size: 1.75rem;
  margin-top: 0;
  margin-bottom: 20px;
  color: var(--color-primary);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

@media (min-width: 768px) {
  .form-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group--full {
  grid-column: 1 / -1;
}

.form-group label {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 1.1rem;
  text-transform: uppercase;
  color: var(--color-goal-white);
}

.form-input {
  background-color: var(--color-surface-container-low);
  color: var(--color-goal-white);
  border: 2px solid var(--color-outline-variant);
  padding: 10px 12px;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: var(--radius-sm);
  box-shadow: 2px 2px 0px var(--color-asphalt);
}

.form-input:focus {
  border-color: var(--color-primary);
  outline: none;
  box-shadow: 2px 2px 0px var(--color-primary);
}

.form-textarea {
  resize: vertical;
  min-height: 150px;
}

.char-counter {
  font-size: 0.9rem;
  color: #a3a3a3;
  text-align: right;
  margin-top: 2px;
}

.char-counter--limit {
  color: var(--color-error-red);
  font-weight: 700;
}

.input-tip {
  font-size: 0.85rem;
  color: #888;
  font-style: italic;
}

.image-preview-wrapper {
  background-color: var(--color-surface-container-low);
  padding: 16px;
  border: 2px dashed var(--color-outline-variant);
  border-radius: var(--radius-sm);
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.preview-label {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  text-transform: uppercase;
  color: #a3a3a3;
}

.image-preview {
  max-width: 100%;
  max-height: 240px;
  object-fit: cover;
  border: 3px solid var(--color-asphalt);
  border-radius: var(--radius-sm);
  box-shadow: 3px 3px 0px var(--color-asphalt);
  align-self: flex-start;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  border-top: 2px solid rgba(255, 255, 255, 0.05);
  padding-top: 16px;
  grid-column: 1 / -1;
}

/* Transições */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.25s ease-out;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

/* Lista de Notícias */
.news-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

@media (min-width: 768px) {
  .news-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1200px) {
  .news-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.news-card {
  padding: 0 !important;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 3px solid var(--color-asphalt) !important;
  transition: all 0.15s ease-in-out;
}

.news-card:hover {
  transform: translate(-4px, -4px);
  box-shadow: 8px 8px 0px var(--color-asphalt) !important;
}

.news-image-container {
  width: 100%;
  height: 180px;
  overflow: hidden;
  border-bottom: 3px solid var(--color-asphalt);
}

.news-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.news-card:hover .news-image {
  transform: scale(1.05);
}

.news-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.news-meta {
  display: flex;
  justify-content: space-between;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: #a3a3a3;
  margin-bottom: 10px;
  text-transform: uppercase;
}

.news-card-title {
  font-family: 'Oswald', sans-serif;
  font-size: 1.35rem;
  text-transform: uppercase;
  margin: 0 0 10px 0;
  line-height: 1.2;
  color: var(--color-goal-white);
}

.news-excerpt {
  font-size: 1.05rem;
  color: #cccccc;
  margin: 0 0 20px 0;
  line-height: 1.4;
  flex-grow: 1;
}

.news-actions {
  display: flex;
  gap: 10px;
  margin-top: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 12px;
}

.edit-btn {
  background-color: #ffca28 !important;
  color: #000 !important;
  border-color: #ffca28 !important;
  flex: 1;
}

.edit-btn:hover {
  background-color: #ffd54f !important;
}

.delete-btn {
  flex: 1;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  text-align: center;
  color: #a3a3a3;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.25rem;
}

.loading-spinner {
  font-size: 3rem;
  animation: spin 1.5s linear infinite;
  display: inline-block;
  margin-bottom: 12px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 3.5rem;
  margin-bottom: 12px;
}
</style>
