<template>
  <div class="admin-players">
    <div class="page-header">
      <div>
        <h1>Gerenciar Elenco</h1>
        <p class="page-subtitle">Adicione, edite ou remova atletas do La Resenha FC.</p>
      </div>
      <VButton @click="toggleForm" variant="primary" class="new-player-btn">
        {{ showForm ? 'Fechar Formulário ✖' : 'Novo Jogador 🏃' }}
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
      <VCard v-if="showForm" class="player-form-card" variant="featured">
        <h2 class="form-title">{{ isEditing ? 'Editar Atleta' : 'Cadastrar Novo Atleta' }}</h2>
        <form @submit.prevent="handleSubmit" class="player-form">
          <div class="form-grid">
            <div class="form-group">
              <label for="name">Nome Completo *</label>
              <input 
                v-model="form.name" 
                type="text" 
                id="name" 
                placeholder="Ex: Cristiano Ronaldo" 
                required
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="number">Número da Camisa *</label>
              <input 
                v-model.number="form.number" 
                type="number" 
                id="number" 
                placeholder="Ex: 7" 
                min="1"
                max="99"
                required
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="position">Posição em Campo *</label>
              <select v-model="form.position" id="position" required class="form-input">
                <option value="GOALKEEPER">Goleiro (GOALKEEPER)</option>
                <option value="DEFENDER">Defensor (DEFENDER)</option>
                <option value="MIDFIELDER">Meio-Campista (MIDFIELDER)</option>
                <option value="FORWARD">Atacante (FORWARD)</option>
              </select>
            </div>

            <div class="form-group">
              <label for="photoUrl">Link da Foto (Opcional)</label>
              <input 
                v-model="form.photoUrl" 
                type="url" 
                id="photoUrl" 
                placeholder="Ex: https://imagens.com/jogador.jpg" 
                class="form-input"
              />
            </div>
          </div>

          <div class="form-actions">
            <VButton type="button" @click="cancelEdit" variant="default">Cancelar</VButton>
            <VButton type="submit" variant="primary" :disabled="submitting">
              {{ submitting ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Cadastrar Atleta') }}
            </VButton>
          </div>
        </form>
      </VCard>
    </transition>

    <!-- Lista de Jogadores -->
    <VCard class="players-list-card">
      <div v-if="loading" class="loading-state">
        <span class="loading-spinner">⚽</span>
        <p>Carregando elenco...</p>
      </div>

      <div v-else-if="players.length === 0" class="empty-state">
        <span class="empty-icon">🏃</span>
        <p>Nenhum jogador cadastrado no momento. Comece adicionando um!</p>
      </div>

      <div v-else class="table-responsive">
        <table class="players-table">
          <thead>
            <tr>
              <th>Foto</th>
              <th>Nome</th>
              <th class="text-center">Número</th>
              <th>Posição</th>
              <th class="text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="player in players" :key="player.id">
              <td class="photo-cell">
                <img 
                  :src="player.photoUrl || 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?q=80&w=100&auto=format&fit=crop'" 
                  :alt="player.name"
                  class="player-avatar"
                />
              </td>
              <td class="name-cell">
                <span class="player-name">{{ player.name }}</span>
              </td>
              <td class="number-cell text-center">
                <span class="player-number">{{ player.number }}</span>
              </td>
              <td class="position-cell">
                <span :class="['pos-badge', `pos-badge--${player.position.toLowerCase()}`]">
                  {{ translatePosition(player.position) }}
                </span>
              </td>
              <td class="actions-cell text-center">
                <div class="actions-wrapper">
                  <VButton size="sm" @click="startEdit(player)" class="action-btn edit-btn">
                    ✏️ Editar
                  </VButton>
                  <VButton size="sm" variant="danger" @click="confirmDelete(player)" class="action-btn delete-btn">
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
  title: 'Gerenciar Elenco - La Resenha FC',
});

interface Player {
  id: number;
  name: string;
  number: number;
  position: string;
  photoUrl?: string;
}

const { request } = useApi();

const players = ref<Player[]>([]);
const loading = ref(true);
const submitting = ref(false);
const showForm = ref(false);
const isEditing = ref(false);
const editingId = ref<number | null>(null);

const form = ref({
  name: '',
  number: null as number | null,
  position: 'MIDFIELDER',
  photoUrl: ''
});

const feedback = ref<{ type: 'success' | 'error'; message: string } | null>(null);

const showFeedback = (type: 'success' | 'error', message: string) => {
  feedback.value = { type, message };
  // Auto-clear após 5 segundos se for sucesso
  if (type === 'success') {
    setTimeout(() => {
      if (feedback.value?.message === message) {
        feedback.value = null;
      }
    }, 5000);
  }
};

