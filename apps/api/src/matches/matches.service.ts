import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { Match } from './interfaces/matches.interface';

@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateMatchDto): Promise<Match> {
    const newMatch = await this.prisma.match.create({
      data: {
        date: new Date(data.date),
        opponent: data.opponent,
        location: data.location,
        homeScore: data.homeScore,
        awayScore: data.awayScore,
        championship: data.championship ?? null,
      },
    });
    return newMatch as Match;
  }

  async findAll(): Promise<Match[]> {
    const matches = await this.prisma.match.findMany({
      orderBy: { date: 'desc' },
    });
    return matches as Match[];
  }

  async findOne(id: number): Promise<Match> {
    const match = await this.prisma.match.findUnique({
      where: { id },
    });
    if (!match) {
      throw new NotFoundException(`Partida com id ${id} não encontrada.`);
    }
    return match as Match;
  }

  async update(id: number, data: Partial<CreateMatchDto>): Promise<Match> {
    await this.findOne(id);

    const updateData: any = {};
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.opponent !== undefined) updateData.opponent = data.opponent;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.homeScore !== undefined) updateData.homeScore = data.homeScore;
    if (data.awayScore !== undefined) updateData.awayScore = data.awayScore;
    if (data.championship !== undefined) updateData.championship = data.championship ?? null;

    const updatedMatch = await this.prisma.match.update({
      where: { id },
      data: updateData,
    });
    return updatedMatch as Match;
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.prisma.match.delete({
      where: { id },
    });
  }
}
