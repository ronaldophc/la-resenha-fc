import { Test, TestingModule } from '@nestjs/testing';
import { PlayersService } from './players.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreatePlayerDto } from './dto/create-player.dto';
import { PlayerNumberAlreadyInUseException } from './exceptions/player-number-already-in-use.exception';

describe('PlayersService', () => {
  let service: PlayersService;
  let prisma: PrismaService;

  const mockPlayer = {
    id: 1,
    name: 'Ronaldo',
    number: 10,
    position: 'MIDFIELDER',
    photoUrl: 'https://example.com/ronaldo.jpg',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    player: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlayersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PlayersService>(PlayersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a player successfully', async () => {
      const dto: CreatePlayerDto = {
        name: 'Ronaldo',
        number: 10,
        position: 'MIDFIELDER',
        photoUrl: 'https://example.com/ronaldo.jpg',
      };

      mockPrismaService.player.findUnique.mockResolvedValue(null);
      mockPrismaService.player.create.mockResolvedValue(mockPlayer);

      const result = await service.create(dto);

      expect(prisma.player.findUnique).toHaveBeenCalledWith({ where: { number: dto.number } });
      expect(prisma.player.create).toHaveBeenCalledWith({
        data: {
          name: dto.name,
          number: dto.number,
          position: dto.position,
          photoUrl: dto.photoUrl,
        },
      });
      expect(result).toEqual(mockPlayer);
    });

    it('should throw PlayerNumberAlreadyInUseException if player number exists', async () => {
      const dto: CreatePlayerDto = {
        name: 'Ronaldo',
        number: 10,
        position: 'MIDFIELDER',
      };

      mockPrismaService.player.findUnique.mockResolvedValue(mockPlayer);

      await expect(service.create(dto)).rejects.toThrow(PlayerNumberAlreadyInUseException);
    });
  });

  describe('findAll', () => {
    it('should return all players when no query filter is provided', async () => {
      mockPrismaService.player.findMany.mockResolvedValue([mockPlayer]);

      const result = await service.findAll();

      expect(prisma.player.findMany).toHaveBeenCalled();
      expect(result).toEqual([mockPlayer]);
    });

    it('should filter players by name or position when query filter is provided', async () => {
      mockPrismaService.player.findMany.mockResolvedValue([mockPlayer]);

      const result = await service.findAll({ filter: 'MID' });

      expect(prisma.player.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'MID', mode: 'insensitive' } },
            { position: { contains: 'MID', mode: 'insensitive' } },
          ],
        },
      });
      expect(result).toEqual([mockPlayer]);
    });
  });

  describe('findOne', () => {
    it('should return a player when found', async () => {
      mockPrismaService.player.findUnique.mockResolvedValue(mockPlayer);

      const result = await service.findOne(1);

      expect(prisma.player.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockPlayer);
    });

    it('should throw NotFoundException when player is not found', async () => {
      mockPrismaService.player.findUnique.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('replace', () => {
    const dto: CreatePlayerDto = {
      name: 'Ronaldo Updated',
      number: 9,
      position: 'FORWARD',
      photoUrl: 'https://example.com/ronaldo9.jpg',
    };

    it('should replace a player successfully', async () => {
      mockPrismaService.player.findUnique.mockResolvedValue(mockPlayer);
      mockPrismaService.player.findFirst.mockResolvedValue(null);
      mockPrismaService.player.update.mockResolvedValue({ ...mockPlayer, ...dto, id: 1 });

      const result = await service.replace(1, dto);

      expect(prisma.player.findFirst).toHaveBeenCalledWith({
        where: {
          number: dto.number,
          id: { not: 1 },
        },
      });
      expect(result.number).toEqual(9);
    });

    it('should throw PlayerNumberAlreadyInUseException when target number belongs to another player', async () => {
      mockPrismaService.player.findUnique.mockResolvedValue(mockPlayer);
      mockPrismaService.player.findFirst.mockResolvedValue({ id: 2, number: 9 });

      await expect(service.replace(1, dto)).rejects.toThrow(PlayerNumberAlreadyInUseException);
    });
  });

  describe('update', () => {
    it('should update partial properties of a player successfully', async () => {
      const dto: Partial<CreatePlayerDto> = { name: 'Ronaldo Partial' };

      mockPrismaService.player.findUnique.mockResolvedValue(mockPlayer);
      mockPrismaService.player.update.mockResolvedValue({ ...mockPlayer, name: 'Ronaldo Partial' });

      const result = await service.update(1, dto);

      expect(prisma.player.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'Ronaldo Partial' },
      });
      expect(result.name).toEqual('Ronaldo Partial');
    });

    it('should check unique number if number is updated', async () => {
      const dto: Partial<CreatePlayerDto> = { number: 8 };

      mockPrismaService.player.findUnique.mockResolvedValue(mockPlayer);
      mockPrismaService.player.findFirst.mockResolvedValue(null);
      mockPrismaService.player.update.mockResolvedValue({ ...mockPlayer, number: 8 });

      const result = await service.update(1, dto);

      expect(prisma.player.findFirst).toHaveBeenCalledWith({
        where: {
          number: 8,
          id: { not: 1 },
        },
      });
      expect(result.number).toEqual(8);
    });

    it('should throw PlayerNumberAlreadyInUseException if updated number is already taken', async () => {
      const dto: Partial<CreatePlayerDto> = { number: 8 };

      mockPrismaService.player.findUnique.mockResolvedValue(mockPlayer);
      mockPrismaService.player.findFirst.mockResolvedValue({ id: 2, number: 8 });

      await expect(service.update(1, dto)).rejects.toThrow(PlayerNumberAlreadyInUseException);
    });
  });

  describe('remove', () => {
    it('should delete a player successfully', async () => {
      mockPrismaService.player.findUnique.mockResolvedValue(mockPlayer);
      mockPrismaService.player.delete.mockResolvedValue(mockPlayer);

      await service.remove(1);

      expect(prisma.player.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});
