import { Module } from '@nestjs/common';
import { ChampionshipsService } from './championships.service';
import { ChampionshipsController } from './championships.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ChampionshipsController],
  providers: [ChampionshipsService],
  exports: [ChampionshipsService],
})
export class ChampionshipsModule {}
