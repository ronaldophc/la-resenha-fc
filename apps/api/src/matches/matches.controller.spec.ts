import { Test, TestingModule } from '@nestjs/testing';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { Match } from './interfaces/matches.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

describe('MatchesController', () => {
  let controller: MatchesController;
  let service: MatchesService;

  const mockMatch: Match = {
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

  const mockMatchesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatchesController],
      providers: [
        { provide: MatchesService, useValue: mockMatchesService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<MatchesController>(MatchesController);
    service = module.get<MatchesService>(MatchesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a match', async () => {
      const dto: CreateMatchDto = {
        date: '2026-06-22T20:00:00Z',
        opponent: 'Adversário FC',
        location: 'Estádio Municipal',
        homeScore: 2,
        awayScore: 1,
        championship: 'Copa Várzea',
      };

      mockMatchesService.create.mockResolvedValue(mockMatch);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockMatch);
    });
  });

  describe('findAll', () => {
    it('should return all matches', async () => {
      mockMatchesService.findAll.mockResolvedValue([mockMatch]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockMatch]);
    });
  });

  describe('findOne', () => {
    it('should return a match by id', async () => {
      mockMatchesService.findOne.mockResolvedValue(mockMatch);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockMatch);
    });
  });

  describe('replace', () => {
    it('should replace a match', async () => {
      const dto: CreateMatchDto = {
        date: '2026-06-22T20:00:00Z',
        opponent: 'Adversário FC',
        location: 'Estádio Municipal',
        homeScore: 3,
        awayScore: 1,
        championship: 'Copa Várzea',
      };
      const updatedMatch = { ...mockMatch, homeScore: 3 };

      mockMatchesService.update.mockResolvedValue(updatedMatch);

      const result = await controller.replace(1, dto);

      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(updatedMatch);
    });
  });

  describe('update', () => {
    it('should update a match', async () => {
      const dto: Partial<CreateMatchDto> = { homeScore: 3 };
      const updatedMatch = { ...mockMatch, homeScore: 3 };

      mockMatchesService.update.mockResolvedValue(updatedMatch);

      const result = await controller.update(1, dto);

      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(updatedMatch);
    });
  });

  describe('remove', () => {
    it('should remove a match', async () => {
      mockMatchesService.remove.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
