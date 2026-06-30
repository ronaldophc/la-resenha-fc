import { Test, TestingModule } from '@nestjs/testing';
import { StandingsService } from './standings.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateStandingDto } from './dto/create-standing.dto';

describe('StandingsService', () => {
  let service: StandingsService;
  let prisma: PrismaService;

  const mockStanding = {
    id: 1,
    championshipId: 1,
    teamId: 2,
    position: 1,
    points: 15,
    played: 5,
    won: 5,
    drawn: 0,
    lost: 0,
    goalsFor: 15,
    goalsAgainst: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    standing: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    championship: {
      findUnique: jest.fn(),
    },
    team: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StandingsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<StandingsService>(StandingsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a standing and return it', async () => {
      const dto: CreateStandingDto = {
        championshipId: 1,
        teamId: 2,
        position: 1,
        points: 15,
        played: 5,
        won: 5,
        drawn: 0,
        lost: 0,
        goalsFor: 15,
        goalsAgainst: 2,
      };

      mockPrismaService.championship.findUnique.mockResolvedValue({ id: 1, name: 'Liga Amadora 2026' });
      mockPrismaService.team.findUnique.mockResolvedValue({ id: 2, name: 'Resenha FC' });
      mockPrismaService.standing.findUnique.mockResolvedValue(null);
      mockPrismaService.standing.create.mockResolvedValue(mockStanding);

      const result = await service.create(dto);

      expect(prisma.championship.findUnique).toHaveBeenCalledWith({ where: { id: dto.championshipId } });
      expect(prisma.team.findUnique).toHaveBeenCalledWith({ where: { id: dto.teamId } });
      expect(prisma.standing.findUnique).toHaveBeenCalledWith({
        where: {
          championshipId_teamId: {
            championshipId: dto.championshipId,
            teamId: dto.teamId,
          },
        },
      });
      expect(prisma.standing.create).toHaveBeenCalledWith({
        data: {
          championshipId: dto.championshipId,
          teamId: dto.teamId,
          position: dto.position,
          points: dto.points,
          played: dto.played,
          won: dto.won,
          drawn: dto.drawn,
          lost: dto.lost,
          goalsFor: dto.goalsFor,
          goalsAgainst: dto.goalsAgainst,
        },
        include: {
          championship: true,
          team: true,
        },
      });
      expect(result).toEqual(mockStanding);
    });
  });

  describe('findAll', () => {
    it('should return an array of standings ordered by position asc', async () => {
      mockPrismaService.standing.findMany.mockResolvedValue([mockStanding]);

      const result = await service.findAll();

      expect(prisma.standing.findMany).toHaveBeenCalledWith({
        include: {
          championship: true,
          team: true,
        },
        orderBy: [
          { championshipId: 'asc' },
          { position: 'asc' },
        ],
      });
      expect(result).toEqual([mockStanding]);
    });
  });

  describe('findOne', () => {
    it('should return a standing if it exists', async () => {
      mockPrismaService.standing.findUnique.mockResolvedValue(mockStanding);

      const result = await service.findOne(1);

      expect(prisma.standing.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          championship: true,
          team: true,
        },
      });
      expect(result).toEqual(mockStanding);
    });

    it('should throw NotFoundException if standing does not exist', async () => {
      mockPrismaService.standing.findUnique.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a standing and return the updated entity', async () => {
      const dto = {
        championshipId: 1,
        teamId: 2,
        position: 2,
        points: 12,
        played: 5,
        won: 4,
        drawn: 0,
        lost: 1,
        goalsFor: 12,
        goalsAgainst: 4,
      };

      const updatedStanding = { ...mockStanding, ...dto };

      mockPrismaService.standing.findUnique.mockResolvedValue(mockStanding);
      mockPrismaService.standing.update.mockResolvedValue(updatedStanding);

      const result = await service.update(1, dto);

      expect(prisma.standing.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          championship: true,
          team: true,
        },
      });
      expect(prisma.standing.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: dto,
        include: {
          championship: true,
          team: true,
        },
      });
      expect(result).toEqual(updatedStanding);
    });

    it('should throw NotFoundException if standing does not exist', async () => {
      mockPrismaService.standing.findUnique.mockResolvedValue(null);

      await expect(service.update(99, {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a standing and return the deleted entity', async () => {
      mockPrismaService.standing.findUnique.mockResolvedValue(mockStanding);
      mockPrismaService.standing.delete.mockResolvedValue(mockStanding);

      const result = await service.remove(1);

      expect(prisma.standing.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          championship: true,
          team: true,
        },
      });
      expect(prisma.standing.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockStanding);
    });

    it('should throw NotFoundException if standing does not exist', async () => {
      mockPrismaService.standing.findUnique.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
