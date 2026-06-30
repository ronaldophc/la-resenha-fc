import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';

@Injectable()
export class TeamsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateTeamDto) {
    const nameExists = await this.prisma.team.findUnique({
      where: { name: data.name },
    });
    if (nameExists) {
      throw new BadRequestException(`Já existe um time cadastrado com o nome "${data.name}".`);
    }

    return this.prisma.team.create({
      data: {
        name: data.name,
        logoUrl: data.logoUrl ?? null,
      },
    });
  }

  async findAll(filter?: string) {
    if (filter) {
      return this.prisma.team.findMany({
        where: {
          name: { contains: filter, mode: 'insensitive' },
        },
        orderBy: { name: 'asc' },
      });
    }

    return this.prisma.team.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const team = await this.prisma.team.findUnique({
      where: { id },
    });
    if (!team) {
      throw new NotFoundException(`Time com ID ${id} não encontrado.`);
    }
    return team;
  }

  async update(id: number, data: UpdateTeamDto) {
    await this.findOne(id);

    if (data.name) {
      const nameExists = await this.prisma.team.findFirst({
        where: {
          name: data.name,
          id: { not: id },
        },
      });
      if (nameExists) {
        throw new BadRequestException(`Já existe outro time cadastrado com o nome "${data.name}".`);
      }
    }

    return this.prisma.team.update({
      where: { id },
      data: {
        name: data.name,
        logoUrl: data.logoUrl !== undefined ? (data.logoUrl ?? null) : undefined,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.team.delete({
      where: { id },
    });
  }
}
