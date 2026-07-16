<template>
  <div class="admin-championship-detail">
    <!-- Header com botão de voltar -->
    <div class="back-header">
      <NuxtLink to="/admin/campeonatos" class="back-link">
        ⬅️ Voltar aos Campeonatos
      </NuxtLink>
    </div>

    <div v-if="loadingChampionship" class="loading-state">
      <span class="loading-spinner">⚽</span>
      <p>Carregando detalhes do campeonato...</p>
    </div>

    <div v-else-if="!championship" class="empty-state">
      <span class="empty-icon">⚠️</span>
      <p>Campeonato não encontrado.</p>
    </div>

    <div v-else class="championship-content">
      <div class="page-header">
        <div class="champ-info-title">
          <div class="champ-logo-wrapper">
            <img 
              :src="championship.logoUrl || 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?q=80&w=100&auto=format&fit=crop'" 
              :alt="championship.name"
              class="champ-logo"
              @error="setDefaultLogo"
            />
          </div>
          <div>
            <h1>{{ championship.name }}</h1>
            <p class="page-subtitle">
              Inscreva os times participantes. A tabela é calculada automaticamente
              a partir dos resultados das partidas cadastradas.
            </p>
          </div>
        </div>
        <VButton @click="toggleForm" variant="primary" class="new-standing-btn">
          {{ showForm ? 'Fechar Formulário ✖' : 'Inscrever Time no Campeonato 🏆' }}
        </VButton>
      </div>

      <!-- Alertas de Feedback -->
      <div v-if="feedback" :class="['feedback-alert', `feedback-alert--${feedback.type}`]">
        <span class="feedback-icon">{{ feedback.type === 'success' ? '✅' : '⚠️' }}</span>
        <span class="feedback-message">{{ feedback.message }}</span>
        <button @click="feedback = null" class="feedback-close">×</button>
      </div>

      <!-- Formulário de Cadastro / Edição de Registro na Tabela -->
      <transition name="slide-fade">
        <VCard v-if="showForm" class="standing-form-card" variant="featured">
          <h2 class="form-title">{{ isEditing ? 'Ajuste de Pontos do Time' : 'Inscrever Time no Campeonato' }}</h2>
          <form @submit.prevent="handleSubmit" class="standing-form">
            <div class="form-grid">
              <!-- Seletor de Times Globais (Apenas na Criação) -->
              <div class="form-group" v-if="!isEditing">
                <label for="teamId">Selecionar Time *</label>
                <select v-model="form.teamId" id="teamId" required class="form-input">
                  <option value="" disabled>-- Selecione um time --</option>
                  <option v-for="team in availableTeams" :key="team.id" :value="team.id">
                    {{ team.name }}
                  </option>
                </select>
                <p class="form-help">
                  Não achou o time? Crie ele antes na página
                  <NuxtLink to="/admin/times" class="link-in-text">Gerenciar Times</NuxtLink>.
                </p>
              </div>

              <!-- Exibição do Nome do Time na Edição -->
              <div class="form-group" v-else>
                <label>Time</label>
                <input type="text" :value="editingTeamName" disabled class="form-input readonly-input" />
              </div>

              <div class="form-group">
                <label for="pointsAdjustment">Ajuste de Pontos (punição/W.O.)</label>
                <input
                  v-model.number="form.pointsAdjustment"
                  type="number"
                  id="pointsAdjustment"
                  placeholder="Ex: -3"
                  class="form-input"
                />
                <p class="form-help">
                  Somado ao total calculado. Use valores negativos para punições. Deixe 0 se não houver ajuste.
                </p>
              </div>
            </div>

            <div class="form-actions">
              <VButton type="button" @click="cancelEdit" variant="outline">Cancelar</VButton>
              <VButton type="submit" variant="primary" :disabled="submitting">
                {{ submitting ? 'Salvando...' : (isEditing ? 'Salvar Ajuste' : 'Inscrever Time') }}
              </VButton>
            </div>
          </form>
        </VCard>
      </transition>

      <!-- Tabela de Classificação do Campeonato -->
      <VCard class="standings-list-card">
        <div v-if="championship.standings.length === 0" class="empty-state">
          <span class="empty-icon">🏆</span>
          <p>Nenhum time inscrito neste campeonato. Inscreva os times participantes — a tabela será montada automaticamente conforme as partidas forem cadastradas!</p>
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
                <th class="text-center" title="Ajuste manual de pontos">Ajuste</th>
                <th class="text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="standing in championship.standings" 
                :key="standing.id" 
                :class="{ 'highlight-row': standing.team?.name.toLowerCase().includes('resenha') }"
              >
                <td class="pos-cell text-center font-bold">
                  <span class="pos-num">{{ standing.position }}º</span>
                </td>
                <td class="team-cell font-bold text-white">
                  <div class="table-team-info">
                    <img 
                      :src="standing.team?.logoUrl || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=100&auto=format&fit=crop'" 
                      :alt="standing.team?.name"
                      class="table-team-logo"
                      @error="setDefaultTeamLogo"
                    />
                    <span>{{ standing.team?.name }}</span>
                  </div>
                </td>
                <td class="points-cell text-center font-bold text-primary">
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
                <td class="text-center" :class="{ 'text-red': (standing.pointsAdjustment || 0) < 0, 'text-green': (standing.pointsAdjustment || 0) > 0 }">
                  {{ (standing.pointsAdjustment || 0) > 0 ? '+' : '' }}{{ standing.pointsAdjustment || 0 }}
                </td>
                <td class="actions-cell text-center">
                  <div class="actions-wrapper">
                    <VButton size="sm" @click="startEdit(standing)" class="action-btn edit-btn">
                      ⚖️ Ajuste
                    </VButton>
                    <VButton size="sm" variant="danger" @click="confirmDelete(standing)" class="action-btn delete-btn">
                      🗑️ Remover
                    </VButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </VCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useHead, definePageMeta } from '#imports';