const loadPlayers = async () => {
  loading.value = true;
  try {
    const res = await request<any>('/players');
    players.value = Array.isArray(res) ? res : (res?.data || []);
    // Ordena por posição e depois número
    players.value.sort((a, b) => {
      const posOrder: Record<string, number> = { GOALKEEPER: 1, DEFENDER: 2, MIDFIELDER: 3, FORWARD: 4 };
      if (posOrder[a.position] !== posOrder[b.position]) {
        return posOrder[a.position] - posOrder[b.position];
      }
      return a.number - b.number;
    });
  } catch (error) {
    console.error('Erro ao carregar jogadores:', error);
    showFeedback('error', 'Não foi possível carregar a lista de jogadores. Tente novamente mais tarde.');
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
    number: null,
    position: 'MIDFIELDER',
    photoUrl: ''
  };
  isEditing.value = false;
  editingId.value = null;
};

const translatePosition = (pos: string) => {
  const translations: Record<string, string> = {
    GOALKEEPER: 'Goleiro',
    DEFENDER: 'Defensor',
    MIDFIELDER: 'Meio-Campista',
    FORWARD: 'Atacante'
  };
  return translations[pos] || pos;
};

const startEdit = (player: Player) => {
  form.value = {
    name: player.name,
    number: player.number,
    position: player.position,
    photoUrl: player.photoUrl || ''
  };
  editingId.value = player.id;
  isEditing.value = true;
  showForm.value = true;
  // Scroll suave até o formulário
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
      number: Number(form.value.number),
      position: form.value.position,
      photoUrl: form.value.photoUrl || null
    };

    if (isEditing.value && editingId.value !== null) {
      await request(`/players/${editingId.value}`, {
        method: 'PATCH',
        body: payload
      });
      showFeedback('success', `Atleta "${payload.name}" atualizado com sucesso!`);
    } else {
      await request('/players', {
        method: 'POST',
        body: payload
      });
      showFeedback('success', `Atleta "${payload.name}" cadastrado com sucesso!`);
    }

    resetForm();
    showForm.value = false;
    await loadPlayers();
  } catch (error: any) {
    console.error('Erro ao salvar jogador:', error);
    const apiErrorMsg = error.data?.message;
    const errorMsg = Array.isArray(apiErrorMsg) ? apiErrorMsg[0] : apiErrorMsg;
    showFeedback(
      'error', 
      errorMsg || 'Erro ao salvar atleta. Verifique se o número da camisa já está em uso.'
    );
  } finally {
    submitting.value = false;
  }
};

const confirmDelete = async (player: Player) => {
  if (confirm(`Tem certeza que deseja remover o atleta ${player.name} (Camisa ${player.number})?`)) {
    try {
      await request(`/players/${player.id}`, {
        method: 'DELETE'
      });
      showFeedback('success', `Atleta "${player.name}" removido com sucesso.`);
      await loadPlayers();
    } catch (error) {
      console.error('Erro ao deletar jogador:', error);
      showFeedback('error', 'Não foi possível remover o jogador.');
    }
  }
};

onMounted(() => {
  loadPlayers();
});
</script>

<style scoped>
.admin-players {
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

.new-player-btn {
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
.player-form-card {
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

/* Tabela de Jogadores */
.players-list-card {
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

.players-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.players-table th {
  background-color: var(--color-primary-container);
  color: var(--color-primary);
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 1.1rem;
  text-transform: uppercase;
  padding: 16px;
  border-bottom: 4px solid var(--color-asphalt);
}

.players-table td {
  padding: 14px 16px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.05);
  vertical-align: middle;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.15rem;
}

.players-table tbody tr:hover {
  background-color: rgba(255, 255, 255, 0.02);
}

.player-avatar {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border: 2px solid var(--color-asphalt);
  border-radius: var(--radius-sm);
  box-shadow: 2px 2px 0px var(--color-asphalt);
}

.player-name {
  font-weight: 700;
  color: var(--color-goal-white);
}

.player-number {
  font-family: 'Oswald', sans-serif;
  font-size: 1.3rem;
  font-weight: 700;
  background-color: var(--color-asphalt);
  color: var(--color-primary);
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Posições */
.pos-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
  font-weight: 700;
  text-transform: uppercase;
  border: 1.5px solid var(--color-asphalt);
  box-shadow: 1.5px 1.5px 0px var(--color-asphalt);
}

.pos-badge--goalkeeper {
  background-color: #ff9f43;
  color: #000;
}

.pos-badge--defender {
  background-color: #54a0ff;
  color: #000;
}

.pos-badge--midfielder {
  background-color: #5f27cd;
  color: #fff;
}

.pos-badge--forward {
  background-color: var(--color-primary);
  color: #000;
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
