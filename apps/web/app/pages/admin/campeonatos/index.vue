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
              <label>Logo do Campeonato (Opcional)</label>
              <ImageUpload v-model="form.logoUrl" label="Logo do campeonato" />
            </div>
          </div>

          <!-- Configuração de Pontuação -->
          <h3 class="form-section-title">Pontuação</h3>
          <div class="form-grid form-grid--3">
            <div class="form-group">
              <label for="pointsPerWin">Pontos por Vitória *</label>
              <input
                v-model.number="form.pointsPerWin"
                type="number"
                min="0"
                id="pointsPerWin"
                required
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label for="pointsPerDraw">Pontos por Empate *</label>
              <input
                v-model.number="form.pointsPerDraw"
                type="number"
                min="0"
                id="pointsPerDraw"
                required
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label for="pointsPerLoss">Pontos por Derrota *</label>
              <input
                v-model.number="form.pointsPerLoss"
                type="number"
                min="0"
                id="pointsPerLoss"
                required
                class="form-input"
              />
            </div>
          </div>

          <!-- Critérios de Desempate -->
          <h3 class="form-section-title">Critérios de Desempate</h3>
          <p class="form-hint">
            Aplicados na ordem abaixo quando os times empatam em pontos. Use as setas para reordenar.
          </p>
          <ul class="tiebreaker-list">
            <li v-for="(criterion, index) in form.tiebreakers" :key="criterion" class="tiebreaker-item">
              <span class="tiebreaker-order">{{ index + 1 }}º</span>
              <span class="tiebreaker-label">{{ TIEBREAKER_LABELS[criterion] || criterion }}</span>
              <div class="tiebreaker-actions">
                <button type="button" class="tiebreaker-btn" :disabled="index === 0" @click="moveTiebreaker(index, -1)" title="Subir">▲</button>
                <button type="button" class="tiebreaker-btn" :disabled="index === form.tiebreakers.length - 1" @click="moveTiebreaker(index, 1)" title="Descer">▼</button>
                <button type="button" class="tiebreaker-btn tiebreaker-btn--remove" @click="removeTiebreaker(index)" title="Remover">✖</button>
              </div>
            </li>
          </ul>
          <div v-if="availableTiebreakers.length > 0" class="tiebreaker-add">
            <select v-model="tiebreakerToAdd" class="form-input tiebreaker-select">
              <option value="" disabled>Adicionar critério...</option>
              <option v-for="c in availableTiebreakers" :key="c" :value="c">
                {{ TIEBREAKER_LABELS[c] }}
              </option>
            </select>
            <VButton type="button" size="sm" @click="addTiebreaker" :disabled="!tiebreakerToAdd">
              + Adicionar
            </VButton>
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
import { ref, computed, onMounted } from 'vue';
import { useHead, definePageMeta, navigateTo } from '#imports';
import { useApi } from '~/composables/useApi';
import { useToast } from '~/composables/useToast';
import VCard from '~/components/ui/VCard.vue';
import VButton from '~/components/ui/VButton.vue';
import ImageUpload from '~/components/ui/ImageUpload.vue';

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
  pointsPerWin?: number;
  pointsPerDraw?: number;
  pointsPerLoss?: number;
  tiebreakers?: string[];
}

const TIEBREAKER_LABELS: Record<string, string> = {
  wins: 'Vitórias',
  goalDiff: 'Saldo de gols',
  goalsFor: 'Gols pró',
  goalsAgainst: 'Menos gols sofridos',
  headToHead: 'Confronto direto',
};

const ALL_TIEBREAKERS = Object.keys(TIEBREAKER_LABELS);
const DEFAULT_TIEBREAKERS = ['wins', 'goalDiff', 'goalsFor', 'headToHead'];

const { request } = useApi();

const championships = ref<Championship[]>([]);
const loading = ref(true);
const submitting = ref(false);
const showForm = ref(false);
const isEditing = ref(false);
const editingId = ref<number | null>(null);
const tiebreakerToAdd = ref('');

