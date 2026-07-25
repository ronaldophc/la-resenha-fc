import { phaseLabel, roundName, computeTieWinner, LegMatch } from './bracket';

const leg = (
  homeTeamId: number,
  awayTeamId: number,
  homeScore: number | null,
  awayScore: number | null,
  homePenalties: number | null = null,
  awayPenalties: number | null = null,
): LegMatch => ({ homeTeamId, awayTeamId, homeScore, awayScore, homePenalties, awayPenalties });

describe('bracket', () => {
  describe('roundName / phaseLabel', () => {
    it('nomeia as fases pelo número de times', () => {
      expect(roundName(2)).toBe('Final');
      expect(roundName(4)).toBe('Semifinal');
      expect(roundName(8)).toBe('Quartas de final');
      expect(roundName(16)).toBe('Oitavas de final');
    });

    it('phaseLabel usa round + total de rounds', () => {
      // 3 rounds (quartas, semi, final): round 1 = Quartas, 2 = Semi, 3 = Final
      expect(phaseLabel(1, 3)).toBe('Quartas de final');
      expect(phaseLabel(2, 3)).toBe('Semifinal');
      expect(phaseLabel(3, 3)).toBe('Final');
    });
  });

  describe('computeTieWinner', () => {
    it('sem os dois times definidos, não há vencedor', () => {
      expect(computeTieWinner(null, 2, [], 1)).toBeNull();
    });

    it('jogo único: vencedor pelo placar', () => {
      expect(computeTieWinner(1, 2, [leg(1, 2, 3, 1)], 1)).toBe(1);
      expect(computeTieWinner(1, 2, [leg(1, 2, 0, 2)], 1)).toBe(2);
    });

    it('jogo único empatado sem pênaltis: sem vencedor', () => {
      expect(computeTieWinner(1, 2, [leg(1, 2, 1, 1)], 1)).toBeNull();
    });

    it('jogo único empatado: decide nos pênaltis', () => {
      expect(computeTieWinner(1, 2, [leg(1, 2, 1, 1, 4, 2)], 1)).toBe(1);
      expect(computeTieWinner(1, 2, [leg(1, 2, 1, 1, 2, 4)], 1)).toBe(2);
    });

    it('ida e volta: vencedor pelo agregado (com mando invertido no 2º jogo)', () => {
      // Ida: 1(casa) 2x0 2 ; Volta: 2(casa) 1x0 1  -> agregado time1=2, time2=1
      const matches = [leg(1, 2, 2, 0), leg(2, 1, 1, 0)];
      expect(computeTieWinner(1, 2, matches, 2)).toBe(1);
    });

    it('ida e volta com só um jogo lançado: incompleto (sem vencedor)', () => {
      expect(computeTieWinner(1, 2, [leg(1, 2, 2, 0)], 2)).toBeNull();
    });

    it('ida e volta empatado no agregado: decide nos pênaltis do 2º jogo', () => {
      // Ida: 1 1x0 2 ; Volta: 2 1x0 1 (agg 1-1), pênaltis no 2º jogo 5x4 para o time 2 (casa)
      const matches = [leg(1, 2, 1, 0), leg(2, 1, 1, 0, 5, 4)];
      expect(computeTieWinner(1, 2, matches, 2)).toBe(2);
    });
  });
});
