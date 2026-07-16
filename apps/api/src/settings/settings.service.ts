import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

const SETTINGS_ID = 1;

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Retorna as configurações, criando o registro padrão na primeira leitura. */
  async get() {
    return this.prisma.siteSettings.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID },
      update: {},
    });
  }

  async update(data: UpdateSettingsDto) {
    const settings = await this.prisma.siteSettings.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID, ...this.clean(data) },
      update: this.clean(data),
    });

    // Mantém o time do clube (usado em partidas/classificação) em sincronia
    if (data.clubName !== undefined || data.logoUrl !== undefined) {
      await this.prisma.team.updateMany({
        where: { isOwnClub: true },
        data: {
          ...(data.clubName !== undefined ? { name: data.clubName } : {}),
          ...(data.logoUrl !== undefined ? { logoUrl: data.logoUrl ?? null } : {}),
        },
      });
    }

    return settings;
  }

  /** Normaliza strings vazias para null nos campos opcionais. */
  private clean(data: UpdateSettingsDto) {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) continue;
      result[key] = typeof value === 'string' && value.trim() === '' && key !== 'clubName'
        ? null
        : value;
    }
    return result;
  }
}
