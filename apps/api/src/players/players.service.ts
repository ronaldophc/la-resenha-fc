import { Injectable, NotFoundException } from '@nestjs/common';
import { Player, PlayerPosition } from './interfaces/players.interface';

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

  create(data: {
    name: string;
    number: number;
    position: PlayerPosition;
    photoUrl?: string;
  }): Player {
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

  findAll(): Player[] {
    return this.players;
  }

  findOne(id: number): Player {
    const player = this.players.find((p) => p.id === id);

    if (!player) {
      throw new NotFoundException(`Jogador com id ${id} não encontrado.`);
    }

    return player;
  }

  replace(id: number, data: Pick<Player, 'name' | 'number' | 'position' | 'photoUrl'>): Player {
    const player = this.findOne(id);

    Object.assign(player, { ...data, updatedAt: new Date() });

    return player;
  }

  update(id: number, data: Partial<Player>): Player {
    const player = this.findOne(id);

    Object.assign(player, { ...data, updatedAt: new Date() });

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
