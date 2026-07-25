import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStandingDto } from './dto/create-standing.dto';
import { UpdateStandingDto } from './dto/update-standing.dto';
import { computeStandings } from './standings-calculator';

/**
 * A tabela de classificação não é armazenada: cada linha de `standings` no
 * banco representa apenas a inscrição de um time no campeonato (+ ajuste
 * manual de pontos). As estatísticas são calculadas a partir das partidas
 * com placar preenchido, usando a configuração de pontuação/desempate do
 * campeonato.
 */
@Injectable()
export class StandingsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Inscreve um time em um campeonato. */
  async create(createStandingDto: CreateStandingDto) {
    const championship = await this.prisma.championship.findUnique({
      where: { id: createStandingDto.championshipId },
    });
    if (!championship) {
      throw new NotFoundException(`Campeonato com ID ${createStandingDto.championshipId} não encontrado.`);
    }

    const team = await this.prisma.team.findUnique({
      where: { id: createStandingDto.teamId },
    });
    if (!team) {
      throw new NotFoundException(`Time com ID ${createStandingDto.teamId} não encontrado.`);
    }

    const existingStanding = await this.prisma.standing.findUnique({
      where: {
        championshipId_teamId: {
          championshipId: createStandingDto.championshipId,
          teamId: createStandingDto.teamId,
        },
      },
    });
    if (existingStanding) {
      throw new BadRequestException(`O time "${team.name}" já está participando do campeonato "${championship.name}".`);
    }

    return this.prisma.standing.create({
      data: {
        championshipId: createStandingDto.championshipId,
        teamId: createStandingDto.teamId,
        pointsAdjustment: createStandingDto.pointsAdjustment ?? 0,
        groupName: createStandingDto.groupName?.trim() || null,
      },
      include: {
        championship: true,
        team: true,
      },
    });
  }

  /**
   * Retorna a(s) tabela(s) calculada(s). Com `championshipId`, só a daquele
   * campeonato; sem, as de todos os campeonatos com times inscritos.
   * O formato de cada linha é compatível com o antigo registro armazenado.
   */
  async findAll(championshipId?: number) {
    const championships = await this.prisma.championship.findMany({
      where: championshipId ? { id: championshipId } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    const tables = await Promise.all(
      championships.map((c) => this.computeTableForChampionship(c)),
    );
    return tables.flat();
  }

  /** Calcula a tabela de um campeonato específico. */
  async getTable(championshipId: number) {
    const championship = await this.prisma.championship.findUnique({
      where: { id: championshipId },
    });
    if (!championship) {
      throw new NotFoundException(`Campeonato com ID ${championshipId} não encontrado.`);
    }
    return this.computeTableForChampionship(championship);
  }

  private async computeTableForChampionship(championship: {
    id: number;
    format?: string;
    pointsPerWin: number;
    pointsPerDraw: number;
    pointsPerLoss: number;
    tiebreakers: string[];
  }) {
    const [enrollments, matches] = await Promise.all([
      this.prisma.standing.findMany({
        where: { championshipId: championship.id },
        include: { team: true, championship: true },
      }),
      this.prisma.match.findMany({
        where: {
          championshipId: championship.id,
          homeScore: { not: null },
          awayScore: { not: null },
          homeTeamId: { not: null },
          awayTeamId: { not: null },
        },
      }),
    ]);

    if (enrollments.length === 0) return [];

    const format = championship.format || 'PONTOS_CORRIDOS';

    // Mata-mata puro não tem tabela de classificação (só chaveamento)
    if (format === 'MATA_MATA') return [];

    // Grupos + mata-mata: uma tabela por grupo, contando só os jogos daquele grupo
    if (format === 'GRUPOS_MATA_MATA') {
      const groups = Array.from(
        new Set(enrollments.map((e) => e.groupName).filter((g): g is string => !!g)),
      ).sort((a, b) => a.localeCompare(b, 'pt-BR'));

      return groups.flatMap((group) => {
        const groupEnrollments = enrollments.filter((e) => e.groupName === group);
        const groupMatches = matches.filter((m) => m.groupName === group);
        return this.buildRows(championship, groupEnrollments, groupMatches, group);
      });
    }

    // Pontos corridos: tabela única com todos os jogos (ignora grupo/fase)
    return this.buildRows(championship, enrollments, matches, null);
  }

  /** Roda a calculadora para um conjunto de times/jogos e mapeia para o formato da view. */
  private buildRows(
    championship: { id: number; pointsPerWin: number; pointsPerDraw: number; pointsPerLoss: number; tiebreakers: string[] },
    enrollments: any[],
    matches: any[],
    group: string | null,
  ) {
    const rows = computeStandings(
      {
        pointsPerWin: championship.pointsPerWin,
        pointsPerDraw: championship.pointsPerDraw,
        pointsPerLoss: championship.pointsPerLoss,
        tiebreakers: championship.tiebreakers,
      },
      enrollments.map((e) => ({
        teamId: e.teamId,
        teamName: e.team.name,
        pointsAdjustment: e.pointsAdjustment,
      })),
      matches.map((m) => ({
        homeTeamId: m.homeTeamId!,
        awayTeamId: m.awayTeamId!,
        homeScore: m.homeScore!,
        awayScore: m.awayScore!,
      })),
    );

    const byTeamId = new Map(enrollments.map((e) => [e.teamId, e]));
    return rows.map((row) => {
      const enrollment = byTeamId.get(row.teamId)!;
      return {
        id: enrollment.id,
        championshipId: championship.id,
        teamId: row.teamId,
        group,
        position: row.position,
        points: row.points,
        played: row.played,
        won: row.won,
        drawn: row.drawn,
        lost: row.lost,
        goalsFor: row.goalsFor,
        goalsAgainst: row.goalsAgainst,
        pointsAdjustment: row.pointsAdjustment,
        championship: enrollment.championship,
        team: enrollment.team,
        createdAt: enrollment.createdAt,
        updatedAt: enrollment.updatedAt,
      };
    });
  }

  async findOne(id: number) {
    const standing = await this.prisma.standing.findUnique({
      where: { id },
      include: {
        championship: true,
        team: true,
      },
    });

    if (!standing) {
      throw new NotFoundException(`Inscrição de classificação com ID ${id} não encontrada.`);
    }

    return standing;
  }

  /** Atualiza a inscrição (ajuste manual de pontos e/ou grupo). */
  async update(id: number, updateStandingDto: UpdateStandingDto) {
    await this.findOne(id);

    return this.prisma.standing.update({
      where: { id },
      data: {
        pointsAdjustment: updateStandingDto.pointsAdjustment,
        groupName:
          updateStandingDto.groupName !== undefined
            ? (updateStandingDto.groupName?.trim() || null)
            : undefined,
      },
      include: {
        championship: true,
        team: true,
      },
    });
  }

  /** Remove o time do campeonato (a inscrição). */
  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.standing.delete({
      where: { id },
    });
  }
}
