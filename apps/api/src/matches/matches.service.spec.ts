import { Test, TestingModule } from '@nestjs/testing';
import { MatchesService } from './matches.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateMatchDto } from './dto/create-match.dto';

const MATCH_INCLUDE = {
  championship: true,
  homeTeam: true,
  awayTeam: true,
};

describe('MatchesService', () => {
  let service: MatchesService;
  let prisma: PrismaService;

  const mockOwnClub = { id: 1, name: 'La Resenha', isOwnClub: true };
  const mockOpponentTeam = { id: 2, name: 'Adversário FC', isOwnClub: false };

  const mockMatch = {
    id: 1,
    date: new Date('2026-06-22T20:00:00Z'),
    opponent: 'Adversário FC',
    location: 'Estádio Municipal',
    homeScore: 2,
    awayScore: 1,
    homeTeamId: null,
    awayTeamId: null,
    championshipId: null,
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
    championship: {
      findUnique: jest.fn(),
    },
    team: {
      findUnique: jest.fn(),
    },
    standing: {
      upsert: jest.fn(),
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
    it('cria amistoso legado com adversário textual', async () => {
      const dto: CreateMatchDto = {
        date: '2026-06-22T20:00:00Z',
        opponent: 'Adversário FC',
        location: 'Estádio Municipal',
        homeScore: 2,
        awayScore: 1,
      };

      mockPrismaService.match.create.mockResolvedValue(mockMatch);

      const result = await service.create(dto);

      expect(prisma.match.create).toHaveBeenCalledWith({
        data: {
          date: new Date(dto.date),
          opponent: 'Adversário FC',
          location: dto.location,
          homeScore: 2,
          awayScore: 1,
          homeTeamId: null,
          awayTeamId: null,
          championshipId: null,
        },
        include: MATCH_INCLUDE,
      });
      expect(result).toEqual(mockMatch);
    });

    it('cria partida de campeonato com times e auto-inscreve ambos', async () => {
      const dto: CreateMatchDto = {
        date: '2026-06-22T20:00:00Z',
        location: 'Estádio Municipal',
        homeTeamId: 1,
        awayTeamId: 2,
        homeScore: 2,
        awayScore: 1,
        championshipId: 5,
      };

      mockPrismaService.championship.findUnique.mockResolvedValue({ id: 5 });
      mockPrismaService.team.findUnique
        .mockResolvedValueOnce(mockOwnClub)
        .mockResolvedValueOnce(mockOpponentTeam);
      mockPrismaService.match.create.mockResolvedValue({
        ...mockMatch,
        homeTeamId: 1,
        awayTeamId: 2,
        championshipId: 5,
      });
      mockPrismaService.standing.upsert.mockResolvedValue({});

      await service.create(dto);

      // opponent derivado: time que não é o clube da casa
      expect(prisma.match.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            opponent: 'Adversário FC',
            homeTeamId: 1,
            awayTeamId: 2,
            championshipId: 5,
          }),
        }),
      );
      expect(prisma.standing.upsert).toHaveBeenCalledTimes(2);
    });

    it('rejeita partida de campeonato sem os dois times', async () => {
      mockPrismaService.championship.findUnique.mockResolvedValue({ id: 5 });
      mockPrismaService.team.findUnique.mockResolvedValue(mockOwnClub);

      await expect(
        service.create({
          date: '2026-06-22T20:00:00Z',
          location: 'Estádio',
          homeTeamId: 1,
          championshipId: 5,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejeita placar incompleto', async () => {
      await expect(
        service.create({
          date: '2026-06-22T20:00:00Z',
          location: 'Estádio',
          opponent: 'X',
          homeScore: 2,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejeita mandante igual ao visitante', async () => {
      mockPrismaService.team.findUnique.mockResolvedValue(mockOwnClub);

      await expect(
        service.create({
          date: '2026-06-22T20:00:00Z',
          location: 'Estádio',
          homeTeamId: 1,
          awayTeamId: 1,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('aceita partida agendada sem placar', async () => {
      mockPrismaService.match.create.mockResolvedValue({
        ...mockMatch,
        homeScore: null,
        awayScore: null,
      });

      await service.create({
        date: '2099-06-22T20:00:00Z',
        location: 'Estádio',
        opponent: 'Adversário FC',
      });

      expect(prisma.match.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ homeScore: null, awayScore: null }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of matches ordered by date desc', async () => {
      mockPrismaService.match.findMany.mockResolvedValue([mockMatch]);

      const result = await service.findAll();

      expect(prisma.match.findMany).toHaveBeenCalledWith({
        include: MATCH_INCLUDE,
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
        include: MATCH_INCLUDE,
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
      const dto: Partial<CreateMatchDto> = { homeScore: 3, awayScore: 1 };
      const updatedMatch = { ...mockMatch, homeScore: 3 };

      mockPrismaService.match.findUnique.mockResolvedValue(mockMatch);
      mockPrismaService.match.update.mockResolvedValue(updatedMatch);

      const result = await service.update(1, dto);

      expect(prisma.match.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { homeScore: 3, awayScore: 1 },
        include: MATCH_INCLUDE,
      });
      expect(result).toEqual(updatedMatch);
    });

    it('permite limpar o placar (partida volta a ser agendada)', async () => {
      mockPrismaService.match.findUnique.mockResolvedValue(mockMatch);
      mockPrismaService.match.update.mockResolvedValue({
        ...mockMatch,
        homeScore: null,
        awayScore: null,
      });

      await service.update(1, { homeScore: null, awayScore: null });

      expect(prisma.match.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ homeScore: null, awayScore: null }),
        }),
      );
    });

    it('rejeita atualização que deixe placar incompleto', async () => {
      mockPrismaService.match.findUnique.mockResolvedValue(mockMatch);

      await expect(service.update(1, { homeScore: null })).rejects.toThrow(
        BadRequestException,
      );
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

      expect(prisma.match.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw a NotFoundException when trying to delete a non-existent match', async () => {
      mockPrismaService.match.findUnique.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
