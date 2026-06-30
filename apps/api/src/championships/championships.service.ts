import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChampionshipDto } from './dto/create-championship.dto';
import { UpdateChampionshipDto } from './dto/update-championship.dto';

@Injectable()
export class ChampionshipsService {
  constructor(private readonly prisma: PrismaService) {}

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
      include: {
        standings: {
          include: {
            team: true,
          },
          orderBy: {
            position: 'asc',
          },
        },
      },
    });
    if (!championship) {
      throw new NotFoundException(`Campeonato com ID ${id} não encontrado.`);
    }
    return championship;
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
