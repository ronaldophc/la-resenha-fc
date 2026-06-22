import { Test, TestingModule } from '@nestjs/testing';
import { StandingsController } from './standings.controller';
import { StandingsService } from './standings.service';
import { CreateStandingDto } from './dto/create-standing.dto';
import { UpdateStandingDto } from './dto/update-standing.dto';
import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

describe('StandingsController', () => {
  let controller: StandingsController;
  let service: StandingsService;

  const mockStanding = {
    id: 1,
    championship: 'Liga Amadora 2026',
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

  const mockStandingsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const mockGuard = {
      canActivate: (context: ExecutionContext) => true,
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StandingsController],
      providers: [
        {
          provide: StandingsService,
          useValue: mockStandingsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get<StandingsController>(StandingsController);
    service = module.get<StandingsService>(StandingsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a standing and return it', async () => {
      const dto: CreateStandingDto = {
        championship: 'Liga Amadora 2026',
        position: 1,
        points: 15,
        played: 5,
        won: 5,
        drawn: 0,
        lost: 0,
        goalsFor: 15,
        goalsAgainst: 2,
      };

      mockStandingsService.create.mockResolvedValue(mockStanding);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockStanding);
    });
  });

  describe('findAll', () => {
    it('should return a list of standings', async () => {
      mockStandingsService.findAll.mockResolvedValue([mockStanding]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockStanding]);
    });
  });

  describe('update', () => {
    it('should update a standing and return the updated entity', async () => {
      const dto: UpdateStandingDto = {
        championship: 'Liga Amadora 2026 Atualizada',
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
      mockStandingsService.update.mockResolvedValue(updatedStanding);

      const result = await controller.update(1, dto);

      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(updatedStanding);
    });
  });

  describe('remove', () => {
    it('should delete a standing', async () => {
      mockStandingsService.remove.mockResolvedValue(mockStanding);

      const result = await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });
  });
});