const form = ref({
  name: '',
  logoUrl: '',
  pointsPerWin: 3,
  pointsPerDraw: 1,
  pointsPerLoss: 0,
  tiebreakers: [...DEFAULT_TIEBREAKERS] as string[]
});

const availableTiebreakers = computed(() =>
  ALL_TIEBREAKERS.filter(c => !form.value.tiebreakers.includes(c))
);

const moveTiebreaker = (index: number, delta: number) => {
  const target = index + delta;
  if (target < 0 || target >= form.value.tiebreakers.length) return;
  const list = [...form.value.tiebreakers];
  [list[index], list[target]] = [list[target], list[index]];
  form.value.tiebreakers = list;
};

const removeTiebreaker = (index: number) => {
  form.value.tiebreakers = form.value.tiebreakers.filter((_, i) => i !== index);
};

const addTiebreaker = () => {
  if (tiebreakerToAdd.value && !form.value.tiebreakers.includes(tiebreakerToAdd.value)) {
    form.value.tiebreakers = [...form.value.tiebreakers, tiebreakerToAdd.value];
  }
  tiebreakerToAdd.value = '';
};

const toast = useToast();

const showFeedback = (type: 'success' | 'error', message: string) => {
  if (type === 'success') toast.success(message);
  else toast.error(message);
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
    logoUrl: '',
    pointsPerWin: 3,
    pointsPerDraw: 1,
    pointsPerLoss: 0,
    tiebreakers: [...DEFAULT_TIEBREAKERS]
  };
  tiebreakerToAdd.value = '';
  isEditing.value = false;
  editingId.value = null;
};

const startEdit = (champ: Championship) => {
  form.value = {
    name: champ.name,
    logoUrl: champ.logoUrl || '',
    pointsPerWin: champ.pointsPerWin ?? 3,
    pointsPerDraw: champ.pointsPerDraw ?? 1,
    pointsPerLoss: champ.pointsPerLoss ?? 0,
    tiebreakers: champ.tiebreakers?.length ? [...champ.tiebreakers] : [...DEFAULT_TIEBREAKERS]
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

  try {
    const payload = {
      name: form.value.name,
      logoUrl: form.value.logoUrl || null,
      pointsPerWin: form.value.pointsPerWin,
      pointsPerDraw: form.value.pointsPerDraw,
      pointsPerLoss: form.value.pointsPerLoss,
      tiebreakers: form.value.tiebreakers
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

.form-section-title {
  font-family: 'Oswald', sans-serif;
  text-transform: uppercase;
  font-size: 1.25rem;
  color: var(--color-goal-white);
  margin: 24px 0 12px 0;
  border-bottom: 2px dashed var(--color-outline-variant);
  padding-bottom: 6px;
}

.form-hint {
  font-size: 0.95rem;
  color: #a3a3a3;
  margin: 0 0 12px 0;
}

.form-grid--3 {
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .form-grid--3 {
    grid-template-columns: repeat(3, 1fr);
  }
}

.tiebreaker-list {
  list-style: none;
  padding: 0;
  margin: 0 0 12px 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tiebreaker-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: var(--color-surface-container-low);
  border: 2px solid var(--color-outline-variant);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
  box-shadow: 2px 2px 0px var(--color-asphalt);
}

.tiebreaker-order {
  font-family: 'Oswald', sans-serif;
  font-weight: 700;
  color: var(--color-primary);
  min-width: 28px;
}

.tiebreaker-label {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-goal-white);
  flex-grow: 1;
}

.tiebreaker-actions {
  display: flex;
  gap: 6px;
}

.tiebreaker-btn {
  background-color: var(--color-surface-bright);
  color: var(--color-goal-white);
  border: 2px solid var(--color-outline-variant);
  border-radius: var(--radius-sm);
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tiebreaker-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.tiebreaker-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.tiebreaker-btn--remove:hover {
  border-color: #ff5252;
  color: #ff5252;
}

.tiebreaker-add {
  display: flex;
  gap: 12px;
  align-items: center;
}

.tiebreaker-select {
  max-width: 280px;
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
