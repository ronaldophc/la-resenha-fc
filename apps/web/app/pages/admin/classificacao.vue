<template>
  <div class="admin-standings">
    <div class="page-header">
      <div>
        <h1>Gerenciar Classificação</h1>
        <p class="page-subtitle">Gerencie as tabelas de classificação dos campeonatos que o La Resenha FC participa.</p>
      </div>
      <VButton @click="toggleForm" variant="primary" class="new-standing-btn">
        {{ showForm ? 'Fechar Formulário ✖' : 'Novo Time / Registro 🏆' }}
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
      <VCard v-if="showForm" class="standing-form-card" variant="featured">
        <h2 class="form-title">{{ isEditing ? 'Editar Registro de Classificação' : 'Adicionar Time à Classificação' }}</h2>
        <form @submit.prevent="handleSubmit" class="standing-form">
          <div class="form-grid">
            <div class="form-group">
              <label for="championship">Campeonato *</label>
              <input 
                v-model="form.championship" 
                type="text" 
                id="championship" 
                placeholder="Ex: Copa Várzea Curitiba 2026" 
                required
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="teamName">Nome do Time *</label>
              <input 
                v-model="form.teamName" 
                type="text" 
                id="teamName" 
                placeholder="Ex: La Resenha FC" 
                required
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="position">Posição na Tabela *</label>
              <input 
                v-model.number="form.position" 
                type="number" 
                id="position" 
                placeholder="Ex: 1" 
                min="1"
                required
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="won">Vitórias *</label>
              <input 
                v-model.number="form.won" 
                type="number" 
                id="won" 
                min="0"
                required
                class="form-input"
                @input="autoCalculate"
              />
            </div>

            <div class="form-group">
              <label for="drawn">Empates *</label>
              <input 
                v-model.number="form.drawn" 
                type="number" 
                id="drawn" 
                min="0"
                required
                class="form-input"
                @input="autoCalculate"
              />
            </div>

            <div class="form-group">
              <label for="lost">Derrotas *</label>
              <input 
                v-model.number="form.lost" 
                type="number" 
                id="lost" 
                min="0"
                required
                class="form-input"
                @input="autoCalculate"
              />
            </div>

            <div class="form-group">
              <label for="played">Jogos (Calculado automaticamente)</label>
              <input 
                v-model.number="form.played" 
                type="number" 
                id="played" 
                readonly
                class="form-input readonly-input"
              />
            </div>

            <div class="form-group">
              <label for="points">Pontos (Calculado automaticamente)</label>
              <input 
                v-model.number="form.points" 
                type="number" 
                id="points" 
                readonly
                class="form-input readonly-input"
              />
            </div>

            <div class="form-group">
              <label for="goalsFor">Gols Pró (Marcados) *</label>
              <input 
                v-model.number="form.goalsFor" 
                type="number" 
                id="goalsFor" 
                min="0"
                required
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="goalsAgainst">Gols Contra (Sofridos) *</label>
              <input 
                v-model.number="form.goalsAgainst" 
                type="number" 
                id="goalsAgainst" 
                min="0"
                required
                class="form-input"
              />
            </div>
          </div>

          <div class="form-actions">
            <VButton type="button" @click="cancelEdit" variant="default">Cancelar</VButton>
            <VButton type="submit" variant="primary" :disabled="submitting">
              {{ submitting ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Salvar Registro') }}
            </VButton>
          </div>
        </form>
      </VCard>
    </transition>

    <!-- Filtro de Campeonatos -->
    <div class="filter-section" v-if="championshipsList.length > 1">
      <span class="filter-label">Filtrar por Campeonato:</span>
      <div class="filter-buttons">
        <button 
          v-for="champ in championshipsList" 
          :key="champ"
          @click="selectedChampionship = champ"
          :class="['filter-btn', { 'filter-btn--active': selectedChampionship === champ }]"
        >
          {{ champ === 'all' ? 'Ver Todos 🌍' : champ }}
        </button>
      </div>
    </div>

    <!-- Lista de Classificação -->
    <VCard class="standings-list-card">
      <div v-if="loading" class="loading-state">
        <span class="loading-spinner">⚽</span>
        <p>Carregando tabela de classificação...</p>
      </div>

      <div v-else-if="filteredStandings.length === 0" class="empty-state">
        <span class="empty-icon">🏆</span>
        <p>Nenhum time ou registro de classificação cadastrado. Comece adicionando um!</p>
      </div>

      <div v-else class="table-responsive">
        <table class="standings-table">
          <thead>
            <tr>
              <th class="text-center">Pos</th>
              <th>Time</th>
              <th class="text-center">P</th>
              <th class="text-center">J</th>
              <th class="text-center">V</th>
              <th class="text-center">E</th>
              <th class="text-center">D</th>
              <th class="text-center">GP</th>
              <th class="text-center">GC</th>
              <th class="text-center">SG</th>
              <th>Campeonato</th>
              <th class="text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="standing in filteredStandings" :key="standing.id" :class="{ 'highlight-row': standing.teamName.toLowerCase().includes('resenha') }">
              <td class="pos-cell text-center font-bold">
                <span class="pos-num">{{ standing.position }}º</span>
              </td>
              <td class="team-cell font-bold">
                {{ standing.teamName }}
              </td>
              <td class="points-cell text-center font-bold">
                {{ standing.points }}
              </td>
              <td class="games-cell text-center">
                {{ standing.played }}
              </td>
              <td class="text-center">{{ standing.won }}</td>
              <td class="text-center">{{ standing.drawn }}</td>
              <td class="text-center">{{ standing.lost }}</td>
              <td class="text-center text-green">{{ standing.goalsFor }}</td>
              <td class="text-center text-red">{{ standing.goalsAgainst }}</td>
              <td class="text-center font-bold" :class="standing.goalsFor - standing.goalsAgainst >= 0 ? 'text-green' : 'text-red'">
                {{ standing.goalsFor - standing.goalsAgainst }}
              </td>
              <td class="champ-cell">
                <span class="champ-tag">{{ standing.championship }}</span>
              </td>
              <td class="actions-cell text-center">
                <div class="actions-wrapper">
                  <VButton size="sm" @click="startEdit(standing)" class="action-btn edit-btn">
                    ✏️
                  </VButton>
                  <VButton size="sm" variant="danger" @click="confirmDelete(standing)" class="action-btn delete-btn">
                    🗑️
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
import { ref, computed, onMounted } from 'vue';
import { useHead, definePageMeta } from '#imports';
import { useApi } from '~/composables/useApi';
import VCard from '~/components/ui/VCard.vue';
import VButton from '~/components/ui/VButton.vue';

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
});

