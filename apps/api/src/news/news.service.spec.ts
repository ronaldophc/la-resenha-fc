import { Test, TestingModule } from '@nestjs/testing';
import { NewsService } from './news.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateNewsDto } from './dto/create-news.dto';

describe('NewsService', () => {
  let service: NewsService;
  let prisma: PrismaService;

  const mockNews = {
    id: 1,
    title: 'La Resenha FC Campeão',
    content: 'O time do La Resenha FC sagrou-se campeão após uma final emocionante de muitos gols.',
    imageUrl: 'https://exemplo.com/foto.jpg',
    publishedAt: new Date('2026-06-22T20:00:00Z'),
    authorId: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    news: {
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
        NewsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<NewsService>(NewsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a news post successfully', async () => {
      const dto: CreateNewsDto = {
        title: 'La Resenha FC Campeão',
        content: 'O time do La Resenha FC sagrou-se campeão após uma final emocionante de muitos gols.',
        imageUrl: 'https://exemplo.com/foto.jpg',
        publishedAt: '2026-06-22T20:00:00Z',
      };
      const authorId = 2;

      mockPrismaService.news.create.mockResolvedValue(mockNews);

      const result = await service.create(dto, authorId);

      expect(prisma.news.create).toHaveBeenCalledWith({
        data: {
          title: dto.title,
          content: dto.content,
          imageUrl: dto.imageUrl,
          publishedAt: new Date(dto.publishedAt),
          authorId: authorId,
        },
      });
      expect(result).toEqual(mockNews);
    });
  });

  describe('findAll', () => {
    it('should return all news ordered by publishedAt desc', async () => {
      mockPrismaService.news.findMany.mockResolvedValue([mockNews]);

      const result = await service.findAll();

      expect(prisma.news.findMany).toHaveBeenCalledWith({
        orderBy: { publishedAt: 'desc' },
      });
      expect(result).toEqual([mockNews]);
    });
  });

  describe('findOne', () => {
    it('should return a news post when found', async () => {
      mockPrismaService.news.findUnique.mockResolvedValue(mockNews);

      const result = await service.findOne(1);

      expect(prisma.news.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockNews);
    });

    it('should throw a NotFoundException when news post not found', async () => {
      mockPrismaService.news.findUnique.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a news post successfully', async () => {
      const dto: Partial<CreateNewsDto> = { title: 'Novo Título' };
      const updatedNews = { ...mockNews, title: 'Novo Título' };

      mockPrismaService.news.findUnique.mockResolvedValue(mockNews);
      mockPrismaService.news.update.mockResolvedValue(updatedNews);

      const result = await service.update(1, dto);

      expect(prisma.news.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(prisma.news.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { title: 'Novo Título' },
      });
      expect(result).toEqual(updatedNews);
    });

    it('should throw a NotFoundException when trying to update a non-existent news post', async () => {
      mockPrismaService.news.findUnique.mockResolvedValue(null);

      await expect(service.update(99, { title: 'Qualquer' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a news post successfully', async () => {
      mockPrismaService.news.findUnique.mockResolvedValue(mockNews);
      mockPrismaService.news.delete.mockResolvedValue(mockNews);

      await service.remove(1);

      expect(prisma.news.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(prisma.news.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw a NotFoundException when trying to delete a non-existent news post', async () => {
      mockPrismaService.news.findUnique.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
