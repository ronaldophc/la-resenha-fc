import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

// Validade do token quando "Lembrar-me" está marcado
const REMEMBER_ME_EXPIRATION = '30d';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(email: string, password: string, role?: string) {
    return this.usersService.create({ email, password, role });
  }

  async login(email: string, password: string, rememberMe = false) {
    const user = await this.usersService.findByEmailWithPassword(email);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    // "Lembrar-me" emite um token de validade longa; caso contrário, a validade padrão
    const expiresIn: any = rememberMe
      ? REMEMBER_ME_EXPIRATION
      : this.configService.get<string>('JWT_EXPIRATION') || '8h';
    const accessToken = await this.jwtService.signAsync(payload, { expiresIn });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}