useHead({
  title: 'Gerenciar Classificação - La Resenha FC',
});

interface Standing {
  id: number;
  position: number;
  teamName: string;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  championship: string;
}

const { request } = useApi();

const standings = ref<Standing[]>([]);
const loading = ref(true);
const submitting = ref(false);
const showForm = ref(false);
const isEditing = ref(false);
const editingId = ref<number | null>(null);

const form = ref({
  championship: '',
  teamName: '',
  position: 1,
  won: 0,
  drawn: 0,
  lost: 0,
  played: 0,
  points: 0,
  goalsFor: 0,
  goalsAgainst: 0
});

const feedback = ref<{ type: 'success' | 'error'; message: string } | null>(null);
const selectedChampionship = ref<string>('all');

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

const autoCalculate = () => {
  const won = Number(form.value.won) || 0;
  const drawn = Number(form.value.drawn) || 0;
  const lost = Number(form.value.lost) || 0;
  
  form.value.played = won + drawn + lost;
  form.value.points = (won * 3) + drawn;
};

const loadStandings = async () => {
  loading.value = true;
  try {
    const res = await request<any>('/standings');
    standings.value = Array.isArray(res) ? res : (res?.data || []);
    // Ordena por campeonato, depois posição na tabela
    standings.value.sort((a, b) => {
      if (a.championship !== b.championship) {
        return a.championship.localeCompare(b.championship);
      }
      return a.position - b.position;
    });
  } catch (error) {
    console.error('Erro ao carregar classificações:', error);
    showFeedback('error', 'Não foi possível carregar as tabelas de classificação.');
  } finally {
    loading.value = false;
  }
};

const championshipsList = computed(() => {
  const champs = standings.value.map(s => s.championship).filter(Boolean);
  const uniqueChamps = Array.from(new Set(champs));
  return ['all', ...uniqueChamps];
});

const filteredStandings = computed(() => {
  if (selectedChampionship.value === 'all') {
    return standings.value;
  }
  return standings.value.filter(s => s.championship === selectedChampionship.value);
});

const toggleForm = () => {
  showForm.value = !showForm.value;
  if (!showForm.value) {
    resetForm();
  }
};

const resetForm = () => {
  form.value = {
    championship: '',
    teamName: '',
    position: 1,
    won: 0,
    drawn: 0,
    lost: 0,
    played: 0,
    points: 0,
    goalsFor: 0,
    goalsAgainst: 0
  };
  isEditing.value = false;
  editingId.value = null;
};

