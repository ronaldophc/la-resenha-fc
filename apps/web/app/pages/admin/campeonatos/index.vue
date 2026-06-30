<template>
  <div class="admin-championships">
    <div class="page-header">
      <div>
        <h1>Gerenciar Campeonatos</h1>
        <p class="page-subtitle">Cadastre e gerencie os campeonatos e acesse para gerenciar suas tabelas.</p>
      </div>
      <VButton @click="toggleForm" variant="primary" class="new-champ-btn">
        {{ showForm ? 'Fechar Formulário ✖' : 'Novo Campeonato 🏆' }}
      </VButton>
    </div>

    <!-- Alertas de Feedback -->
    <div v-if="feedback" :class="['feedback-alert', `feedback-alert--${feedback.type}`]">
      <span class="feedback-icon">{{ feedback.type === 'success' ? '✅' : '⚠️' }}</span>
      <span class="feedback-message">{{ feedback.message }}</span>
      <button @click="feedback = null" class="feedback-close">×</button>
    </div>

    <!-- Formulário de Cadastro / Edição -->
    <transition name="slide-fade">
      <VCard v-if="showForm" class="champ-form-card" variant="featured">
        <h2 class="form-title">{{ isEditing ? 'Editar Campeonato' : 'Criar Novo Campeonato' }}</h2>
        <form @submit.prevent="handleSubmit" class="champ-form">
          <div class="form-grid">
            <div class="form-group">
              <label for="name">Nome do Campeonato *</label>
              <input 
                v-model="form.name" 
                type="text" 
                id="name" 
                placeholder="Ex: Copa Várzea Curitiba 2026" 
                required
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="logoUrl">Link do Logo (Opcional)</label>
              <input 
                v-model="form.logoUrl" 
                type="url" 
                id="logoUrl" 
                placeholder="Ex: https://imagens.com/logo-champ.png" 
                class="form-input"
              />
            </div>
          </div>

          <div class="form-actions">
            <VButton type="button" @click="cancelEdit" variant="outline">Cancelar</VButton>
            <VButton type="submit" variant="primary" :disabled="submitting">
              {{ submitting ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Criar Campeonato') }}
            </VButton>
          </div>
        </form>
      </VCard>
    </transition>

    <!-- Lista de Campeonatos -->
    <div v-if="loading" class="loading-state">
      <span class="loading-spinner">⚽</span>
      <p>Carregando campeonatos...</p>
    </div>

    <div v-else-if="championships.length === 0" class="empty-state">
      <span class="empty-icon">🏆</span>
      <p>Nenhum campeonato cadastrado no momento. Comece criando um!</p>
    </div>

    <div v-else class="championships-grid">
      <VCard v-for="champ in championships" :key="champ.id" class="champ-card" variant="default" :hoverable="true">
        <div class="champ-card-header">
          <div class="champ-logo-wrapper">
            <img 
              :src="champ.logoUrl || 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?q=80&w=100&auto=format&fit=crop'" 
              :alt="champ.name"
              class="champ-logo"
              @error="setDefaultLogo"
            />
          </div>
          <h3 class="champ-title">{{ champ.name }}</h3>
        </div>

        <div class="champ-card-actions">
          <VButton :to="`/admin/campeonatos/${champ.id}`" variant="primary" size="sm" class="action-btn enter-btn">
            Gerenciar
          </VButton>
          <div class="sub-actions">
            <VButton size="sm" @click="startEdit(champ)" class="action-btn edit-btn">
              ✏️ Editar
            </VButton>
            <VButton size="sm" variant="danger" @click="confirmDelete(champ)" class="action-btn delete-btn">
              🗑️
            </VButton>
          </div>
        </div>
      </VCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useHead, definePageMeta, navigateTo } from '#imports';
import { useApi } from '~/composables/useApi';
import VCard from '~/components/ui/VCard.vue';
import VButton from '~/components/ui/VButton.vue';

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
});

useHead({
  title: 'Gerenciar Campeonatos - La Resenha FC',
});

