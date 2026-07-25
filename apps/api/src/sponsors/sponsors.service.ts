import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSponsorDto } from './dto/create-sponsor.dto';
import { UpdateSponsorDto } from './dto/update-sponsor.dto';

@Injectable()
export class SponsorsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateSponsorDto) {
    return this.prisma.sponsor.create({
      data: {
        name: data.name,
        logoUrl: data.logoUrl ?? null,
        description: data.description ?? null,
        instagramUrl: data.instagramUrl ?? null,
        whatsappNumber: data.whatsappNumber ?? null,
        youtubeUrl: data.youtubeUrl ?? null,
        facebookUrl: data.facebookUrl ?? null,
      },
    });
  }

  /** Converte string vazia em null nos campos opcionais de atualização. */
  private optional(value?: string | null) {
    if (value === undefined) return undefined;
    return value === '' ? null : value;
  }

  async findAll() {
    return this.prisma.sponsor.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const sponsor = await this.prisma.sponsor.findUnique({
      where: { id },
    });
    if (!sponsor) {
      throw new NotFoundException(`Patrocinador com ID ${id} não encontrado.`);
    }
    return sponsor;
  }

  async update(id: number, data: UpdateSponsorDto) {
    await this.findOne(id);

    return this.prisma.sponsor.update({
      where: { id },
      data: {
        name: data.name,
        logoUrl: data.logoUrl !== undefined ? (data.logoUrl ?? null) : undefined,
        description: data.description !== undefined ? (data.description ?? null) : undefined,
        instagramUrl: this.optional(data.instagramUrl),
        whatsappNumber: this.optional(data.whatsappNumber),
        youtubeUrl: this.optional(data.youtubeUrl),
        facebookUrl: this.optional(data.facebookUrl),
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.sponsor.delete({
      where: { id },
    });
  }
}
