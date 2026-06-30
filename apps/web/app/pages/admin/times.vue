<template>
  <div class="admin-teams">
    <div class="page-header">
      <div>
        <h1>Gerenciar Times</h1>
        <p class="page-subtitle">Cadastre e gerencie os times que participam dos campeonatos.</p>
      </div>
      <VButton @click="toggleForm" variant="primary" class="new-team-btn">
        {{ showForm ? 'Fechar Formulário ✖' : 'Novo Time 🛡️' }}
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
      <VCard v-if="showForm" class="team-form-card" variant="featured">
        <h2 class="form-title">{{ isEditing ? 'Editar Time' : 'Cadastrar Novo Time' }}</h2>
        <form @submit.prevent="handleSubmit" class="team-form">
          <div class="form-grid">
            <div class="form-group">
              <label for="name">Nome do Time *</label>
              <input 
                v-model="form.name" 
                type="text" 
                id="name" 
                placeholder="Ex: La Resenha FC" 
                required
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="logoUrl">Link do Escudo / Logo (Opcional)</label>
              <input 
                v-model="form.logoUrl" 
                type="url" 
                id="logoUrl" 
                placeholder="Ex: https://imagens.com/escudo.png" 
                class="form-input"
              />
            </div>
          </div>

          <div class="form-actions">
            <VButton type="button" @click="cancelEdit" variant="outline">Cancelar</VButton>
            <VButton type="submit" variant="primary" :disabled="submitting">
              {{ submitting ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Cadastrar Time') }}
            </VButton>
          </div>
        </form>
      </VCard>
    </transition>

    <!-- Lista de Times -->
    <VCard class="teams-list-card">
      <div v-if="loading" class="loading-state">
        <span class="loading-spinner">⚽</span>
        <p>Carregando times...</p>
      </div>

      <div v-else-if="teams.length === 0" class="empty-state">
        <span class="empty-icon">🛡️</span>
        <p>Nenhum time cadastrado no momento. Comece adicionando um!</p>
      </div>

      <div v-else class="table-responsive">
        <table class="teams-table">
          <thead>
            <tr>
              <th>Escudo</th>
              <th>Nome do Time</th>
              <th class="text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="team in teams" :key="team.id">
              <td class="logo-cell">
                <img 
                  :src="team.logoUrl || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=100&auto=format&fit=crop'" 
                  :alt="team.name"
                  class="team-logo"
                  @error="setDefaultLogo"
                />
              </td>
              <td class="name-cell font-bold text-white">
                {{ team.name }}
              </td>
              <td class="actions-cell text-center">
                <div class="actions-wrapper">
                  <VButton size="sm" @click="startEdit(team)" class="action-btn edit-btn">
                    ✏️ Editar
                  </VButton>
                  <VButton size="sm" variant="danger" @click="confirmDelete(team)" class="action-btn delete-btn">
                    🗑️ Excluir
                  </VButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </VCard>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useHead, definePageMeta } from '#imports';
import { useApi } from '~/composables/useApi';
import VCard from '~/components/ui/VCard.vue';
import VButton from '~/components/ui/VButton.vue';

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
});

useHead({
  title: 'Gerenciar Times - La Resenha FC',
});

interface Team {
  id: number;
  name: string;
  logoUrl?: string;
}

const { request } = useApi();

const teams = ref<Team[]>([]);
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

const loadTeams = async () => {
  loading.value = true;
  try {
    const res = await request<any>('/teams');
    teams.value = Array.isArray(res) ? res : (res?.data || []);
  } catch (error) {
    console.error('Erro ao carregar times:', error);
    showFeedback('error', 'Não foi possível carregar a lista de times.');
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

const startEdit = (team: Team) => {
  form.value = {
    name: team.name,
    logoUrl: team.logoUrl || ''
  };
  editingId.value = team.id;
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
      await request(`/teams/${editingId.value}`, {
        method: 'PATCH',
        body: payload
      });
      showFeedback('success', `Time "${payload.name}" atualizado com sucesso!`);
    } else {
      await request('/teams', {
        method: 'POST',
        body: payload
      });
      showFeedback('success', `Time "${payload.name}" cadastrado com sucesso!`);
    }

    resetForm();
    showForm.value = false;
    await loadTeams();
  } catch (error: any) {
    console.error('Erro ao salvar time:', error);
    const apiErrorMsg = error.data?.message;
    const errorMsg = Array.isArray(apiErrorMsg) ? apiErrorMsg[0] : apiErrorMsg;
    showFeedback('error', errorMsg || 'Erro ao salvar o time. Verifique se o nome já existe.');
  } finally {
    submitting.value = false;
  }
};

const confirmDelete = async (team: Team) => {
  if (confirm(`Tem certeza que deseja remover o time "${team.name}"? Isso removerá o time de todos os campeonatos e classificações.`)) {
    try {
      await request(`/teams/${team.id}`, {
        method: 'DELETE'
      });
      showFeedback('success', `Time "${team.name}" removido com sucesso.`);
      await loadTeams();
    } catch (error) {
      console.error('Erro ao deletar time:', error);
      showFeedback('error', 'Não foi possível remover o time.');
    }
  }
};

const setDefaultLogo = (event: any) => {
  event.target.src = 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=100&auto=format&fit=crop';
};

onMounted(() => {
  loadTeams();
});
</script>

<style scoped>
.admin-teams {
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

.new-team-btn {
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

.team-form-card {
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

.teams-list-card {
  padding: 0 !important;
  overflow: hidden;
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

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.teams-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.teams-table th {
  background-color: var(--color-primary-container);
  color: var(--color-primary);
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 1.1rem;
  text-transform: uppercase;
  padding: 16px;
  border-bottom: 4px solid var(--color-asphalt);
}

.teams-table td {
  padding: 14px 16px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.05);
  vertical-align: middle;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.15rem;
}

.teams-table tbody tr:hover {
  background-color: rgba(255, 255, 255, 0.02);
}

.team-logo {
  width: 50px;
  height: 50px;
  object-fit: contain;
  border: 2px solid var(--color-asphalt);
  background-color: #262626;
  border-radius: var(--radius-sm);
  box-shadow: 2px 2px 0px var(--color-asphalt);
  padding: 4px;
}

.actions-wrapper {
  display: flex;
  justify-content: center;
  gap: 8px;
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
