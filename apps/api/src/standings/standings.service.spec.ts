import { Test, TestingModule } from '@nestjs/testing';
import { StandingsService } from './standings.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateStandingDto } from './dto/create-standing.dto';

describe('StandingsService', () => {
  let service: StandingsService;
  let prisma: PrismaService;

  const mockChampionship = {
    id: 1,
    name: 'Liga Amadora 2026',
    format: 'PONTOS_CORRIDOS',
    pointsPerWin: 3,
    pointsPerDraw: 1,
    pointsPerLoss: 0,
    tiebreakers: ['wins', 'goalDiff', 'goalsFor', 'headToHead'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTeamA = { id: 2, name: 'Resenha FC', isOwnClub: true };
  const mockTeamB = { id: 3, name: 'Tabajara FC', isOwnClub: false };

  const mockEnrollmentA = {
    id: 1,
    championshipId: 1,
    teamId: 2,
    pointsAdjustment: 0,
    team: mockTeamA,
    championship: mockChampionship,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockEnrollmentB = {
    id: 2,
    championshipId: 1,
    teamId: 3,
    pointsAdjustment: 0,
    team: mockTeamB,
    championship: mockChampionship,
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
      findMany: jest.fn(),
    },
    team: {
      findUnique: jest.fn(),
    },
    match: {
      findMany: jest.fn(),
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
    it('inscreve um time no campeonato', async () => {
      const dto: CreateStandingDto = {
        championshipId: 1,
        teamId: 2,
        pointsAdjustment: 0,
      };

      mockPrismaService.championship.findUnique.mockResolvedValue(mockChampionship);
      mockPrismaService.team.findUnique.mockResolvedValue(mockTeamA);
      mockPrismaService.standing.findUnique.mockResolvedValue(null);
      mockPrismaService.standing.create.mockResolvedValue(mockEnrollmentA);

      const result = await service.create(dto);

      expect(prisma.standing.create).toHaveBeenCalledWith({
        data: {
          championshipId: 1,
          teamId: 2,
          pointsAdjustment: 0,
          groupName: null,
        },
        include: {
          championship: true,
          team: true,
        },
      });
      expect(result).toEqual(mockEnrollmentA);
    });

    it('rejeita inscrição duplicada', async () => {
      mockPrismaService.championship.findUnique.mockResolvedValue(mockChampionship);
      mockPrismaService.team.findUnique.mockResolvedValue(mockTeamA);
      mockPrismaService.standing.findUnique.mockResolvedValue(mockEnrollmentA);

      await expect(
        service.create({ championshipId: 1, teamId: 2 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('calcula a tabela a partir das partidas com placar', async () => {
      mockPrismaService.championship.findMany.mockResolvedValue([mockChampionship]);
      mockPrismaService.standing.findMany.mockResolvedValue([
        mockEnrollmentA,
        mockEnrollmentB,
      ]);
      mockPrismaService.match.findMany.mockResolvedValue([
        { homeTeamId: 2, awayTeamId: 3, homeScore: 2, awayScore: 0 },
      ]);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      const first = result[0];
      expect(first.teamId).toBe(2); // Resenha venceu => 1º
      expect(first.position).toBe(1);
      expect(first.points).toBe(3);
      expect(first.played).toBe(1);
      expect(first.won).toBe(1);
      expect(first.goalsFor).toBe(2);
      expect(first.goalsAgainst).toBe(0);
      expect(first.team).toEqual(mockTeamA);

      const second = result[1];
      expect(second.teamId).toBe(3);
      expect(second.position).toBe(2);
      expect(second.points).toBe(0);
    });

    it('retorna vazio para campeonato sem times inscritos', async () => {
      mockPrismaService.championship.findMany.mockResolvedValue([mockChampionship]);
      mockPrismaService.standing.findMany.mockResolvedValue([]);
      mockPrismaService.match.findMany.mockResolvedValue([]);

      const result = await service.findAll(1);
      expect(result).toEqual([]);
    });

    it('mata-mata não gera tabela (só chaveamento)', async () => {
      mockPrismaService.championship.findMany.mockResolvedValue([
        { ...mockChampionship, format: 'MATA_MATA' },
      ]);
      mockPrismaService.standing.findMany.mockResolvedValue([mockEnrollmentA, mockEnrollmentB]);
      mockPrismaService.match.findMany.mockResolvedValue([]);

      const result = await service.findAll(1);
      expect(result).toEqual([]);
    });

    it('grupos + mata-mata: uma tabela por grupo, contando só os jogos do grupo', async () => {
      mockPrismaService.championship.findMany.mockResolvedValue([
        { ...mockChampionship, format: 'GRUPOS_MATA_MATA' },
      ]);
      mockPrismaService.standing.findMany.mockResolvedValue([
        { ...mockEnrollmentA, groupName: 'A' },
        { ...mockEnrollmentB, groupName: 'B' },
      ]);
      mockPrismaService.match.findMany.mockResolvedValue([
        // jogo do grupo A não existe; knockout (sem groupName) não conta
        { homeTeamId: 2, awayTeamId: 3, homeScore: 3, awayScore: 0, groupName: null },
      ]);

      const result = await service.findAll(1);
      // duas linhas (um time em cada grupo), cada uma 1º do seu grupo, sem jogos contados
      expect(result).toHaveLength(2);
      const groups = result.map((r) => r.group).sort();
      expect(groups).toEqual(['A', 'B']);
      expect(result.every((r) => r.position === 1 && r.played === 0)).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return a standing if it exists', async () => {
      mockPrismaService.standing.findUnique.mockResolvedValue(mockEnrollmentA);

      const result = await service.findOne(1);

      expect(prisma.standing.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          championship: true,
          team: true,
        },
      });
      expect(result).toEqual(mockEnrollmentA);
    });

    it('should throw NotFoundException if standing does not exist', async () => {
      mockPrismaService.standing.findUnique.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('atualiza apenas o ajuste manual de pontos', async () => {
      const updated = { ...mockEnrollmentA, pointsAdjustment: -3 };

      mockPrismaService.standing.findUnique.mockResolvedValue(mockEnrollmentA);
      mockPrismaService.standing.update.mockResolvedValue(updated);

      const result = await service.update(1, { pointsAdjustment: -3 });

      expect(prisma.standing.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { pointsAdjustment: -3 },
        include: {
          championship: true,
          team: true,
        },
      });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException if standing does not exist', async () => {
      mockPrismaService.standing.findUnique.mockResolvedValue(null);

      await expect(service.update(99, {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a standing and return the deleted entity', async () => {
      mockPrismaService.standing.findUnique.mockResolvedValue(mockEnrollmentA);
      mockPrismaService.standing.delete.mockResolvedValue(mockEnrollmentA);

      const result = await service.remove(1);

      expect(prisma.standing.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockEnrollmentA);
    });

    it('should throw NotFoundException if standing does not exist', async () => {
      mockPrismaService.standing.findUnique.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
