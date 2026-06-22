import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { EmailAlreadyInUseException } from './exceptions/email-already-in-use.exception';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
}));

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockUser = {
    id: 1,
    email: 'admin@example.com',
    passwordHash: 'hashed_password',
    role: 'ADMIN',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    user: {
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
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto: CreateUserDto = {
      email: 'admin@example.com',
      password: 'password123',
      role: 'ADMIN',
    };

    it('should create a user successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.create(dto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: dto.email } });
      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: dto.email,
          passwordHash: 'hashed_password',
          role: dto.role,
        },
      });
      expect(result).not.toHaveProperty('passwordHash');
      expect(result.email).toEqual(dto.email);
    });

    it('should throw EmailAlreadyInUseException if email exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.create(dto)).rejects.toThrow(EmailAlreadyInUseException);
    });
  });

  describe('findAll', () => {
    it('should return all users with passwordHash omitted when no filter is provided', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([mockUser]);

      const result = await service.findAll();

      expect(prisma.user.findMany).toHaveBeenCalledWith({ where: {} });
      expect(result[0]).not.toHaveProperty('passwordHash');
      expect(result[0].email).toEqual(mockUser.email);
    });

    it('should filter users by email or role when query filter is provided', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([mockUser]);

      const result = await service.findAll({ filter: 'ADM' });

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: { contains: 'ADM', mode: 'insensitive' } },
            { role: { contains: 'ADM', mode: 'insensitive' } },
          ],
        },
      });
      expect(result[0]).not.toHaveProperty('passwordHash');
    });
  });

  describe('findOne', () => {
    it('should return a user without passwordHash when found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).not.toHaveProperty('passwordHash');
      expect(result.email).toEqual(mockUser.email);
    });

    it('should throw NotFoundException when user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmailWithPassword', () => {
    it('should return user including passwordHash', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmailWithPassword('admin@example.com');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'admin@example.com' } });
      expect(result).toEqual(mockUser);
    });
  });

  describe('replace', () => {
    const dto: CreateUserDto = {
      email: 'updated@example.com',
      password: 'newpassword',
      role: 'ADMIN',
    };

    it('should replace a user successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.update.mockResolvedValue({ ...mockUser, email: dto.email });

      const result = await service.replace(1, dto);

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          email: dto.email,
          id: { not: 1 },
        },
      });
      expect(result).not.toHaveProperty('passwordHash');
      expect(result.email).toEqual(dto.email);
    });

    it('should throw EmailAlreadyInUseException when target email belongs to another user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.findFirst.mockResolvedValue({ id: 2, email: dto.email });

      await expect(service.replace(1, dto)).rejects.toThrow(EmailAlreadyInUseException);
    });
  });

  describe('update', () => {
    it('should update partial user properties successfully', async () => {
      const dto: Partial<CreateUserDto> = { role: 'USER' };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({ ...mockUser, role: 'USER' });

      const result = await service.update(1, dto);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { role: 'USER' },
      });
      expect(result.role).toEqual('USER');
    });

    it('should check unique email if email is updated', async () => {
      const dto: Partial<CreateUserDto> = { email: 'new@example.com' };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.update.mockResolvedValue({ ...mockUser, email: 'new@example.com' });

      const result = await service.update(1, dto);

      expect(prisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          email: 'new@example.com',
          id: { not: 1 },
        },
      });
      expect(result.email).toEqual('new@example.com');
    });

    it('should throw EmailAlreadyInUseException if updated email is already taken', async () => {
      const dto: Partial<CreateUserDto> = { email: 'new@example.com' };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.findFirst.mockResolvedValue({ id: 2, email: 'new@example.com' });

      await expect(service.update(1, dto)).rejects.toThrow(EmailAlreadyInUseException);
    });
  });

  describe('remove', () => {
    it('should delete a user successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      await service.remove(1);

      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});