const startEdit = (standing: Standing) => {
  form.value = {
    championship: standing.championship,
    teamName: standing.teamName,
    position: standing.position,
    won: standing.won,
    drawn: standing.drawn,
    lost: standing.lost,
    played: standing.played,
    points: standing.points,
    goalsFor: standing.goalsFor,
    goalsAgainst: standing.goalsAgainst
  };
  editingId.value = standing.id;
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
  
  // Recalcula só por garantia
  autoCalculate();

  try {
    const payload = {
      championship: form.value.championship,
      teamName: form.value.teamName,
      position: Number(form.value.position),
      won: Number(form.value.won),
      drawn: Number(form.value.drawn),
      lost: Number(form.value.lost),
      played: Number(form.value.played),
      points: Number(form.value.points),
      goalsFor: Number(form.value.goalsFor),
      goalsAgainst: Number(form.value.goalsAgainst)
    };

    if (isEditing.value && editingId.value !== null) {
      await request(`/standings/${editingId.value}`, {
        method: 'PATCH',
        body: payload
      });
      showFeedback('success', `Registro do time "${payload.teamName}" atualizado com sucesso!`);
    } else {
      await request('/standings', {
        method: 'POST',
        body: payload
      });
      showFeedback('success', `Time "${payload.teamName}" adicionado à classificação com sucesso!`);
    }

    resetForm();
    showForm.value = false;
    await loadStandings();
  } catch (error: any) {
    console.error('Erro ao salvar classificação:', error);
    const apiErrorMsg = error.data?.message;
    const errorMsg = Array.isArray(apiErrorMsg) ? apiErrorMsg[0] : apiErrorMsg;
    showFeedback('error', errorMsg || 'Erro ao salvar registro de classificação.');
  } finally {
    submitting.value = false;
  }
};

const confirmDelete = async (standing: Standing) => {
  if (confirm(`Tem certeza que deseja remover o registro do time "${standing.teamName}" do campeonato "${standing.championship}"?`)) {
    try {
      await request(`/standings/${standing.id}`, {
        method: 'DELETE'
      });
      showFeedback('success', 'Registro de classificação removido.');
      await loadStandings();
    } catch (error) {
      console.error('Erro ao deletar classificação:', error);
      showFeedback('error', 'Não foi possível remover o registro.');
    }
  }
};

onMounted(() => {
  loadStandings();
});
</script>

<style scoped>
.admin-standings {
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

.new-standing-btn {
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
.standing-form-card {
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

@media (min-width: 576px) {
  .form-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 992px) {
  .form-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* Campo campeonato e nome do time ocupam duas colunas */
.form-group:nth-child(1),
.form-group:nth-child(2) {
  @media (min-width: 992px) {
    grid-column: span 2;
  }
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

.readonly-input {
  background-color: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
  color: var(--color-primary);
  cursor: not-allowed;
  box-shadow: none;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  border-top: 2px solid rgba(255, 255, 255, 0.05);
  padding-top: 16px;
  @media (min-width: 992px) {
    grid-column: span 4;
  }
}

/* Filtros */
.filter-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: var(--color-surface-container-low);
  padding: 16px;
  border: 3px solid var(--color-asphalt);
  border-radius: var(--radius-sm);
  box-shadow: 4px 4px 0px var(--color-asphalt);
  align-items: flex-start;
}

@media (min-width: 768px) {
  .filter-section {
    flex-direction: row;
    align-items: center;
  }
}

.filter-label {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 1.2rem;
  text-transform: uppercase;
  color: var(--color-primary);
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-btn {
  background-color: var(--color-surface-container-high);
  color: var(--color-goal-white);
  border: 2px solid var(--color-asphalt);
  padding: 6px 12px;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  border-radius: var(--radius-sm);
  box-shadow: 2px 2px 0px var(--color-asphalt);
  transition: all 0.1s ease;
}

.filter-btn:hover {
  transform: translate(-1px, -1px);
  box-shadow: 3px 3px 0px var(--color-asphalt);
}

.filter-btn--active {
  background-color: var(--color-primary);
  color: #000;
  transform: translate(1px, 1px);
  box-shadow: 0px 0px 0px var(--color-asphalt);
}

/* Tabela de Classificação */
.standings-list-card {
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

.standings-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.standings-table th {
  background-color: var(--color-primary-container);
  color: var(--color-primary);
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 1.1rem;
  text-transform: uppercase;
  padding: 16px;
  border-bottom: 4px solid var(--color-asphalt);
}

.standings-table td {
  padding: 14px 16px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.05);
  vertical-align: middle;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.15rem;
}

.standings-table tbody tr:hover {
  background-color: rgba(255, 255, 255, 0.02);
}

.highlight-row {
  background-color: rgba(0, 255, 102, 0.05) !important;
  border-left: 6px solid var(--color-primary);
}

.highlight-row:hover {
  background-color: rgba(0, 255, 102, 0.08) !important;
}

.pos-num {
  font-family: 'Oswald', sans-serif;
  font-size: 1.25rem;
}

.champ-tag {
  display: inline-block;
  background-color: var(--color-surface-container-low);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
  font-weight: 700;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Helpers */
.font-bold {
  font-weight: 700;
}

.text-center {
  text-align: center;
}

.text-green {
  color: var(--color-primary);
}

.text-red {
  color: var(--color-error-red);
}

.actions-wrapper {
  display: flex;
  justify-content: center;
  gap: 6px;
}

.action-btn {
  font-weight: 700;
  padding: 6px 10px;
}

.edit-btn {
  background-color: #ffca28 !important;
  color: #000 !important;
  border-color: #ffca28 !important;
}

.edit-btn:hover {
  background-color: #ffd54f !important;
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
</style>
