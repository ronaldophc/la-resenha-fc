import {
  computeStandings,
  ScoringConfig,
  EnrollmentInput,
  MatchInput,
} from './standings-calculator';

const defaultConfig: ScoringConfig = {
  pointsPerWin: 3,
  pointsPerDraw: 1,
  pointsPerLoss: 0,
  tiebreakers: ['wins', 'goalDiff', 'goalsFor', 'headToHead'],
};

const enroll = (id: number, name: string, adj = 0): EnrollmentInput => ({
  teamId: id,
  teamName: name,
  pointsAdjustment: adj,
});

const match = (
  homeTeamId: number,
  awayTeamId: number,
  homeScore: number,
  awayScore: number,
): MatchInput => ({ homeTeamId, awayTeamId, homeScore, awayScore });

describe('computeStandings', () => {
  it('calcula pontos, jogos, vitórias, empates, derrotas e gols', () => {
    const table = computeStandings(
      defaultConfig,
      [enroll(1, 'Resenha'), enroll(2, 'Barcelona'), enroll(3, 'Real')],
      [
        match(1, 2, 2, 1), // Resenha vence
        match(2, 3, 0, 0), // empate
        match(3, 1, 1, 3), // Resenha vence fora
      ],
    );

    const resenha = table.find((r) => r.teamId === 1)!;
    expect(resenha.position).toBe(1);
    expect(resenha.points).toBe(6);
    expect(resenha.played).toBe(2);
    expect(resenha.won).toBe(2);
    expect(resenha.drawn).toBe(0);
    expect(resenha.lost).toBe(0);
    expect(resenha.goalsFor).toBe(5);
    expect(resenha.goalsAgainst).toBe(2);
    expect(resenha.goalDiff).toBe(3);

    const barcelona = table.find((r) => r.teamId === 2)!;
    expect(barcelona.points).toBe(1);
    expect(barcelona.played).toBe(2);
    expect(barcelona.drawn).toBe(1);
    expect(barcelona.lost).toBe(1);
  });

  it('respeita configuração de pontos customizada (vitória=2, empate=1, derrota=1)', () => {
    const config: ScoringConfig = {
      pointsPerWin: 2,
      pointsPerDraw: 1,
      pointsPerLoss: 1,
      tiebreakers: [],
    };
    const table = computeStandings(
      config,
      [enroll(1, 'A'), enroll(2, 'B')],
      [match(1, 2, 3, 0)],
    );
    expect(table[0].points).toBe(2); // vencedor
    expect(table[1].points).toBe(1); // perdedor ainda pontua
  });

  it('desempata por vitórias antes de saldo quando configurado assim', () => {
    // A: 1 vitória, 1 derrota (saldo 0). B: 2 empates + stats iguais em pontos:
    // A: vence 3x0, perde 0x1 => 3 pts, 1 vitória, saldo +2
    // B: empata 2 => 2 pts... precisa dar mesmos pontos.
    // Cenário: A vence 1 e perde 2 (3 pts, saldo -2); B empata 3 (3 pts, saldo 0)
    const config: ScoringConfig = { ...defaultConfig, tiebreakers: ['wins'] };
    const table = computeStandings(
      config,
      [enroll(1, 'A'), enroll(2, 'B'), enroll(3, 'C'), enroll(4, 'D')],
      [
        match(1, 3, 1, 0), // A vence
        match(1, 4, 0, 2), // A perde
        match(3, 1, 3, 0), // A perde
        match(2, 3, 1, 1), // B empata
        match(2, 4, 0, 0), // B empata
        match(4, 2, 2, 2), // B empata
      ],
    );
    const a = table.find((r) => r.teamId === 1)!;
    const b = table.find((r) => r.teamId === 2)!;
    expect(a.points).toBe(3);
    expect(b.points).toBe(3);
    // A tem 1 vitória e saldo -4; B tem 0 vitórias e saldo 0.
    // Com desempate por vitórias, A fica na frente apesar do saldo pior.
    expect(a.position).toBeLessThan(b.position);
  });

  it('desempata por saldo de gols', () => {
    const config: ScoringConfig = { ...defaultConfig, tiebreakers: ['goalDiff'] };
    const table = computeStandings(
      config,
      [enroll(1, 'A'), enroll(2, 'B'), enroll(3, 'C'), enroll(4, 'D')],
      [
        match(1, 3, 5, 0), // A vence por 5
        match(2, 4, 1, 0), // B vence por 1
      ],
    );
    expect(table[0].teamId).toBe(1); // mesmo 3 pts, saldo maior
    expect(table[1].teamId).toBe(2);
  });

  it('desempata por confronto direto entre dois times', () => {
    const config: ScoringConfig = {
      ...defaultConfig,
      tiebreakers: ['headToHead'],
    };

    const minimal = computeStandings(
      config,
      [enroll(1, 'A'), enroll(2, 'B')],
      [
        match(2, 1, 2, 1), // B vence A
        match(1, 2, 1, 0), // A vence B — mesmos pontos, mesmas vitórias
        // saldo: A 2-2=0, B 2-2=0; gols pró iguais (2 e 2)
        // confronto direto entre A e B: 3 pts cada — continua empatado,
        // cai no fallback alfabético => A antes de B
      ],
    );
    expect(minimal[0].teamName).toBe('A');

    // Agora um confronto direto decisivo: B vence os dois jogos entre eles,
    // mas A compensa pontos contra outros times.
    const decisive = computeStandings(
      config,
      [enroll(1, 'A'), enroll(2, 'B'), enroll(3, 'C'), enroll(4, 'D')],
      [
        match(2, 1, 1, 0), // B vence A (confronto direto)
        match(1, 3, 1, 0), // A vence C
        match(1, 4, 1, 0), // A vence D
        match(2, 3, 1, 0), // B vence C
        match(4, 2, 1, 0), // D vence B
        // A: 6 pts (2V), saldo 2-1=+1... B: 6 pts (2V), saldo 2-1=+1
        // Empatados em tudo; confronto direto: B venceu A => B na frente
      ],
    );
    const a = decisive.find((r) => r.teamName === 'A')!;
    const b = decisive.find((r) => r.teamName === 'B')!;
    expect(a.points).toBe(b.points);
    expect(b.position).toBeLessThan(a.position);
  });

  it('aplica ajuste manual de pontos (punição)', () => {
    const table = computeStandings(
      defaultConfig,
      [enroll(1, 'A', -3), enroll(2, 'B')],
      [match(1, 2, 1, 0)], // A vence, mas tem -3 de punição
    );
    const a = table.find((r) => r.teamId === 1)!;
    const b = table.find((r) => r.teamId === 2)!;
    expect(a.points).toBe(0); // 3 da vitória - 3 de punição
    expect(b.points).toBe(0);
    expect(a.pointsAdjustment).toBe(-3);
    // Empatados em pontos; A leva no desempate por ter 1 vitória
    expect(a.position).toBe(1);
    expect(b.position).toBe(2);
  });

  it('ignora partidas de times não inscritos e sem placar não entram (pré-filtradas)', () => {
    const table = computeStandings(
      defaultConfig,
      [enroll(1, 'A'), enroll(2, 'B')],
      [
        match(1, 2, 1, 0),
        match(1, 99, 5, 0), // time 99 não inscrito: partida ignorada
      ],
    );
    const a = table.find((r) => r.teamId === 1)!;
    expect(a.played).toBe(1);
    expect(a.goalsFor).toBe(1);
  });

  it('fallback alfabético garante ordenação determinística', () => {
    const table = computeStandings(
      defaultConfig,
      [enroll(2, 'Zebra'), enroll(1, 'Águia')],
      [],
    );
    expect(table[0].teamName).toBe('Águia');
    expect(table.map((r) => r.position)).toEqual([1, 2]);
  });

  it('ignora critérios de desempate desconhecidos', () => {
    const config: ScoringConfig = {
      ...defaultConfig,
      tiebreakers: ['naoExiste', 'goalDiff'],
    };
    const table = computeStandings(
      config,
      [enroll(1, 'A'), enroll(2, 'B'), enroll(3, 'C'), enroll(4, 'D')],
      [
        match(1, 3, 3, 0),
        match(2, 4, 1, 0),
      ],
    );
    expect(table[0].teamId).toBe(1); // desempatou por saldo, sem quebrar
  });
});
