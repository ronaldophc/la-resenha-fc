<template>
  <div class="admin-sponsors">
    <div class="page-header">
      <div>
        <h1>Gerenciar Patrocinadores</h1>
        <p class="page-subtitle">Cadastre as marcas que apoiam o La Resenha FC. Elas aparecem no site e na home.</p>
      </div>
      <VButton @click="openForm" variant="primary" class="new-sponsor-btn">
        Novo Patrocinador 🤝
      </VButton>
    </div>

    <!-- Formulário de Cadastro / Edição -->
    <VModal v-model="showForm" :title="isEditing ? 'Editar Patrocinador' : 'Cadastrar Novo Patrocinador'">
        <form @submit.prevent="handleSubmit" class="sponsor-form">
          <div class="form-grid">
            <div class="form-group">
              <label for="name">Nome *</label>
              <input
                v-model="form.name"
                type="text"
                id="name"
                placeholder="Ex: Padaria do Bairro"
                maxlength="120"
                required
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label>Logo</label>
              <ImageUpload v-model="form.logoUrl" label="Logo do patrocinador" />
            </div>

            <div class="form-group form-group--full">
              <label for="description">Descrição (Opcional)</label>
              <textarea
                v-model="form.description"
                id="description"
                placeholder="Ex: Apoiador oficial do time desde 2024."
                maxlength="500"
                rows="3"
                class="form-input form-textarea"
              ></textarea>
              <span class="char-counter">{{ form.description.length }}/500</span>
            </div>
          </div>

          <h3 class="form-section-title">Redes Sociais e Contato (Opcional)</h3>
          <p class="form-hint">Os ícones das redes preenchidas aparecem no card do patrocinador no site.</p>
          <div class="form-grid">
            <div class="form-group">
              <label for="instagramUrl">Instagram</label>
              <input v-model="form.instagramUrl" type="url" id="instagramUrl" placeholder="https://instagram.com/patrocinador" class="form-input" />
            </div>
            <div class="form-group">
              <label for="whatsappNumber">WhatsApp (somente números)</label>
              <input v-model="form.whatsappNumber" type="tel" id="whatsappNumber" placeholder="5541999999999" class="form-input" />
              <span class="char-counter">Com DDI e DDD, sem espaços ou símbolos.</span>
            </div>
            <div class="form-group">
              <label for="youtubeUrl">YouTube</label>
              <input v-model="form.youtubeUrl" type="url" id="youtubeUrl" placeholder="https://youtube.com/@patrocinador" class="form-input" />
            </div>
            <div class="form-group">
              <label for="facebookUrl">Facebook</label>
              <input v-model="form.facebookUrl" type="url" id="facebookUrl" placeholder="https://facebook.com/patrocinador" class="form-input" />
            </div>
          </div>

          <div class="form-actions">
            <VButton type="button" @click="cancelEdit" variant="default">Cancelar</VButton>
            <VButton type="submit" variant="primary" :disabled="submitting">
              {{ submitting ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Cadastrar Patrocinador') }}
            </VButton>
          </div>
        </form>
    </VModal>

    <!-- Lista de Patrocinadores -->
    <div v-if="loading" class="loading-state">
      <span class="loading-spinner">⚽</span>
      <p>Carregando patrocinadores...</p>
    </div>

    <div v-else-if="sponsors.length === 0" class="empty-state">
      <span class="empty-icon">🤝</span>
      <p>Nenhum patrocinador cadastrado. Comece adicionando o primeiro!</p>
    </div>

    <div v-else class="sponsors-grid">
      <VCard v-for="sponsor in sponsors" :key="sponsor.id" class="sponsor-card">
        <div class="sponsor-logo-wrapper">
          <img
            v-if="sponsor.logoUrl"
            :src="sponsor.logoUrl"
            :alt="sponsor.name"
            class="sponsor-logo"
          />
          <span v-else class="material-symbols-outlined sponsor-logo-placeholder">handshake</span>
        </div>
        <h3 class="sponsor-name">{{ sponsor.name }}</h3>
        <p v-if="sponsor.description" class="sponsor-desc">{{ sponsor.description }}</p>
        <div class="sponsor-actions">
          <VButton size="sm" @click="startEdit(sponsor)" class="action-btn edit-btn">✏️ Editar</VButton>
          <VButton size="sm" variant="danger" @click="confirmDelete(sponsor)" class="action-btn">🗑️ Excluir</VButton>
        </div>
      </VCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useHead, definePageMeta } from '#imports';
import { useApi } from '~/composables/useApi';
import { useFeedback } from '~/composables/useFeedback';
import VCard from '~/components/ui/VCard.vue';
import VButton from '~/components/ui/VButton.vue';
import ImageUpload from '~/components/ui/ImageUpload.vue';
import VModal from '~/components/ui/VModal.vue';

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
});

useHead({
  title: 'Gerenciar Patrocinadores - La Resenha FC',
});

interface Sponsor {
  id: number;
  name: string;
  logoUrl?: string | null;
  description?: string | null;
  instagramUrl?: string | null;
  whatsappNumber?: string | null;
  youtubeUrl?: string | null;
  facebookUrl?: string | null;
}

const { request } = useApi();
const { showFeedback, getErrorMessage } = useFeedback();

const sponsors = ref<Sponsor[]>([]);
const loading = ref(true);
const submitting = ref(false);
const showForm = ref(false);
const isEditing = ref(false);
const editingId = ref<number | null>(null);

