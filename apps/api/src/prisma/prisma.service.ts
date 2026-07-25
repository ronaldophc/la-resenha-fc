import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  /**
   * Conecta com algumas tentativas. O Neon (free tier) hiberna após inatividade
   * e a primeira conexão pode falhar (P1001) enquanto o banco acorda. Em vez de
   * derrubar a aplicação no boot, tentamos novamente; se ainda assim falhar, a
   * app sobe mesmo assim — o Prisma conecta sob demanda na primeira query.
   */
  async onModuleInit() {
    const maxAttempts = 5;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await this.$connect();
        return;
      } catch {
        this.logger.warn(
          `Falha ao conectar ao banco (tentativa ${attempt}/${maxAttempts}). ` +
            'Pode ser o Neon acordando. Nova tentativa em breve...',
        );
        if (attempt === maxAttempts) {
          this.logger.error(
            'Não foi possível conectar ao banco no boot. A aplicação vai subir e ' +
              'tentar conectar sob demanda na primeira requisição.',
          );
          return; // não relança: deixa a app subir e escutar a porta
        }
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
