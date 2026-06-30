import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStandingDto } from './dto/create-standing.dto';
import { UpdateStandingDto } from './dto/update-standing.dto';

@Injectable()
export class StandingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createStandingDto: CreateStandingDto) {
    // Check if championship exists
    const championship = await this.prisma.championship.findUnique({
      where: { id: createStandingDto.championshipId },
    });
    if (!championship) {
      throw new NotFoundException(`Campeonato com ID ${createStandingDto.championshipId} não encontrado.`);
    }

    // Check if team exists
    const team = await this.prisma.team.findUnique({
      where: { id: createStandingDto.teamId },
    });
    if (!team) {
      throw new NotFoundException(`Time com ID ${createStandingDto.teamId} não encontrado.`);
    }

    // Check if this team is already in the championship
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
        position: createStandingDto.position ?? 0,
        points: createStandingDto.points ?? 0,
        played: createStandingDto.played ?? 0,
        won: createStandingDto.won ?? 0,
        drawn: createStandingDto.drawn ?? 0,
        lost: createStandingDto.lost ?? 0,
        goalsFor: createStandingDto.goalsFor ?? 0,
        goalsAgainst: createStandingDto.goalsAgainst ?? 0,
      },
      include: {
        championship: true,
        team: true,
      },
    });
  }

  async findAll() {
    return this.prisma.standing.findMany({
      include: {
        championship: true,
        team: true,
      },
      orderBy: [
        { championshipId: 'asc' },
        { position: 'asc' },
      ],
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
      throw new NotFoundException(`Registro de classificação com ID ${id} não encontrado.`);
    }

    return standing;
  }

  async update(id: number, updateStandingDto: UpdateStandingDto) {
    await this.findOne(id);

    // If changing championshipId or teamId, check for duplicates
    if (updateStandingDto.championshipId !== undefined || updateStandingDto.teamId !== undefined) {
      const current = await this.findOne(id);
      const targetChampionshipId = updateStandingDto.championshipId ?? current.championshipId;
      const targetTeamId = updateStandingDto.teamId ?? current.teamId;

      if (targetChampionshipId !== current.championshipId || targetTeamId !== current.teamId) {
        const duplicate = await this.prisma.standing.findFirst({
          where: {
            championshipId: targetChampionshipId,
            teamId: targetTeamId,
            id: { not: id },
          },
        });
        if (duplicate) {
          throw new BadRequestException('Este time já possui um registro de classificação neste campeonato.');
        }
      }
    }

    return this.prisma.standing.update({
      where: { id },
      data: {
        championshipId: updateStandingDto.championshipId,
        teamId: updateStandingDto.teamId,
        position: updateStandingDto.position,
        points: updateStandingDto.points,
        played: updateStandingDto.played,
        won: updateStandingDto.won,
        drawn: updateStandingDto.drawn,
        lost: updateStandingDto.lost,
        goalsFor: updateStandingDto.goalsFor,
        goalsAgainst: updateStandingDto.goalsAgainst,
      },
      include: {
        championship: true,
        team: true,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.standing.delete({
      where: { id },
    });
  }
}
