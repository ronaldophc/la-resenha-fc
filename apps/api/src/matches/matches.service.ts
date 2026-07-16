import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMatchDto } from './dto/create-match.dto';

const MATCH_INCLUDE = {
  championship: true,
  homeTeam: true,
  awayTeam: true,
} as const;

@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateMatchDto) {
    const { championship, homeTeam, awayTeam } = await this.validateRelations(data);

    this.validateScores(data.homeScore, data.awayScore);

    // Partida de campeonato exige os dois times cadastrados
    if (championship && (!homeTeam || !awayTeam)) {
      throw new BadRequestException(
        'Partidas de campeonato exigem mandante e visitante cadastrados como times.',
      );
    }
    // Amistoso sem times cadastrados exige ao menos o nome do adversário
    if (!homeTeam && !awayTeam && !data.opponent?.trim()) {
      throw new BadRequestException('Informe os times da partida ou o nome do adversário.');
    }

    const match = await this.prisma.match.create({
      data: {
        date: new Date(data.date),
        opponent: await this.deriveOpponent(data.opponent, homeTeam, awayTeam),
        location: data.location,
        homeScore: data.homeScore ?? null,
        awayScore: data.awayScore ?? null,
        homeTeamId: homeTeam?.id ?? null,
        awayTeamId: awayTeam?.id ?? null,
        championshipId: championship?.id ?? null,
      },
      include: MATCH_INCLUDE,
    });

    if (championship && homeTeam && awayTeam) {
      await this.autoEnroll(championship.id, [homeTeam.id, awayTeam.id]);
    }

    return match;
  }

  async findAll() {
    return this.prisma.match.findMany({
      include: MATCH_INCLUDE,
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: number) {
    const match = await this.prisma.match.findUnique({
      where: { id },
      include: MATCH_INCLUDE,
    });
    if (!match) {
      throw new NotFoundException(`Partida com id ${id} não encontrada.`);
    }
    return match;
  }

  async update(id: number, data: Partial<CreateMatchDto>) {
    const current = await this.findOne(id);

    const { championship, homeTeam, awayTeam } = await this.validateRelations(data);

    // Estado final após o merge (undefined = não alterado; null = limpar)
    const finalChampionshipId =
      data.championshipId !== undefined ? (data.championshipId ?? null) : current.championshipId;
    const finalHomeTeamId =
      data.homeTeamId !== undefined ? (data.homeTeamId ?? null) : current.homeTeamId;
    const finalAwayTeamId =
      data.awayTeamId !== undefined ? (data.awayTeamId ?? null) : current.awayTeamId;
    const finalHomeScore =
      data.homeScore !== undefined ? data.homeScore : current.homeScore;
    const finalAwayScore =
      data.awayScore !== undefined ? data.awayScore : current.awayScore;

    this.validateScores(finalHomeScore, finalAwayScore);

    if (finalChampionshipId && (!finalHomeTeamId || !finalAwayTeamId)) {
      throw new BadRequestException(
        'Partidas de campeonato exigem mandante e visitante cadastrados como times.',
      );
    }
    if (finalHomeTeamId && finalAwayTeamId && finalHomeTeamId === finalAwayTeamId) {
      throw new BadRequestException('Mandante e visitante devem ser times diferentes.');
    }

    const updateData: any = {};
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.location !== undefined) updateData.location = data.location;
    if (data.homeScore !== undefined) updateData.homeScore = data.homeScore;
    if (data.awayScore !== undefined) updateData.awayScore = data.awayScore;
    if (data.championshipId !== undefined) updateData.championshipId = data.championshipId ?? null;
    if (data.homeTeamId !== undefined) updateData.homeTeamId = data.homeTeamId ?? null;
    if (data.awayTeamId !== undefined) updateData.awayTeamId = data.awayTeamId ?? null;

    // Mantém o campo textual legado coerente com os times informados
    if (data.opponent !== undefined || data.homeTeamId !== undefined || data.awayTeamId !== undefined) {
      const finalHome = homeTeam ?? (finalHomeTeamId ? await this.findTeam(finalHomeTeamId) : null);
      const finalAway = awayTeam ?? (finalAwayTeamId ? await this.findTeam(finalAwayTeamId) : null);
      updateData.opponent = await this.deriveOpponent(
        data.opponent ?? (finalHome || finalAway ? undefined : current.opponent),
        finalHome,
        finalAway,
      );
    }

    const match = await this.prisma.match.update({
      where: { id },
      data: updateData,
      include: MATCH_INCLUDE,
    });

    if (finalChampionshipId && finalHomeTeamId && finalAwayTeamId) {
      await this.autoEnroll(finalChampionshipId, [finalHomeTeamId, finalAwayTeamId]);
    }

    return match;
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.prisma.match.delete({
      where: { id },
    });
  }

  /** Valida existência de campeonato e times informados no payload. */
  private async validateRelations(data: Partial<CreateMatchDto>) {
    let championship: { id: number } | null = null;
    if (data.championshipId) {
      championship = await this.prisma.championship.findUnique({
        where: { id: data.championshipId },
      });
      if (!championship) {
        throw new NotFoundException(`Campeonato com ID ${data.championshipId} não encontrado.`);
      }
    }

    const homeTeam = data.homeTeamId ? await this.findTeam(data.homeTeamId) : null;
    const awayTeam = data.awayTeamId ? await this.findTeam(data.awayTeamId) : null;

    if (data.homeTeamId && data.awayTeamId && data.homeTeamId === data.awayTeamId) {
      throw new BadRequestException('Mandante e visitante devem ser times diferentes.');
    }

    return { championship, homeTeam, awayTeam };
  }

  private async findTeam(id: number) {
    const team = await this.prisma.team.findUnique({ where: { id } });
    if (!team) {
      throw new NotFoundException(`Time com ID ${id} não encontrado.`);
    }
    return team;
  }

  /** Placar deve vir completo (os dois) ou vazio (partida agendada). */
  private validateScores(homeScore?: number | null, awayScore?: number | null) {
    const hasHome = homeScore !== null && homeScore !== undefined;
    const hasAway = awayScore !== null && awayScore !== undefined;
    if (hasHome !== hasAway) {
      throw new BadRequestException(
        'Informe o placar completo (mandante e visitante) ou deixe ambos vazios para partida agendada.',
      );
    }
  }

  /**
   * Campo textual legado (perspectiva do La Resenha) usado pelo site público
   * durante a transição: nome do time que NÃO é o clube da casa.
   */
  private async deriveOpponent(
    explicit: string | undefined,
    homeTeam: { name: string; isOwnClub: boolean } | null,
    awayTeam: { name: string; isOwnClub: boolean } | null,
  ): Promise<string> {
    if (explicit?.trim()) return explicit.trim();
    if (homeTeam?.isOwnClub && awayTeam) return awayTeam.name;
    if (awayTeam?.isOwnClub && homeTeam) return homeTeam.name;
    return awayTeam?.name ?? homeTeam?.name ?? '';
  }

  /** Garante que os times da partida estejam inscritos no campeonato. */
  private async autoEnroll(championshipId: number, teamIds: number[]) {
    await Promise.all(
      teamIds.map((teamId) =>
        this.prisma.standing.upsert({
          where: { championshipId_teamId: { championshipId, teamId } },
          create: { championshipId, teamId },
          update: {},
        }),
      ),
    );
  }
}