interface Championship {
  id: number;
  name: string;
  logoUrl?: string;
}

const { request } = useApi();

const championships = ref<Championship[]>([]);
const loading = ref(true);
const submitting = ref(false);
const showForm = ref(false);
const isEditing = ref(false);
const editingId = ref<number | null>(null);

const form = ref({
  name: '',
  logoUrl: ''
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

const loadChampionships = async () => {
  loading.value = true;
  try {
    const res = await request<any>('/championships');
    championships.value = Array.isArray(res) ? res : (res?.data || []);
  } catch (error) {
    console.error('Erro ao carregar campeonatos:', error);
    showFeedback('error', 'Não foi possível carregar a lista de campeonatos.');
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
    name: '',
    logoUrl: ''
  };
  isEditing.value = false;
  editingId.value = null;
};

const startEdit = (champ: Championship) => {
  form.value = {
    name: champ.name,
    logoUrl: champ.logoUrl || ''
  };
  editingId.value = champ.id;
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
  feedback.value = null;

  try {
    const payload = {
      name: form.value.name,
      logoUrl: form.value.logoUrl || null
    };

    if (isEditing.value && editingId.value !== null) {
      await request(`/championships/${editingId.value}`, {
        method: 'PATCH',
        body: payload
      });
      showFeedback('success', `Campeonato "${payload.name}" atualizado com sucesso!`);
    } else {
      await request('/championships', {
        method: 'POST',
        body: payload
      });
      showFeedback('success', `Campeonato "${payload.name}" criado com sucesso!`);
    }

    resetForm();
    showForm.value = false;
    await loadChampionships();
  } catch (error: any) {
    console.error('Erro ao salvar campeonato:', error);
    const apiErrorMsg = error.data?.message;
    const errorMsg = Array.isArray(apiErrorMsg) ? apiErrorMsg[0] : apiErrorMsg;
    showFeedback('error', errorMsg || 'Erro ao salvar o campeonato. Verifique se o nome já existe.');
  } finally {
    submitting.value = false;
  }
};

const confirmDelete = async (champ: Championship) => {
  if (confirm(`Tem certeza que deseja remover o campeonato "${champ.name}"? Isso removerá todas as classificações e desvinculará as partidas dele.`)) {
    try {
      await request(`/championships/${champ.id}`, {
        method: 'DELETE'
      });
      showFeedback('success', `Campeonato "${champ.name}" removido com sucesso.`);
      await loadChampionships();
    } catch (error) {
      console.error('Erro ao deletar campeonato:', error);
      showFeedback('error', 'Não foi possível remover o campeonato.');
    }
  }
};

const setDefaultLogo = (event: any) => {
  event.target.src = 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?q=80&w=100&auto=format&fit=crop';
};

const goToChampionship = (id: number) => {
  navigateTo(`/admin/campeonatos/${id}`);
};

onMounted(() => {
  loadChampionships();
});
</script>

<style scoped>
.admin-championships {
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

.new-champ-btn {
  font-size: 1.1rem;
  font-weight: 700;
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

.champ-form-card {
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

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  border-top: 2px solid rgba(255, 255, 255, 0.05);
  padding-top: 16px;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.25s ease-out;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
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

.championships-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

@media (min-width: 768px) {
  .championships-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1200px) {
  .championships-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.champ-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  padding: 20px !important;
}

.champ-card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.champ-logo-wrapper {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #262626;
  border: 2px solid var(--color-asphalt);
  border-radius: var(--radius-sm);
  box-shadow: 2px 2px 0px var(--color-asphalt);
  overflow: hidden;
  padding: 4px;
}

.champ-logo {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.champ-title {
  font-family: 'Oswald', sans-serif;
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-goal-white);
  margin: 0;
  text-transform: uppercase;
  line-height: 1.2;
}

.champ-card-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sub-actions {
  display: flex;
  gap: 8px;
}

.sub-actions .action-btn {
  flex-grow: 1;
}

.action-btn {
  font-weight: 700;
  font-size: 0.95rem;
}

.enter-btn {
  width: 100%;
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
