import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMatchDto } from './dto/create-match.dto';

@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateMatchDto) {
    if (data.championshipId) {
      const championship = await this.prisma.championship.findUnique({
        where: { id: data.championshipId },
      });
      if (!championship) {
        throw new NotFoundException(`Campeonato com ID ${data.championshipId} não encontrado.`);
      }
    }

    return this.prisma.match.create({
      data: {
        date: new Date(data.date),
        opponent: data.opponent,
        location: data.location,
        homeScore: data.homeScore,
        awayScore: data.awayScore,
        championshipId: data.championshipId ?? null,
      },
      include: {
        championship: true,
      },
    });
  }

  async findAll() {
    return this.prisma.match.findMany({
      include: {
        championship: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: number) {
    const match = await this.prisma.match.findUnique({
      where: { id },
      include: {
        championship: true,
      },
    });
    if (!match) {
      throw new NotFoundException(`Partida com id ${id} não encontrada.`);
    }
    return match;
  }

  async update(id: number, data: Partial<CreateMatchDto>) {
    await this.findOne(id);

    if (data.championshipId) {
      const championship = await this.prisma.championship.findUnique({
        where: { id: data.championshipId },
      });
      if (!championship) {
        throw new NotFoundException(`Campeonato com ID ${data.championshipId} não encontrado.`);
      }
    }

    const updateData: any = {};
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.opponent !== undefined) updateData.opponent = data.opponent;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.homeScore !== undefined) updateData.homeScore = data.homeScore;
    if (data.awayScore !== undefined) updateData.awayScore = data.awayScore;
    if (data.championshipId !== undefined) updateData.championshipId = data.championshipId ?? null;

    return this.prisma.match.update({
      where: { id },
      data: updateData,
      include: {
        championship: true,
      },
    });
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.prisma.match.delete({
      where: { id },
    });
  }
}
