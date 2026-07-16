/**
 * Calculadora de classificação.
 *
 * Função pura: recebe a configuração do campeonato, os times inscritos e as
 * partidas realizadas, e devolve a tabela ordenada. Nenhuma estatística é
 * armazenada no banco — a fonte de verdade são as partidas.
 */

export const TIEBREAKER_CRITERIA = [
  'wins',
  'goalDiff',
  'goalsFor',
  'goalsAgainst',
  'headToHead',
] as const;

export type TiebreakerCriterion = (typeof TIEBREAKER_CRITERIA)[number];

export interface ScoringConfig {
  pointsPerWin: number;
  pointsPerDraw: number;
  pointsPerLoss: number;
  tiebreakers: string[];
}

export interface EnrollmentInput {
  teamId: number;
  teamName: string;
  pointsAdjustment: number;
}

export interface MatchInput {
  homeTeamId: number;
  awayTeamId: number;
  homeScore: number;
  awayScore: number;
}

export interface StandingRow {
  teamId: number;
  teamName: string;
  position: number;
  points: number;
  pointsAdjustment: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
}

type Stats = Omit<StandingRow, 'position'>;

function emptyStats(teamId: number, teamName: string, pointsAdjustment: number): Stats {
  return {
    teamId,
    teamName,
    pointsAdjustment,
    points: pointsAdjustment,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDiff: 0,
  };
}

function accumulate(stats: Map<number, Stats>, matches: MatchInput[], config: ScoringConfig) {
  for (const match of matches) {
    const home = stats.get(match.homeTeamId);
    const away = stats.get(match.awayTeamId);
    // Partida com time não inscrito não conta para a tabela
    if (!home || !away) continue;

    home.played++;
    away.played++;
    home.goalsFor += match.homeScore;
    home.goalsAgainst += match.awayScore;
    away.goalsFor += match.awayScore;
    away.goalsAgainst += match.homeScore;

    if (match.homeScore > match.awayScore) {
      home.won++;
      home.points += config.pointsPerWin;
      away.lost++;
      away.points += config.pointsPerLoss;
    } else if (match.homeScore < match.awayScore) {
      away.won++;
      away.points += config.pointsPerWin;
      home.lost++;
      home.points += config.pointsPerLoss;
    } else {
      home.drawn++;
      away.drawn++;
      home.points += config.pointsPerDraw;
      away.points += config.pointsPerDraw;
    }
  }

  for (const s of stats.values()) {
    s.goalDiff = s.goalsFor - s.goalsAgainst;
  }
}

/**
 * Ordena um grupo de times empatados aplicando os critérios a partir de
 * `criterionIndex`. O confronto direto exige recomputar uma mini-tabela só
 * com os jogos entre os empatados, por isso a ordenação é feita por
 * particionamento recursivo de grupos de empate, e não por um comparator
 * simples.
 */
function sortGroup(
  group: Stats[],
  criteria: string[],
  criterionIndex: number,
  matches: MatchInput[],
  config: ScoringConfig,
): Stats[] {
  if (group.length <= 1) return group;

  // Critérios esgotados: fallback determinístico por nome
  if (criterionIndex >= criteria.length) {
    return [...group].sort((a, b) => a.teamName.localeCompare(b.teamName, 'pt-BR'));
  }

  const criterion = criteria[criterionIndex];

  // Valor de comparação de cada time segundo o critério atual
  let keyOf: (s: Stats) => number;

  if (criterion === 'headToHead') {
    // Mini-tabela apenas com os jogos entre os times deste grupo de empate
    const groupIds = new Set(group.map((s) => s.teamId));
    const h2hMatches = matches.filter(
      (m) => groupIds.has(m.homeTeamId) && groupIds.has(m.awayTeamId),
    );
    const h2hStats = new Map<number, Stats>();
    for (const s of group) {
      h2hStats.set(s.teamId, emptyStats(s.teamId, s.teamName, 0));
    }
    accumulate(h2hStats, h2hMatches, config);
    keyOf = (s) => h2hStats.get(s.teamId)!.points;
  } else {
    keyOf = (s) => keyBase(s, criterion);
  }

  // Ordena pelo critério atual (maior chave = melhor)
  const sorted = [...group].sort((a, b) => keyOf(b) - keyOf(a));

  // Reparte em subgrupos que continuam empatados e aplica o próximo critério
  const result: Stats[] = [];
  let i = 0;
  while (i < sorted.length) {
    let j = i + 1;
    while (j < sorted.length && keyOf(sorted[j]) === keyOf(sorted[i])) j++;
    const tied = sorted.slice(i, j);
    result.push(...sortGroup(tied, criteria, criterionIndex + 1, matches, config));
    i = j;
  }
  return result;
}

/** Valor numérico do critério simples (maior = melhor colocado). */
function keyBase(s: Stats, criterion: string): number {
  switch (criterion) {
    case 'points':
      return s.points;
    case 'wins':
      return s.won;
    case 'goalDiff':
      return s.goalDiff;
    case 'goalsFor':
      return s.goalsFor;
    case 'goalsAgainst':
      return -s.goalsAgainst;
    default:
      return 0;
  }
}

export function computeStandings(
  config: ScoringConfig,
  enrollments: EnrollmentInput[],
  matches: MatchInput[],
): StandingRow[] {
  const stats = new Map<number, Stats>();
  for (const e of enrollments) {
    stats.set(e.teamId, emptyStats(e.teamId, e.teamName, e.pointsAdjustment));
  }

  accumulate(stats, matches, config);

  // Filtra critérios desconhecidos para tolerar configs antigas/corrompidas
  const criteria = (config.tiebreakers || []).filter((c) =>
    (TIEBREAKER_CRITERIA as readonly string[]).includes(c),
  );

  // 1º critério é sempre pontos; depois os desempates configurados
  const ordered = sortGroup([...stats.values()], ['points', ...criteria], 0, matches, config);

  return ordered.map((s, index) => ({ ...s, position: index + 1 }));
}