import { useApi } from '~/composables/useApi';
import VCard from '~/components/ui/VCard.vue';
import VButton from '~/components/ui/VButton.vue';

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
});

useHead({
  title: 'Detalhes do Campeonato - La Resenha FC',
});

interface Team {
  id: number;
  name: string;
  logoUrl?: string;
}

interface Standing {
  id: number;
  championshipId: number;
  teamId: number;
  position: number;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  pointsAdjustment?: number;
  team: Team;
}

interface ChampionshipDetail {
  id: number;
  name: string;
  logoUrl?: string;
  standings: Standing[];
}

const route = useRoute();
const champId = Number(route.params.id);

const { request } = useApi();

const championship = ref<ChampionshipDetail | null>(null);
const globalTeams = ref<Team[]>([]);
const loadingChampionship = ref(true);
const submitting = ref(false);
const showForm = ref(false);
const isEditing = ref(false);
const editingStandingId = ref<number | null>(null);
const editingTeamName = ref('');

const form = ref({
  teamId: '' as number | '',
  pointsAdjustment: 0
});

// Só oferece times que ainda não estão inscritos no campeonato
const availableTeams = computed(() => {
  const enrolledIds = new Set((championship.value?.standings || []).map(s => s.teamId));
  return globalTeams.value.filter(t => !enrolledIds.has(t.id));
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

const loadChampionshipDetails = async () => {
  loadingChampionship.value = true;
  try {
    const res = await request<any>(`/championships/${champId}`);
    championship.value = res?.data || res;
    
    // Ordena os standings por posição
    if (championship.value && championship.value.standings) {
      championship.value.standings.sort((a, b) => a.position - b.position);
    }
  } catch (error) {
    console.error('Erro ao carregar campeonato:', error);
    showFeedback('error', 'Não foi possível carregar os detalhes do campeonato.');
  } finally {
    loadingChampionship.value = false;
  }
};

const loadGlobalTeams = async () => {
  try {
    const res = await request<any>('/teams');
    globalTeams.value = Array.isArray(res) ? res : (res?.data || []);
  } catch (error) {
    console.error('Erro ao carregar times globais:', error);
  }
};

const toggleForm = () => {
  showForm.value = !showForm.value;
  if (!showForm.value) {
    resetForm();
  } else {
    loadGlobalTeams();
  }
};

const resetForm = () => {
  form.value = {
    teamId: '',
    pointsAdjustment: 0
  };
  isEditing.value = false;
  editingStandingId.value = null;
  editingTeamName.value = '';
};

const startEdit = (standing: Standing) => {
  form.value = {
    teamId: standing.teamId,
    pointsAdjustment: standing.pointsAdjustment ?? 0
  };
  editingStandingId.value = standing.id;
  editingTeamName.value = standing.team?.name || 'Time';
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
    if (isEditing.value && editingStandingId.value !== null) {
      await request(`/standings/${editingStandingId.value}`, {
        method: 'PUT',
        body: { pointsAdjustment: Number(form.value.pointsAdjustment) || 0 }
      });
      showFeedback('success', 'Ajuste de pontos salvo com sucesso!');
    } else {
      await request('/standings', {
        method: 'POST',
        body: {
          championshipId: champId,
          teamId: Number(form.value.teamId),
          pointsAdjustment: Number(form.value.pointsAdjustment) || 0
        }
      });
      showFeedback('success', 'Time inscrito no campeonato com sucesso!');
    }

    resetForm();
    showForm.value = false;
    await loadChampionshipDetails();
  } catch (error: any) {
    console.error('Erro ao salvar classificação:', error);
    const apiErrorMsg = error.data?.message;
    const errorMsg = Array.isArray(apiErrorMsg) ? apiErrorMsg[0] : apiErrorMsg;
    showFeedback('error', errorMsg || 'Erro ao salvar a classificação. Verifique se este time já está na tabela.');
  } finally {
    submitting.value = false;
  }
};

const confirmDelete = async (standing: Standing) => {
  if (confirm(`Tem certeza que deseja remover a inscrição do time "${standing.team?.name}" deste campeonato? Ele sai da tabela, mas as partidas dele continuam cadastradas.`)) {
    try {
      await request(`/standings/${standing.id}`, {
        method: 'DELETE'
      });
      showFeedback('success', `Time "${standing.team?.name}" removido com sucesso.`);
      await loadChampionshipDetails();
    } catch (error) {
      console.error('Erro ao remover classificação:', error);
      showFeedback('error', 'Não foi possível remover o time da tabela.');
    }
  }
};

const setDefaultLogo = (event: any) => {
  event.target.src = 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?q=80&w=100&auto=format&fit=crop';
};

const setDefaultTeamLogo = (event: any) => {
  event.target.src = 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=100&auto=format&fit=crop';
};

onMounted(() => {
  loadChampionshipDetails();
  loadGlobalTeams();
});
</script>

<style scoped>
.admin-championship-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.back-header {
  margin-bottom: 8px;
}

.back-link {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-primary);
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.back-link:hover {
  text-decoration: underline;
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

@media (min-width: 992px) {
  .page-header {
    flex-direction: row;
    align-items: center;
  }
}

.champ-info-title {
  display: flex;
  align-items: center;
  gap: 20px;
}

.champ-logo-wrapper {
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #262626;
  border: 3px solid var(--color-asphalt);
  border-radius: var(--radius-sm);
  box-shadow: 3px 3px 0px var(--color-asphalt);
  overflow: hidden;
  padding: 4px;
}

.champ-logo {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
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
    grid-template-columns: repeat(3, 1fr);
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
  width: 100%;
}

.form-input:focus {
  border-color: var(--color-primary);
  outline: none;
  box-shadow: 2px 2px 0px var(--color-primary);
}

.readonly-input {
  background-color: var(--color-surface-container);
  color: #888;
  cursor: not-allowed;
}

.form-help {
  font-size: 0.95rem;
  color: #a3a3a3;
  margin: 4px 0 0 0;
}

.link-in-text {
  color: var(--color-primary);
  text-decoration: underline;
  font-weight: bold;
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
  background-color: rgba(255, 167, 38, 0.08) !important;
}

.pos-cell {
  width: 60px;
}

.pos-num {
  font-family: 'Oswald', sans-serif;
  font-size: 1.25rem;
}

.table-team-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.table-team-logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
  border: 1.5px solid var(--color-asphalt);
  background-color: #262626;
  border-radius: var(--radius-sm);
  padding: 2px;
}

.points-cell {
  font-size: 1.25rem;
}

.text-green {
  color: var(--color-vibrant-turf) !important;
}

.text-red {
  color: var(--color-error-red) !important;
}

.font-bold {
  font-weight: 700;
}

.text-center {
  text-align: center;
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
