import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './interfaces/users.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { EmailAlreadyInUseException } from './exceptions/email-already-in-use.exception';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async create(data: CreateUserDto): Promise<User> {
    const emailExists = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (emailExists) {
      throw new EmailAlreadyInUseException(data.email);
    }

    const hashedPassword = await this.hashPassword(data.password);

    const newUser = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash: hashedPassword,
        role: data.role ?? 'ADMIN',
      },
    });

    const { passwordHash, ...result } = newUser;
    return result as User;
  }

  async findAll(query?: any): Promise<User[]> {
    let where = {};
    if (query?.filter) {
      const filterStr = query.filter;
      where = {
        OR: [
          { email: { contains: filterStr, mode: 'insensitive' } },
          { role: { contains: filterStr, mode: 'insensitive' } },
        ],
      };
    }

    const users = await this.prisma.user.findMany({ where });
    return users.map(({ passwordHash, ...user }) => user) as User[];
  }

  async findOne(id: number): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`Usuário com id ${id} não encontrado.`);
    }

    const { passwordHash, ...result } = user;
    return result as User;
  }

  async findByEmailWithPassword(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async replace(id: number, data: CreateUserDto): Promise<User> {
    await this.findOne(id);

    const emailExists = await this.prisma.user.findFirst({
      where: {
        email: data.email,
        id: { not: id },
      },
    });
    if (emailExists) {
      throw new EmailAlreadyInUseException(data.email);
    }

    const hashedPassword = await this.hashPassword(data.password);

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        email: data.email,
        passwordHash: hashedPassword,
        role: data.role ?? 'ADMIN',
      },
    });

    const { passwordHash, ...result } = updatedUser;
    return result as User;
  }

  async update(id: number, data: Partial<CreateUserDto>): Promise<User> {
    await this.findOne(id);

    if (data.email !== undefined) {
      const emailExists = await this.prisma.user.findFirst({
        where: {
          email: data.email,
          id: { not: id },
        },
      });
      if (emailExists) {
        throw new EmailAlreadyInUseException(data.email);
      }
    }

    const updateData: any = {};
    if (data.email !== undefined) updateData.email = data.email;
    if (data.password !== undefined) {
      updateData.passwordHash = await this.hashPassword(data.password);
    }
    if (data.role !== undefined) updateData.role = data.role;

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    const { passwordHash, ...result } = updatedUser;
    return result as User;
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);

    await this.prisma.user.delete({
      where: { id },
    });
  }
}
