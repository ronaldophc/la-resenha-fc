import { Test, TestingModule } from '@nestjs/testing';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { News } from './interfaces/news.interface';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

describe('NewsController', () => {
  let controller: NewsController;
  let service: NewsService;

  const mockNews: News = {
    id: 1,
    title: 'La Resenha FC Campeão',
    content: 'O time do La Resenha FC sagrou-se campeão após uma final emocionante de muitos gols.',
    imageUrl: 'https://exemplo.com/foto.jpg',
    publishedAt: new Date('2026-06-22T20:00:00Z'),
    authorId: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockNewsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NewsController],
      providers: [
        { provide: NewsService, useValue: mockNewsService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<NewsController>(NewsController);
    service = module.get<NewsService>(NewsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a news post with req.user.id as authorId', async () => {
      const dto: CreateNewsDto = {
        title: 'La Resenha FC Campeão',
        content: 'O time do La Resenha FC sagrou-se campeão após uma final emocionante de muitos gols.',
        imageUrl: 'https://exemplo.com/foto.jpg',
        publishedAt: '2026-06-22T20:00:00Z',
      };
      const req = { user: { id: 2 } };

      mockNewsService.create.mockResolvedValue(mockNews);

      const result = await controller.create(dto, req);

      expect(service.create).toHaveBeenCalledWith(dto, 2);
      expect(result).toEqual(mockNews);
    });
  });

  describe('findAll', () => {
    it('should return all news posts', async () => {
      mockNewsService.findAll.mockResolvedValue([mockNews]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockNews]);
    });
  });

  describe('findOne', () => {
    it('should return a news post by id', async () => {
      mockNewsService.findOne.mockResolvedValue(mockNews);

      const result = await controller.findOne(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockNews);
    });
  });

  describe('update', () => {
    it('should update a news post', async () => {
      const dto: Partial<CreateNewsDto> = { title: 'Novo Título' };
      const updatedNews = { ...mockNews, title: 'Novo Título' };

      mockNewsService.update.mockResolvedValue(updatedNews);

      const result = await controller.update(1, dto);

      expect(service.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(updatedNews);
    });
  });

  describe('remove', () => {
    it('should remove a news post', async () => {
      mockNewsService.remove.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
