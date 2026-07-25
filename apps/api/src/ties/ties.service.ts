import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GenerateBracketDto } from './dto/generate-bracket.dto';
import { UpdateTieDto } from './dto/update-tie.dto';
import { computeTieWinner, phaseLabel, LegMatch } from './bracket';

@Injectable()
export class TiesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Gera o chaveamento vazio a partir do nº de times na fase inicial (potência de 2). */
  async generate(dto: GenerateBracketDto) {
    const champ = await this.prisma.championship.findUnique({ where: { id: dto.championshipId } });
    if (!champ) throw new NotFoundException('Campeonato não encontrado.');

    const maxRound = Math.log2(dto.teams); // 8 times -> 3 rodadas (Quartas, Semi, Final)

    // Limpa o chaveamento anterior (as partidas vinculadas caem por cascade)
    await this.prisma.tie.deleteMany({ where: { championshipId: dto.championshipId } });

    const data: { championshipId: number; round: number; slot: number }[] = [];
    for (let round = 1; round <= maxRound; round++) {
      const games = 2 ** (maxRound - round);
      for (let slot = 0; slot < games; slot++) {
        data.push({ championshipId: dto.championshipId, round, slot });
      }
    }
    await this.prisma.tie.createMany({ data });
    return this.getBracket(dto.championshipId);
  }

  /** Retorna o chaveamento (confrontos com times, vencedor e jogos) + rótulos de fase. */
  async getBracket(championshipId: number) {
    const ties = await this.prisma.tie.findMany({
      where: { championshipId },
      include: {
        homeTeam: true,
        awayTeam: true,
        matches: { orderBy: { leg: 'asc' } },
      },
      orderBy: [{ round: 'asc' }, { slot: 'asc' }],
    });
    if (ties.length === 0) return { championshipId, maxRound: 0, ties: [] };
    const maxRound = Math.max(...ties.map((t) => t.round));
    return {
      championshipId,
      maxRound,
      ties: ties.map((t) => ({ ...t, phase: phaseLabel(t.round, maxRound) })),
    };
  }

  /** Define os times (só na fase inicial) e/ou os placares do confronto, e recalcula o avanço. */
  async updateTie(id: number, dto: UpdateTieDto) {
    const tie = await this.prisma.tie.findUnique({ where: { id }, include: { championship: true } });
    if (!tie) throw new NotFoundException('Confronto não encontrado.');
    const legsAllowed = tie.championship.knockoutLegs || 1;

    // Só a fase inicial permite escolher os times na mão (as demais vêm do avanço)
    if (tie.round === 1) {
      const data: { homeTeamId?: number | null; awayTeamId?: number | null } = {};
      if (dto.homeTeamId !== undefined) data.homeTeamId = dto.homeTeamId ?? null;
      if (dto.awayTeamId !== undefined) data.awayTeamId = dto.awayTeamId ?? null;
      if (Object.keys(data).length) await this.prisma.tie.update({ where: { id }, data });
    }

    if (dto.legs) {
      const fresh = await this.prisma.tie.findUnique({ where: { id } });
      const lastRound = await this.prisma.tie.findFirst({
        where: { championshipId: tie.championshipId },
        orderBy: { round: 'desc' },
      });
      const maxRound = lastRound?.round || tie.round;
      const label = phaseLabel(tie.round, maxRound);

      await this.prisma.match.deleteMany({ where: { tieId: id } });

      for (let i = 0; i < Math.min(dto.legs.length, legsAllowed); i++) {
        const l = dto.legs[i];
        const hasScore = l.homeScore !== undefined && l.homeScore !== null
          && l.awayScore !== undefined && l.awayScore !== null;
        // Cria a partida se houver placar OU se foi agendada (data/local informados)
        const scheduled = !!l.date || !!(l.location && l.location.trim());
        if (!hasScore && !scheduled) continue;
        const legNo = i + 1;
        // O mando inverte no 2º jogo (ida e volta)
        const legHome = legNo === 2 ? fresh!.awayTeamId : fresh!.homeTeamId;
        const legAway = legNo === 2 ? fresh!.homeTeamId : fresh!.awayTeamId;
        await this.prisma.match.create({
          data: {
            date: l.date ? new Date(l.date) : new Date(),
            opponent: '',
            location: l.location?.trim() || '',
            homeScore: hasScore ? l.homeScore! : null,
            awayScore: hasScore ? l.awayScore! : null,
            homePenalties: l.homePenalties ?? null,
            awayPenalties: l.awayPenalties ?? null,
            phase: label,
            homeTeamId: legHome ?? null,
            awayTeamId: legAway ?? null,
            championshipId: tie.championshipId,
            tieId: id,
            leg: legNo,
          },
        });
      }
    }

    await this.recompute(tie.championshipId);
    return this.getBracket(tie.championshipId);
  }

  /** Recalcula vencedores e propaga os avanços por todas as rodadas. */
  async recompute(championshipId: number) {
    const champ = await this.prisma.championship.findUnique({ where: { id: championshipId } });
    const legs = champ?.knockoutLegs || 1;

    const ties = await this.prisma.tie.findMany({
      where: { championshipId },
      include: { matches: true },
      orderBy: [{ round: 'asc' }, { slot: 'asc' }],
    });
    if (ties.length === 0) return;
    const maxRound = Math.max(...ties.map((t) => t.round));

    const byRS = new Map<string, (typeof ties)[number]>();
    for (const t of ties) byRS.set(`${t.round}:${t.slot}`, t);
    const winners = new Map<number, number | null>();

    for (let round = 1; round <= maxRound; round++) {
      const roundTies = ties.filter((t) => t.round === round);
      for (const t of roundTies) {
        let home = t.homeTeamId;
        let away = t.awayTeamId;

        if (round > 1) {
          const prevHome = byRS.get(`${round - 1}:${t.slot * 2}`);
          const prevAway = byRS.get(`${round - 1}:${t.slot * 2 + 1}`);
          const newHome = prevHome ? winners.get(prevHome.id) ?? null : null;
          const newAway = prevAway ? winners.get(prevAway.id) ?? null : null;
          if (newHome !== home || newAway !== away) {
            // Times mudaram (resultado anterior editado): jogos lançados ficam inválidos
            if (t.matches.length) await this.prisma.match.deleteMany({ where: { tieId: t.id } });
            t.matches = [];
            home = newHome;
            away = newAway;
            await this.prisma.tie.update({ where: { id: t.id }, data: { homeTeamId: home, awayTeamId: away } });
          }
        }

        const legMatches: LegMatch[] = t.matches.map((m) => ({
          homeTeamId: m.homeTeamId,
          awayTeamId: m.awayTeamId,
          homeScore: m.homeScore,
          awayScore: m.awayScore,
          homePenalties: m.homePenalties,
          awayPenalties: m.awayPenalties,
        }));
        const winner = computeTieWinner(home, away, legMatches, legs);
        winners.set(t.id, winner);
        if (winner !== t.winnerTeamId) {
          await this.prisma.tie.update({ where: { id: t.id }, data: { winnerTeamId: winner } });
        }
      }
    }
  }
}
