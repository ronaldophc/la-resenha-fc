<template>
  <div class="admin-settings">
    <div class="page-header">
      <div>
        <h1>Configurações Gerais</h1>
        <p class="page-subtitle">Informações do time exibidas no site: nome, logo, localização e links.</p>
      </div>
    </div>

    <!-- Alertas de Feedback -->
    <div v-if="feedback" :class="['feedback-alert', `feedback-alert--${feedback.type}`]">
      <span class="feedback-icon">{{ feedback.type === 'success' ? '✅' : '⚠️' }}</span>
      <span class="feedback-message">{{ feedback.message }}</span>
      <button @click="feedback = null" class="feedback-close">×</button>
    </div>

    <div v-if="loading" class="loading-state">
      <span class="loading-spinner">⚽</span>
      <p>Carregando configurações...</p>
    </div>

    <VCard v-else class="settings-form-card" variant="featured">
      <form @submit.prevent="handleSubmit" class="settings-form">
        <h3 class="form-section-title">Identidade do Time</h3>
        <div class="form-grid">
          <div class="form-group">
            <label for="clubName">Nome do Time *</label>
            <input
              v-model="form.clubName"
              type="text"
              id="clubName"
              required
              maxlength="80"
              placeholder="Ex: La Resenha FC"
              class="form-input"
            />
            <p class="form-help">Usado no site inteiro e também no time da tabela de classificação.</p>
          </div>

          <div class="form-group">
            <label for="logoUrl">Link do Logo</label>
            <input
              v-model="form.logoUrl"
              type="url"
              id="logoUrl"
              placeholder="https://imagens.com/logo.png"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="bannerUrl">Link do Banner da Home</label>
            <input
              v-model="form.bannerUrl"
              type="url"
              id="bannerUrl"
              placeholder="https://imagens.com/banner.jpg"
              class="form-input"
            />
            <p class="form-help">Imagem grande exibida no topo da página inicial (ideal: horizontal, ex. 1600x600).</p>
          </div>

        </div>

        <div v-if="form.logoUrl" class="logo-preview">
          <span class="logo-preview-label">Prévia do logo:</span>
          <img :src="form.logoUrl" alt="Prévia do logo" class="logo-preview-img" @error="logoError = true" @load="logoError = false" />
          <span v-if="logoError" class="logo-preview-error">⚠️ Não foi possível carregar a imagem desse link.</span>
        </div>

        <h3 class="form-section-title">Seção de Redes Sociais (Home)</h3>
        <p class="form-help" style="margin-bottom: 12px;">
          A seção só aparece na home se pelo menos um link de rede social estiver preenchido.
        </p>
        <div class="form-grid">
          <div class="form-group">
            <label for="socialTitle">Título da Seção</label>
            <input
              v-model="form.socialTitle"
              type="text"
              id="socialTitle"
              maxlength="120"
              placeholder="Ex: FAÇA PARTE DA NOSSA QUADRA"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label for="socialSubtitle">Subtítulo da Seção</label>
            <input
              v-model="form.socialSubtitle"
              type="text"
              id="socialSubtitle"
              maxlength="300"
              placeholder="Ex: Siga nossas redes para acompanhar os jogos e bastidores."
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label for="instagramUrl">Instagram</label>
            <input v-model="form.instagramUrl" type="url" id="instagramUrl" placeholder="https://instagram.com/seutime" class="form-input" />
          </div>
          <div class="form-group">
            <label for="whatsappNumber">WhatsApp (somente números)</label>
            <input v-model="form.whatsappNumber" type="tel" id="whatsappNumber" placeholder="5541999999999" class="form-input" />
            <p class="form-help">Com DDI e DDD, sem espaços ou símbolos. O link do WhatsApp é gerado automaticamente.</p>
          </div>
          <div class="form-group">
            <label for="youtubeUrl">YouTube</label>
            <input v-model="form.youtubeUrl" type="url" id="youtubeUrl" placeholder="https://youtube.com/@seutime" class="form-input" />
          </div>
          <div class="form-group">
            <label for="facebookUrl">Facebook</label>
            <input v-model="form.facebookUrl" type="url" id="facebookUrl" placeholder="https://facebook.com/seutime" class="form-input" />
          </div>
        </div>

        <div class="form-actions">
          <VButton type="submit" variant="primary" :disabled="submitting">
            {{ submitting ? 'Salvando...' : 'Salvar Configurações' }}
          </VButton>
        </div>
      </form>
    </VCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useHead, definePageMeta } from '#imports';
