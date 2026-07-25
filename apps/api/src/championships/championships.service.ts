import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChampionshipDto } from './dto/create-championship.dto';
import { UpdateChampionshipDto } from './dto/update-championship.dto';
import { StandingsService } from '../standings/standings.service';

@Injectable()
export class ChampionshipsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly standingsService: StandingsService,
  ) {}

  async create(data: CreateChampionshipDto) {
    const nameExists = await this.prisma.championship.findUnique({
      where: { name: data.name },
    });
    if (nameExists) {
      throw new BadRequestException(`Já existe um campeonato cadastrado com o nome "${data.name}".`);
    }

    return this.prisma.championship.create({
      data: {
        name: data.name,
        logoUrl: data.logoUrl ?? null,
        format: data.format ?? 'PONTOS_CORRIDOS',
        knockoutLegs: data.knockoutLegs ?? 1,
        pointsPerWin: data.pointsPerWin ?? 3,
        pointsPerDraw: data.pointsPerDraw ?? 1,
        pointsPerLoss: data.pointsPerLoss ?? 0,
        tiebreakers: data.tiebreakers ?? ['wins', 'goalDiff', 'goalsFor', 'headToHead'],
      },
    });
  }

  async findAll() {
    return this.prisma.championship.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const championship = await this.prisma.championship.findUnique({
      where: { id },
    });
    if (!championship) {
      throw new NotFoundException(`Campeonato com ID ${id} não encontrado.`);
    }

    // Tabela calculada a partir das partidas, no lugar dos registros manuais
    const standings = await this.standingsService.getTable(id);
    return { ...championship, standings };
  }

  async update(id: number, data: UpdateChampionshipDto) {
    await this.findOne(id);

    if (data.name) {
      const nameExists = await this.prisma.championship.findFirst({
        where: {
          name: data.name,
          id: { not: id },
        },
      });
      if (nameExists) {
        throw new BadRequestException(`Já existe outro campeonato cadastrado com o nome "${data.name}".`);
      }
    }

    return this.prisma.championship.update({
      where: { id },
      data: {
        name: data.name,
        logoUrl: data.logoUrl !== undefined ? (data.logoUrl ?? null) : undefined,
        format: data.format,
        knockoutLegs: data.knockoutLegs,
        pointsPerWin: data.pointsPerWin,
        pointsPerDraw: data.pointsPerDraw,
        pointsPerLoss: data.pointsPerLoss,
        tiebreakers: data.tiebreakers,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.championship.delete({
      where: { id },
    });
  }
}
