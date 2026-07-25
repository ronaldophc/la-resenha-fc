<template>
  <div class="bracket" :class="{ 'bracket--editable': editable }">
    <div v-for="round in rounds" :key="round.round" class="bracket-round">
      <h4 class="bracket-round__title">{{ round.phase }}</h4>
      <div class="bracket-round__ties">
        <div
          v-for="tie in round.ties"
          :key="tie.id"
          class="bracket-tie"
          :class="{ 'bracket-tie--clickable': editable }"
          @click="editable && $emit('select', tie)"
        >
          <div
            class="bracket-tie__team"
            :class="{ 'bracket-tie__team--winner': tie.winnerTeamId && tie.winnerTeamId === tie.homeTeamId }"
          >
            <span class="bracket-tie__name">{{ teamName(tie, 'home') }}</span>
            <span class="bracket-tie__score">{{ agg(tie, 'home') }}</span>
          </div>
          <div
            class="bracket-tie__team"
            :class="{ 'bracket-tie__team--winner': tie.winnerTeamId && tie.winnerTeamId === tie.awayTeamId }"
          >
            <span class="bracket-tie__name">{{ teamName(tie, 'away') }}</span>
            <span class="bracket-tie__score">{{ agg(tie, 'away') }}</span>
          </div>
          <div v-if="penaltiesText(tie)" class="bracket-tie__pen">{{ penaltiesText(tie) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Tie {
  id: number;
  round: number;
  slot: number;
  phase: string;
  homeTeamId: number | null;
  awayTeamId: number | null;
  winnerTeamId: number | null;
  homeTeam?: { id: number; name: string } | null;
  awayTeam?: { id: number; name: string } | null;
  matches: any[];
}

const props = defineProps<{
  bracket: { maxRound: number; ties: Tie[] };
  editable?: boolean;
}>();

defineEmits<{ (e: 'select', tie: Tie): void }>();

const rounds = computed(() => {
  const map = new Map<number, Tie[]>();
  for (const t of props.bracket.ties) {
    if (!map.has(t.round)) map.set(t.round, []);
    map.get(t.round)!.push(t);
  }
  return Array.from(map.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([round, ties]) => ({
      round,
      phase: ties[0]?.phase || '',
      ties: ties.slice().sort((a, b) => a.slot - b.slot),
    }));
});

const teamName = (tie: Tie, side: 'home' | 'away') => {
  const team = side === 'home' ? tie.homeTeam : tie.awayTeam;
  return team?.name || 'A definir';
};

// Agregado de gols de um lado do confronto (soma nos 1 ou 2 jogos)
const agg = (tie: Tie, side: 'home' | 'away') => {
  const teamId = side === 'home' ? tie.homeTeamId : tie.awayTeamId;
  if (!teamId || !tie.matches?.length) return '-';
  let total = 0;
  let hasScore = false;
  for (const m of tie.matches) {
    if (m.homeScore === null || m.awayScore === null) continue;
    if (m.homeTeamId === teamId) { total += m.homeScore; hasScore = true; }
    else if (m.awayTeamId === teamId) { total += m.awayScore; hasScore = true; }
  }
  return hasScore ? total : '-';
};

const penaltiesText = (tie: Tie) => {
  const pk = (tie.matches || []).find((m) => m.homePenalties !== null && m.awayPenalties !== null);
  if (!pk) return '';
  const homePk = pk.homeTeamId === tie.homeTeamId ? pk.homePenalties : pk.awayPenalties;
  const awayPk = pk.homeTeamId === tie.homeTeamId ? pk.awayPenalties : pk.homePenalties;
  return `pênaltis ${homePk} - ${awayPk}`;
};
</script>

<style scoped>
.bracket {
  display: flex;
  gap: 24px;
  overflow-x: auto;
  padding-bottom: 8px;
  align-items: stretch;
}

.bracket-round {
  display: flex;
  flex-direction: column;
  min-width: 210px;
}

.bracket-round__title {
  font-family: 'Oswald', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-tertiary);
  text-align: center;
  margin: 0 0 12px 0;
  letter-spacing: 0.03em;
}

.bracket-round__ties {
  display: flex;
  flex-direction: column;
  /* space-around distribui igualmente: assim cada confronto de uma fase fica
     centralizado entre os dois da fase anterior (alinhamento de chave). */
  justify-content: space-around;
  flex-grow: 1;
}

.bracket-tie {
  background-color: var(--color-surface-container-low);
  border: 2px solid var(--color-outline-variant);
  border-radius: var(--radius-sm);
  box-shadow: 3px 3px 0px var(--color-asphalt);
  overflow: hidden;
  /* A margem vertical dá o espaçamento da 1ª fase (que define a altura) e
     mantém os cards separados; as fases seguintes centralizam via space-around. */
  margin: 10px 0;
}

.bracket-tie--clickable {
  cursor: pointer;
  transition: all 0.1s ease;
}

.bracket-tie--clickable:hover {
  border-color: var(--color-primary);
  transform: translate(-1px, -1px);
  box-shadow: 4px 4px 0px var(--color-asphalt);
}

.bracket-tie__team {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-goal-white);
}

.bracket-tie__team:first-child {
  border-bottom: 1px solid var(--color-outline-variant);
}

.bracket-tie__team--winner {
  background-color: var(--color-primary-container);
  color: var(--color-goal-white);
}

.bracket-tie__name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bracket-tie__score {
  font-family: 'Oswald', sans-serif;
  font-weight: 700;
  flex-shrink: 0;
}

.bracket-tie__pen {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--color-on-surface-variant);
  text-align: center;
  padding: 2px 0 4px;
}
</style>
