/**
 * Lógica pura do chaveamento (mata-mata): nome da fase e cálculo do vencedor
 * de um confronto (agregado + pênaltis). Sem dependência de banco.
 */

/** Nome da fase a partir do número de times naquela rodada. */
export function roundName(teamsInRound: number): string {
  switch (teamsInRound) {
    case 2:
      return 'Final';
    case 4:
      return 'Semifinal';
    case 8:
      return 'Quartas de final';
    case 16:
      return 'Oitavas de final';
    case 32:
      return '16-avos de final';
    default:
      return `Fase de ${teamsInRound}`;
  }
}

/** Rótulo da fase de um confronto, dado o round (1=inicial) e o total de rounds. */
export function phaseLabel(round: number, maxRound: number): string {
  const teamsInRound = 2 ** (maxRound - round + 1);
  return roundName(teamsInRound);
}

export interface LegMatch {
  homeTeamId: number | null;
  awayTeamId: number | null;
  homeScore: number | null;
  awayScore: number | null;
  homePenalties: number | null;
  awayPenalties: number | null;
}

/**
 * Vencedor do confronto: soma dos gols de cada time (agregado); em caso de
 * empate no agregado, decide pelos pênaltis (na partida que os tiver).
 * Retorna null se ainda não há jogos suficientes ou o empate persiste.
 */
export function computeTieWinner(
  homeTeamId: number | null,
  awayTeamId: number | null,
  matches: LegMatch[],
  requiredLegs: number,
): number | null {
  if (!homeTeamId || !awayTeamId) return null;

  const played = matches.filter((m) => m.homeScore !== null && m.awayScore !== null);
  if (played.length < requiredLegs) return null;

  const goalsFor = (teamId: number) =>
    played.reduce((sum, m) => {
      if (m.homeTeamId === teamId) return sum + (m.homeScore || 0);
      if (m.awayTeamId === teamId) return sum + (m.awayScore || 0);
      return sum;
    }, 0);

  const aggHome = goalsFor(homeTeamId);
  const aggAway = goalsFor(awayTeamId);
  if (aggHome > aggAway) return homeTeamId;
  if (aggAway > aggHome) return awayTeamId;

  // Empate no agregado -> pênaltis
  const pk = played.find((m) => m.homePenalties !== null && m.awayPenalties !== null);
  if (!pk) return null;
  const pkFor = (teamId: number) => {
    if (pk.homeTeamId === teamId) return pk.homePenalties || 0;
    if (pk.awayTeamId === teamId) return pk.awayPenalties || 0;
    return 0;
  };
  const pHome = pkFor(homeTeamId);
  const pAway = pkFor(awayTeamId);
  if (pHome > pAway) return homeTeamId;
  if (pAway > pHome) return awayTeamId;
  return null;
}