import { useApi } from '~/composables/useApi';
import { useSiteSettings } from '~/composables/useSiteSettings';
import VCard from '~/components/ui/VCard.vue';
import VButton from '~/components/ui/VButton.vue';

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
});

useHead({
  title: 'Configurações Gerais - La Resenha FC',
});

const { request } = useApi();
const { load: reloadSiteSettings } = useSiteSettings();

const loading = ref(true);
const submitting = ref(false);
const logoError = ref(false);

const form = ref({
  clubName: '',
  logoUrl: '',
  bannerUrl: '',
  socialTitle: '',
  socialSubtitle: '',
  instagramUrl: '',
  whatsappNumber: '',
  youtubeUrl: '',
  facebookUrl: ''
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

const loadSettings = async () => {
  loading.value = true;
  try {
    const res = await request<any>('/settings');
    const data = res?.data || res;
    form.value = {
      clubName: data.clubName || '',
      logoUrl: data.logoUrl || '',
      bannerUrl: data.bannerUrl || '',
      socialTitle: data.socialTitle || '',
      socialSubtitle: data.socialSubtitle || '',
      instagramUrl: data.instagramUrl || '',
      whatsappNumber: data.whatsappNumber || '',
      youtubeUrl: data.youtubeUrl || '',
      facebookUrl: data.facebookUrl || ''
    };
  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
    showFeedback('error', 'Não foi possível carregar as configurações.');
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  submitting.value = true;
  feedback.value = null;

  try {
    await request('/settings', {
      method: 'PATCH',
      body: { ...form.value }
    });
    showFeedback('success', 'Configurações salvas com sucesso!');
    // Atualiza header/footer sem precisar recarregar a página
    await reloadSiteSettings(true);
  } catch (error: any) {
    console.error('Erro ao salvar configurações:', error);
    const apiErrorMsg = error.data?.message;
    const errorMsg = Array.isArray(apiErrorMsg) ? apiErrorMsg[0] : apiErrorMsg;
    showFeedback('error', errorMsg || 'Erro ao salvar as configurações.');
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  loadSettings();
});
</script>

<style scoped>
.admin-settings {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  border-bottom: 4px solid var(--color-asphalt);
  padding-bottom: 16px;
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

.settings-form-card {
  border: 4px solid var(--color-primary) !important;
  box-shadow: 6px 6px 0px var(--color-asphalt) !important;
}

.form-section-title {
  font-family: 'Oswald', sans-serif;
  text-transform: uppercase;
  font-size: 1.25rem;
  color: var(--color-primary);
  margin: 24px 0 12px 0;
  border-bottom: 2px dashed var(--color-outline-variant);
  padding-bottom: 6px;
}

.form-section-title:first-child {
  margin-top: 0;
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

.form-help {
  font-size: 0.95rem;
  color: #a3a3a3;
  margin: 4px 0 0 0;
}

.logo-preview {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
  padding: 12px;
  background-color: var(--color-surface-container-low);
  border: 2px dashed var(--color-outline-variant);
  border-radius: var(--radius-sm);
}

.logo-preview-label {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.95rem;
  color: #a3a3a3;
}

.logo-preview-img {
  width: 64px;
  height: 64px;
  object-fit: contain;
  border-radius: 50%;
  border: 2px solid var(--color-outline-variant);
  background-color: #262626;
}

.logo-preview-error {
  font-size: 0.95rem;
  color: var(--color-error-red);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  border-top: 2px solid rgba(255, 255, 255, 0.05);
  padding-top: 16px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  text-align: center;
  color: #a3a3a3;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.25rem;
  background-color: var(--color-surface-container);
  border: var(--border-width-regular) solid var(--color-asphalt);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-hard-md);
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
</style>
