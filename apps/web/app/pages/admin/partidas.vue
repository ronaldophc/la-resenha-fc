<template>
  <div class="admin-matches">
    <div class="page-header">
      <div>
        <h1>Gerenciar Partidas</h1>
        <p class="page-subtitle">Cadastre os resultados e as informações de confrontos do La Resenha FC.</p>
      </div>
      <VButton @click="toggleForm" variant="primary" class="new-match-btn">
        {{ showForm ? 'Fechar Formulário ✖' : 'Nova Partida ⚽' }}
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
      <VCard v-if="showForm" class="match-form-card" variant="featured">
        <h2 class="form-title">{{ isEditing ? 'Editar Partida' : 'Registrar Nova Partida' }}</h2>
        <form @submit.prevent="handleSubmit" class="match-form">
          <div class="form-grid">
            <div class="form-group">
              <label for="opponentSelect">Adversário *</label>
              <select 
                v-model="opponentSelectValue" 
                id="opponentSelect" 
                required
                class="form-input"
              >
                <option value="" disabled>Selecione um adversário</option>
                <option v-for="team in filteredTeams" :key="team.id" :value="team.name">
                  {{ team.name }}
                </option>
                <option value="custom">Outro (Digitar nome...)</option>
              </select>
            </div>

            <div v-if="opponentSelectValue === 'custom'" class="form-group">
              <label for="opponentCustom">Nome do Adversário *</label>
              <input 
                v-model="customOpponentName" 
                type="text" 
                id="opponentCustom" 
                placeholder="Ex: Real Madrid da Várzea" 
                required
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="championshipId">Campeonato / Torneio (Opcional)</label>
              <select 
                v-model="form.championshipId" 
                id="championshipId" 
                class="form-input"
              >
                <option value="">Amistoso (Nenhum)</option>
                <option v-for="champ in championshipsList" :key="champ.id" :value="champ.id">
                  {{ champ.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="date">Data e Horário *</label>
              <input 
                v-model="form.date" 
                type="datetime-local" 
                id="date" 
                required
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="location">Local / Campo *</label>
              <input 
                v-model="form.location" 
                type="text" 
                id="location" 
                placeholder="Ex: Arena Várzea, Campo de Terra" 
                required
                class="form-input"
              />
            </div>

            <div class="form-group score-group">
              <label>Placar do Jogo *</label>
              <div class="score-inputs">
                <div class="score-field">
                  <span class="score-label">La Resenha FC</span>
                  <input 
                    v-model.number="form.homeScore" 
                    type="number" 
                    min="0" 
                    required
                    class="form-input score-input-box"
                  />
                </div>
                <span class="score-divider">X</span>
                <div class="score-field">
                  <span class="score-label">Adversário</span>
                  <input 
                    v-model.number="form.awayScore" 
                    type="number" 
                    min="0" 
                    required
                    class="form-input score-input-box"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <VButton type="button" @click="cancelEdit" variant="default">Cancelar</VButton>
            <VButton type="submit" variant="primary" :disabled="submitting">
              {{ submitting ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Registrar Partida') }}
            </VButton>
          </div>
        </form>
      </VCard>
    </transition>

    <!-- Lista de Partidas -->
    <VCard class="matches-list-card">
      <div v-if="loading" class="loading-state">
        <span class="loading-spinner">⚽</span>
        <p>Carregando partidas...</p>
      </div>

      <div v-else-if="matches.length === 0" class="empty-state">
        <span class="empty-icon">📅</span>
        <p>Nenhuma partida registrada no momento. Comece registrando uma!</p>
      </div>

      <div v-else class="table-responsive">
        <table class="matches-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Adversário</th>
              <th class="text-center">Placar</th>
              <th>Local</th>
              <th>Campeonato</th>
              <th class="text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="match in matches" :key="match.id">
              <td class="date-cell">
                <span class="match-date">{{ formatDate(match.date) }}</span>
              </td>
              <td class="opponent-cell">
                <span class="match-opponent">{{ match.opponent }}</span>
              </td>
              <td class="score-cell text-center">
                <span :class="['score-badge', getMatchResultClass(match)]">
                  {{ match.homeScore }} x {{ match.awayScore }}
                </span>
              </td>
              <td class="location-cell">
                <span class="match-location">📍 {{ match.location }}</span>
              </td>
              <td class="championship-cell">
                <span v-if="match.championship" class="champ-badge">🏆 {{ match.championship.name }}</span>
                <span v-else class="text-muted">Amistoso</span>
              </td>
              <td class="actions-cell text-center">
                <div class="actions-wrapper">
                  <VButton size="sm" @click="startEdit(match)" class="action-btn edit-btn">
                    ✏️ Editar
                  </VButton>
                  <VButton size="sm" variant="danger" @click="confirmDelete(match)" class="action-btn delete-btn">
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
import { ref, onMounted, computed } from 'vue';
import { useHead, definePageMeta } from '#imports';
import { useApi } from '~/composables/useApi';
import VCard from '~/components/ui/VCard.vue';
import VButton from '~/components/ui/VButton.vue';

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
});

useHead({
  title: 'Gerenciar Partidas - La Resenha FC',
});

interface Team {
  id: number;
  name: string;
}

interface Championship {
  id: number;
  name: string;
}

interface Match {
  id: number;
  date: string;
  opponent: string;
  location: string;
  homeScore: number;
  awayScore: number;
  championshipId?: number | null;
  championship?: Championship | null;
}

const { request } = useApi();

const matches = ref<Match[]>([]);
const loading = ref(true);
const submitting = ref(false);
const showForm = ref(false);
const isEditing = ref(false);
const editingId = ref<number | null>(null);

const championshipsList = ref<Championship[]>([]);
const teamsList = ref<Team[]>([]);

const opponentSelectValue = ref('');
const customOpponentName = ref('');

const filteredTeams = computed(() => {
  return teamsList.value.filter(team => {
    const name = team.name.toLowerCase();
    return !name.includes('la resenha');
  });
});

const form = ref({
  opponent: '',
  championshipId: '' as number | '',
  date: '',
  location: '',
  homeScore: 0,
  awayScore: 0
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
  try {
    const res = await request<any>('/championships');
    championshipsList.value = Array.isArray(res) ? res : (res?.data || []);
  } catch (error) {
    console.error('Erro ao carregar campeonatos para select:', error);
  }
};

const loadTeams = async () => {
  try {
    const res = await request<any>('/teams');
    teamsList.value = Array.isArray(res) ? res : (res?.data || []);
  } catch (error) {
    console.error('Erro ao carregar times para select:', error);
  }
};

const loadMatches = async () => {
  loading.value = true;
  try {
    const res = await request<any>('/matches');
    matches.value = Array.isArray(res) ? res : (res?.data || []);
    // Ordena por data decrescente (mais recentes primeiro)
    matches.value.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Erro ao carregar partidas:', error);
    showFeedback('error', 'Não foi possível carregar a lista de partidas. Tente novamente mais tarde.');
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
    opponent: '',
    championshipId: '',
    date: '',
    location: '',
    homeScore: 0,
    awayScore: 0
  };
  opponentSelectValue.value = '';
  customOpponentName.value = '';
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

const getMatchResultClass = (match: Match) => {
  if (match.homeScore > match.awayScore) return 'score-badge--win';
  if (match.homeScore < match.awayScore) return 'score-badge--loss';
  return 'score-badge--draw';
};

const startEdit = (match: Match) => {
  // Formata a data de ISO string para YYYY-MM-DDTHH:MM exigido pelo input datetime-local
  const d = new Date(match.date);
  // Ajusta para o fuso horário local antes de formatar
  const tzOffset = d.getTimezoneOffset() * 60000;
  const localISOTime = (new Date(d.getTime() - tzOffset)).toISOString().slice(0, 16);

  form.value = {
    opponent: match.opponent,
    championshipId: match.championshipId || '',
    date: localISOTime,
    location: match.location,
    homeScore: match.homeScore,
    awayScore: match.awayScore
  };

  // Mapeia o nome do adversário de volta para o select ou custom input
  const matchOpponent = match.opponent;
  const teamExists = filteredTeams.value.some(t => t.name.toLowerCase() === matchOpponent.toLowerCase());
  if (teamExists) {
    opponentSelectValue.value = matchOpponent;
    customOpponentName.value = '';
  } else {
    opponentSelectValue.value = 'custom';
    customOpponentName.value = matchOpponent;
  }

  editingId.value = match.id;
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
    const opponentName = opponentSelectValue.value === 'custom'
      ? customOpponentName.value
      : opponentSelectValue.value;

    const payload = {
      opponent: opponentName,
      championshipId: form.value.championshipId ? Number(form.value.championshipId) : null,
      date: new Date(form.value.date).toISOString(),
      location: form.value.location,
      homeScore: Number(form.value.homeScore),
      awayScore: Number(form.value.awayScore)
    };

    if (isEditing.value && editingId.value !== null) {
      await request(`/matches/${editingId.value}`, {
        method: 'PATCH',
        body: payload
      });
      showFeedback('success', `Partida contra "${payload.opponent}" atualizada com sucesso!`);
    } else {
      await request('/matches', {
        method: 'POST',
        body: payload
      });
      showFeedback('success', `Partida contra "${payload.opponent}" registrada com sucesso!`);
    }

    resetForm();
    showForm.value = false;
    await loadMatches();
  } catch (error: any) {
    console.error('Erro ao salvar partida:', error);
    const apiErrorMsg = error.data?.message;
    const errorMsg = Array.isArray(apiErrorMsg) ? apiErrorMsg[0] : apiErrorMsg;
    showFeedback('error', errorMsg || 'Erro ao salvar partida. Verifique os dados inseridos.');
  } finally {
    submitting.value = false;
  }
};

const confirmDelete = async (match: Match) => {
  if (confirm(`Tem certeza que deseja remover a partida contra o ${match.opponent}?`)) {
    try {
      await request(`/matches/${match.id}`, {
        method: 'DELETE'
      });
      showFeedback('success', 'Partida removida com sucesso.');
      await loadMatches();
    } catch (error) {
      console.error('Erro ao deletar partida:', error);
      showFeedback('error', 'Não foi possível remover a partida.');
    }
  }
};

onMounted(() => {
  loadMatches();
  loadChampionships();
  loadTeams();
});
</script>

<style scoped>
.admin-matches {
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

.new-match-btn {
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
.match-form-card {
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

.score-group {
  grid-column: 1 / -1;
  background-color: rgba(255, 255, 255, 0.02);
  padding: 16px;
  border: 2px dashed var(--color-outline-variant);
  border-radius: var(--radius-sm);
}

.score-inputs {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 8px;
}

.score-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 120px;
}

.score-label {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #a3a3a3;
}

.score-input-box {
  text-align: center;
  font-family: 'Oswald', sans-serif;
  font-size: 1.5rem;
}

.score-divider {
  font-family: 'Oswald', sans-serif;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-primary);
  align-self: flex-end;
  margin-bottom: 6px;
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

/* Tabela de Partidas */
.matches-list-card {
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

.matches-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.matches-table th {
  background-color: var(--color-primary-container);
  color: var(--color-primary);
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 1.1rem;
  text-transform: uppercase;
  padding: 16px;
  border-bottom: 4px solid var(--color-asphalt);
}

.matches-table td {
  padding: 14px 16px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.05);
  vertical-align: middle;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.15rem;
}

.matches-table tbody tr:hover {
  background-color: rgba(255, 255, 255, 0.02);
}

.match-date {
  font-weight: 700;
  color: var(--color-goal-white);
  display: block;
}

.match-opponent {
  font-weight: 700;
  color: var(--color-primary);
}

/* Placar */
.score-badge {
  display: inline-block;
  font-family: 'Oswald', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: var(--radius-sm);
  border: 2px solid var(--color-asphalt);
  box-shadow: 2px 2px 0px var(--color-asphalt);
}

.score-badge--win {
  background-color: var(--color-primary);
  color: #000;
}

.score-badge--loss {
  background-color: var(--color-error-red);
  color: #fff;
}

.score-badge--draw {
  background-color: #7f8c8d;
  color: #fff;
}

.match-location {
  color: #cccccc;
}

.champ-badge {
  display: inline-block;
  background-color: var(--color-surface-container-low);
  color: var(--color-goal-white);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
  font-weight: 700;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.text-muted {
  color: #666;
  font-style: italic;
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
