import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser = {
    id: 1,
    email: 'admin@example.com',
    passwordHash: 'hashed_password',
    role: 'ADMIN',
  };

  const mockUsersService = {
    findByEmailWithPassword: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should delegate user creation to usersService', async () => {
      mockUsersService.create.mockResolvedValue({ id: 1, email: 'test@example.com', role: 'ADMIN' });

      const result = await service.register('test@example.com', 'pass123', 'ADMIN');

      expect(usersService.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'pass123',
        role: 'ADMIN',
      });
      expect(result).toEqual({ id: 1, email: 'test@example.com', role: 'ADMIN' });
    });
  });

  describe('login', () => {
    it('should successfully log in and return an access token', async () => {
      mockUsersService.findByEmailWithPassword.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('jwt_token');

      const result = await service.login('admin@example.com', 'password123');

      expect(usersService.findByEmailWithPassword).toHaveBeenCalledWith('admin@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password');
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: 1,
        email: 'admin@example.com',
        role: 'ADMIN',
      });
      expect(result).toEqual({
        accessToken: 'jwt_token',
        user: {
          id: 1,
          email: 'admin@example.com',
          role: 'ADMIN',
        },
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findByEmailWithPassword.mockResolvedValue(null);

      await expect(service.login('invalid@example.com', 'password123')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      mockUsersService.findByEmailWithPassword.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login('admin@example.com', 'wrongpassword')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
