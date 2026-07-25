<template>
  <div class="admin-matches">
    <div class="page-header">
      <div>
        <h1>Gerenciar Partidas</h1>
        <p class="page-subtitle">Cadastre os resultados e as informações de confrontos do La Resenha FC.</p>
      </div>
      <VButton @click="openForm" variant="primary" class="new-match-btn">
        Nova Partida ⚽
      </VButton>
    </div>

    <!-- Formulário de Cadastro / Edição -->
    <VModal v-model="showForm" :title="isEditing ? 'Editar Partida' : 'Registrar Nova Partida'">
        <form @submit.prevent="handleSubmit" class="match-form">
          <div class="form-grid">
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
              <p v-if="form.championshipId" class="form-help">
                Partida de campeonato: os dois times precisam estar cadastrados.
                O resultado entra automaticamente na tabela de classificação.
              </p>
            </div>

            <div class="form-group">
              <label for="homeTeamId">Time Mandante *</label>
              <select
                v-model="form.homeTeamId"
                id="homeTeamId"
                required
                class="form-input"
              >
                <option value="" disabled>Selecione o mandante</option>
                <option v-for="team in teamsList" :key="team.id" :value="team.id">
                  {{ team.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="awayTeamId">Time Visitante *</label>
              <select
                v-model="form.awayTeamId"
                id="awayTeamId"
                required
                class="form-input"
              >
                <option value="" disabled>Selecione o visitante</option>
                <option v-for="team in teamsList" :key="team.id" :value="team.id">
                  {{ team.name }}
                </option>
                <option v-if="!form.championshipId" value="custom">Outro (Digitar nome...)</option>
              </select>
            </div>

            <div v-if="form.awayTeamId === 'custom'" class="form-group">
              <label for="opponentCustom">Nome do Adversário *</label>
              <input
                v-model="customOpponentName"
                type="text"
                id="opponentCustom"
                placeholder="Ex: Real Madrid da Várzea"
                required
                class="form-input"
              />
              <p class="form-help">Disponível apenas para amistosos. Times de campeonato precisam estar cadastrados.</p>
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
              <label>Placar do Jogo</label>
              <div class="score-inputs">
                <div class="score-field">
                  <span class="score-label">{{ homeTeamLabel }}</span>
                  <input
                    v-model.number="form.homeScore"
                    type="number"
                    min="0"
                    placeholder="-"
                    class="form-input score-input-box"
                  />
                </div>
                <span class="score-divider">X</span>
                <div class="score-field">
                  <span class="score-label">{{ awayTeamLabel }}</span>
                  <input
                    v-model.number="form.awayScore"
                    type="number"
                    min="0"
                    placeholder="-"
                    class="form-input score-input-box"
                  />
                </div>
              </div>
              <p class="form-help">Deixe os dois campos vazios para partida agendada (ainda não realizada).</p>
            </div>

            <!-- Campos de mata-mata / grupos (só para partidas de campeonato) -->
            <template v-if="form.championshipId">
              <div class="form-group">
                <label for="phase">Fase (mata-mata)</label>
                <input
                  v-model="form.phase"
                  type="text"
                  id="phase"
                  maxlength="60"
                  placeholder="Ex: Final, Semifinal, Oitavas"
                  class="form-input"
                />
                <p class="form-help">Preencha em jogos de mata-mata. Deixe vazio em pontos corridos.</p>
              </div>

              <div class="form-group">
                <label for="matchGroup">Grupo (fase de grupos)</label>
                <input
                  v-model="form.groupName"
                  type="text"
                  id="matchGroup"
                  maxlength="30"
                  placeholder="Ex: A"
                  class="form-input"
                />
                <p class="form-help">Preencha em jogos de fase de grupos (entra na tabela do grupo).</p>
              </div>

              <div class="form-group score-group">
                <label>Pênaltis (se houve disputa)</label>
                <div class="score-inputs">
                  <div class="score-field">
                    <span class="score-label">{{ homeTeamLabel }}</span>
                    <input
                      v-model.number="form.homePenalties"
                      type="number"
                      min="0"
                      placeholder="-"
                      class="form-input score-input-box"
                    />
                  </div>
                  <span class="score-divider">X</span>
                  <div class="score-field">
                    <span class="score-label">{{ awayTeamLabel }}</span>
                    <input
                      v-model.number="form.awayPenalties"
                      type="number"
                      min="0"
                      placeholder="-"
                      class="form-input score-input-box"
                    />
                  </div>
                </div>
              </div>
            </template>
          </div>

          <div class="form-actions">
            <VButton type="button" @click="cancelEdit" variant="default">Cancelar</VButton>
            <VButton type="submit" variant="primary" :disabled="submitting">
              {{ submitting ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Registrar Partida') }}
            </VButton>
          </div>
        </form>
    </VModal>

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
              <th>Confronto</th>
              <th class="text-center">Placar</th>
              <th>Local</th>
              <th>Campeonato</th>
              <th class="text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="match in matches" :key="match.id">
              <td class="date-cell">
                <span class="match-date">{{ formatDateTime(match.date) }}</span>
              </td>
              <td class="opponent-cell">
                <span class="match-opponent">{{ formatMatchup(match) }}</span>
              </td>
              <td class="score-cell text-center">
                <span v-if="match.homeScore === null || match.homeScore === undefined" class="score-badge score-badge--scheduled">
                  AGENDADO
                </span>
                <span v-else :class="['score-badge', getMatchResultClass(match)]">
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
import { ref, onMounted, computed, watch } from 'vue';
import { useHead, definePageMeta } from '#imports';
import { useApi } from '~/composables/useApi';
import { useFeedback } from '~/composables/useFeedback';
import { formatDateTime, toDatetimeLocal } from '~/utils/formatters';
import VCard from '~/components/ui/VCard.vue';
import VButton from '~/components/ui/VButton.vue';
import VModal from '~/components/ui/VModal.vue';

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
  isOwnClub?: boolean;
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
  homeScore: number | null;
  awayScore: number | null;
  homePenalties?: number | null;
  awayPenalties?: number | null;
  phase?: string | null;
  groupName?: string | null;
  homeTeamId?: number | null;
  awayTeamId?: number | null;
  homeTeam?: Team | null;
  awayTeam?: Team | null;
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

const customOpponentName = ref('');

const form = ref({
  homeTeamId: '' as number | '',
  awayTeamId: '' as number | 'custom' | '',
  championshipId: '' as number | '',
  date: '',
  location: '',
  homeScore: '' as number | '',
  awayScore: '' as number | '',
  homePenalties: '' as number | '',
  awayPenalties: '' as number | '',
  phase: '',
  groupName: ''
});

const ownClub = computed(() => teamsList.value.find(t => t.isOwnClub));

const teamNameById = (id: number | '' | 'custom') => {
  if (typeof id !== 'number') return null;
  return teamsList.value.find(t => t.id === id)?.name || null;
};

const homeTeamLabel = computed(() => teamNameById(form.value.homeTeamId) || 'Mandante');
const awayTeamLabel = computed(() =>
  form.value.awayTeamId === 'custom'
    ? (customOpponentName.value || 'Adversário')
    : (teamNameById(form.value.awayTeamId) || 'Visitante')
);

// Adversário digitado só vale para amistoso: ao escolher campeonato, limpa
watch(() => form.value.championshipId, (champId) => {
  if (champId && form.value.awayTeamId === 'custom') {
    form.value.awayTeamId = '';
    customOpponentName.value = '';
  }
});

// Pré-seleciona o La Resenha como mandante assim que os times carregarem
watch(ownClub, (club) => {
  if (club && !isEditing.value && form.value.homeTeamId === '') {
    form.value.homeTeamId = club.id;
  }
});

const formatMatchup = (match: Match) => {
  const home = match.homeTeam?.name || (match.awayTeam ? null : 'La Resenha');
  const away = match.awayTeam?.name || match.opponent;
  return `${home || '?'} x ${away || '?'}`;
};

const { showFeedback, getErrorMessage } = useFeedback();

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

const openForm = () => {
  resetForm();
  showForm.value = true;
};

const resetForm = () => {
  form.value = {
    homeTeamId: ownClub.value?.id ?? '',
    awayTeamId: '',
    championshipId: '',
    date: '',
    location: '',
    homeScore: '',
    awayScore: '',
    homePenalties: '',
    awayPenalties: '',
    phase: '',
    groupName: ''
  };
  customOpponentName.value = '';
  isEditing.value = false;
  editingId.value = null;
};

const getMatchResultClass = (match: Match) => {
  if (match.homeScore === null || match.awayScore === null) return 'score-badge--scheduled';
  if (match.homeScore > match.awayScore) return 'score-badge--win';
  if (match.homeScore < match.awayScore) return 'score-badge--loss';
  return 'score-badge--draw';
};

const startEdit = (match: Match) => {
  form.value = {
    homeTeamId: match.homeTeamId ?? (ownClub.value?.id ?? ''),
    awayTeamId: match.awayTeamId ?? 'custom',
    championshipId: match.championshipId || '',
    date: toDatetimeLocal(match.date),
    location: match.location,
    homeScore: match.homeScore ?? '',
    awayScore: match.awayScore ?? '',
    homePenalties: match.homePenalties ?? '',
    awayPenalties: match.awayPenalties ?? '',
    phase: match.phase || '',
    groupName: match.groupName || ''
  };
  customOpponentName.value = match.awayTeamId ? '' : (match.opponent || '');

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

  try {
    const isCustomOpponent = form.value.awayTeamId === 'custom';
    const hasHomeScore = form.value.homeScore !== '' && form.value.homeScore !== null;
    const hasAwayScore = form.value.awayScore !== '' && form.value.awayScore !== null;

    if (hasHomeScore !== hasAwayScore) {
      showFeedback('error', 'Preencha o placar completo (os dois campos) ou deixe ambos vazios.');
      submitting.value = false;
      return;
    }

    const isChampMatch = !!form.value.championshipId;
    const hasHomePk = form.value.homePenalties !== '' && form.value.homePenalties !== null;
    const hasAwayPk = form.value.awayPenalties !== '' && form.value.awayPenalties !== null;

    const payload = {
      championshipId: form.value.championshipId ? Number(form.value.championshipId) : null,
      homeTeamId: form.value.homeTeamId ? Number(form.value.homeTeamId) : null,
      awayTeamId: isCustomOpponent || !form.value.awayTeamId ? null : Number(form.value.awayTeamId),
      opponent: isCustomOpponent ? customOpponentName.value : undefined,
      date: new Date(form.value.date).toISOString(),
      location: form.value.location,
      homeScore: hasHomeScore ? Number(form.value.homeScore) : null,
      awayScore: hasAwayScore ? Number(form.value.awayScore) : null,
      // Campos de mata-mata/grupos só quando é partida de campeonato
      homePenalties: isChampMatch && hasHomePk ? Number(form.value.homePenalties) : null,
      awayPenalties: isChampMatch && hasAwayPk ? Number(form.value.awayPenalties) : null,
      phase: isChampMatch ? (form.value.phase || null) : null,
      groupName: isChampMatch ? (form.value.groupName || null) : null
    };

    const matchupLabel = `${homeTeamLabel.value} x ${awayTeamLabel.value}`;

    if (isEditing.value && editingId.value !== null) {
      await request(`/matches/${editingId.value}`, {
        method: 'PATCH',
        body: payload
      });
      showFeedback('success', `Partida "${matchupLabel}" atualizada com sucesso!`);
    } else {
      await request('/matches', {
        method: 'POST',
        body: payload
      });
      showFeedback('success', `Partida "${matchupLabel}" registrada com sucesso!`);
    }

    resetForm();
    showForm.value = false;
    await loadMatches();
  } catch (error: any) {
    console.error('Erro ao salvar partida:', error);
    showFeedback('error', getErrorMessage(error, 'Erro ao salvar partida. Verifique os dados inseridos.'));
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
  /* No mobile os dois campos dividem o espaço sem estourar o modal;
     max-width evita ficarem largos demais no desktop. */
  flex: 1;
  min-width: 0;
  max-width: 120px;
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
  background-color: var(--color-vibrant-turf);
  color: #052e16;
}

.score-badge--loss {
  background-color: var(--color-error-red);
  color: #fff;
}

.score-badge--draw {
  background-color: #7f8c8d;
  color: #fff;
}

.score-badge--scheduled {
  background-color: #ffca28;
  color: #000;
  font-size: 0.95rem;
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
