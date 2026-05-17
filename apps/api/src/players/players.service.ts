import { Injectable, NotFoundException } from '@nestjs/common';
import { Player, PlayerPosition } from './interfaces/players.interface';
import { CreatePlayerDto } from './dto/create-player.dto';
import { PlayerNumberAlreadyInUseException } from './exceptions/player-number-already-in-use.exception';

@Injectable()
export class PlayersService {
  private players: Player[] = [
    {
      id: 1,
      name: 'Carlos Silva',
      number: 1,
      position: PlayerPosition.GOALKEEPER,
      photoUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      name: 'Marcos Oliveira',
      number: 4,
      position: PlayerPosition.DEFENDER,
      photoUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      name: 'Felipe Santos',
      number: 8,
      position: PlayerPosition.MIDFIELDER,
      photoUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 4,
      name: 'Rafael Costa',
      number: 9,
      position: PlayerPosition.FORWARD,
      photoUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  private nextId = 5;

  create(data: CreatePlayerDto): Player {
    const numberExists = this.players.some((p) => p.number === data.number);
    if (numberExists) {
      throw new PlayerNumberAlreadyInUseException(data.number);
    }

    const newPlayer: Player = {
      id: this.nextId++,
      name: data.name,
      number: data.number,
      position: data.position,
      photoUrl: data.photoUrl ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.players.push(newPlayer);
    return newPlayer;
  }

  findAll(query?: any): Player[] {
    let result = this.players;

    if (query?.filter) {
      const lowerFilter = query.filter.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(lowerFilter) ||
          p.position.toLowerCase().includes(lowerFilter),
      );
    }

    return result;
  }

  findOne(id: number): Player {
    const player = this.players.find((p) => p.id === id);

    if (!player) {
      throw new NotFoundException(`Jogador com id ${id} não encontrado.`);
    }

    return player;
  }

  replace(id: number, data: CreatePlayerDto): Player {
    const player = this.findOne(id);

    const numberExists = this.players.some((p) => p.number === data.number && p.id !== id);
    if (numberExists) {
      throw new PlayerNumberAlreadyInUseException(data.number);
    }

    Object.assign(player, {
      ...data,
      photoUrl: data.photoUrl ?? null,
      updatedAt: new Date(),
    });

    return player;
  }

  update(id: number, data: Partial<CreatePlayerDto>): Player {
    const player = this.findOne(id);

    if (data.number !== undefined) {
      const numberExists = this.players.some((p) => p.number === data.number && p.id !== id);
      if (numberExists) {
        throw new PlayerNumberAlreadyInUseException(data.number);
      }
    }

    const updateData = { ...data, updatedAt: new Date() };
    if (data.photoUrl === undefined && !('photoUrl' in data)) {
      // do nothing
    } else {
      (updateData as any).photoUrl = data.photoUrl ?? null;
    }

    Object.assign(player, updateData);

    return player;
  }

  remove(id: number): void {
    const index = this.players.findIndex((p) => p.id === id);

    if (index === -1) {
      throw new NotFoundException(`Jogador com id ${id} não encontrado.`);
    }

    this.players.splice(index, 1);
  }
}
