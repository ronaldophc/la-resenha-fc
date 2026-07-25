import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SponsorsService } from './sponsors.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SponsorsService', () => {
  let service: SponsorsService;
  let prisma: PrismaService;

  const mockSponsor = {
    id: 1,
    name: 'Padaria do Bairro',
    logoUrl: 'https://x/logo.png',
    description: 'Apoiador oficial',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrisma = {
    sponsor: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SponsorsService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<SponsorsService>(SponsorsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('cria um patrocinador normalizando campos opcionais', async () => {
      mockPrisma.sponsor.create.mockResolvedValue(mockSponsor);

      await service.create({ name: 'Padaria do Bairro' });

      expect(prisma.sponsor.create).toHaveBeenCalledWith({
        data: {
          name: 'Padaria do Bairro',
          logoUrl: null,
          description: null,
          instagramUrl: null,
          whatsappNumber: null,
          youtubeUrl: null,
          facebookUrl: null,
        },
      });
    });
  });

  describe('findAll', () => {
    it('lista patrocinadores ordenados por nome', async () => {
      mockPrisma.sponsor.findMany.mockResolvedValue([mockSponsor]);

      const result = await service.findAll();

      expect(prisma.sponsor.findMany).toHaveBeenCalledWith({ orderBy: { name: 'asc' } });
      expect(result).toEqual([mockSponsor]);
    });
  });

  describe('findOne', () => {
    it('retorna o patrocinador quando existe', async () => {
      mockPrisma.sponsor.findUnique.mockResolvedValue(mockSponsor);
      expect(await service.findOne(1)).toEqual(mockSponsor);
    });

    it('lança NotFound quando não existe', async () => {
      mockPrisma.sponsor.findUnique.mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('atualiza apenas os campos enviados', async () => {
      mockPrisma.sponsor.findUnique.mockResolvedValue(mockSponsor);
      mockPrisma.sponsor.update.mockResolvedValue({ ...mockSponsor, name: 'Novo Nome' });

      await service.update(1, { name: 'Novo Nome' });

      expect(prisma.sponsor.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: 'Novo Nome',
          logoUrl: undefined,
          description: undefined,
          instagramUrl: undefined,
          whatsappNumber: undefined,
          youtubeUrl: undefined,
          facebookUrl: undefined,
        },
      });
    });

    it('lança NotFound ao atualizar inexistente', async () => {
      mockPrisma.sponsor.findUnique.mockResolvedValue(null);
      await expect(service.update(99, { name: 'x' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('remove o patrocinador existente', async () => {
      mockPrisma.sponsor.findUnique.mockResolvedValue(mockSponsor);
      mockPrisma.sponsor.delete.mockResolvedValue(mockSponsor);

      await service.remove(1);

      expect(prisma.sponsor.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('lança NotFound ao remover inexistente', async () => {
      mockPrisma.sponsor.findUnique.mockResolvedValue(null);
      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