const form = ref({
  name: '',
  logoUrl: '',
  description: '',
  instagramUrl: '',
  whatsappNumber: '',
  youtubeUrl: '',
  facebookUrl: ''
});

const loadSponsors = async () => {
  loading.value = true;
  try {
    const res = await request<any>('/sponsors');
    sponsors.value = Array.isArray(res) ? res : (res?.data || []);
  } catch (error) {
    console.error('Erro ao carregar patrocinadores:', error);
    showFeedback('error', 'Não foi possível carregar os patrocinadores.');
  } finally {
    loading.value = false;
  }
};

const openForm = () => {
  resetForm();
  showForm.value = true;
};

const resetForm = () => {
  form.value = { name: '', logoUrl: '', description: '', instagramUrl: '', whatsappNumber: '', youtubeUrl: '', facebookUrl: '' };
  isEditing.value = false;
  editingId.value = null;
};

const startEdit = (sponsor: Sponsor) => {
  form.value = {
    name: sponsor.name,
    logoUrl: sponsor.logoUrl || '',
    description: sponsor.description || '',
    instagramUrl: sponsor.instagramUrl || '',
    whatsappNumber: sponsor.whatsappNumber || '',
    youtubeUrl: sponsor.youtubeUrl || '',
    facebookUrl: sponsor.facebookUrl || ''
  };
  editingId.value = sponsor.id;
  isEditing.value = true;
  showForm.value = true;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const cancelEdit = () => {
  resetForm();
  showForm.value = false;
};

const handleSubmit = async () => {
  submitting.value = true;

  try {
    const payload = {
      name: form.value.name,
      logoUrl: form.value.logoUrl || null,
      description: form.value.description || null,
      instagramUrl: form.value.instagramUrl || null,
      whatsappNumber: form.value.whatsappNumber || null,
      youtubeUrl: form.value.youtubeUrl || null,
      facebookUrl: form.value.facebookUrl || null
    };

    if (isEditing.value && editingId.value !== null) {
      await request(`/sponsors/${editingId.value}`, { method: 'PATCH', body: payload });
      showFeedback('success', `Patrocinador "${payload.name}" atualizado com sucesso!`);
    } else {
      await request('/sponsors', { method: 'POST', body: payload });
      showFeedback('success', `Patrocinador "${payload.name}" cadastrado com sucesso!`);
    }

    resetForm();
    showForm.value = false;
    await loadSponsors();
  } catch (error: any) {
    console.error('Erro ao salvar patrocinador:', error);
    showFeedback('error', getErrorMessage(error, 'Erro ao salvar o patrocinador.'));
  } finally {
    submitting.value = false;
  }
};

const confirmDelete = async (sponsor: Sponsor) => {
  if (confirm(`Tem certeza que deseja remover o patrocinador "${sponsor.name}"?`)) {
    try {
      await request(`/sponsors/${sponsor.id}`, { method: 'DELETE' });
      showFeedback('success', `Patrocinador "${sponsor.name}" removido com sucesso.`);
      await loadSponsors();
    } catch (error) {
      console.error('Erro ao remover patrocinador:', error);
      showFeedback('error', 'Não foi possível remover o patrocinador.');
    }
  }
};

onMounted(() => {
  loadSponsors();
});
</script>

<style scoped>
.admin-sponsors {
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

.new-sponsor-btn {
  font-size: 1.1rem;
  font-weight: 700;
}

.sponsor-form-card {
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
  font-family: 'Public Sans', sans-serif;
  font-size: 1rem;
}

.char-counter {
  font-size: 0.85rem;
  color: #a3a3a3;
  align-self: flex-end;
}

.form-section-title {
  font-family: 'Oswald', sans-serif;
  text-transform: uppercase;
  font-size: 1.25rem;
  color: var(--color-goal-white);
  margin: 24px 0 4px 0;
  border-bottom: 2px dashed var(--color-outline-variant);
  padding-bottom: 6px;
}

.form-hint {
  font-size: 0.95rem;
  color: #a3a3a3;
  margin: 0 0 12px 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  border-top: 2px solid rgba(255, 255, 255, 0.05);
  padding-top: 16px;
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

.empty-icon {
  font-size: 3.5rem;
  margin-bottom: 12px;
}

.sponsors-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

@media (min-width: 640px) {
  .sponsors-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .sponsors-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.sponsor-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  padding: 24px !important;
}

.sponsor-logo-wrapper {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border: 2px solid var(--color-asphalt);
  border-radius: var(--radius-sm);
  box-shadow: 3px 3px 0px var(--color-asphalt);
  overflow: hidden;
  padding: 8px;
}

.sponsor-logo {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.sponsor-logo-placeholder {
  font-size: 2.5rem;
  color: var(--color-outline-variant);
}

.sponsor-name {
  font-family: 'Oswald', sans-serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-goal-white);
  margin: 0;
  text-transform: uppercase;
}

.sponsor-desc {
  font-family: 'Public Sans', sans-serif;
  font-size: 0.95rem;
  color: var(--color-on-surface-variant);
  margin: 0;
  line-height: 1.4;
}

.sponsor-actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
  padding-top: 12px;
}

.action-btn {
  font-weight: 700;
}

.edit-btn {
  background-color: #ffca28 !important;
  color: #000 !important;
  border-color: #ffca28 !important;
}

.edit-btn:hover {
  background-color: #ffd54f !important;
}
</style>
