import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStandingDto } from './dto/create-standing.dto';
import { UpdateStandingDto } from './dto/update-standing.dto';
import { Standing } from './interfaces/standing.interface';

@Injectable()
export class StandingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createStandingDto: CreateStandingDto): Promise<Standing> {
    return this.prisma.standing.create({
      data: createStandingDto,
    });
  }

  async findAll(): Promise<Standing[]> {
    return this.prisma.standing.findMany({
      orderBy: {
        position: 'asc',
      },
    });
  }

  async findOne(id: number): Promise<Standing> {
    const standing = await this.prisma.standing.findUnique({
      where: { id },
    });

    if (!standing) {
      throw new NotFoundException(`Tabela de classificação com ID ${id} não encontrada`);
    }

    return standing;
  }

  async update(id: number, updateStandingDto: UpdateStandingDto): Promise<Standing> {
    await this.findOne(id);

    return this.prisma.standing.update({
      where: { id },
      data: updateStandingDto,
    });
  }

  async remove(id: number): Promise<Standing> {
    await this.findOne(id);

    return this.prisma.standing.delete({
      where: { id },
    });
  }
}
