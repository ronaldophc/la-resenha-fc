import { Test, TestingModule } from '@nestjs/testing';
import { MatchesService } from './matches.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateMatchDto } from './dto/create-match.dto';

describe('MatchesService', () => {
  let service: MatchesService;
  let prisma: PrismaService;

  const mockMatch = {
    id: 1,
    date: new Date('2026-06-22T20:00:00Z'),
    opponent: 'Adversário FC',
    location: 'Estádio Municipal',
    homeScore: 2,
    awayScore: 1,
    championship: 'Copa Várzea',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    match: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<MatchesService>(MatchesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a match successfully', async () => {
      const dto: CreateMatchDto = {
        date: '2026-06-22T20:00:00Z',
        opponent: 'Adversário FC',
        location: 'Estádio Municipal',
        homeScore: 2,
        awayScore: 1,
        championship: 'Copa Várzea',
      };

      mockPrismaService.match.create.mockResolvedValue(mockMatch);

      const result = await service.create(dto);

      expect(prisma.match.create).toHaveBeenCalledWith({
        data: {
          date: new Date(dto.date),
          opponent: dto.opponent,
          location: dto.location,
          homeScore: dto.homeScore,
          awayScore: dto.awayScore,
          championship: dto.championship,
        },
      });
      expect(result).toEqual(mockMatch);
    });
  });

  describe('findAll', () => {
    it('should return an array of matches ordered by date desc', async () => {
      mockPrismaService.match.findMany.mockResolvedValue([mockMatch]);

      const result = await service.findAll();

      expect(prisma.match.findMany).toHaveBeenCalledWith({
        orderBy: { date: 'desc' },
      });
      expect(result).toEqual([mockMatch]);
    });
  });

  describe('findOne', () => {
    it('should return a match when found', async () => {
      mockPrismaService.match.findUnique.mockResolvedValue(mockMatch);

      const result = await service.findOne(1);

      expect(prisma.match.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockMatch);
    });

    it('should throw a NotFoundException when match not found', async () => {
      mockPrismaService.match.findUnique.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a match successfully', async () => {
      const dto: Partial<CreateMatchDto> = { homeScore: 3 };
      const updatedMatch = { ...mockMatch, homeScore: 3 };

      mockPrismaService.match.findUnique.mockResolvedValue(mockMatch);
      mockPrismaService.match.update.mockResolvedValue(updatedMatch);

      const result = await service.update(1, dto);

      expect(prisma.match.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(prisma.match.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { homeScore: 3 },
      });
      expect(result).toEqual(updatedMatch);
    });

    it('should throw a NotFoundException when trying to update a non-existent match', async () => {
      mockPrismaService.match.findUnique.mockResolvedValue(null);

      await expect(service.update(99, { opponent: 'Outro' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a match successfully', async () => {
      mockPrismaService.match.findUnique.mockResolvedValue(mockMatch);
      mockPrismaService.match.delete.mockResolvedValue(mockMatch);

      await service.remove(1);

      expect(prisma.match.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(prisma.match.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw a NotFoundException when trying to delete a non-existent match', async () => {
      mockPrismaService.match.findUnique.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
