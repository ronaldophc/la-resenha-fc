import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Torna o serviço disponível em toda a aplicação sem precisar importar repetidamente
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Exige que o serviço seja exportado
})
export class PrismaModule {}