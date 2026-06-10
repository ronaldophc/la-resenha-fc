import { Injectable, NotFoundException } from '@nestjs/common';
import { Player, PlayerPosition } from './interfaces/players.interface';
import { CreatePlayerDto } from './dto/create-player.dto';
import { PlayerNumberAlreadyInUseException } from './exceptions/player-number-already-in-use.exception';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PlayersService {

  constructor(private prisma: PrismaService) {}

  async create(data: CreatePlayerDto): Promise<Player> {
    const numberExists = await this.prisma.player.findUnique({ where: { number: data.number } });
    if (numberExists) {
      throw new PlayerNumberAlreadyInUseException(data.number);
    }

    const newPlayer = await this.prisma.player.create({
      data: {
        name: data.name,
        number: data.number,
        position: data.position,
        photoUrl: data.photoUrl ?? null,
      },
    });

    return newPlayer as Player;
  }

  async findAll(query?: any): Promise<Player[]> {
    if (query?.filter) {
      const filterStr = query.filter;
      return this.prisma.player.findMany({
        where: {
          OR: [
            { name: { contains: filterStr, mode: 'insensitive' } },
            { position: { contains: filterStr, mode: 'insensitive' } },
          ],
        },
      }) as Promise<Player[]>;
    }

    return this.prisma.player.findMany() as Promise<Player[]>;
  }

  async findOne(id: number): Promise<Player> {
    const player = await this.prisma.player.findUnique({
      where: { id },
    });

    if (!player) {
      throw new NotFoundException(`Jogador com id ${id} não encontrado.`);
    }

    return player as Player;
  }

  async replace(id: number, data: CreatePlayerDto): Promise<Player> {
    await this.findOne(id);

    const numberExists = await this.prisma.player.findFirst({
      where: {
        number: data.number,
        id: { not: id },
      },
    });
    if (numberExists) {
      throw new PlayerNumberAlreadyInUseException(data.number);
    }

    const updatedPlayer = await this.prisma.player.update({
      where: { id },
      data: {
        name: data.name,
        number: data.number,
        position: data.position,
        photoUrl: data.photoUrl ?? null,
      },
    });

    return updatedPlayer as Player;
  }

  async update(id: number, data: Partial<CreatePlayerDto>): Promise<Player> {
    await this.findOne(id);

    if (data.number !== undefined) {
      const numberExists = await this.prisma.player.findFirst({
        where: {
          number: data.number,
          id: { not: id },
        },
      });
      if (numberExists) {
        throw new PlayerNumberAlreadyInUseException(data.number);
      }
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.number !== undefined) updateData.number = data.number;
    if (data.position !== undefined) updateData.position = data.position;
    if (data.photoUrl !== undefined) updateData.photoUrl = data.photoUrl ?? null;

    const updatedPlayer = await this.prisma.player.update({
      where: { id },
      data: updateData,
    });

    return updatedPlayer as Player;
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);

    await this.prisma.player.delete({
      where: { id },
    });
  }
}
