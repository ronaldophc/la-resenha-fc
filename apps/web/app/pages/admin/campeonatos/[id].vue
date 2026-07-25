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
              :src="championship.logoUrl || PLACEHOLDER_CHAMP"
              :alt="championship.name"
              class="champ-logo"
              @error="onImageError($event, PLACEHOLDER_CHAMP)"
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
        <VButton @click="openForm" variant="primary" class="new-standing-btn">
          Inscrever Time 🏆
        </VButton>
      </div>

      <!-- Modal de Cadastro / Edição de Registro na Tabela -->
      <VModal v-model="showForm" :title="isEditing ? 'Ajuste de Pontos do Time' : 'Inscrever Time no Campeonato'">
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

              <div class="form-group" v-if="isGroupsFormat">
                <label for="groupName">Grupo</label>
                <input
                  v-model="form.groupName"
                  type="text"
                  id="groupName"
                  maxlength="30"
                  placeholder="Ex: A"
                  class="form-input"
                />
                <p class="form-help">Grupo do time na fase de grupos (ex: A, B, C).</p>
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
      </VModal>

      <!-- Chaveamento (mata-mata) -->
      <VCard v-if="isKnockout" class="bracket-card">
        <div class="bracket-header">
          <h2 class="bracket-title">Chaveamento</h2>
          <div class="bracket-config">
            <select v-model.number="bracketSize" class="form-input bracket-size-select">
              <option :value="2">Final (2 times)</option>
              <option :value="4">Semifinais (4 times)</option>
              <option :value="8">Quartas (8 times)</option>
              <option :value="16">Oitavas (16 times)</option>
            </select>
            <VButton size="sm" @click="generateBracket" :disabled="generating">
              {{ bracket.ties.length ? '↻ Regenerar' : 'Gerar chaveamento' }}
            </VButton>
          </div>
        </div>
        <BracketBoard v-if="bracket.ties.length" :bracket="bracket" editable @select="openTie" />
        <p v-else class="bracket-empty">
          Escolha o tamanho e clique em "Gerar chaveamento". Depois clique em cada jogo para definir os times e os placares.
        </p>
      </VCard>

      <!-- Modal de edição de um confronto do chaveamento -->
      <VModal v-model="showTieModal" :title="tieModalTitle">
        <form @submit.prevent="saveTie" class="tie-form">
          <div v-if="selectedTie && selectedTie.round === 1" class="form-grid">
            <div class="form-group">
              <label>Mandante</label>
              <select v-model="tieForm.homeTeamId" class="form-input">
                <option :value="null">-- selecione --</option>
                <option v-for="s in championship.standings" :key="'h'+s.teamId" :value="s.teamId">{{ s.team.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Visitante</label>
              <select v-model="tieForm.awayTeamId" class="form-input">
                <option :value="null">-- selecione --</option>
                <option v-for="s in championship.standings" :key="'a'+s.teamId" :value="s.teamId">{{ s.team.name }}</option>
              </select>
            </div>
          </div>
          <p v-else class="form-help">
            Times definidos pelo avanço: <strong>{{ selectedTie?.homeTeam?.name || 'A definir' }}</strong>
            x <strong>{{ selectedTie?.awayTeam?.name || 'A definir' }}</strong>
          </p>

          <div v-for="(leg, i) in tieForm.legs" :key="i" class="tie-leg">
            <label class="tie-leg__title">{{ tieForm.legs.length > 1 ? (i === 0 ? 'Ida' : 'Volta') : 'Jogo' }}</label>
            <div class="form-grid">
              <div class="form-group">
                <label>Data e horário</label>
                <input v-model="leg.date" type="datetime-local" class="form-input" />
              </div>
              <div class="form-group">
                <label>Local / Campo</label>
                <input v-model="leg.location" type="text" placeholder="Ex: Arena Várzea" class="form-input" />
              </div>
            </div>
            <div class="score-inputs">
              <div class="score-field">
                <span class="score-label">{{ legTeamLabel(i, 'home') }}</span>
                <input v-model.number="leg.homeScore" type="number" min="0" placeholder="-" class="form-input score-input-box" />
              </div>
              <span class="score-divider">X</span>
              <div class="score-field">
                <span class="score-label">{{ legTeamLabel(i, 'away') }}</span>
                <input v-model.number="leg.awayScore" type="number" min="0" placeholder="-" class="form-input score-input-box" />
              </div>
            </div>
            <div class="score-inputs" style="margin-top: 8px;">
              <div class="score-field">
                <span class="score-label">Pên. {{ legTeamLabel(i, 'home') }}</span>
                <input v-model.number="leg.homePenalties" type="number" min="0" placeholder="-" class="form-input score-input-box" />
              </div>
              <span class="score-divider">X</span>
              <div class="score-field">
                <span class="score-label">Pên. {{ legTeamLabel(i, 'away') }}</span>
                <input v-model.number="leg.awayPenalties" type="number" min="0" placeholder="-" class="form-input score-input-box" />
              </div>
            </div>
          </div>

          <div class="form-actions">
            <VButton type="button" @click="showTieModal = false" variant="default">Cancelar</VButton>
            <VButton type="submit" variant="primary" :disabled="savingTie">
              {{ savingTie ? 'Salvando...' : 'Salvar confronto' }}
            </VButton>
          </div>
        </form>
      </VModal>

      <!-- Tabela de Classificação do Campeonato -->
      <VCard v-if="showStandings" class="standings-list-card">
        <div v-if="championship.standings.length === 0" class="empty-state">
          <span class="empty-icon">🏆</span>
          <p>Nenhum time inscrito neste campeonato. Inscreva os times participantes — a tabela será montada automaticamente conforme as partidas forem cadastradas!</p>
        </div>

        <div v-else class="standings-groups-admin">
         <div v-for="g in standingsGroups" :key="g.group || 'unico'" class="standings-group-block">
          <h3 v-if="g.group" class="standings-group-title">Grupo {{ g.group }}</h3>
          <div class="table-responsive">
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
                v-for="standing in g.rows"
                :key="standing.id"
                :class="{ 'highlight-row': standing.team?.name.toLowerCase().includes('resenha') }"
              >
                <td class="pos-cell text-center font-bold">
                  <span class="pos-num">{{ standing.position }}º</span>
                </td>
                <td class="team-cell font-bold text-white">
                  <div class="table-team-info">
                    <img 
                      :src="standing.team?.logoUrl || PLACEHOLDER_TEAM"
                      :alt="standing.team?.name"
                      class="table-team-logo"
                      @error="onImageError($event, PLACEHOLDER_TEAM)"
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
         </div>
        </div>
      </VCard>

      <!-- Partidas do campeonato (pontos corridos / fase de grupos) -->
      <VCard v-if="showStandings" class="matches-card">
        <div class="matches-card__header">
          <div>
            <h2 class="matches-card__title">Partidas</h2>
            <p class="matches-card__subtitle">
              {{ isGroupsFormat
                ? 'Jogos da fase de grupos. Informe o grupo para entrarem na tabela certa.'
                : 'Cadastre os jogos — a tabela é calculada automaticamente pelos resultados.' }}
            </p>
          </div>
          <VButton
            variant="primary"
            @click="openMatchForm"
            :disabled="(championship.standings?.length || 0) < 2"
          >
            ⚽ + Partida
          </VButton>
        </div>

        <p v-if="(championship.standings?.length || 0) < 2" class="matches-empty">
          Inscreva ao menos 2 times acima para poder cadastrar partidas.
        </p>
        <div v-else-if="loadingMatches" class="matches-empty">Carregando partidas…</div>
        <div v-else-if="champMatches.length === 0" class="matches-empty">
          Nenhuma partida cadastrada ainda. Clique em “+ Partida” para começar.
        </div>
        <div v-else class="table-responsive">
          <table class="standings-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Confronto</th>
                <th class="text-center">Placar</th>
                <th v-if="isGroupsFormat" class="text-center">Grupo</th>
                <th>Local</th>
                <th class="text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in champMatches" :key="m.id">
                <td>{{ formatDateTime(m.date) }}</td>
                <td class="font-bold text-white">{{ matchupLabel(m) }}</td>
                <td class="text-center">
                  <span v-if="m.homeScore === null || m.homeScore === undefined" class="score-tag score-tag--scheduled">Agendado</span>
                  <span v-else class="score-tag">{{ m.homeScore }} x {{ m.awayScore }}</span>
                </td>
                <td v-if="isGroupsFormat" class="text-center">{{ m.groupName || '—' }}</td>
                <td>📍 {{ m.location }}</td>
                <td class="text-center">
                  <div class="actions-wrapper">
                    <VButton size="sm" @click="editMatch(m)" class="action-btn edit-btn">✏️</VButton>
                    <VButton size="sm" variant="danger" @click="deleteMatch(m)" class="action-btn">🗑️</VButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </VCard>

      <!-- Modal de cadastro/edição de partida do campeonato -->
      <VModal v-model="showMatchModal" :title="editingMatchId ? 'Editar Partida' : 'Nova Partida'">
        <form @submit.prevent="saveMatch" class="match-form">
          <div class="form-grid">
            <div class="form-group">
              <label>Mandante *</label>
              <select v-model="matchForm.homeTeamId" required class="form-input">
                <option value="" disabled>-- selecione --</option>
                <option v-for="s in championship.standings" :key="'mh' + s.teamId" :value="s.teamId">{{ s.team.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Visitante *</label>
              <select v-model="matchForm.awayTeamId" required class="form-input">
                <option value="" disabled>-- selecione --</option>
                <option v-for="s in championship.standings" :key="'ma' + s.teamId" :value="s.teamId">{{ s.team.name }}</option>
              </select>
            </div>
            <div class="form-group" v-if="isGroupsFormat">
              <label>Grupo</label>
              <input v-model="matchForm.groupName" type="text" maxlength="30" placeholder="Ex: A" class="form-input" />
              <p class="form-help">Grupo em que o jogo acontece (entra na tabela do grupo).</p>
            </div>
            <div class="form-group">
              <label>Data e horário *</label>
              <input v-model="matchForm.date" type="datetime-local" required class="form-input" />
            </div>
            <div class="form-group">
              <label>Local / Campo *</label>
              <input v-model="matchForm.location" type="text" required placeholder="Ex: Arena Várzea" class="form-input" />
            </div>
          </div>

          <div class="score-group">
            <label class="score-group__label">Placar</label>
            <div class="score-inputs">
              <div class="score-field">
                <span class="score-label">{{ matchHomeLabel }}</span>
                <input v-model.number="matchForm.homeScore" type="number" min="0" placeholder="-" class="form-input score-input-box" />
              </div>
              <span class="score-divider">X</span>
              <div class="score-field">
                <span class="score-label">{{ matchAwayLabel }}</span>
                <input v-model.number="matchForm.awayScore" type="number" min="0" placeholder="-" class="form-input score-input-box" />
              </div>
            </div>
            <p class="form-help">Deixe os dois vazios para jogo apenas agendado (ainda não realizado).</p>
          </div>

          <div class="form-actions">
            <VButton type="button" @click="showMatchModal = false" variant="default">Cancelar</VButton>
            <VButton type="submit" variant="primary" :disabled="submittingMatch">
              {{ submittingMatch ? 'Salvando...' : (editingMatchId ? 'Salvar' : 'Cadastrar Partida') }}
            </VButton>
          </div>
        </form>
      </VModal>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useHead, definePageMeta } from '#imports';
import { useApi } from '~/composables/useApi';
import { useFeedback } from '~/composables/useFeedback';
import { formatDateTime, toDatetimeLocal } from '~/utils/formatters';
import { onImageError, PLACEHOLDER_TEAM, PLACEHOLDER_CHAMP } from '~/utils/placeholders';
import VCard from '~/components/ui/VCard.vue';
import VButton from '~/components/ui/VButton.vue';
import VModal from '~/components/ui/VModal.vue';
import BracketBoard from '~/components/ui/BracketBoard.vue';

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
  group?: string | null;
  team: Team;
}

interface ChampionshipDetail {
  id: number;
  name: string;
  logoUrl?: string;
  format?: string;
  knockoutLegs?: number;
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
  pointsAdjustment: 0,
  groupName: ''
});

const isGroupsFormat = computed(() => championship.value?.format === 'GRUPOS_MATA_MATA');
const isKnockout = computed(() =>
  championship.value?.format === 'MATA_MATA' || championship.value?.format === 'GRUPOS_MATA_MATA',
);
const showStandings = computed(() => championship.value?.format !== 'MATA_MATA');

// Agrupa a classificação por grupo (GRUPOS_MATA_MATA); sem grupo = tabela única
const standingsGroups = computed(() => {
  const map = new Map<string, any[]>();
  for (const row of championship.value?.standings || []) {
    const key = (row as any).group || '';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(row);
  }
  return Array.from(map.entries()).map(([group, rows]) => ({ group, rows }));
});

// Só oferece times que ainda não estão inscritos no campeonato
const availableTeams = computed(() => {
  const enrolledIds = new Set((championship.value?.standings || []).map(s => s.teamId));
  return globalTeams.value.filter(t => !enrolledIds.has(t.id));
});

// --- Chaveamento (bracket) ---
const bracket = ref<{ maxRound: number; ties: any[] }>({ maxRound: 0, ties: [] });
const bracketSize = ref(8);
const generating = ref(false);
const showTieModal = ref(false);
const savingTie = ref(false);
const selectedTie = ref<any | null>(null);
const legsCount = computed(() => championship.value?.knockoutLegs || 1);
const tieForm = ref<{ homeTeamId: number | null; awayTeamId: number | null; legs: any[] }>({
  homeTeamId: null,
  awayTeamId: null,
  legs: [],
});

const tieModalTitle = computed(() => selectedTie.value ? `Confronto — ${selectedTie.value.phase}` : 'Confronto');

const loadBracket = async () => {
  try {
    const res = await request<any>(`/ties?championshipId=${champId}`);
    bracket.value = res?.data || res || { maxRound: 0, ties: [] };
  } catch (error) {
    console.warn('Chaveamento indisponível.');
    bracket.value = { maxRound: 0, ties: [] };
  }
};

const generateBracket = async () => {
  if (bracket.value.ties.length && !confirm('Regenerar apaga o chaveamento atual (times e placares). Continuar?')) return;
  generating.value = true;
  try {
    await request('/ties/generate', { method: 'POST', body: { championshipId: champId, teams: bracketSize.value } });
    await loadBracket();
    showFeedback('success', 'Chaveamento gerado!');
  } catch (error: any) {
    showFeedback('error', getErrorMessage(error, 'Erro ao gerar o chaveamento.'));
  } finally {
    generating.value = false;
  }
};

// Nomes dos times de cada jogo (o mando inverte no jogo de volta)
const legTeamLabel = (legIndex: number, side: 'home' | 'away') => {
  const home = selectedTie.value?.homeTeam?.name || tieName(tieForm.value.homeTeamId) || 'Mandante';
  const away = selectedTie.value?.awayTeam?.name || tieName(tieForm.value.awayTeamId) || 'Visitante';
  const swap = legIndex === 1; // 2º jogo (volta) inverte
  if (side === 'home') return swap ? away : home;
  return swap ? home : away;
};
const tieName = (teamId: number | null) => {
  if (!teamId) return null;
  return championship.value?.standings.find(s => s.teamId === teamId)?.team.name || null;
};

const openTie = (tie: any) => {
  selectedTie.value = tie;
  const legs = Array.from({ length: legsCount.value }, (_, i) => {
    const m = (tie.matches || []).find((x: any) => x.leg === i + 1) || {};
    return {
      date: toDatetimeLocal(m.date),
      location: m.location ?? '',
      homeScore: m.homeScore ?? '',
      awayScore: m.awayScore ?? '',
      homePenalties: m.homePenalties ?? '',
      awayPenalties: m.awayPenalties ?? '',
    };
  });
  tieForm.value = { homeTeamId: tie.homeTeamId ?? null, awayTeamId: tie.awayTeamId ?? null, legs };
  showTieModal.value = true;
};

const saveTie = async () => {
  savingTie.value = true;
  try {
    const legs = tieForm.value.legs.map((l) => ({
      date: l.date ? new Date(l.date).toISOString() : null,
      location: l.location || null,
      homeScore: l.homeScore === '' ? null : Number(l.homeScore),
      awayScore: l.awayScore === '' ? null : Number(l.awayScore),
      homePenalties: l.homePenalties === '' ? null : Number(l.homePenalties),
      awayPenalties: l.awayPenalties === '' ? null : Number(l.awayPenalties),
    }));
    const body: any = { legs };
    if (selectedTie.value?.round === 1) {
      body.homeTeamId = tieForm.value.homeTeamId;
      body.awayTeamId = tieForm.value.awayTeamId;
    }
    await request(`/ties/${selectedTie.value.id}`, { method: 'PATCH', body });
    await loadBracket();
    showTieModal.value = false;
    showFeedback('success', 'Confronto salvo!');
  } catch (error: any) {
    showFeedback('error', getErrorMessage(error, 'Erro ao salvar o confronto.'));
  } finally {
    savingTie.value = false;
  }
};

const { showFeedback, getErrorMessage } = useFeedback();

const loadChampionshipDetails = async () => {
  loadingChampionship.value = true;
  try {
    const res = await request<any>(`/championships/${champId}`);
    championship.value = res?.data || res;
    
    // Ordena os standings por posição
    if (championship.value && championship.value.standings) {
      championship.value.standings.sort((a, b) => a.position - b.position);
    }

    // Carrega o chaveamento se for mata-mata
    if (isKnockout.value) await loadBracket();
    // Carrega as partidas (pontos corridos / fase de grupos)
    if (showStandings.value) await loadChampMatches();
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

const openForm = () => {
  resetForm();
  loadGlobalTeams();
  showForm.value = true;
};

const resetForm = () => {
  form.value = {
    teamId: '',
    pointsAdjustment: 0,
    groupName: ''
  };
  isEditing.value = false;
  editingStandingId.value = null;
  editingTeamName.value = '';
};

const startEdit = (standing: Standing) => {
  form.value = {
    teamId: standing.teamId,
    pointsAdjustment: standing.pointsAdjustment ?? 0,
    groupName: standing.group || ''
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

  try {
    if (isEditing.value && editingStandingId.value !== null) {
      await request(`/standings/${editingStandingId.value}`, {
        method: 'PUT',
        body: {
          pointsAdjustment: Number(form.value.pointsAdjustment) || 0,
          groupName: form.value.groupName || null
        }
      });
      showFeedback('success', 'Inscrição atualizada com sucesso!');
    } else {
      await request('/standings', {
        method: 'POST',
        body: {
          championshipId: champId,
          teamId: Number(form.value.teamId),
          pointsAdjustment: Number(form.value.pointsAdjustment) || 0,
          groupName: form.value.groupName || null
        }
      });
      showFeedback('success', 'Time inscrito no campeonato com sucesso!');
    }

    resetForm();
    showForm.value = false;
    await loadChampionshipDetails();
  } catch (error: any) {
    console.error('Erro ao salvar classificação:', error);
    showFeedback('error', getErrorMessage(error, 'Erro ao salvar a classificação. Verifique se este time já está na tabela.'));
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

// --- Partidas do campeonato (pontos corridos / fase de grupos) ---
const champMatches = ref<any[]>([]);
const loadingMatches = ref(false);
const showMatchModal = ref(false);
const submittingMatch = ref(false);
const editingMatchId = ref<number | null>(null);
const matchForm = ref<{
  homeTeamId: number | '';
  awayTeamId: number | '';
  date: string;
  location: string;
  homeScore: number | '';
  awayScore: number | '';
  groupName: string;
}>({
  homeTeamId: '',
  awayTeamId: '',
  date: '',
  location: '',
  homeScore: '',
  awayScore: '',
  groupName: '',
});

const teamNameInChamp = (teamId: number | '') => {
  if (teamId === '') return null;
  return championship.value?.standings.find((s) => s.teamId === teamId)?.team.name || null;
};
const matchHomeLabel = computed(() => teamNameInChamp(matchForm.value.homeTeamId) || 'Mandante');
const matchAwayLabel = computed(() => teamNameInChamp(matchForm.value.awayTeamId) || 'Visitante');

const matchupLabel = (m: any) =>
  `${m.homeTeam?.name || '?'} x ${m.awayTeam?.name || m.opponent || '?'}`;

// Fase de grupos: ao escolher o mandante, sugere o grupo dele (se ainda vazio)
watch(() => matchForm.value.homeTeamId, (teamId) => {
  if (!isGroupsFormat.value || matchForm.value.groupName) return;
  const g = championship.value?.standings.find((s) => s.teamId === teamId)?.group;
  if (g) matchForm.value.groupName = g;
});

const loadChampMatches = async () => {
  loadingMatches.value = true;
  try {
    const res = await request<any>(`/matches?championshipId=${champId}`);
    const list = Array.isArray(res) ? res : (res?.data || []);
    // Fase de grupos só lista os jogos de grupo aqui (o mata-mata fica no chaveamento)
    champMatches.value = list
      .filter((m: any) => (isKnockout.value ? !m.tieId : true))
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Erro ao carregar partidas do campeonato:', error);
    champMatches.value = [];
  } finally {
    loadingMatches.value = false;
  }
};

const resetMatchForm = () => {
  matchForm.value = {
    homeTeamId: '', awayTeamId: '', date: '', location: '',
    homeScore: '', awayScore: '', groupName: '',
  };
  editingMatchId.value = null;
};

const openMatchForm = () => {
  resetMatchForm();
  showMatchModal.value = true;
};

const editMatch = (m: any) => {
  editingMatchId.value = m.id;
  matchForm.value = {
    homeTeamId: m.homeTeamId ?? '',
    awayTeamId: m.awayTeamId ?? '',
    date: toDatetimeLocal(m.date),
    location: m.location || '',
    homeScore: m.homeScore ?? '',
    awayScore: m.awayScore ?? '',
    groupName: m.groupName || '',
  };
  showMatchModal.value = true;
};

const saveMatch = async () => {
  const f = matchForm.value;
  if (f.homeTeamId === '' || f.awayTeamId === '') {
    showFeedback('error', 'Selecione o mandante e o visitante.');
    return;
  }
  if (f.homeTeamId === f.awayTeamId) {
    showFeedback('error', 'Mandante e visitante devem ser times diferentes.');
    return;
  }
  const hasHome = f.homeScore !== '' && f.homeScore !== null;
  const hasAway = f.awayScore !== '' && f.awayScore !== null;
  if (hasHome !== hasAway) {
    showFeedback('error', 'Preencha o placar completo (os dois campos) ou deixe ambos vazios.');
    return;
  }

  submittingMatch.value = true;
  try {
    const payload: any = {
      championshipId: champId,
      homeTeamId: Number(f.homeTeamId),
      awayTeamId: Number(f.awayTeamId),
      date: new Date(f.date).toISOString(),
      location: f.location,
      homeScore: hasHome ? Number(f.homeScore) : null,
      awayScore: hasAway ? Number(f.awayScore) : null,
      groupName: isGroupsFormat.value ? (f.groupName || null) : null,
      phase: null,
    };
    if (editingMatchId.value !== null) {
      await request(`/matches/${editingMatchId.value}`, { method: 'PATCH', body: payload });
      showFeedback('success', 'Partida atualizada!');
    } else {
      await request('/matches', { method: 'POST', body: payload });
      showFeedback('success', 'Partida cadastrada!');
    }
    showMatchModal.value = false;
    resetMatchForm();
    // Recarrega jogos e a tabela (que é recalculada pelo backend)
    await Promise.all([loadChampMatches(), loadChampionshipDetails()]);
  } catch (error: any) {
    showFeedback('error', getErrorMessage(error, 'Erro ao salvar a partida.'));
  } finally {
    submittingMatch.value = false;
  }
};

const deleteMatch = async (m: any) => {
  if (!confirm(`Remover a partida "${matchupLabel(m)}"? A tabela será recalculada.`)) return;
  try {
    await request(`/matches/${m.id}`, { method: 'DELETE' });
    showFeedback('success', 'Partida removida.');
    await Promise.all([loadChampMatches(), loadChampionshipDetails()]);
  } catch (error) {
    console.error('Erro ao remover partida:', error);
    showFeedback('error', 'Não foi possível remover a partida.');
  }
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

/* Espaça o cabeçalho, o chaveamento e a tabela entre si */
.championship-content {
  display: flex;
  flex-direction: column;
  gap: 28px;
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

/* No mobile a logo empilha acima do nome e fica maior (mais destaque) */
@media (max-width: 767px) {
  .champ-info-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .champ-logo-wrapper {
    width: 96px;
    height: 96px;
  }
}

.champ-logo-wrapper {
  width: 70px;
  height: 70px;
  flex-shrink: 0;
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

.bracket-card {
  padding: 20px !important;
}

.bracket-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}

.bracket-title {
  font-family: 'Oswald', sans-serif;
  font-size: 1.5rem;
  text-transform: uppercase;
  color: var(--color-primary);
  margin: 0;
}

.bracket-config {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bracket-size-select {
  max-width: 200px;
}

.bracket-empty {
  color: var(--color-on-surface-variant);
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.05rem;
}

.tie-form .form-help {
  margin-bottom: 16px;
}

/* Bloco de um jogo do confronto (ida/volta) no modal */
.tie-leg {
  border: 2px dashed var(--color-outline-variant);
  border-radius: var(--radius-sm);
  padding: 14px;
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tie-leg__title {
  font-family: 'Oswald', sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-tertiary);
}

/* Campos de placar (reutilizados no modal do confronto) */
.score-group {
  margin-top: 8px;
}

.score-inputs {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

.score-field {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
}

.score-label {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.9rem;
  font-weight: 600;
  text-align: center;
  color: var(--color-on-surface-variant);
}

.score-input-box {
  text-align: center;
  max-width: 90px;
}

.score-divider {
  font-family: 'Oswald', sans-serif;
  font-weight: 700;
  color: var(--color-primary);
  padding-bottom: 8px;
}

.standings-groups-admin {
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding: 20px 16px;
}

.standings-group-title {
  font-family: 'Oswald', sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-tertiary);
  margin: 0 0 10px 0;
  letter-spacing: 0.03em;
}

.standings-list-card {
  padding: 0 !important;
  overflow: hidden;
}

/* Card de partidas do campeonato */
.matches-card {
  padding: 20px !important;
}

.matches-card__header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

@media (min-width: 600px) {
  .matches-card__header {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.matches-card__title {
  font-family: 'Oswald', sans-serif;
  font-size: 1.5rem;
  text-transform: uppercase;
  color: var(--color-primary);
  margin: 0;
}

.matches-card__subtitle {
  font-size: 0.95rem;
  color: #a3a3a3;
  margin: 2px 0 0 0;
}

.matches-empty {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.05rem;
  color: var(--color-on-surface-variant);
  padding: 8px 0;
}

.score-tag {
  display: inline-block;
  font-family: 'Oswald', sans-serif;
  font-weight: 700;
  background-color: var(--color-primary-container);
  color: var(--color-goal-white);
  padding: 3px 10px;
  border-radius: var(--radius-sm);
  white-space: nowrap;
}

.score-tag--scheduled {
  background-color: transparent;
  border: 2px dashed var(--color-outline-variant);
  color: #a3a3a3;
  font-family: 'Barlow Condensed', sans-serif;
  text-transform: uppercase;
  font-size: 0.85rem;
}

.score-group__label {
  display: block;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 1.1rem;
  text-transform: uppercase;
  color: var(--color-goal-white);
  margin-bottom: 8px;
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
